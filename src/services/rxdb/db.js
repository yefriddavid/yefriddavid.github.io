import { createRxDatabase } from 'rxdb'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'

let dbPromise = null

export function getRxDb() {
  if (!dbPromise) {
    dbPromise = createRxDatabase({
      name: 'my-admin-rxdb',
      storage: getRxStorageDexie(),
    })
  }
  return dbPromise
}
