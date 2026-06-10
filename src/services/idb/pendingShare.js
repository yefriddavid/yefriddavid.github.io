import { openDB } from './db'
import { IDB_STORES as S } from './idbStores'

const STORE = S.APP_METADATA
const KEY = 'pending-share'

export async function getPendingShare() {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(KEY)
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror = () => resolve(null)
  })
}

export async function clearPendingShare() {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(KEY)
    tx.oncomplete = resolve
    tx.onerror = resolve
  })
}
