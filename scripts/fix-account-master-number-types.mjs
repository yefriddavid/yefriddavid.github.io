// One-time fix: some CashFlow_AccountsMaster documents ended up with
// defaultValue / targetAmount / maxDatePay stored as strings (from the
// AccountMasterForm bug fixed in the app — react-hook-form returned raw
// input strings with no Number() coercion before saving). This corrects the
// existing bad data by converting those string values to real numbers.
//
// Usage:
//   node scripts/fix-account-master-number-types.mjs           (dry run)
//   node scripts/fix-account-master-number-types.mjs --apply   (write changes)
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))
const SA_PATH = resolve(__dirname, '../notifier/service-account.json')
const TENANT_ID = 'Atlfc1jvEUbLsintnpAq'
const NUMERIC_FIELDS = ['defaultValue', 'targetAmount', 'maxDatePay']

const apply = process.argv.includes('--apply')

console.log(`\n🔧  fix-account-master-number-types`)
console.log(`    Modo: ${apply ? 'APLICAR CAMBIOS' : 'dry run (solo muestra el plan)'}\n`)

if (apply) {
  console.log('⚠️  Vas a modificar PRODUCCIÓN. Tienes 5 segundos para cancelar (Ctrl+C)...\n')
  await new Promise((r) => setTimeout(r, 5000))
}

const app = admin.initializeApp({ credential: admin.credential.cert(SA_PATH) }, 'fix-number-types')
const db = admin.firestore(app)

const snap = await db.collection('CashFlow_AccountsMaster').where('tenantId', '==', TENANT_ID).get()

const fixes = []
snap.docs.forEach((d) => {
  const a = d.data()
  const patch = {}
  const before = {}
  NUMERIC_FIELDS.forEach((field) => {
    if (typeof a[field] === 'string') {
      before[field] = a[field]
      patch[field] = Number(a[field]) || 0
    }
  })
  if (Object.keys(patch).length > 0) {
    fixes.push({ id: d.id, name: a.name, before, patch })
  }
})

console.log(`Cuentas con campos numéricos guardados como texto: ${fixes.length}\n`)
fixes.forEach((f) => {
  console.log(`  ${f.id}  ${f.name}`)
  Object.entries(f.patch).forEach(([field, newVal]) => {
    console.log(`    ${field}: ${JSON.stringify(f.before[field])} → ${newVal}`)
  })
})

if (!apply) {
  console.log(`\nDry run — no se escribió nada. Vuelve a correr con --apply para aplicar los cambios.`)
  process.exit(0)
}

for (const f of fixes) {
  await db.collection('CashFlow_AccountsMaster').doc(f.id).update(f.patch)
}

console.log(`\n✅  Listo. ${fixes.length} cuentas corregidas.`)
process.exit(0)
