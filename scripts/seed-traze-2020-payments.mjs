// One-time seed: "Traze" (personal, Salario) has no income payments recorded
// for 2020. Creates the 12 missing CashFlow_Transactions docs, amounts and
// dates extracted from the Banco Colpatria remittance PDFs in
// ~/Downloads/comprobantes/Consignaciones-2020-traze. No payment in
// April/July; June and August each had 2 separate credits.
//
// Usage:
//   node scripts/seed-traze-2020-payments.mjs           (dry run)
//   node scripts/seed-traze-2020-payments.mjs --apply   (write changes)
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))
const SA_PATH = resolve(__dirname, '../notifier/service-account.json')
const TENANT_ID = 'Atlfc1jvEUbLsintnpAq'
const ACCOUNT_MASTER_ID = '6l8ZdjnOFx37GvqvChd2'

const RECORDS = [
  { date: '2020-01-14', amount: 4906940 },
  { date: '2020-02-04', amount: 5855344 },
  { date: '2020-03-09', amount: 6600000 },
  { date: '2020-05-14', amount: 6839360 },
  { date: '2020-06-05', amount: 4008576 },
  { date: '2020-06-24', amount: 4196043.28 },
  { date: '2020-08-06', amount: 6556000 },
  { date: '2020-08-19', amount: 7015774.5 },
  { date: '2020-09-11', amount: 6424000 },
  { date: '2020-10-05', amount: 6696800 },
  { date: '2020-11-09', amount: 7920000 },
  { date: '2020-12-07', amount: 8886800 },
]

const apply = process.argv.includes('--apply')

console.log(`\n💰  seed-traze-2020-payments`)
console.log(`    Modo: ${apply ? 'APLICAR CAMBIOS' : 'dry run (solo muestra el plan)'}\n`)

if (apply) {
  console.log('⚠️  Vas a escribir en PRODUCCIÓN. Tienes 5 segundos para cancelar (Ctrl+C)...\n')
  await new Promise((r) => setTimeout(r, 5000))
}

const app = admin.initializeApp({ credential: admin.credential.cert(SA_PATH) }, 'seed-traze-2020')
const db = admin.firestore(app)

const payments = RECORDS.map(({ date, amount }) => ({
  type: 'income',
  category: 'Salario',
  description: 'Traze',
  amount,
  date,
  accountMonth: date.slice(0, 7),
  accountMasterId: ACCOUNT_MASTER_ID,
  division: 'personal',
  tenantId: TENANT_ID,
}))

console.log(`Pagos a crear: ${payments.length}\n`)
payments.forEach((p) => console.log(`  ${p.date}  $${p.amount.toLocaleString('es-CO')}`))

if (!apply) {
  console.log('\nDry run — nada escrito. Corre con --apply para confirmar.')
  process.exit(0)
}

const col = db.collection('CashFlow_Transactions')
for (const p of payments) {
  await col.add({ ...p, created_at: admin.firestore.FieldValue.serverTimestamp() })
}

console.log('\n✓ 12 pagos de Traze (2020) creados correctamente')
process.exit(0)
