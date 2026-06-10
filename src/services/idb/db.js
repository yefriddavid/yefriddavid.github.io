import { IDB_NAME, IDB_VERSION, IDB_STORES as S } from './idbStores'

let _db = null
let _opening = null

// Copies records from an old store to a new store (already created), then deletes the old store.
// useKey=true for key-value stores (no keyPath), false for keyPath stores.
function migrateStore(db, tx, oldName, newName, opts, useKey) {
  if (db.objectStoreNames.contains(newName)) {
    if (db.objectStoreNames.contains(oldName)) db.deleteObjectStore(oldName)
    return
  }
  const newStore = db.createObjectStore(newName, opts)
  if (!db.objectStoreNames.contains(oldName)) return
  tx.objectStore(oldName).openCursor().onsuccess = (e) => {
    const cursor = e.target.result
    if (!cursor) {
      db.deleteObjectStore(oldName)
      return
    }
    useKey ? newStore.put(cursor.value, cursor.key) : newStore.put(cursor.value)
    cursor.continue()
  }
}

export function openDB() {
  if (_db) return Promise.resolve(_db)
  if (_opening) return _opening

  _opening = new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION)

    req.onupgradeneeded = (e) => {
      const db = e.target.result
      const tx = e.target.transaction

      // Rename existing stores (v1–v7) to new names; creates fresh on first install.
      migrateStore(db, tx, 'salary-distribution', S.CF_SALARY_DISTRIBUTION, undefined, true)
      migrateStore(db, tx, 'my-projects', S.CF_MY_PROJECTS, { keyPath: 'id' }, false)
      migrateStore(db, tx, 'assets', S.CF_ASSETS, { keyPath: 'id' }, false)
      migrateStore(db, tx, 'accounts-master', S.CF_ACCOUNTS_MASTER, { keyPath: 'id' }, false)
      migrateStore(db, tx, 'metadata', S.APP_METADATA, undefined, true)
      migrateStore(db, tx, 'taxi-vehicles', S.TAXI_VEHICLES, { keyPath: 'id' }, false)
      migrateStore(db, tx, 'tasks', S.MISC_TASKS, { keyPath: 'id' }, false)

      if (!db.objectStoreNames.contains(S.FINANCE_GRID_TRADES)) {
        db.createObjectStore(S.FINANCE_GRID_TRADES, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(S.FINANCE_CALC_LIST)) {
        db.createObjectStore(S.FINANCE_CALC_LIST, { keyPath: 'id' })
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

    req.onblocked = () => {
      const reloadKey = `idb-reload-v${IDB_VERSION}`
      if (!sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, '1')
        window.location.reload()
      } else {
        _opening = null
        reject(new Error('IDB upgrade blocked. Cierra otras pestañas de la app y recarga.'))
      }
    }
  })

  return _opening
}

// Re-exported for consumers that still import DB_STORES from this file (sw.js, etc.)
export const DB_STORES = S
