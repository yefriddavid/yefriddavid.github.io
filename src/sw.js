import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'
import { openDB, DB_STORES } from './services/providers/indexeddb/db'
import { getAllAccounts } from './services/providers/indexeddb/CashFlow/accountsMaster'

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

// Periodic Background Sync to check active accounts
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-active-accounts') {
    event.waitUntil(checkActiveAccountsAndNotify())
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
