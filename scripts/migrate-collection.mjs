// Migrates all documents from one Firestore collection to another.
// Usage: node scripts/migrate-collection.mjs
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore'

const source = 'taxi_vehiculos'   // source collection
const target = 'CashFlow_taxi_vehiculos' // target collection

const firebaseConfig = {
  apiKey: 'AIzaSyBCul4mFCoDYWWKwBjNUrkPQSbmq6vXi4g',
  authDomain: 'cashflow-9cbbc.firebaseapp.com',
  projectId: 'cashflow-9cbbc',
  storageBucket: 'cashflow-9cbbc.appspot.com',
  messagingSenderId: '221005846539',
  appId: '1:221005846539:web:b51908636c88cb25998f0e',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

console.log(`Migrating: ${source} → ${target}`)

const snap = await getDocs(collection(db, source))

if (snap.empty) {
  console.log('Source collection is empty, nothing to migrate.')
  process.exit(0)
}

let success = 0
let failed = 0

for (const srcDoc of snap.docs) {
  try {
    await setDoc(doc(db, target, srcDoc.id), srcDoc.data())
    console.log(`  ✓ ${srcDoc.id}`)
    success++
  } catch (err) {
    console.error(`  ✗ ${srcDoc.id}: ${err.message}`)
    failed++
  }
}

console.log(`\nDone. ${success} migrated, ${failed} failed.`)
process.exit(failed > 0 ? 1 : 0)
