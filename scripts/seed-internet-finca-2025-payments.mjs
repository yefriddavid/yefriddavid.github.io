// One-time seed: "Internet Finca" (personal) has no expense payments
// recorded for 2025 apr-dec. Creates the 9 missing CashFlow_Transactions
// docs, day 15, $70.000/month.
//
// Usage:
//   node scripts/seed-internet-finca-2025-payments.mjs           (dry run)
//   node scripts/seed-internet-finca-2025-payments.mjs --apply   (write changes)
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))
const SA_PATH = resolve(__dirname, '../notifier/service-account.json')
const TENANT_ID = 'Atlfc1jvEUbLsintnpAq'
const ACCOUNT_MASTER_ID = '6361Qyw9fC39KSrqALb5'
const YEAR = 2025
const AMOUNT = 70000
const START_MONTH = 4

const apply = process.argv.includes('--apply')

console.log(`\n💸  seed-internet-finca-2025-payments`)
console.log(`    Modo: ${apply ? 'APLICAR CAMBIOS' : 'dry run (solo muestra el plan)'}\n`)

if (apply) {
  console.log('⚠️  Vas a escribir en PRODUCCIÓN. Tienes 5 segundos para cancelar (Ctrl+C)...\n')
  await new Promise((r) => setTimeout(r, 5000))
}

const app = admin.initializeApp({ credential: admin.credential.cert(SA_PATH) }, 'seed-internet-finca-2025')
const db = admin.firestore(app)

const pad = (n) => String(n).padStart(2, '0')

const payments = Array.from({ length: 12 - START_MONTH + 1 }, (_, i) => {
  const month = START_MONTH + i
  return {
    type: 'expense',
    category: 'Servicios',
    description: 'Internet Finca',
    amount: AMOUNT,
    date: `${YEAR}-${pad(month)}-15`,
    accountMonth: `${YEAR}-${pad(month)}`,
    accountMasterId: ACCOUNT_MASTER_ID,
    division: 'personal',
    tenantId: TENANT_ID,
  }
})

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

console.log('\n✓ 9 pagos de Internet Finca (2025, abr-dic) creados correctamente')
process.exit(0)
