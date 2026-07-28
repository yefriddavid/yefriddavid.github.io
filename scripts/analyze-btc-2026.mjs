// Read-only analysis (no writes): what BTC purchase data exists for 2026 in
// Finance_Crypto_Purchases, to plan populating LOTS_2026 in BtcLosses2025.js.
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))
const SA_PATH = resolve(
  '/mnt/Zeus/Workspace/me/sources/My-Admin',
  'notifier/service-account.json',
)
const COLLECTION = 'Finance_Crypto_Purchases'
const TENANT = 'Atlfc1jvEUbLsintnpAq'

const app = admin.initializeApp({ credential: admin.credential.cert(SA_PATH) }, 'analyze-2026')
const db = admin.firestore(app)

const snap = await db.collection(COLLECTION).where('tenantId', '==', TENANT).get()
const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

const btc2026 = all.filter(
  (p) => p.symbol === 'BTCUSDT' && (p.purchaseDate || '').startsWith('2026'),
)

console.log(`\nTotal docs BTC 2026 (todas las plataformas, buy+sell): ${btc2026.length}\n`)

const byPlatform = {}
btc2026.forEach((p) => {
  byPlatform[p.platform] = (byPlatform[p.platform] || 0) + 1
})
console.log('Por plataforma:', byPlatform)

const buys = btc2026.filter((p) => (p.type ?? 'buy') !== 'sell')
const sells = btc2026.filter((p) => (p.type ?? 'buy') === 'sell')
console.log(`Compras: ${buys.length}  Ventas: ${sells.length}\n`)

// Group by binanceOrderId (same grouping logic as Crypto Query) to see how
// many logical "purchases" the 2026 buys collapse into.
const byOrder = new Map()
const singles = []
buys.forEach((p) => {
  if (!p.binanceOrderId) {
    singles.push(p)
    return
  }
  const key = `${p.platform}|${p.symbol}|${p.binanceOrderId}`
  const arr = byOrder.get(key) || []
  arr.push(p)
  byOrder.set(key, arr)
})

const groups = []
byOrder.forEach((recs, key) => {
  if (recs.length === 1) {
    singles.push(recs[0])
  } else {
    groups.push({ key, recs })
  }
})

console.log(`Compras individuales (sin agrupar): ${singles.length}`)
console.log(`Órdenes agrupadas (varios fills): ${groups.length}\n`)

const rows = [
  ...singles.map((p) => ({
    date: p.purchaseDate,
    time: p.purchaseTime || '',
    quantity: p.quantity,
    price: p.purchasePrice,
    note: p.notes || '',
  })),
  ...groups.map(({ recs }) => {
    const quantity = recs.reduce((s, r) => s + (Number(r.quantity) || 0), 0)
    const total = recs.reduce((s, r) => s + (Number(r.quantity) || 0) * (Number(r.purchasePrice) || 0), 0)
    const last = [...recs].sort((a, b) =>
      `${a.purchaseDate}${a.purchaseTime || ''}`.localeCompare(`${b.purchaseDate}${b.purchaseTime || ''}`),
    ).pop()
    return {
      date: last.purchaseDate,
      time: last.purchaseTime || '',
      quantity,
      price: quantity ? total / quantity : 0,
      note: `grupo de ${recs.length} fills`,
    }
  }),
].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))

console.log('=== Filas propuestas para LOTS_2026 (solo compras) ===\n')
rows.forEach((r) => {
  console.log(
    `  { date: '${r.date}', quantity: ${r.quantity}, price: ${Number(r.price.toFixed(2))} }` +
      (r.note ? `  // ${r.note}` : ''),
  )
})

console.log(`\nTotal filas: ${rows.length}`)
console.log(`Cantidad total BTC comprada 2026: ${rows.reduce((s, r) => s + r.quantity, 0)}`)

if (sells.length > 0) {
  console.log(`\n⚠️  Hay ${sells.length} ventas de BTC en 2026 — no incluidas arriba (solo compras).`)
  sells.forEach((p) => console.log(`  VENTA ${p.purchaseDate} qty=${p.quantity} price=${p.purchasePrice}`))
}
