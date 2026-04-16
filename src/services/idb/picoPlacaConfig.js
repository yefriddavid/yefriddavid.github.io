import { openDB, DB_STORES } from './db'

const KEY = 'pico-placa-notify-hours'
export const DEFAULT_HOURS = [8, 12, 17]

export async function getNotifyHours() {
  try {
    const db = await openDB()
    return await new Promise((resolve) => {
      const tx = db.transaction(DB_STORES.METADATA, 'readonly')
      const req = tx.objectStore(DB_STORES.METADATA).get(KEY)
      req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : DEFAULT_HOURS)
      req.onerror = () => resolve(DEFAULT_HOURS)
    })
  } catch {
    return DEFAULT_HOURS
  }
}

export async function saveNotifyHours(hours) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORES.METADATA, 'readwrite')
    tx.objectStore(DB_STORES.METADATA).put(hours, KEY)
    tx.oncomplete = resolve
    tx.onerror = () => reject(tx.error)
  })
}
