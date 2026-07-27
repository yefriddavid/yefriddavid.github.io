// One-time creation: adds a "table" note in Misc_notes with the 9 BTC purchase
// lots identified (via a FIFO buy/sell match run on 2026-07-27) as still held —
// title "IA analisis", category "Investment". See docs/btc-remaining-lots-2025.md.
//
// Uses the Admin SDK (service account) so it bypasses Firestore security rules —
// the client SDK needs an authenticated user session, which this script doesn't have.
// The note needs the same tenantId as the user's other data, so this script reads
// one existing Finance_Crypto_Purchases doc and reuses its tenantId.
//
// Usage:
//   node scripts/create-note-btc-remaining-lots.mjs             (dry run, production data)
//   node scripts/create-note-btc-remaining-lots.mjs --apply     (write changes, production)
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))

const NOTES_COLLECTION = 'Misc_notes'
const PURCHASES_COLLECTION = 'Finance_Crypto_Purchases'
const SA_PATH = resolve(__dirname, '../notifier/service-account.json')

const apply = process.argv.includes('--apply')

const HEADER = [
  'date:Fecha compra',
  'decimal:Cantidad BTC',
  'currency(usd):Precio compra',
  'sum:currency(usd):Costo',
  'string:Notas',
]

const ROWS = [
  ['2025-08-17', '0.00334', '117389.98', '392.08', ''],
  ['2025-08-18', '0.01735', '115236.61', '1999.36', ''],
  ['2025-08-19', '0.00878', '113822.74', '999.36', ''],
  ['2025-10-10', '0.00833', '120000', '999.60', ''],
  ['2025-10-10', '0.01407', '111527.53', '1569.19', ''],
  ['2025-10-10', '0.01713', '116810.92', '2000.97', ''],
  ['2025-10-13', '0.00868', '115150.11', '999.50', ''],
  ['2025-10-14', '0.01799', '111133.56', '1999.29', ''],
  ['2025-10-28', '0.00887', '112739.15', '1000.00', 'yo nunca vendi esto, me quede con este btc'],
]

console.log(`\n🔧  create-note-btc-remaining-lots`)
console.log(`    Modo     : ${apply ? 'APLICAR CAMBIOS' : 'dry run (solo muestra el plan)'}\n`)

if (apply) {
  console.log('⚠️  Vas a modificar PRODUCCIÓN. Tienes 5 segundos para cancelar (Ctrl+C)...\n')
  await new Promise((r) => setTimeout(r, 5000))
}

const app = admin.initializeApp({ credential: admin.credential.cert(SA_PATH) }, 'create-note')
const db = admin.firestore(app)

const anyPurchase = await db.collection(PURCHASES_COLLECTION).limit(1).get()
if (anyPurchase.empty) {
  console.log('No se encontró ningún registro en Finance_Crypto_Purchases para tomar el tenantId.')
  process.exit(1)
}
const tenantId = anyPurchase.docs[0].data().tenantId

const note = {
  title: 'IA analisis',
  category: 'Investment',
  mode: 'table',
  content: JSON.stringify([HEADER, ...ROWS]),
  body: '',
  color: '#ffffff',
  private: false,
  tenantId,
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
}

console.log(`tenantId       : ${tenantId}`)
console.log(`título         : ${note.title}`)
console.log(`categoría      : ${note.category}`)
console.log(`filas de tabla : ${ROWS.length}`)

if (!apply) {
  console.log(`\nDry run — no se escribió nada. Vuelve a correr con --apply para crear la nota.`)
  process.exit(0)
}

const ref = await db.collection(NOTES_COLLECTION).add(note)

console.log(`\n✅  Nota creada con id ${ref.id}.`)
process.exit(0)
