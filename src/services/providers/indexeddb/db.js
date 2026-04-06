const DB_NAME = 'my-admin-local'
const DB_VERSION = 4

const STORES = {
  SALARY_DISTRIBUTION: 'salary-distribution',
  MY_PROJECTS: 'my-projects',
  ASSETS: 'assets',
  ACCOUNTS_MASTER: 'accounts-master',
}

export function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = (e) => {
      const db = e.target.result

      if (!db.objectStoreNames.contains(STORES.SALARY_DISTRIBUTION)) {
        db.createObjectStore(STORES.SALARY_DISTRIBUTION)
      }

      if (!db.objectStoreNames.contains(STORES.MY_PROJECTS)) {
        db.createObjectStore(STORES.MY_PROJECTS, { keyPath: 'id' })
      }

      if (!db.objectStoreNames.contains(STORES.ASSETS)) {
        db.createObjectStore(STORES.ASSETS, { keyPath: 'id' })
      }

      if (!db.objectStoreNames.contains(STORES.ACCOUNTS_MASTER)) {
        db.createObjectStore(STORES.ACCOUNTS_MASTER, { keyPath: 'id' })
      }
    }

    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror = (e) => reject(e.target.error)
  })
}

export const DB_STORES = STORES
