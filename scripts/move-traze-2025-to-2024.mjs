// One-time fix: the 11 "Traze" income transactions (feb-dec) were seeded
// under the wrong year (2025) by mistake. Moves them to 2024 by rewriting
// `date` and `accountMonth`, keeping the same doc ids and amounts.
//
// Usage:
//   node scripts/move-traze-2025-to-2024.mjs           (dry run)
//   node scripts/move-traze-2025-to-2024.mjs --apply   (write changes)
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))
const SA_PATH = resolve(__dirname, '../notifier/service-account.json')
const ACCOUNT_MASTER_ID = '6l8ZdjnOFx37GvqvChd2'

const apply = process.argv.includes('--apply')

console.log(`\n🔀  move-traze-2025-to-2024`)
console.log(`    Modo: ${apply ? 'APLICAR CAMBIOS' : 'dry run (solo muestra el plan)'}\n`)

if (apply) {
  console.log('⚠️  Vas a escribir en PRODUCCIÓN. Tienes 5 segundos para cancelar (Ctrl+C)...\n')
  await new Promise((r) => setTimeout(r, 5000))
}

const app = admin.initializeApp({ credential: admin.credential.cert(SA_PATH) }, 'move-traze-2025-to-2024')
const db = admin.firestore(app)

const snap = await db
  .collection('CashFlow_Transactions')
  .where('accountMasterId', '==', ACCOUNT_MASTER_ID)
  .get()

const targets = snap.docs
  .map((d) => ({ id: d.id, ...d.data() }))
  .filter((r) => (r.accountMonth || '').startsWith('2025') && r.accountMonth !== '2025-01')
  .sort((a, b) => a.accountMonth.localeCompare(b.accountMonth))

console.log(`Registros a mover: ${targets.length}\n`)
targets.forEach((r) => {
  const newMonth = r.accountMonth.replace('2025', '2024')
  const newDate = r.date.replace('2025', '2024')
  console.log(`  ${r.id}  ${r.accountMonth} -> ${newMonth}   ${r.date} -> ${newDate}   $${r.amount.toLocaleString('es-CO')}`)
})

if (!apply) {
  console.log('\nDry run — nada escrito. Corre con --apply para confirmar.')
  process.exit(0)
}

for (const r of targets) {
  await db.collection('CashFlow_Transactions').doc(r.id).update({
    accountMonth: r.accountMonth.replace('2025', '2024'),
    date: r.date.replace('2025', '2024'),
  })
}

console.log('\n✓ 11 pagos de Traze movidos de 2025 a 2024 correctamente')
process.exit(0)
