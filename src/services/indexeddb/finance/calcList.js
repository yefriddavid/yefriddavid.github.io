import { openDB } from '../../idb/db'
import { IDB_STORES as S } from '../../idb/idbStores'

const STORE = S.FINANCE_CALC_LIST

export const fetchAll = async () => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll()
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror = (e) => reject(e.target.error)
  })
}

export const upsertRow = async (row) => {
  const db = await openDB()
  const record = { ...row, id: row.id || crypto.randomUUID() }
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).put(record)
    req.onsuccess = () => resolve(record)
    req.onerror = (e) => reject(e.target.error)
  })
}

export const deleteRow = async (id) => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id)
    req.onsuccess = () => resolve()
    req.onerror = (e) => reject(e.target.error)
  })
}
