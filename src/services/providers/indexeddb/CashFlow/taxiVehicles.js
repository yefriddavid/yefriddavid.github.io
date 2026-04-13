import { openDB, DB_STORES } from '../db'

export async function saveVehicles(vehicles) {
  const db = await openDB()
  const tx = db.transaction(DB_STORES.TAXI_VEHICLES, 'readwrite')
  const store = tx.objectStore(DB_STORES.TAXI_VEHICLES)
  store.clear()
  for (const v of vehicles) {
    store.put(v)
  }
  await new Promise((resolve, reject) => {
    tx.oncomplete = resolve
    tx.onerror = () => reject(tx.error)
  })
}

export async function getVehicles() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORES.TAXI_VEHICLES, 'readonly')
    const req = tx.objectStore(DB_STORES.TAXI_VEHICLES).getAll()
    req.onsuccess = () => resolve(req.result ?? [])
    req.onerror = () => reject(req.error)
  })
}
