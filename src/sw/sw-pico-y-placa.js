import { openDB, DB_STORES } from '../services/providers/indexeddb/db'
import { getVehicles, saveVehicles } from '../services/providers/indexeddb/CashFlow/taxiVehicles'
import { getNotifyHours } from '../services/providers/indexeddb/picoPlacaConfig'

const DAY_LABELS = ['Hoy', 'Mañana', 'En 2 días', 'En 3 días', 'En 4 días']

export async function checkPicoYPlaca() {
  try {
    const now = new Date()
    const hour = now.getHours()

    const windows = await getNotifyHours()
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

    const lines = []
    for (let i = 0; i <= 4; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() + i)
      const restricted = vehicles
        .filter((v) => isRestricted(v.restrictions, d.getMonth() + 1, d.getDate()))
        .map((v) => v.plate)

      if (i === 0) {
        lines.push(restricted.length ? `Hoy: ${restricted.join(', ')}` : 'Hoy: sin pico y placa')
      } else if (restricted.length) {
        lines.push(`${DAY_LABELS[i]}: ${restricted.join(', ')}`)
      }
    }

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
