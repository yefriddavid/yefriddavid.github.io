// One-time import: loads a Phoenix (Lightning) wallet CSV export into
// Finance_Crypto_Purchases. Sign of amount_msat decides buy/sell (positive:
// swap_in/lightning_received -> buy; negative: lightning_sent/channel_close
// -> sell) — best-effort, some sells are self-custody moves rather than real
// sales; review and fix by hand after import. purchasePrice uses Phoenix's
// own amount_fiat (USD) when present; falls back to the BTCUSDT daily close
// from Binance for rows where Phoenix didn't record a fiat value.
//
// Uses the Admin SDK (service account) so it bypasses Firestore security rules.
//
// Usage:
//   node scripts/add-phoenix-purchases.mjs             (dry run, production data)
//   node scripts/add-phoenix-purchases.mjs --apply     (write, production)
//   node scripts/add-phoenix-purchases.mjs --test            (dry run, test project)
//   node scripts/add-phoenix-purchases.mjs --test --apply    (write, test project)
import { createRequire } from 'module'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))

const COLLECTION = 'Finance_Crypto_Purchases'
const TENANT_ID = 'Atlfc1jvEUbLsintnpAq'
const PLATFORM = 'phoenix_long'
const SYMBOL = 'BTCUSDT'
const CSV_PATH = resolve(__dirname, 'data/phoenix-purchases.csv')

// Minimal RFC4180 parser — this export has quoted fields with embedded
// commas and newlines (a multi-line note in one description), so a plain
// split('\n')/split(',') would misalign columns.
function parseCSV(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else inQuotes = false
      } else field += c
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (c !== '\r') {
      field += c
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

const [, ...dataRows] = parseCSV(readFileSync(CSV_PATH, 'utf8').trim())
const rows = dataRows
  .filter((cols) => cols.length > 1)
  .map((cols) => {
    const [date, , type, amountMsat, amountFiat, , , , , , , , , description] = cols
    return { date, type, amountMsat: Number(amountMsat), amountFiat: parseFloat(amountFiat), description }
  })

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

console.log(`\n🔧  add-phoenix-purchases`)
console.log(`    Entorno  : ${env}`)
console.log(`    Registros: ${rows.length}`)
console.log(`    Modo     : ${apply ? 'APLICAR CAMBIOS' : 'dry run (solo muestra el plan)'}\n`)

console.log('Resolviendo precios (Phoenix fiat, o Binance histórico si falta)...')
const purchases = []
for (const r of rows) {
  const purchaseDate = r.date.slice(0, 10)
  const quantity = Math.abs(r.amountMsat) / 1e11
  const purchasePrice = Number.isFinite(r.amountFiat)
    ? r.amountFiat / quantity
    : await btcPriceOn(purchaseDate)
  purchases.push({
    type: r.amountMsat >= 0 ? 'buy' : 'sell',
    symbol: SYMBOL,
    platform: PLATFORM,
    quantity,
    purchasePrice,
    purchaseDate,
    usdCopRate: null,
    isAdjustment: false,
    active: true,
    notes: [r.type, r.description].filter(Boolean).join(' — '),
  })
}

purchases.forEach((p) =>
  console.log(
    `  ${p.type.padEnd(4)} ${p.purchaseDate}  ${p.quantity.toFixed(8)} BTC  @ $${p.purchasePrice?.toFixed(2)}`,
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

const app = admin.initializeApp({ credential: admin.credential.cert(SA_PATH) }, 'add-phoenix-purchases')
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
