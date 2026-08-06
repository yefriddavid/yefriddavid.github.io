// One-time seed: "Traze" (personal, Salario) 2025 — flat $1.200.000/month
// for all 12 months (replaces the earlier varying-amount data, which turned
// out to actually belong to 2024 and was moved there).
//
// Usage:
//   node scripts/seed-traze-2025-flat-payments.mjs           (dry run)
//   node scripts/seed-traze-2025-flat-payments.mjs --apply   (write changes)
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
const AMOUNT = 1200000

const apply = process.argv.includes('--apply')

console.log(`\n💰  seed-traze-2025-flat-payments`)
console.log(`    Modo: ${apply ? 'APLICAR CAMBIOS' : 'dry run (solo muestra el plan)'}\n`)

if (apply) {
  console.log('⚠️  Vas a escribir en PRODUCCIÓN. Tienes 5 segundos para cancelar (Ctrl+C)...\n')
  await new Promise((r) => setTimeout(r, 5000))
}

const app = admin.initializeApp({ credential: admin.credential.cert(SA_PATH) }, 'seed-traze-2025-flat')
const db = admin.firestore(app)

const pad = (n) => String(n).padStart(2, '0')

const payments = Array.from({ length: 12 }, (_, i) => {
  const month = i + 1
  return {
    type: 'income',
    category: 'Salario',
    description: 'Traze',
    amount: AMOUNT,
    date: `${YEAR}-${pad(month)}-01`,
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

console.log('\n✓ 12 pagos de Traze (2025, $1.200.000 c/u) creados correctamente')
process.exit(0)
