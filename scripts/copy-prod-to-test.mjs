/**
 * Copies all Firestore collections from production to the test project.
 *
 * Usage:
 *   node scripts/copy-prod-to-test.mjs
 *
 * To copy specific collections only:
 *   node scripts/copy-prod-to-test.mjs CashFlow_taxi_liquidaciones CashFlow_taxi_conductores
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

// Collections to copy. If args are passed, use those instead.
const ALL_COLLECTIONS = [
  // Taxi
  'CashFlow_taxi_liquidaciones',
  'CashFlow_taxi_conductores',
  'CashFlow_taxi_vehiculos',
  'CashFlow_taxi_partners',
  'CashFlow_taxi_period_notes',
  'CashFlow_taxi_audit_notes',
  'CashFlow_taxi_audit_notas',
  'CashFlow_taxi_gastos',
  // CashFlow
  'CashFlow_AccountsMaster',
  'CashFlow_Transactions',
  'CashFlow_account_status_period_notes',
  'CashFlow_salary_distribution',
  'CashFlow_assets',
  'CashFlow_my_projects',
  'CashFlow_eggs',
  // Vouchers
  'paymentVauchers',
  'paymentVauchers-2025',
  'paymentVauchers-2026',
  // Contratos
  'Contratos_Contratos',
  'Contratos_CuentasBancarias',
  'Contratos_Inmuebles',
  'Contratos_Propietarios',
  'Contratos_contract_attachments',
  'Contratos_contract_notes',
  // Seguridad
  'users',
  'sessions',
  'fcm_tokens',
  'registers',
]

const targets = process.argv.slice(2).length > 0 ? process.argv.slice(2) : ALL_COLLECTIONS

async function copyCollection(colName) {
  const snap = await prodDb.collection(colName).get()
  if (snap.empty) {
    console.log(`  ↷ ${colName} — vacía, se omite`)
    return { copied: 0, failed: 0 }
  }

  const batch_size = 400
  let copied = 0
  let failed = 0
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
  }

  if (batchCount > 0) await batch.commit()

  return { copied, failed }
}

// Detect actual collection names from Firestore in case they differ
async function listProdCollections() {
  const cols = await prodDb.listCollections()
  return cols.map((c) => c.id)
}

console.log('🔄 Copiando colecciones de prod → test\n')

if (process.argv.slice(2).length === 0) {
  console.log('ℹ️  Detectando colecciones en prod...')
  const actual = await listProdCollections()
  const unknown = actual.filter((c) => !ALL_COLLECTIONS.includes(c))
  if (unknown.length > 0) {
    console.log(`⚠️  Colecciones en prod no incluidas en el script: ${unknown.join(', ')}\n`)
  }
}

let totalCopied = 0
let totalFailed = 0

for (const col of targets) {
  process.stdout.write(`  ${col}... `)
  try {
    const { copied, failed } = await copyCollection(col)
    totalCopied += copied
    totalFailed += failed
    console.log(`✓ ${copied} docs`)
  } catch (err) {
    console.log(`✗ ERROR: ${err.message}`)
    totalFailed++
  }
}

console.log(`\n✅ Listo. ${totalCopied} documentos copiados, ${totalFailed} errores.`)
process.exit(totalFailed > 0 ? 1 : 0)
