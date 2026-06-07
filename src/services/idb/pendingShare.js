import { openDB, DB_STORES } from './db'

export async function getPendingShare() {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(DB_STORES.METADATA, 'readonly')
    const req = tx.objectStore(DB_STORES.METADATA).get('pending-share')
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror = () => resolve(null)
  })
}

export async function clearPendingShare() {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(DB_STORES.METADATA, 'readwrite')
    tx.objectStore(DB_STORES.METADATA).delete('pending-share')
    tx.oncomplete = resolve
    tx.onerror = resolve
  })
}
