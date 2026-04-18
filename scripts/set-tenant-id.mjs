// One-time migration — stamps tenantId on all data documents.
// Usage:
//   node scripts/set-tenant-id.mjs             (production)
//   node scripts/set-tenant-id.mjs --test       (test project)
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  getDocs,
  writeBatch,
  doc,
} from 'firebase/firestore'

const TENANT_ID = 'Atlfc1jvEUbLsintnpAq'

const CONFIGS = {
  production: {
    apiKey: 'AIzaSyBCul4mFCoDYWWKwBjNUrkPQSbmq6vXi4g',
    authDomain: 'cashflow-9cbbc.firebaseapp.com',
    projectId: 'cashflow-9cbbc',
    storageBucket: 'cashflow-9cbbc.appspot.com',
    messagingSenderId: '221005846539',
    appId: '1:221005846539:web:b51908636c88cb25998f0e',
  },
  test: {
    apiKey: 'AIzaSyA1ARq9UOfFwUsm-tyrFZ0iF9dm6vwgsdA',
    authDomain: 'cashflow-test-afc07.firebaseapp.com',
    projectId: 'cashflow-test-afc07',
    storageBucket: 'cashflow-test-afc07.firebasestorage.app',
    messagingSenderId: '886498418395',
    appId: '1:886498418395:web:236c937e313cbe8aa636fe',
  },
}

// Collections that receive tenantId
const STATIC_COLLECTIONS = [
  // CashFlow
  'CashFlow_AccountsMaster',
  'CashFlow_Transactions',
  'CashFlow_assets',
  'CashFlow_eggs',
  'CashFlow_my_projects',
  'CashFlow_salary_distribution',
  'CashFlow_account_status_period_notes',
  // Taxi
  'CashFlow_taxi_liquidaciones',
  'CashFlow_taxi_conductores',
  'CashFlow_taxi_vehiculos',
  'CashFlow_taxi_gastos',
  'CashFlow_taxi_partners',
  'CashFlow_taxi_distributions',
  'CashFlow_taxi_period_notes',
  'CashFlow_taxi_audit_notas',
  // Contratos
  'Contratos_Contratos',
  'Contratos_Inmuebles',
  'Contratos_Propietarios',
  'Contratos_CuentasBancarias',
  'Contratos_contract_notes',
  'Contratos_contract_attachments',
  // Users
  'users',
]

// paymentVauchers is year-based — stamp from 2022 to current year
const CURRENT_YEAR = new Date().getFullYear()
const VOUCHER_COLLECTIONS = Array.from(
  { length: CURRENT_YEAR - 2022 + 1 },
  (_, i) => `paymentVauchers-${2022 + i}`,
)

const ALL_COLLECTIONS = [...STATIC_COLLECTIONS, ...VOUCHER_COLLECTIONS]

// Firestore batch limit
const BATCH_SIZE = 499

async function stampCollection(db, colName) {
  const snap = await getDocs(collection(db, colName))

  if (snap.empty) {
    console.log(`  skip  ${colName} (vacía)`)
    return 0
  }

  let updated = 0
  let skipped = 0
  const pending = []

  for (const d of snap.docs) {
    if (d.data().tenantId === TENANT_ID) {
      skipped++
    } else {
      pending.push(d)
    }
  }

  // Process in batches of BATCH_SIZE
  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const chunk = pending.slice(i, i + BATCH_SIZE)
    const batch = writeBatch(db)
    for (const d of chunk) {
      batch.update(doc(db, colName, d.id), { tenantId: TENANT_ID })
    }
    await batch.commit()
    updated += chunk.length
  }

  const msg = [
    `  ✓  ${colName}`,
    `${updated} actualizados`,
    skipped ? `${skipped} ya tenían tenantId` : null,
  ]
    .filter(Boolean)
    .join(' — ')
  console.log(msg)

  return updated
}

// ── Main ──────────────────────────────────────────────────────────────────────

const isTest = process.argv.includes('--test')
const env = isTest ? 'test' : 'production'

console.log(`\n🔧  set-tenant-id`)
console.log(`    Proyecto  : ${CONFIGS[env].projectId}`)
console.log(`    Tenant ID : ${TENANT_ID}`)
console.log(`    Colecciones: ${ALL_COLLECTIONS.length}\n`)

if (!isTest) {
  console.log('⚠️  Vas a modificar PRODUCCIÓN. Tienes 5 segundos para cancelar (Ctrl+C)...\n')
  await new Promise((r) => setTimeout(r, 5000))
}

const app = initializeApp(CONFIGS[env])
const db = getFirestore(app)

let totalUpdated = 0

for (const col of ALL_COLLECTIONS) {
  try {
    totalUpdated += await stampCollection(db, col)
  } catch (err) {
    console.error(`  ✗  ${col}: ${err.message}`)
  }
}

console.log(`\n✅  Listo. ${totalUpdated} documentos actualizados en total.`)
process.exit(0)
