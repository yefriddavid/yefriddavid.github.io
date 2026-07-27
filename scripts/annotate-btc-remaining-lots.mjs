// One-time annotation: appends a note to the BTC purchase lots identified (via a
// FIFO buy/sell match run on 2026-07-27) as the ones still held — not yet sold.
//
// Uses the Admin SDK (service account) so it bypasses Firestore security rules —
// the client SDK needs an authenticated user session, which this script doesn't have.
//
// Usage:
//   node scripts/annotate-btc-remaining-lots.mjs             (dry run, production data)
//   node scripts/annotate-btc-remaining-lots.mjs --apply     (write changes, production)
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))

const COLLECTION = 'Finance_Crypto_Purchases'
const SA_PATH = resolve(__dirname, '../notifier/service-account.json')
const NOTE = 'analisis IA, compras sin ventas'
const EPSILON_QTY = 1e-6
const EPSILON_PRICE = 0.01

const apply = process.argv.includes('--apply')

// The 9 remaining lots from the FIFO match (date, quantity, purchase price).
const REMAINING_LOTS = [
  { date: '2025-08-17', quantity: 0.01703, purchasePrice: 117389.98 },
  { date: '2025-08-18', quantity: 0.01735, purchasePrice: 115236.61 },
  { date: '2025-08-19', quantity: 0.00878, purchasePrice: 113822.74 },
  { date: '2025-10-10', quantity: 0.00833, purchasePrice: 120000 },
  { date: '2025-10-10', quantity: 0.01407, purchasePrice: 111527.53 },
  { date: '2025-10-10', quantity: 0.01713, purchasePrice: 116810.92 },
  { date: '2025-10-13', quantity: 0.00868, purchasePrice: 115150.11 },
  { date: '2025-10-14', quantity: 0.01799, purchasePrice: 111133.56 },
  { date: '2025-10-28', quantity: 0.00887, purchasePrice: 112739.15 },
]

console.log(`\n🔧  annotate-btc-remaining-lots`)
console.log(`    Modo     : ${apply ? 'APLICAR CAMBIOS' : 'dry run (solo muestra el plan)'}\n`)

if (apply) {
  console.log('⚠️  Vas a modificar PRODUCCIÓN. Tienes 5 segundos para cancelar (Ctrl+C)...\n')
  await new Promise((r) => setTimeout(r, 5000))
}

const app = admin.initializeApp({ credential: admin.credential.cert(SA_PATH) }, 'annotate')
const db = admin.firestore(app)

const snap = await db.collection(COLLECTION).where('symbol', '==', 'BTCUSDT').get()
const candidates = snap.docs.filter((d) => {
  const t = d.data()
  return t.type !== 'sell' && t.purchaseDate
})

const matches = []
const notFound = []

REMAINING_LOTS.forEach((lot) => {
  const doc = candidates.find((d) => {
    const t = d.data()
    return (
      t.purchaseDate === lot.date &&
      Math.abs((Number(t.quantity) || 0) - lot.quantity) < EPSILON_QTY &&
      Math.abs((Number(t.purchasePrice) || 0) - lot.purchasePrice) < EPSILON_PRICE
    )
  })
  if (doc) matches.push({ id: doc.id, existingNote: doc.data().notes || '', lot })
  else notFound.push(lot)
})

console.log(`Lotes a anotar        : ${REMAINING_LOTS.length}`)
console.log(`Encontrados en Firestore: ${matches.length}`)
console.log(`Sin encontrar          : ${notFound.length}\n`)

matches.forEach((m) => {
  const newNote = m.existingNote ? `${m.existingNote} | ${NOTE}` : NOTE
  console.log(`  ${m.id}  ${m.lot.date}  x${m.lot.quantity} @ ${m.lot.purchasePrice}`)
  console.log(`    nota actual: ${m.existingNote || '(vacía)'}`)
  console.log(`    nota nueva : ${newNote}`)
})
if (notFound.length) {
  console.log(`\nNo se encontró match en Firestore para:`)
  notFound.forEach((l) => console.log(`  ${l.date}  x${l.quantity} @ ${l.purchasePrice}`))
}

if (!apply) {
  console.log(`\nDry run — no se escribió nada. Vuelve a correr con --apply para aplicar los cambios.`)
  process.exit(0)
}

const batch = db.batch()
matches.forEach((m) => {
  const newNote = m.existingNote ? `${m.existingNote} | ${NOTE}` : NOTE
  batch.update(db.collection(COLLECTION).doc(m.id), { notes: newNote })
})
await batch.commit()

console.log(`\n✅  Listo. ${matches.length} compras anotadas.`)
process.exit(0)
