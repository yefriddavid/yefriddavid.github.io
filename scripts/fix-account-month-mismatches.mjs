// One-time fix: 5 transactions ended up with accountMonth pointing to the wrong
// month after their `date` was corrected manually from the Transacciones screen
// (before handleUpdate synced accountMonth automatically). Sets accountMonth to
// match date's month for these specific documents only.
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))
const SA_PATH = resolve(__dirname, '../notifier/service-account.json')

const FIXES = [
  { id: 'AFihwYye9H1Le0zNrcBe', description: 'Taxis', date: '2026-03-31', accountMonth: '2026-03' },
  { id: 'ByZlY4EJEyQTvYwqo5QO', description: 'Taxis', date: '2026-05-31', accountMonth: '2026-05' },
  { id: 'ORKccshJSOqzbpD8UeB4', description: 'Taxis', date: '2026-06-30', accountMonth: '2026-06' },
  { id: 'lyj5OnSPbTGf3DSrjXRF', description: 'Taxis', date: '2026-04-30', accountMonth: '2026-04' },
  {
    id: 'X6MiRvod7AgepIyIuf6W',
    description: 'Impuestos (Casa QT) (enero, febrero)',
    date: '2026-03-06',
    accountMonth: '2026-03',
  },
]

const app = admin.initializeApp({ credential: admin.credential.cert(SA_PATH) }, 'fix-account-month')
const db = admin.firestore(app)

for (const fix of FIXES) {
  const snap = await db.collection('CashFlow_Transactions').doc(fix.id).get()
  if (!snap.exists) {
    console.log(`  ✗  ${fix.id} — no existe, se omite`)
    continue
  }
  const current = snap.data()
  if (current.date !== fix.date) {
    console.log(`  ⚠  ${fix.id} — date en BD (${current.date}) no coincide con lo esperado (${fix.date}), se omite`)
    continue
  }
  await snap.ref.update({ accountMonth: fix.accountMonth })
  console.log(`  ✓  ${fix.id}  ${fix.description}  accountMonth: ${current.accountMonth} → ${fix.accountMonth}`)
}

console.log(`\n✅  Listo.`)
process.exit(0)
