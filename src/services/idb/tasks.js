import { openDB, DB_STORES } from './db'

const STORE = DB_STORES.TASKS

export const getAllTasks = async () => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = (e) => resolve(e.target.result ?? [])
    req.onerror = (e) => reject(e.target.error)
  })
}

export const saveTask = async (task) => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const req = tx.objectStore(STORE).put(task)
    req.onsuccess = () => resolve()
    req.onerror = (e) => reject(e.target.error)
  })
}

export const deleteTask = async (id) => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const req = tx.objectStore(STORE).delete(id)
    req.onsuccess = () => resolve()
    req.onerror = (e) => reject(e.target.error)
  })
}

export const saveBulkTasks = async (tasks) => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    tasks.forEach((t) => store.put(t))
    tx.oncomplete = () => resolve()
    tx.onerror = (e) => reject(e.target.error)
  })
}
