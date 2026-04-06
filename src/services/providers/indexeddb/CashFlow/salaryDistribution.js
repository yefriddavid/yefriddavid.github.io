import { openDB, DB_STORES } from '../db'

const STORE_NAME = DB_STORES.SALARY_DISTRIBUTION
const RECORD_KEY = 'config'

export async function getConfig() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(RECORD_KEY)
    req.onsuccess = (e) => resolve(e.target.result ?? null)
    req.onerror = (e) => reject(e.target.error)
  })
}

export async function saveConfig(config) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const req = tx.objectStore(STORE_NAME).put(config, RECORD_KEY)
    req.onsuccess = () => resolve()
    req.onerror = (e) => reject(e.target.error)
  })
}
