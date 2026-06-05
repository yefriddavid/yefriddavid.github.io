const DB_NAME = 'my-admin-local'
const DB_VERSION = 7

const STORES = {
  SALARY_DISTRIBUTION: 'salary-distribution',
  MY_PROJECTS: 'my-projects',
  ASSETS: 'assets',
  ACCOUNTS_MASTER: 'accounts-master',
  METADATA: 'metadata',
  TAXI_VEHICLES: 'taxi-vehicles',
  TASKS: 'tasks',
}

let _db = null
let _opening = null

export function openDB() {
  if (_db) return Promise.resolve(_db)
  if (_opening) return _opening

  _opening = new Promise((resolve, reject) => {
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
      if (!db.objectStoreNames.contains(STORES.METADATA)) {
        db.createObjectStore(STORES.METADATA)
      }
      if (!db.objectStoreNames.contains(STORES.TAXI_VEHICLES)) {
        db.createObjectStore(STORES.TAXI_VEHICLES, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORES.TASKS)) {
        db.createObjectStore(STORES.TASKS, { keyPath: 'id' })
      }
    }

    req.onsuccess = (e) => {
      _db = e.target.result
      _opening = null
      _db.onversionchange = () => {
        _db.close()
        _db = null
      }
      resolve(_db)
    }

    req.onerror = (e) => {
      _opening = null
      reject(e.target.error)
    }

    // Another connection is blocking the upgrade — reload once to clear it
    req.onblocked = () => {
      const reloadKey = `idb-reload-v${DB_VERSION}`
      if (!sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, '1')
        window.location.reload()
      } else {
        // Already reloaded once — reject so the app doesn't hang
        _opening = null
        reject(new Error('IDB upgrade blocked. Cierra otras pestañas de la app y recarga.'))
      }
    }
  })

  return _opening
}

export const DB_STORES = STORES
