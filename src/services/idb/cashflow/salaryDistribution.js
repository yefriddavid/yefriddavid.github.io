import { openDB, DB_STORES } from '../db'

const STORE_NAME = DB_STORES.SALARY_DISTRIBUTION
const RECORD_KEY = 'config'

export async function getConfig() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(RECORD_KEY)
    req.onsuccess = (e) => {
      const val = e.target.result ?? null
      if (!val) return resolve(null)
      // migrate old plain-array format
      if (Array.isArray(val)) return resolve({ data: val, savedAt: null })
      resolve(val)
    }
    req.onerror = (e) => reject(e.target.error)
  })
}

export async function saveConfig(distributions, savedAt = new Date().toISOString()) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const req = tx.objectStore(STORE_NAME).put({ data: distributions, savedAt }, RECORD_KEY)
    req.onsuccess = () => resolve()
    req.onerror = (e) => reject(e.target.error)
  })
}
