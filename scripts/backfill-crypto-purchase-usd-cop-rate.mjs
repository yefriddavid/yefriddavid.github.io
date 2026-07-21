// One-time backfill: set usdCopRate on existing Finance_Crypto_Purchases docs
// that don't have it yet, using the official Colombia TRM (Banco de la
// República, published via datos.gov.co) valid on each purchase's date.
//
// Uses the Admin SDK (service account) so it bypasses Firestore security rules —
// the client SDK needs an authenticated user session, which this script doesn't have.
//
// Usage:
//   node scripts/backfill-crypto-purchase-usd-cop-rate.mjs             (dry run, production data)
//   node scripts/backfill-crypto-purchase-usd-cop-rate.mjs --apply     (write changes, production)
//   node scripts/backfill-crypto-purchase-usd-cop-rate.mjs --test            (dry run, test project)
//   node scripts/backfill-crypto-purchase-usd-cop-rate.mjs --test --apply    (write changes, test project)
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))

const COLLECTION = 'Finance_Crypto_Purchases'
const BATCH_SIZE = 499
const TRM_ENDPOINT = 'https://www.datos.gov.co/resource/mcec-87by.json'

const isTest = process.argv.includes('--test')
const apply = process.argv.includes('--apply')
const env = isTest ? 'test' : 'production'

const SA_PATH = resolve(
  __dirname,
  isTest
    ? '../notifier/cashflow-test-afc07-firebase-adminsdk-fbsvc-85035f98c1.json'
    : '../notifier/service-account.json',
)

console.log(`\n🔧  backfill-crypto-purchase-usd-cop-rate`)
console.log(`    Entorno  : ${env}`)
console.log(`    Modo     : ${apply ? 'APLICAR CAMBIOS' : 'dry run (solo muestra el plan)'}\n`)

if (apply && !isTest) {
  console.log('⚠️  Vas a modificar PRODUCCIÓN. Tienes 5 segundos para cancelar (Ctrl+C)...\n')
  await new Promise((r) => setTimeout(r, 5000))
}

const app = admin.initializeApp({ credential: admin.credential.cert(SA_PATH) }, 'backfill')
const db = admin.firestore(app)

// Looks up the official TRM valid on `date` (YYYY-MM-DD). The dataset publishes
// a value with a validity range (vigenciadesde/vigenciahasta) that spans
// weekends and holidays, so a single day can match a range that started earlier.
const fetchTrmForDate = async (date) => {
  const iso = `${date}T00:00:00.000`
  const where = encodeURIComponent(`vigenciadesde<='${iso}' AND vigenciahasta>='${iso}'`)
  const res = await fetch(`${TRM_ENDPOINT}?$where=${where}`)
  if (!res.ok) throw new Error(`TRM API error: ${res.status}`)
  const rows = await res.json()
  return rows[0] ? Number(rows[0].valor) : null
}

const snap = await db.collection(COLLECTION).get()

const pending = snap.docs.filter((d) => {
  const t = d.data()
  return (t.usdCopRate == null || t.usdCopRate === '') && t.purchaseDate
})
const skippedNoDate = snap.docs.filter((d) => {
  const t = d.data()
  return (t.usdCopRate == null || t.usdCopRate === '') && !t.purchaseDate
}).length
const alreadySet = snap.size - pending.length - skippedNoDate

console.log(`Compras totales        : ${snap.size}`)
console.log(`Ya con TRM             : ${alreadySet}`)
console.log(`Sin fecha (omitidas)   : ${skippedNoDate}`)
console.log(`A completar            : ${pending.length}\n`)

const rateCache = {}
const toUpdate = []
const notFound = []

for (const doc of pending) {
  const { purchaseDate, symbol, quantity } = doc.data()
  if (!(purchaseDate in rateCache)) {
    try {
      rateCache[purchaseDate] = await fetchTrmForDate(purchaseDate)
    } catch (e) {
      console.log(`  ⚠️  Error consultando TRM para ${purchaseDate}: ${e.message}`)
      rateCache[purchaseDate] = null
    }
  }
  const rate = rateCache[purchaseDate]
  if (rate == null) {
    notFound.push({ id: doc.id, purchaseDate, symbol, quantity })
    continue
  }
  toUpdate.push({ id: doc.id, purchaseDate, symbol, quantity, rate })
}

console.log(`Fechas consultadas (TRM oficial): ${Object.keys(rateCache).length}`)
console.log(`Con TRM encontrada     : ${toUpdate.length}`)
console.log(`Sin TRM encontrada     : ${notFound.length}\n`)

toUpdate.forEach((u) => {
  console.log(`  ${u.id}  ${u.purchaseDate}  ${u.symbol} x${u.quantity}  → TRM ${u.rate}`)
})
if (notFound.length) {
  console.log(`\nSin TRM disponible para estas fechas (quedarán sin completar):`)
  notFound.forEach((u) => console.log(`  ${u.id}  ${u.purchaseDate}  ${u.symbol}`))
}

if (!apply) {
  console.log(`\nDry run — no se escribió nada. Vuelve a correr con --apply para aplicar los cambios.`)
  process.exit(0)
}

for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
  const chunk = toUpdate.slice(i, i + BATCH_SIZE)
  const batch = db.batch()
  chunk.forEach((u) => batch.update(db.collection(COLLECTION).doc(u.id), { usdCopRate: u.rate }))
  await batch.commit()
}

console.log(`\n✅  Listo. ${toUpdate.length} compras actualizadas con su TRM histórica.`)
process.exit(0)
