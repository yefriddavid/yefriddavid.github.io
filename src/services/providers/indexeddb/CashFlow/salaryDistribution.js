// IndexedDB service for salary distribution config.
// To migrate to Firebase: implement the same getConfig / saveConfig interface
// in src/services/providers/firebase/CashFlow/salaryDistribution.js and
// update the import in the saga.

const DB_NAME = 'my-admin-local'
const DB_VERSION = 3
const STORE_NAME = 'salary-distribution'
const RECORD_KEY = 'config'

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
      if (!db.objectStoreNames.contains('my-projects')) {
        db.createObjectStore('my-projects', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('assets')) {
        db.createObjectStore('assets', { keyPath: 'id' })
      }
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror = (e) => reject(e.target.error)
  })
}

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
