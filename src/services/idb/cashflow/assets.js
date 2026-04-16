import { openDB, DB_STORES } from '../db'

const STORE = DB_STORES.ASSETS

export async function getAllAssets() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll()
    req.onsuccess = (e) => resolve(e.target.result ?? [])
    req.onerror = (e) => reject(e.target.error)
  })
}

export async function saveAsset(asset) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).put(asset)
    req.onsuccess = () => resolve()
    req.onerror = (e) => reject(e.target.error)
  })
}

export async function deleteAsset(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id)
    req.onsuccess = () => resolve()
    req.onerror = (e) => reject(e.target.error)
  })
}
