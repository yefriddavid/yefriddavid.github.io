import { openDB } from '../../idb/db'
import { IDB_STORES as S } from '../../idb/idbStores'

const STORE = S.FINANCE_CALC_LIST

export const fetchAll = async () => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll()
    req.onsuccess = (e) => {
      const all = e.target.result ?? []
      // filter to valid list documents (ignore legacy flat rows)
      resolve(all.filter((d) => d && typeof d.name === 'string' && Array.isArray(d.rows)))
    }
    req.onerror = (e) => reject(e.target.error)
  })
}

export const saveList = async (list) => {
  const db = await openDB()
  const record = { ...list, id: list.id || crypto.randomUUID() }
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).put(record)
    req.onsuccess = () => resolve(record)
    req.onerror = (e) => reject(e.target.error)
  })
}

export const deleteList = async (id) => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id)
    req.onsuccess = () => resolve()
    req.onerror = (e) => reject(e.target.error)
  })
}
