// One-time migration: rename CashFlow_taxi_* → Taxi_* within the same Firebase project
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROD_SA = resolve(__dirname, '../notifier/service-account.json')

const app = admin.initializeApp({ credential: admin.credential.cert(PROD_SA) }, 'rename')
const db = admin.firestore(app)

const COLLECTIONS = [
  ['CashFlow_taxi_liquidaciones',       'Taxi_liquidaciones'],
  ['CashFlow_taxi_conductores',         'Taxi_conductores'],
  ['CashFlow_taxi_vehiculos',           'Taxi_vehiculos'],
  ['CashFlow_taxi_gastos',              'Taxi_gastos'],
  ['CashFlow_taxi_partners',            'Taxi_partners'],
  ['CashFlow_taxi_distributions',       'Taxi_distributions'],
  ['CashFlow_taxi_period_notes',        'Taxi_period_notes'],
  ['CashFlow_taxi_audit_notas',         'Taxi_audit_notas'],
  ['CashFlow_taxi_period_attachments',  'Taxi_period_attachments'],
]

const BATCH_SIZE = 400

async function copyCollection(src, dest) {
  const snap = await db.collection(src).get()

  if (snap.empty) {
    console.log(`  (vacía, omitida)`)
    return 0
  }

  const docs = snap.docs
  let written = 0

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = db.batch()
    const chunk = docs.slice(i, i + BATCH_SIZE)

    for (const docSnap of chunk) {
      batch.set(db.collection(dest).doc(docSnap.id), docSnap.data())
    }

    await batch.commit()
    written += chunk.length
  }

  return written
}

async function deleteCollection(name) {
  const snap = await db.collection(name).get()
  if (snap.empty) return

  for (let i = 0; i < snap.docs.length; i += BATCH_SIZE) {
    const batch = db.batch()
    snap.docs.slice(i, i + BATCH_SIZE).forEach((d) => batch.delete(d.ref))
    await batch.commit()
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log('=== Renombrar colecciones taxi: CashFlow_taxi_* → Taxi_* ===\n')

let totalDocs = 0

for (const [src, dest] of COLLECTIONS) {
  process.stdout.write(`${src} → ${dest} ... `)
  const count = await copyCollection(src, dest)
  console.log(`${count} docs`)
  totalDocs += count
}

console.log(`\n${totalDocs} documentos copiados. Verificá que todo esté bien antes de continuar.`)
console.log('Para eliminar las colecciones originales ejecutá con el flag --delete:\n')
console.log('  node scripts/rename-taxi-collections.mjs --delete\n')

if (process.argv.includes('--delete')) {
  console.log('── Eliminando colecciones originales ─────────────────────────')
  for (const [src] of COLLECTIONS) {
    process.stdout.write(`  Borrando ${src} ... `)
    await deleteCollection(src)
    console.log('✓')
  }
  console.log('\nListo.')
}

process.exit(0)
