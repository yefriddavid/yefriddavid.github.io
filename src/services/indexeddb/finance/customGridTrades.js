import { openDB } from '../../idb/db'
import { IDB_STORES as S } from '../../idb/idbStores'

const STORE = S.FINANCE_GRID_TRADES

// One-time migration from the old standalone 'custom_grid_trades' database.
const LEGACY_DB = 'custom_grid_trades'
const LEGACY_STORE = 'trades'
const MIGRATION_KEY = 'finance_grid_trades_migrated_v1'

let _migrated = false

async function runLegacyMigration(db) {
  if (_migrated) return
  _migrated = true

  const alreadyDone = await new Promise((resolve) => {
    const tx = db.transaction(S.APP_METADATA, 'readonly')
    const req = tx.objectStore(S.APP_METADATA).get(MIGRATION_KEY)
    req.onsuccess = () => resolve(!!req.result)
    req.onerror = () => resolve(true)
  })
  if (alreadyDone) return

  const legacyTrades = await new Promise((resolve) => {
    let isNew = false
    const req = indexedDB.open(LEGACY_DB)
    req.onupgradeneeded = () => {
      isNew = true
    }
    req.onsuccess = (e) => {
      const legacyDb = e.target.result
      if (isNew || !legacyDb.objectStoreNames.contains(LEGACY_STORE)) {
        legacyDb.close()
        if (isNew) indexedDB.deleteDatabase(LEGACY_DB)
        resolve([])
        return
      }
      const getAllReq = legacyDb
        .transaction(LEGACY_STORE, 'readonly')
        .objectStore(LEGACY_STORE)
        .getAll()
      getAllReq.onsuccess = (evt) => {
        legacyDb.close()
        resolve(evt.target.result ?? [])
      }
      getAllReq.onerror = () => {
        legacyDb.close()
        resolve([])
      }
    }
    req.onerror = () => resolve([])
  })

  if (legacyTrades.length > 0) {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      const store = tx.objectStore(STORE)
      legacyTrades.forEach((t) => store.put(t))
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)
    })
  }

  await new Promise((resolve) => {
    const tx = db.transaction(S.APP_METADATA, 'readwrite')
    tx.objectStore(S.APP_METADATA).put(true, MIGRATION_KEY)
    tx.oncomplete = resolve
    tx.onerror = resolve
  })

  if (legacyTrades.length > 0) indexedDB.deleteDatabase(LEGACY_DB)
}

async function getDb() {
  const db = await openDB()
  await runLegacyMigration(db)
  return db
}

export const fetchAll = async () => {
  const db = await getDb()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll()
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror = (e) => reject(e.target.error)
  })
}

export const saveTrade = async (trade) => {
  const db = await getDb()
  const id = trade.id || crypto.randomUUID()
  const now = new Date().toISOString()
  const record = { ...trade, id, updatedAt: now, createdAt: trade.createdAt ?? now }
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).put(record)
    req.onsuccess = () => resolve(id)
    req.onerror = (e) => reject(e.target.error)
  })
}

export const deleteTrade = async (id) => {
  const db = await getDb()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id)
    req.onsuccess = () => resolve()
    req.onerror = (e) => reject(e.target.error)
  })
}

export const deleteAll = async () => {
  const db = await getDb()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).clear()
    req.onsuccess = () => resolve()
    req.onerror = (e) => reject(e.target.error)
  })
}
