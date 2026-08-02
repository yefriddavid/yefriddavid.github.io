// One-time backfill: set serverTimestamp on existing CashFlow_my_projects docs
// that don't have it.
//
// RxDB's replicateFirestore pull query does `orderBy(serverTimestampField)`
// (see node_modules/rxdb/dist/esm/plugins/replication-firestore/index.js) —
// Firestore's orderBy silently excludes any document missing that field, so
// projects created before the RxDB migration (commit cdc2135) never sync down
// to the local RxDB collection. Only projects created after the migration have
// serverTimestamp, since RxDB's push stamps it automatically.
//
// Uses the Admin SDK (service account) so it bypasses Firestore security rules —
// the client SDK needs an authenticated user session, which this script doesn't have.
//
// Usage:
//   node scripts/backfill-myproject-server-timestamp.mjs             (dry run, production data)
//   node scripts/backfill-myproject-server-timestamp.mjs --apply     (write changes, production)
//   node scripts/backfill-myproject-server-timestamp.mjs --test            (dry run, test project)
//   node scripts/backfill-myproject-server-timestamp.mjs --test --apply    (write changes, test project)
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))

const COLLECTION = 'CashFlow_my_projects'
const BATCH_SIZE = 499

const isTest = process.argv.includes('--test')
const apply = process.argv.includes('--apply')
const env = isTest ? 'test' : 'production'

const SA_PATH = resolve(
  __dirname,
  isTest
    ? '../notifier/cashflow-test-afc07-firebase-adminsdk-fbsvc-85035f98c1.json'
    : '../notifier/service-account.json',
)

console.log(`\n🔧  backfill-myproject-server-timestamp`)
console.log(`    Entorno  : ${env}`)
console.log(`    Modo     : ${apply ? 'APLICAR CAMBIOS' : 'dry run (solo muestra el plan)'}\n`)

if (apply && !isTest) {
  console.log('⚠️  Vas a modificar PRODUCCIÓN. Tienes 5 segundos para cancelar (Ctrl+C)...\n')
  await new Promise((r) => setTimeout(r, 5000))
}

const app = admin.initializeApp({ credential: admin.credential.cert(SA_PATH) }, 'backfill')
const db = admin.firestore(app)

const snap = await db.collection(COLLECTION).get()

const toUpdate = snap.docs.filter((d) => !d.data().serverTimestamp)

console.log(`Proyectos totales      : ${snap.size}`)
console.log(`Con serverTimestamp ya : ${snap.size - toUpdate.length}`)
console.log(`A completar            : ${toUpdate.length}\n`)

toUpdate.forEach((d) => {
  const { description, tenantId } = d.data()
  console.log(`  ${d.id}  "${description ?? ''}"  tenant=${tenantId ?? '(sin tenant)'}`)
})

if (!apply) {
  console.log(`\nDry run — no se escribió nada. Vuelve a correr con --apply para aplicar los cambios.`)
  process.exit(0)
}

for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
  const chunk = toUpdate.slice(i, i + BATCH_SIZE)
  const batch = db.batch()
  chunk.forEach((d) =>
    batch.update(db.collection(COLLECTION).doc(d.id), {
      serverTimestamp: admin.firestore.FieldValue.serverTimestamp(),
    }),
  )
  await batch.commit()
}

console.log(`\n✅  Listo. ${toUpdate.length} proyectos actualizados con serverTimestamp.`)
process.exit(0)
