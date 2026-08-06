// One-time seed: "Traze" (personal, Salario) has no income payments recorded
// for 2025 feb-dec (no January amount was provided). Creates the 11 missing
// CashFlow_Transactions docs, day 1, amounts per month from a provided
// spreadsheet.
//
// Usage:
//   node scripts/seed-traze-2025-payments.mjs           (dry run)
//   node scripts/seed-traze-2025-payments.mjs --apply   (write changes)
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))
const SA_PATH = resolve(__dirname, '../notifier/service-account.json')
const TENANT_ID = 'Atlfc1jvEUbLsintnpAq'
const ACCOUNT_MASTER_ID = '6l8ZdjnOFx37GvqvChd2'
const YEAR = 2025

const AMOUNTS = {
  2: 10142600,
  3: 9991800,
  4: 1152900,
  5: 1170000,
  6: 1170000,
  7: 1230000,
  8: 1215000,
  9: 1207500,
  10: 1241100,
  11: 1292000,
  12: 1330200,
}

const apply = process.argv.includes('--apply')

console.log(`\n💰  seed-traze-2025-payments`)
console.log(`    Modo: ${apply ? 'APLICAR CAMBIOS' : 'dry run (solo muestra el plan)'}\n`)

if (apply) {
  console.log('⚠️  Vas a escribir en PRODUCCIÓN. Tienes 5 segundos para cancelar (Ctrl+C)...\n')
  await new Promise((r) => setTimeout(r, 5000))
}

const app = admin.initializeApp({ credential: admin.credential.cert(SA_PATH) }, 'seed-traze-2025')
const db = admin.firestore(app)

const pad = (n) => String(n).padStart(2, '0')

const payments = Object.entries(AMOUNTS).map(([month, amount]) => ({
  type: 'income',
  category: 'Salario',
  description: 'Traze',
  amount,
  date: `${YEAR}-${pad(Number(month))}-01`,
  accountMonth: `${YEAR}-${pad(Number(month))}`,
  accountMasterId: ACCOUNT_MASTER_ID,
  division: 'personal',
  tenantId: TENANT_ID,
}))

console.log(`Pagos a crear: ${payments.length}\n`)
payments.forEach((p) => console.log(`  ${p.accountMonth}  ${p.date}  $${p.amount.toLocaleString('es-CO')}`))

if (!apply) {
  console.log('\nDry run — nada escrito. Corre con --apply para confirmar.')
  process.exit(0)
}

const col = db.collection('CashFlow_Transactions')
for (const p of payments) {
  await col.add({ ...p, created_at: admin.firestore.FieldValue.serverTimestamp() })
}

console.log('\n✓ 11 pagos de Traze (2025, feb-dic) creados correctamente')
process.exit(0)
