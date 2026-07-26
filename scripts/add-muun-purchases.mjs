// One-time import: loads a Muun (Lightning/LNP2P) wallet CSV export into
// Finance_Crypto_Purchases. "Recibido" -> buy, "Enviado" -> sell. Rows with
// Estado "Failed" are skipped (the transaction never completed). No fiat
// value is recorded in this export, so purchasePrice always falls back to
// the BTCUSDT daily close from Binance for the transaction date.
//
// Uses the Admin SDK (service account) so it bypasses Firestore security rules.
//
// Usage:
//   node scripts/add-muun-purchases.mjs             (dry run, production data)
//   node scripts/add-muun-purchases.mjs --apply     (write, production)
//   node scripts/add-muun-purchases.mjs --test            (dry run, test project)
//   node scripts/add-muun-purchases.mjs --test --apply    (write, test project)
import { createRequire } from 'module'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))

const COLLECTION = 'Finance_Crypto_Purchases'
const TENANT_ID = 'Atlfc1jvEUbLsintnpAq'
const PLATFORM = 'muun'
const SYMBOL = 'BTCUSDT'
const CSV_PATH = resolve(__dirname, 'data/muun-purchases.csv')

// Fecha,Tipo,Monto BTC,Estado,Descripcion — dates are MM/DD/YY.
const toIsoDate = (mdY) => {
  const [m, d, y] = mdY.split('/')
  return `20${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

const [, ...dataLines] = readFileSync(CSV_PATH, 'utf8').trim().split('\n')
const rows = dataLines
  .filter(Boolean)
  .map((line) => {
    const [fecha, tipo, montoBtc, estado, descripcion] = line.split(',')
    return { fecha, tipo, montoBtc: Number(montoBtc), estado, descripcion }
  })
  .filter((r) => r.estado !== 'Failed')

const priceCache = new Map()
async function btcPriceOn(dateStr) {
  if (priceCache.has(dateStr)) return priceCache.get(dateStr)
  const startTime = new Date(`${dateStr}T00:00:00.000Z`).getTime()
  const url = `https://api.binance.com/api/v3/klines?symbol=${SYMBOL}&interval=1d&startTime=${startTime}&limit=1`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Binance klines error ${res.status} for ${dateStr}`)
  const [kline] = await res.json()
  const price = kline ? Number(kline[4]) : null
  priceCache.set(dateStr, price)
  return price
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

console.log(`\n🔧  add-muun-purchases`)
console.log(`    Entorno  : ${env}`)
console.log(`    Registros: ${rows.length} (omitidas ${dataLines.filter(Boolean).length - rows.length} filas Failed)`)
console.log(`    Modo     : ${apply ? 'APLICAR CAMBIOS' : 'dry run (solo muestra el plan)'}\n`)

console.log('Resolviendo precios históricos BTCUSDT (Binance)...')
const purchases = []
for (const r of rows) {
  const purchaseDate = toIsoDate(r.fecha)
  const quantity = Math.abs(r.montoBtc)
  const purchasePrice = await btcPriceOn(purchaseDate)
  purchases.push({
    type: r.tipo === 'Recibido' ? 'buy' : 'sell',
    symbol: SYMBOL,
    platform: PLATFORM,
    quantity,
    purchasePrice,
    purchaseDate,
    usdCopRate: null,
    isAdjustment: false,
    active: true,
    notes: `${r.tipo} (${r.estado}) — ${r.descripcion}`,
  })
}

purchases.forEach((p) =>
  console.log(
    `  ${p.type.padEnd(4)} ${p.purchaseDate}  ${p.quantity.toFixed(8)} BTC  @ $${p.purchasePrice}`,
  ),
)

if (!apply) {
  console.log('\nDry run — no se escribió nada. Vuelve a correr con --apply para guardar en Firestore.')
  process.exit(0)
}

if (!isTest) {
  console.log('\n⚠️  Vas a escribir en PRODUCCIÓN. Tienes 5 segundos para cancelar (Ctrl+C)...\n')
  await new Promise((r) => setTimeout(r, 5000))
}

const app = admin.initializeApp({ credential: admin.credential.cert(SA_PATH) }, 'add-muun-purchases')
const db = admin.firestore(app)

for (const p of purchases) {
  const ref = await db.collection(COLLECTION).add({
    ...p,
    tenantId: TENANT_ID,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  })
  console.log(`  ✅  ${p.purchaseDate} ${p.type} ${p.quantity.toFixed(8)} BTC → ${ref.id}`)
}

console.log(`\n✅  Listo. ${purchases.length} registros creados en ${COLLECTION}.`)
process.exit(0)
