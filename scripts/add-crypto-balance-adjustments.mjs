// One-time write: adds manual "balance adjustment" sales to
// Finance_Crypto_Purchases so the tracked net quantity of each symbol matches
// the real Binance spot balance. These are withdrawals (retiros) — coins moved
// out of the account outside of a trade, so they never showed up in /myTrades.
// Price is 0 (no real proceeds) and each is flagged isAdjustment: true so the
// app renders it as "Ajuste de saldo" instead of a real "Venta".
//
// Uses the Admin SDK (service account) so it bypasses Firestore security rules.
//
// Usage:
//   node scripts/add-crypto-balance-adjustments.mjs             (dry run, production data)
//   node scripts/add-crypto-balance-adjustments.mjs --apply     (write, production)
//   node scripts/add-crypto-balance-adjustments.mjs --test            (dry run, test project)
//   node scripts/add-crypto-balance-adjustments.mjs --test --apply    (write, test project)
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))

const COLLECTION = 'Finance_Crypto_Purchases'
const TENANT_ID = 'Atlfc1jvEUbLsintnpAq'
const DATE = '2024-04-01'

const ADJUSTMENTS = [
  { symbol: 'BNBUSDT', quantity: 0.0498014547, realBalance: 2.0341985453 },
  { symbol: 'ETHUSDT', quantity: 0.7729947536, realBalance: 0.3040052464 },
  { symbol: 'LINKUSDT', quantity: 2.7717993482, realBalance: 81.5082006518 },
].map((a) => ({
  type: 'sell',
  symbol: a.symbol,
  quantity: a.quantity,
  purchasePrice: 0,
  purchaseDate: DATE,
  platform: 'binance_col',
  usdCopRate: null,
  isAdjustment: true,
  notes: `Retiro — cuadre manual de saldo con Binance (saldo real: ${a.realBalance}). No capturado en /myTrades.`,
}))

const isTest = process.argv.includes('--test')
const apply = process.argv.includes('--apply')
const env = isTest ? 'test' : 'production'

const SA_PATH = resolve(
  __dirname,
  isTest
    ? '../notifier/cashflow-test-afc07-firebase-adminsdk-fbsvc-85035f98c1.json'
    : '../notifier/service-account.json',
)

console.log(`\n🔧  add-crypto-balance-adjustments`)
console.log(`    Entorno  : ${env}`)
console.log(`    Modo     : ${apply ? 'APLICAR CAMBIOS' : 'dry run (solo muestra el plan)'}\n`)
console.log('Registros a crear:')
ADJUSTMENTS.forEach((a) => console.log(`  ${a.symbol}  -${a.quantity}  ${a.notes}`))

if (apply && !isTest) {
  console.log('\n⚠️  Vas a escribir en PRODUCCIÓN. Tienes 5 segundos para cancelar (Ctrl+C)...\n')
  await new Promise((r) => setTimeout(r, 5000))
}

if (!apply) {
  console.log('\nDry run — no se escribió nada. Vuelve a correr con --apply para guardar en Firestore.')
  process.exit(0)
}

const app = admin.initializeApp({ credential: admin.credential.cert(SA_PATH) }, 'add-adjustments')
const db = admin.firestore(app)

for (const a of ADJUSTMENTS) {
  const ref = await db.collection(COLLECTION).add({
    ...a,
    tenantId: TENANT_ID,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  })
  console.log(`  ✅  ${a.symbol} → ${ref.id}`)
}

console.log(`\n✅  Listo. ${ADJUSTMENTS.length} ajustes creados.`)
process.exit(0)
