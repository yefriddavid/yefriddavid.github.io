import { openDB } from '../../idb/db'
import { IDB_STORES as S } from '../../idb/idbStores'

const STORE = S.FINANCE_LOANS

export const fetchAll = async () => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll()
    req.onsuccess = (e) => {
      const all = (e.target.result ?? []).filter((d) => d && typeof d.name === 'string')
      all.sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1))
      resolve(all)
    }
    req.onerror = (e) => reject(e.target.error)
  })
}

export const saveLoan = async (loan) => {
  const db = await openDB()
  const record = {
    ...loan,
    id: loan.id || crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
  }
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).put(record)
    req.onsuccess = () => resolve(record)
    req.onerror = (e) => reject(e.target.error)
  })
}

export const deleteLoan = async (id) => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id)
    req.onsuccess = () => resolve()
    req.onerror = (e) => reject(e.target.error)
  })
}
