// One-time backfill: sets active: true on every Finance_Crypto_Purchases
// document (regardless of whether it already has the field), so the new
// `active` flag is consistently present across the whole collection.
//
// Uses the Admin SDK (service account) so it bypasses Firestore security rules.
//
// Usage:
//   node scripts/backfill-crypto-purchase-active.mjs             (dry run, production data)
//   node scripts/backfill-crypto-purchase-active.mjs --apply     (write, production)
//   node scripts/backfill-crypto-purchase-active.mjs --test            (dry run, test project)
//   node scripts/backfill-crypto-purchase-active.mjs --test --apply    (write, test project)
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))

const COLLECTION = 'Finance_Crypto_Purchases'
const TENANT_ID = 'Atlfc1jvEUbLsintnpAq'
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

console.log(`\n🔧  backfill-crypto-purchase-active`)
console.log(`    Entorno  : ${env}`)
console.log(`    Modo     : ${apply ? 'APLICAR CAMBIOS' : 'dry run (solo muestra el plan)'}\n`)

if (apply && !isTest) {
  console.log('⚠️  Vas a escribir en PRODUCCIÓN. Tienes 5 segundos para cancelar (Ctrl+C)...\n')
  await new Promise((r) => setTimeout(r, 5000))
}

const app = admin.initializeApp({ credential: admin.credential.cert(SA_PATH) }, 'backfill-active')
const db = admin.firestore(app)

const snap = await db.collection(COLLECTION).where('tenantId', '==', TENANT_ID).get()

const alreadyTrue = snap.docs.filter((d) => d.data().active === true).length
const toUpdate = snap.docs.filter((d) => d.data().active !== true)

console.log(`Documentos totales      : ${snap.size}`)
console.log(`Ya con active: true     : ${alreadyTrue}`)
console.log(`A actualizar            : ${toUpdate.length}\n`)

if (!apply) {
  console.log('Dry run — no se escribió nada. Vuelve a correr con --apply para aplicar los cambios.')
  process.exit(0)
}

for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
  const chunk = toUpdate.slice(i, i + BATCH_SIZE)
  const batch = db.batch()
  chunk.forEach((d) => batch.update(d.ref, { active: true }))
  await batch.commit()
}

console.log(`\n✅  Listo. ${toUpdate.length} documentos actualizados con active: true.`)
process.exit(0)
