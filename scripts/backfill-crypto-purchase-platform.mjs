// One-time backfill: set platform = 'binance_col' on existing Finance_Crypto_Purchases
// docs that have no platform value.
//
// Uses the Admin SDK (service account) so it bypasses Firestore security rules —
// the client SDK needs an authenticated user session, which this script doesn't have.
//
// Usage:
//   node scripts/backfill-crypto-purchase-platform.mjs             (dry run, production data)
//   node scripts/backfill-crypto-purchase-platform.mjs --apply     (write changes, production)
//   node scripts/backfill-crypto-purchase-platform.mjs --test            (dry run, test project)
//   node scripts/backfill-crypto-purchase-platform.mjs --test --apply    (write changes, test project)
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))

const COLLECTION = 'Finance_Crypto_Purchases'
const BATCH_SIZE = 499
const PLATFORM_VALUE = 'binance_col'

const isTest = process.argv.includes('--test')
const apply = process.argv.includes('--apply')
const env = isTest ? 'test' : 'production'

const SA_PATH = resolve(
  __dirname,
  isTest
    ? '../notifier/cashflow-test-afc07-firebase-adminsdk-fbsvc-85035f98c1.json'
    : '../notifier/service-account.json',
)

console.log(`\n🔧  backfill-crypto-purchase-platform`)
console.log(`    Entorno  : ${env}`)
console.log(`    Modo     : ${apply ? 'APLICAR CAMBIOS' : 'dry run (solo muestra el plan)'}\n`)

if (apply && !isTest) {
  console.log('⚠️  Vas a modificar PRODUCCIÓN. Tienes 5 segundos para cancelar (Ctrl+C)...\n')
  await new Promise((r) => setTimeout(r, 5000))
}

const app = admin.initializeApp({ credential: admin.credential.cert(SA_PATH) }, 'backfill')
const db = admin.firestore(app)

const snap = await db.collection(COLLECTION).get()

const toUpdate = snap.docs.filter((d) => !d.data().platform)

console.log(`Compras totales        : ${snap.size}`)
console.log(`Con plataforma ya      : ${snap.size - toUpdate.length}`)
console.log(`A completar            : ${toUpdate.length}\n`)

toUpdate.forEach((d) => {
  const { purchaseDate, symbol, quantity } = d.data()
  console.log(`  ${d.id}  ${purchaseDate}  ${symbol} x${quantity}  → platform "${PLATFORM_VALUE}"`)
})

if (!apply) {
  console.log(`\nDry run — no se escribió nada. Vuelve a correr con --apply para aplicar los cambios.`)
  process.exit(0)
}

for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
  const chunk = toUpdate.slice(i, i + BATCH_SIZE)
  const batch = db.batch()
  chunk.forEach((d) => batch.update(db.collection(COLLECTION).doc(d.id), { platform: PLATFORM_VALUE }))
  await batch.commit()
}

console.log(`\n✅  Listo. ${toUpdate.length} compras actualizadas con platform "${PLATFORM_VALUE}".`)
process.exit(0)
