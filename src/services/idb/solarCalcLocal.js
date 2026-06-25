import { openDB } from './db'
import { IDB_STORES as S } from './idbStores'

const STORE = S.DOMOTICA_SOLAR_CALC
const FIXED_ID = 'default'

export const fetchSolarCalcConfigs = async () => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(FIXED_ID)
    req.onsuccess = (e) => resolve(e.target.result ? [e.target.result] : [])
    req.onerror = (e) => reject(e.target.error)
  })
}

export const createSolarCalcConfig = async (data) => {
  const record = { ...data, id: FIXED_ID, createdAt: Date.now(), updatedAt: Date.now() }
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).put(record)
    req.onsuccess = () => resolve(FIXED_ID)
    req.onerror = (e) => reject(e.target.error)
  })
}

export const updateSolarCalcConfig = async (_id, data) => {
  const record = { ...data, id: FIXED_ID, updatedAt: Date.now() }
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).put(record)
    req.onsuccess = () => resolve()
    req.onerror = (e) => reject(e.target.error)
  })
}

export const deleteSolarCalcConfig = async () => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).delete(FIXED_ID)
    req.onsuccess = () => resolve()
    req.onerror = (e) => reject(e.target.error)
  })
}
