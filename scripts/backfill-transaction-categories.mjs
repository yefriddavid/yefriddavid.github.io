// One-time backfill: sync CashFlow_Transactions.category from the current
// CashFlow_AccountsMaster.category for account-linked transactions (accountMasterId set).
// Ad-hoc transactions (no accountMasterId) are left untouched — there's no
// account to infer their category from.
//
// Uses the Admin SDK (service account) so it bypasses Firestore security rules —
// the client SDK needs an authenticated user session, which this script doesn't have.
//
// Usage:
//   node scripts/backfill-transaction-categories.mjs             (dry run, production data)
//   node scripts/backfill-transaction-categories.mjs --apply     (write changes, production)
//   node scripts/backfill-transaction-categories.mjs --test            (dry run, test project)
//   node scripts/backfill-transaction-categories.mjs --test --apply    (write changes, test project)
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))

const TENANT_ID = 'Atlfc1jvEUbLsintnpAq'
const BATCH_SIZE = 499

const isTest = process.argv.includes('--test')
const apply = process.argv.includes('--apply')
const env = isTest ? 'test' : 'production'

const SA_PATH = resolve(
  __dirname,
  isTest ? '../notifier/cashflow-test-afc07-firebase-adminsdk-fbsvc-85035f98c1.json' : '../notifier/service-account.json',
)

console.log(`\n🔧  backfill-transaction-categories`)
console.log(`    Entorno  : ${env}`)
console.log(`    Modo     : ${apply ? 'APLICAR CAMBIOS' : 'dry run (solo muestra el plan)'}\n`)

if (apply && !isTest) {
  console.log('⚠️  Vas a modificar PRODUCCIÓN. Tienes 5 segundos para cancelar (Ctrl+C)...\n')
  await new Promise((r) => setTimeout(r, 5000))
}

const app = admin.initializeApp({ credential: admin.credential.cert(SA_PATH) }, 'backfill')
const db = admin.firestore(app)

const mastersSnap = await db
  .collection('CashFlow_AccountsMaster')
  .where('tenantId', '==', TENANT_ID)
  .get()
const categoryByAccountId = {}
mastersSnap.docs.forEach((d) => {
  const { category } = d.data()
  if (category) categoryByAccountId[d.id] = category
})
console.log(`Cuentas maestras con categoría: ${Object.keys(categoryByAccountId).length}`)

const txSnap = await db
  .collection('CashFlow_Transactions')
  .where('tenantId', '==', TENANT_ID)
  .get()

const toUpdate = []
let noMasterCategory = 0
let alreadyOk = 0
let adHoc = 0

txSnap.docs.forEach((d) => {
  const t = d.data()
  if (!t.accountMasterId) {
    adHoc++
    return
  }
  const masterCategory = categoryByAccountId[t.accountMasterId]
  if (!masterCategory) {
    noMasterCategory++
    return
  }
  if (t.category === masterCategory) {
    alreadyOk++
    return
  }
  toUpdate.push({
    id: d.id,
    from: t.category || '(vacía)',
    to: masterCategory,
    description: t.description,
  })
})

console.log(`\nTransacciones totales     : ${txSnap.size}`)
console.log(`Ad-hoc (sin cuenta)       : ${adHoc}`)
console.log(`Cuenta sin categoría aún  : ${noMasterCategory}`)
console.log(`Ya correctas              : ${alreadyOk}`)
console.log(`A actualizar              : ${toUpdate.length}\n`)

toUpdate.forEach((u) => {
  console.log(`  ${u.id}  ${u.description ?? ''}  "${u.from}" → "${u.to}"`)
})

if (!apply) {
  console.log(`\nDry run — no se escribió nada. Vuelve a correr con --apply para aplicar los cambios.`)
  process.exit(0)
}

for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
  const chunk = toUpdate.slice(i, i + BATCH_SIZE)
  const batch = db.batch()
  chunk.forEach((u) => batch.update(db.collection('CashFlow_Transactions').doc(u.id), { category: u.to }))
  await batch.commit()
}

console.log(`\n✅  Listo. ${toUpdate.length} transacciones actualizadas.`)
process.exit(0)
