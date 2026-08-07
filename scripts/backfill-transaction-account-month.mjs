// One-time backfill: sets accountMonth on CashFlow_Transactions docs that are
// missing it (accountMonth = date.slice(0, 7)).
//
// Needed so the AccountStatus period-scoped Firestore query
// (where('accountMonth', '==', monthStr)) doesn't silently skip legacy
// transactions that predate the accountMonth field.
//
// Uses the Admin SDK (service account) so it bypasses Firestore security rules.
//
// Usage:
//   node scripts/backfill-transaction-account-month.mjs             (dry run, production data)
//   node scripts/backfill-transaction-account-month.mjs --apply     (write changes, production)
//   node scripts/backfill-transaction-account-month.mjs --test            (dry run, test project)
//   node scripts/backfill-transaction-account-month.mjs --test --apply    (write changes, test project)
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))

const COLLECTION = 'CashFlow_Transactions'
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

console.log(`\n🔧  backfill-transaction-account-month`)
console.log(`    Entorno  : ${env}`)
console.log(`    Modo     : ${apply ? 'APLICAR CAMBIOS' : 'dry run (solo muestra el plan)'}\n`)

if (apply && !isTest) {
  console.log('⚠️  Vas a modificar PRODUCCIÓN. Tienes 5 segundos para cancelar (Ctrl+C)...\n')
  await new Promise((r) => setTimeout(r, 5000))
}

admin.initializeApp({ credential: admin.credential.cert(require(SA_PATH)) })
const db = admin.firestore()

const snap = await db.collection(COLLECTION).get()
const toFix = []
snap.forEach((d) => {
  const data = d.data()
  if ((data.accountMonth === undefined || data.accountMonth === null) && data.date) {
    toFix.push({ id: d.id, accountMonth: data.date.slice(0, 7), description: data.description })
  }
})

console.log(`Encontrados ${toFix.length} documentos sin accountMonth de ${snap.size} totales.\n`)
toFix.forEach((t) => console.log(`  ${t.id}  →  accountMonth: ${t.accountMonth}  (${t.description ?? '—'})`))

if (!apply) {
  console.log('\nDry run — no se escribió nada. Volvé a correr con --apply para aplicar.')
  process.exit(0)
}

for (let i = 0; i < toFix.length; i += BATCH_SIZE) {
  const batch = db.batch()
  toFix.slice(i, i + BATCH_SIZE).forEach((t) => {
    batch.update(db.collection(COLLECTION).doc(t.id), { accountMonth: t.accountMonth })
  })
  await batch.commit()
}

console.log(`\n✅ Actualizados ${toFix.length} documentos.`)
