// One-time migration: copy all Taxi collections from cashflow → tapsi-f2345
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))

const SOURCE_SA = resolve(__dirname, '../notifier/service-account.json')
const DEST_SA = resolve(__dirname, '../notifier/taxi-service-account.json')

const TAXI_RTDB_URL = 'https://tapsi-f2345-default-rtdb.firebaseio.com'

const COLLECTIONS = [
  'Taxi_liquidaciones',
  'Taxi_conductores',
  'Taxi_vehiculos',
  'Taxi_gastos',
  'Taxi_partners',
  'Taxi_distributions',
  'Taxi_period_notes',
  'Taxi_audit_notas',
  'Taxi_period_attachments',
  'Taxi_vehicle_location_history',
]

const BATCH_SIZE = 400

const sourceApp = admin.initializeApp(
  { credential: admin.credential.cert(SOURCE_SA) },
  'source',
)

const destApp = admin.initializeApp(
  { credential: admin.credential.cert(DEST_SA), databaseURL: TAXI_RTDB_URL },
  'dest',
)

const sourceDb = admin.firestore(sourceApp)
const destDb = admin.firestore(destApp)

async function migrateCollection(name) {
  const snap = await sourceDb.collection(name).get()

  if (snap.empty) {
    console.log(`  (vacía, omitida)`)
    return 0
  }

  const docs = snap.docs
  let written = 0

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = destDb.batch()
    const chunk = docs.slice(i, i + BATCH_SIZE)
    chunk.forEach((d) => batch.set(destDb.collection(name).doc(d.id), d.data()))
    await batch.commit()
    written += chunk.length
  }

  return written
}

console.log('=== Migración Taxi: cashflow → tapsi-f2345 ===\n')

let total = 0
for (const col of COLLECTIONS) {
  process.stdout.write(`${col} ... `)
  const count = await migrateCollection(col)
  console.log(`${count} docs`)
  total += count
}

console.log(`\n${total} documentos copiados. Verificá que todo esté bien antes de continuar.`)
console.log('Para eliminar las colecciones del proyecto origen ejecutá con --delete:\n')
console.log('  node scripts/migrate-taxi-to-new-project.mjs --delete\n')

if (process.argv.includes('--delete')) {
  console.log('── Eliminando colecciones en cashflow ────────────────────────')
  for (const col of COLLECTIONS) {
    process.stdout.write(`  Borrando ${col} ... `)
    const snap = await sourceDb.collection(col).get()
    for (let i = 0; i < snap.docs.length; i += BATCH_SIZE) {
      const batch = sourceDb.batch()
      snap.docs.slice(i, i + BATCH_SIZE).forEach((d) => batch.delete(d.ref))
      await batch.commit()
    }
    console.log('✓')
  }
  console.log('\nListo.')
}

process.exit(0)
