// One-time fix: the balance-adjustment "sells" (isAdjustment: true) were created
// with purchasePrice: 0 so they wouldn't affect "Invertido". That backfires on
// the *average cost* of the remaining position — dividing the same invested
// cash by a smaller net quantity inflates the implied cost/coin above any real
// trade price ever seen (e.g. BTC showed ~$139,560 avg cost when the highest
// real trade was ~$122,000).
//
// Fix: set each adjustment's purchasePrice to the average cost of the position
// right before the adjustment — net invested (buys minus real sells' proceeds)
// divided by net quantity (buys minus real sells), both excluding the
// adjustment itself. That removes the withdrawn coins at the position's
// actual blended cost instead of "free", so gain/loss against a hypothetical
// price becomes meaningful again.
//
// Uses the Admin SDK (service account) so it bypasses Firestore security rules.
//
// Usage:
//   node scripts/fix-adjustment-cost-basis.mjs             (dry run, production data)
//   node scripts/fix-adjustment-cost-basis.mjs --apply     (write, production)
//   node scripts/fix-adjustment-cost-basis.mjs --test            (dry run, test project)
//   node scripts/fix-adjustment-cost-basis.mjs --test --apply    (write, test project)
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))

const COLLECTION = 'Finance_Crypto_Purchases'
const TENANT_ID = 'Atlfc1jvEUbLsintnpAq'

const isTest = process.argv.includes('--test')
const apply = process.argv.includes('--apply')
const env = isTest ? 'test' : 'production'

const SA_PATH = resolve(
  __dirname,
  isTest
    ? '../notifier/cashflow-test-afc07-firebase-adminsdk-fbsvc-85035f98c1.json'
    : '../notifier/service-account.json',
)

console.log(`\n🔧  fix-adjustment-cost-basis`)
console.log(`    Entorno  : ${env}`)
console.log(`    Modo     : ${apply ? 'APLICAR CAMBIOS' : 'dry run (solo muestra el plan)'}\n`)

if (apply && !isTest) {
  console.log('⚠️  Vas a escribir en PRODUCCIÓN. Tienes 5 segundos para cancelar (Ctrl+C)...\n')
  await new Promise((r) => setTimeout(r, 5000))
}

const app = admin.initializeApp({ credential: admin.credential.cert(SA_PATH) }, 'fix-adjustments')
const db = admin.firestore(app)

const snap = await db.collection(COLLECTION).where('tenantId', '==', TENANT_ID).get()

// Net position (buys minus real sells) per symbol, excluding adjustments —
// this is the "before adjustment" cost basis of the coins that were withdrawn.
const netBySymbol = {}
const adjustments = []

snap.docs.forEach((d) => {
  const t = d.data()
  const qty = Number(t.quantity) || 0
  const price = Number(t.purchasePrice) || 0
  const isSale = t.type === 'sell'

  if (t.isAdjustment) {
    adjustments.push({ id: d.id, symbol: t.symbol, quantity: qty, oldPrice: price, notes: t.notes })
    return
  }

  const sign = isSale ? -1 : 1
  if (!netBySymbol[t.symbol]) netBySymbol[t.symbol] = { qtySum: 0, costSum: 0 }
  netBySymbol[t.symbol].qtySum += sign * qty
  netBySymbol[t.symbol].costSum += sign * qty * price
})

console.log(`Ajustes encontrados: ${adjustments.length}\n`)

const updates = adjustments.map((a) => {
  const stats = netBySymbol[a.symbol]
  const avgCost = stats && stats.qtySum > 0 ? stats.costSum / stats.qtySum : null
  return { ...a, avgCost }
})

updates.forEach((u) => {
  console.log(
    `  ${u.symbol}  ${u.id}  qty=${u.quantity}  precio: ${u.oldPrice} → ${u.avgCost?.toFixed(2) ?? 'N/A'}`,
  )
})

if (!apply) {
  console.log('\nDry run — no se escribió nada. Vuelve a correr con --apply para aplicar los cambios.')
  process.exit(0)
}

for (const u of updates) {
  if (u.avgCost == null) {
    console.log(`  ⚠️  SKIP ${u.symbol} (${u.id}): no hay posición previa para calcular el promedio`)
    continue
  }
  await db
    .collection(COLLECTION)
    .doc(u.id)
    .update({
      purchasePrice: u.avgCost,
      notes: `${u.notes} Precio ajustado al costo promedio de la posición ($${u.avgCost.toFixed(2)}) en vez de $0, para no inflar el costo promedio de lo que queda.`,
    })
  console.log(`  ✅  ${u.symbol} actualizado`)
}

console.log(`\n✅  Listo.`)
process.exit(0)
