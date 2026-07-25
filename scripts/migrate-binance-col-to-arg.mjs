// One-time migration: for a single tenant, change platform from 'binance_col'
// to 'binance_arg' on existing Finance_Crypto_Purchases docs.
//
// Uses the Admin SDK (service account) so it bypasses Firestore security rules —
// the client SDK needs an authenticated user session, which this script doesn't have.
//
// Usage:
//   node scripts/migrate-binance-col-to-arg.mjs             (dry run, production data)
//   node scripts/migrate-binance-col-to-arg.mjs --apply     (write changes, production)
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))

const COLLECTION = 'Finance_Crypto_Purchases'
const BATCH_SIZE = 499
const TENANT_ID = 'Atlfc1jvEUbLsintnpAq' // David rios LLC
const FROM_PLATFORM = 'binance_col'
const TO_PLATFORM = 'binance_arg'

const apply = process.argv.includes('--apply')

const SA_PATH = resolve(__dirname, '../notifier/service-account.json')

console.log(`\n🔧  migrate-binance-col-to-arg`)
console.log(`    Tenant   : ${TENANT_ID}`)
console.log(`    Cambio   : platform "${FROM_PLATFORM}" → "${TO_PLATFORM}"`)
console.log(`    Modo     : ${apply ? 'APLICAR CAMBIOS' : 'dry run (solo muestra el plan)'}\n`)

if (apply) {
  console.log('⚠️  Vas a modificar PRODUCCIÓN. Tienes 5 segundos para cancelar (Ctrl+C)...\n')
  await new Promise((r) => setTimeout(r, 5000))
}

const app = admin.initializeApp({ credential: admin.credential.cert(SA_PATH) }, 'migrate-col-arg')
const db = admin.firestore(app)

const snap = await db
  .collection(COLLECTION)
  .where('tenantId', '==', TENANT_ID)
  .where('platform', '==', FROM_PLATFORM)
  .get()

console.log(`Documentos con platform "${FROM_PLATFORM}" para este tenant: ${snap.size}\n`)

snap.docs.forEach((d) => {
  const { purchaseDate, symbol, quantity, type } = d.data()
  console.log(`  ${d.id}  ${purchaseDate}  ${symbol} ${type} x${quantity}`)
})

if (!apply) {
  console.log(`\nDry run — no se escribió nada. Vuelve a correr con --apply para aplicar los cambios.`)
  process.exit(0)
}

const docs = snap.docs
for (let i = 0; i < docs.length; i += BATCH_SIZE) {
  const chunk = docs.slice(i, i + BATCH_SIZE)
  const batch = db.batch()
  chunk.forEach((d) => batch.update(db.collection(COLLECTION).doc(d.id), { platform: TO_PLATFORM }))
  await batch.commit()
}

console.log(`\n✅  Listo. ${docs.length} compras actualizadas a platform "${TO_PLATFORM}".`)
process.exit(0)
