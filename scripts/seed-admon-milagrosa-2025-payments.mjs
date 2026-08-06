// One-time seed: "Admon (Apt Milagrosa)" (inmobiliaria) has no expense
// payments recorded for 2025. Creates the 12 missing CashFlow_Transactions
// docs, $182.227 each, day 25.
//
// Usage:
//   node scripts/seed-admon-milagrosa-2025-payments.mjs           (dry run)
//   node scripts/seed-admon-milagrosa-2025-payments.mjs --apply   (write changes)
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))
const SA_PATH = resolve(__dirname, '../notifier/service-account.json')
const TENANT_ID = 'Atlfc1jvEUbLsintnpAq'
const ACCOUNT_MASTER_ID = 'N3LpOCCjYIzntwmGlMx2'
const AMOUNT = 182227
const YEAR = 2025

const apply = process.argv.includes('--apply')

console.log(`\n💸  seed-admon-milagrosa-2025-payments`)
console.log(`    Modo: ${apply ? 'APLICAR CAMBIOS' : 'dry run (solo muestra el plan)'}\n`)

if (apply) {
  console.log('⚠️  Vas a escribir en PRODUCCIÓN. Tienes 5 segundos para cancelar (Ctrl+C)...\n')
  await new Promise((r) => setTimeout(r, 5000))
}

const app = admin.initializeApp({ credential: admin.credential.cert(SA_PATH) }, 'seed-admon-milagrosa-2025')
const db = admin.firestore(app)

const pad = (n) => String(n).padStart(2, '0')

const payments = Array.from({ length: 12 }, (_, i) => {
  const month = i + 1
  return {
    type: 'expense',
    category: 'Gastos Fijos',
    description: 'Admon (Apt Milagrosa)',
    amount: AMOUNT,
    date: `${YEAR}-${pad(month)}-25`,
    accountMonth: `${YEAR}-${pad(month)}`,
    accountMasterId: ACCOUNT_MASTER_ID,
    division: 'inmobiliaria',
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

console.log('\n✓ 12 pagos de Admon (Apt Milagrosa) (2025) creados correctamente')
process.exit(0)
