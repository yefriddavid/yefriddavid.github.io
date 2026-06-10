import { openDB } from '../db'
import { IDB_STORES as S } from '../idbStores'

const STORE = S.CF_SALARY_DISTRIBUTION
const RECORD_KEY = 'config'

export async function getConfig() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(RECORD_KEY)
    req.onsuccess = (e) => {
      const val = e.target.result ?? null
      if (!val) return resolve(null)
      if (Array.isArray(val)) return resolve({ data: val, savedAt: null })
      resolve(val)
    }
    req.onerror = (e) => reject(e.target.error)
  })
}

export async function saveConfig(distributions, savedAt = new Date().toISOString()) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const req = tx.objectStore(STORE).put({ data: distributions, savedAt }, RECORD_KEY)
    req.onsuccess = () => resolve()
    req.onerror = (e) => reject(e.target.error)
  })
}
