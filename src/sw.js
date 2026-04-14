import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'
import { openDB, DB_STORES } from './services/providers/indexeddb/db'
import { getAllAccounts } from './services/providers/indexeddb/CashFlow/accountsMaster'
import { getVehicles, saveVehicles } from './services/providers/indexeddb/CashFlow/taxiVehicles'

// Workbox precaching (injected by VitePWA)
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Allow the app to trigger skipWaiting from the update prompt
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

// Firebase Messaging background handler
const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
})

const messaging = getMessaging(app)

onBackgroundMessage(messaging, (payload) => {
  const { title, body } = payload.notification ?? {}
  self.registration.showNotification(title ?? 'Notificación', {
    body,
    icon: '/icons/icon.svg',
  })
})

// Periodic Background Sync to check active accounts and pico y placa
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-active-accounts') {
    event.waitUntil(checkActiveAccountsAndNotify())
  }
  if (event.tag === 'pico-y-placa') {
    event.waitUntil(checkPicoYPlaca())
  }
})

async function checkActiveAccountsAndNotify() {
  try {
    const now = new Date()
    const hour = now.getHours()
    
    // Check if we are in one of the windows: 8, 12, 18
    // We allow a small window around these hours (e.g. 8:00 to 8:59)
    const windows = [8, 12, 18]
    if (!windows.includes(hour)) return

    const dateStr = now.toISOString().split('T')[0]
    const lastNotifyKey = `last-notify-${dateStr}-${hour}`
    
    const db = await openDB()
    
    // Check if we already notified for this window today
    const alreadyNotified = await new Promise((resolve) => {
      const tx = db.transaction(DB_STORES.METADATA, 'readonly')
      const req = tx.objectStore(DB_STORES.METADATA).get(lastNotifyKey)
      req.onsuccess = () => resolve(!!req.result)
      req.onerror = () => resolve(false)
    })

    if (alreadyNotified) return

    // Get active accounts count
    const accounts = await getAllAccounts()
    const activeCount = accounts.filter((a) => a.active === true).length

    // Show notification
    await self.registration.showNotification('Cuentas Activas', {
      body: `Hay ${activeCount} cuentas activas en este momento.`,
      icon: '/icons/icon.svg',
      tag: 'active-accounts-notification',
      badge: '/icons/icon.svg',
    })

    // Mark as notified
    const tx = db.transaction(DB_STORES.METADATA, 'readwrite')
    tx.objectStore(DB_STORES.METADATA).put(true, lastNotifyKey)
    await new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch (err) {
    console.error('Error in periodic sync checkActiveAccountsAndNotify:', err)
  }
}

// ─── Pico y placa local notifications ────────────────────────────────────────
// Windows: 8am, 12pm, 5pm → notify today's and tomorrow's restrictions

async function checkPicoYPlaca() {
  try {
    const now = new Date()
    const hour = now.getHours()

    const windows = [8, 12, 17]
    if (!windows.includes(hour)) return

    const dateKey = now.toISOString().split('T')[0]
    const notifyKey = `pico-placa-${dateKey}-${hour}`

    const db = await openDB()

    const alreadyNotified = await new Promise((resolve) => {
      const tx = db.transaction(DB_STORES.METADATA, 'readonly')
      const req = tx.objectStore(DB_STORES.METADATA).get(notifyKey)
      req.onsuccess = () => resolve(!!req.result)
      req.onerror = () => resolve(false)
    })
    if (alreadyNotified) return

    let vehicles = await getVehicles()
    if (!vehicles.length) {
      vehicles = await fetchVehiclesFromFirestore()
      if (vehicles.length) await saveVehicles(vehicles)
    }
    if (!vehicles.length) return

    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayRestricted = vehicles
      .filter((v) => isRestricted(v.restrictions, now.getMonth() + 1, now.getDate()))
      .map((v) => v.plate)

    const tomorrowRestricted = vehicles
      .filter((v) => isRestricted(v.restrictions, tomorrow.getMonth() + 1, tomorrow.getDate()))
      .map((v) => v.plate)

    if (!todayRestricted.length && !tomorrowRestricted.length) return

    const lines = []
    if (todayRestricted.length) lines.push(`Hoy: ${todayRestricted.join(', ')}`)
    if (tomorrowRestricted.length) lines.push(`Mañana: ${tomorrowRestricted.join(', ')}`)

    const title = 'Pico y Placa'
    const body = lines.join(' | ')

    await self.registration.showNotification(title, {
      body,
      icon: '/icons/icon.svg',
      tag: 'pico-y-placa',
      badge: '/icons/icon.svg',
    })

    const tx = db.transaction(DB_STORES.METADATA, 'readwrite')
    tx.objectStore(DB_STORES.METADATA).put(true, notifyKey)
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)
    })
  } catch (err) {
    console.error('Error in pico-y-placa check:', err)
  }
}

function isRestricted(restrictions, month, day) {
  if (!restrictions) return false
  const monthData = restrictions[String(month)]
  if (!monthData) return false
  const d1 = Number(monthData.d1) || 0
  const d2 = Number(monthData.d2) || 0
  return (d1 !== 0 && d1 === day) || (d2 !== 0 && d2 === day)
}

// ─── Firestore REST fetch (no auth — requires public read rule on collection) ─

async function fetchVehiclesFromFirestore() {
  try {
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
    const url =
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/CashFlow_taxi_vehiculos?key=${apiKey}`
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    return (data.documents ?? []).map(parseFirestoreVehicle).filter((v) => v.plate)
  } catch {
    return []
  }
}

function parseFirestoreVehicle(doc) {
  const fields = doc.fields ?? {}
  const id = doc.name.split('/').pop()

  const restrictionsFields = fields.restrictions?.mapValue?.fields ?? {}
  const restrictions = {}
  for (const [month, monthVal] of Object.entries(restrictionsFields)) {
    const mf = monthVal.mapValue?.fields ?? {}
    restrictions[month] = {
      d1: Number(mf.d1?.integerValue ?? mf.d1?.doubleValue ?? 0),
      d2: Number(mf.d2?.integerValue ?? mf.d2?.doubleValue ?? 0),
    }
  }

  return {
    id,
    plate: fields.plate?.stringValue ?? '',
    restrictions,
  }
}
