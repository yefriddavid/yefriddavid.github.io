import { createRxDatabase, addRxPlugin } from 'rxdb'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema'

addRxPlugin(RxDBMigrationSchemaPlugin)

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
