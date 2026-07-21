// One-time write: adds a single manual "balance adjustment" sale to
// Finance_Crypto_Purchases so the tracked net BTC quantity matches the real
// Binance spot balance. The gap between the synced trade history and the real
// balance comes from something the trades API can't see (withdrawal, Convert,
// transfer to Earn, etc.), so this is a plug entry, not a real market sale —
// price is 0 and it's flagged with isAdjustment: true so the app renders it
// distinctly ("Ajuste de saldo" badge) instead of as a real "Venta".
//
// Uses the Admin SDK (service account) so it bypasses Firestore security rules.
//
// Usage:
//   node scripts/add-btc-balance-adjustment.mjs             (dry run, production data)
//   node scripts/add-btc-balance-adjustment.mjs --apply     (write, production)
//   node scripts/add-btc-balance-adjustment.mjs --test            (dry run, test project)
//   node scripts/add-btc-balance-adjustment.mjs --test --apply    (write, test project)
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))

const COLLECTION = 'Finance_Crypto_Purchases'
const TENANT_ID = 'Atlfc1jvEUbLsintnpAq'

const ADJUSTMENT = {
  type: 'sell',
  symbol: 'BTCUSDT',
  quantity: 0.220111128,
  purchasePrice: 0,
  purchaseDate: '2024-04-01',
  platform: 'binance_col',
  usdCopRate: null,
  isAdjustment: true,
  notes:
    'Ajuste de saldo — cuadre manual entre el historial de trades sincronizado y el saldo real de Binance (0.289048872 BTC). El origen exacto de la diferencia (retiro, Convert, transferencia a Earn, etc.) no quedó registrado en /myTrades.',
}

const isTest = process.argv.includes('--test')
const apply = process.argv.includes('--apply')
const env = isTest ? 'test' : 'production'

const SA_PATH = resolve(
  __dirname,
  isTest
    ? '../notifier/cashflow-test-afc07-firebase-adminsdk-fbsvc-85035f98c1.json'
    : '../notifier/service-account.json',
)

console.log(`\n🔧  add-btc-balance-adjustment`)
console.log(`    Entorno  : ${env}`)
console.log(`    Modo     : ${apply ? 'APLICAR CAMBIOS' : 'dry run (solo muestra el plan)'}\n`)
console.log('Registro a crear:')
console.log(JSON.stringify(ADJUSTMENT, null, 2))

if (apply && !isTest) {
  console.log('\n⚠️  Vas a escribir en PRODUCCIÓN. Tienes 5 segundos para cancelar (Ctrl+C)...\n')
  await new Promise((r) => setTimeout(r, 5000))
}

if (!apply) {
  console.log('\nDry run — no se escribió nada. Vuelve a correr con --apply para guardar en Firestore.')
  process.exit(0)
}

const app = admin.initializeApp({ credential: admin.credential.cert(SA_PATH) }, 'add-adjustment')
const db = admin.firestore(app)

const ref = await db.collection(COLLECTION).add({
  ...ADJUSTMENT,
  tenantId: TENANT_ID,
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
})

console.log(`\n✅  Listo. Documento creado: ${ref.id}`)
process.exit(0)
