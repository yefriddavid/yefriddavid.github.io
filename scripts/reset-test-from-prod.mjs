/**
 * Resets the test database by deleting all its data and then
 * copying all Firestore collections from the production project.
 *
 * Usage:
 *   node scripts/reset-test-from-prod.mjs
 */

import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))

const PROD_SA = resolve(__dirname, '../notifier/service-account.json')
const TEST_SA = resolve(__dirname, '../notifier/cashflow-test-afc07-firebase-adminsdk-fbsvc-85035f98c1.json')

const prodApp = admin.initializeApp(
  { credential: admin.credential.cert(PROD_SA) },
  'prod',
)
const testApp = admin.initializeApp(
  { credential: admin.credential.cert(TEST_SA) },
  'test',
)

const prodDb = admin.firestore(prodApp)
const testDb = admin.firestore(testApp)

async function deleteCollection(colName) {
  const colRef = testDb.collection(colName)
  const query = colRef.orderBy('__name__').limit(500)
  
  let deletedCount = 0
  
  while (true) {
    const snapshot = await query.get()
    if (snapshot.size === 0) break
    
    const batch = testDb.batch()
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })
    
    await batch.commit()
    deletedCount += snapshot.size
    process.stdout.write(`\r  🗑️  ${colName}... ${deletedCount} borrados`)
  }
  console.log(`\r  🗑️  ${colName}... ✓ ${deletedCount} borrados`)
  return deletedCount
}

async function copyCollection(colName) {
  const snap = await prodDb.collection(colName).get()
  if (snap.empty) {
    console.log(`  ↷ ${colName} — vacía, se omite`)
    return 0
  }

  const batch_size = 500
  let copied = 0
  let batch = testDb.batch()
  let batchCount = 0

  for (const docSnap of snap.docs) {
    batch.set(testDb.collection(colName).doc(docSnap.id), docSnap.data())
    batchCount++

    if (batchCount === batch_size) {
      await batch.commit()
      batch = testDb.batch()
      batchCount = 0
    }
    copied++
    process.stdout.write(`\r  📥 ${colName}... ${copied} copiados`)
  }

  if (batchCount > 0) await batch.commit()
  console.log(`\r  📥 ${colName}... ✓ ${copied} copiados`)
  return copied
}

async function main() {
  console.log('🚀 Iniciando reset de base de datos de TEST desde PROD\n')

  // 1. Limpiar TEST
  console.log('--- FASE 1: Limpiando base de datos de TEST ---')
  const testCols = await testDb.listCollections()
  if (testCols.length === 0) {
    console.log('ℹ️ No se encontraron colecciones en TEST.')
  } else {
    for (const col of testCols) {
      await deleteCollection(col.id)
    }
  }

  console.log('\n--- FASE 2: Copiando datos de PROD ---')
  const prodCols = await prodDb.listCollections()
  let totalCopied = 0

  for (const col of prodCols) {
    const count = await copyCollection(col.id)
    totalCopied += count
  }

  console.log(`\n✅ Proceso completado con éxito.`)
  console.log(`📊 Total documentos copiados: ${totalCopied}`)
  process.exit(0)
}

main().catch((err) => {
  console.error('\n❌ Error fatal:', err)
  process.exit(1)
})
