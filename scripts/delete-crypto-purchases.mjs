// One-time reset: delete ALL documents in Finance_Crypto_Purchases so the
// collection can be rebuilt from scratch by scripts/sync-crypto-purchases
// (real Binance trade history) instead of the old manual/seed entries.
//
// Uses the Admin SDK (service account) so it bypasses Firestore security rules —
// the client SDK needs an authenticated user session, which this script doesn't have.
//
// Usage:
//   node scripts/delete-crypto-purchases.mjs             (dry run, production data)
//   node scripts/delete-crypto-purchases.mjs --apply     (delete, production)
//   node scripts/delete-crypto-purchases.mjs --test            (dry run, test project)
//   node scripts/delete-crypto-purchases.mjs --test --apply    (delete, test project)
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))

const COLLECTION = 'Finance_Crypto_Purchases'
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

console.log(`\n🔧  delete-crypto-purchases`)
console.log(`    Entorno  : ${env}`)
console.log(`    Modo     : ${apply ? 'APLICAR BORRADO' : 'dry run (solo muestra el plan)'}\n`)

if (apply && !isTest) {
  console.log('⚠️  Vas a BORRAR datos de PRODUCCIÓN. Tienes 5 segundos para cancelar (Ctrl+C)...\n')
  await new Promise((r) => setTimeout(r, 5000))
}

const app = admin.initializeApp({ credential: admin.credential.cert(SA_PATH) }, 'delete-crypto')
const db = admin.firestore(app)

const snap = await db.collection(COLLECTION).get()

console.log(`Documentos encontrados: ${snap.size}\n`)
snap.docs.forEach((d) => {
  const { symbol, type, purchaseDate, quantity } = d.data()
  console.log(`  ${d.id}  ${purchaseDate}  ${symbol} ${type ?? 'buy'} x${quantity}`)
})

if (!apply) {
  console.log(`\nDry run — no se borró nada. Vuelve a correr con --apply para borrar.`)
  process.exit(0)
}

for (let i = 0; i < snap.docs.length; i += BATCH_SIZE) {
  const chunk = snap.docs.slice(i, i + BATCH_SIZE)
  const batch = db.batch()
  chunk.forEach((d) => batch.delete(d.ref))
  await batch.commit()
}

console.log(`\n✅  Listo. ${snap.size} documentos borrados de ${COLLECTION}.`)
process.exit(0)
