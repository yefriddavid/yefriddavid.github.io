import { openDB, DB_STORES } from '../db'

const STORE = DB_STORES.ACCOUNTS_MASTER

export async function getAllAccounts() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = (e) => resolve(e.target.result ?? [])
    req.onerror = (e) => reject(e.target.error)
  })
}

export async function saveAccounts(accounts) {
  if (!Array.isArray(accounts)) return
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)

    // Clear existing data to ensure sync
    store.clear()

    accounts.forEach((account) => {
      store.put(account)
    })

    tx.oncomplete = () => resolve()
    tx.onerror = (e) => reject(e.target.error)
  })
}

export async function saveAccount(account) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const req = tx.objectStore(STORE).put(account)
    req.onsuccess = () => resolve()
    req.onerror = (e) => reject(e.target.error)
  })
}

export async function deleteAccount(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const req = tx.objectStore(STORE).delete(id)
    req.onsuccess = () => resolve()
    req.onerror = (e) => reject(e.target.error)
  })
}
