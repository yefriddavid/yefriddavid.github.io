import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore'

const app = initializeApp({
  apiKey: 'AIzaSyBCul4mFCoDYWWKwBjNUrkPQSbmq6vXi4g',
  authDomain: 'cashflow-9cbbc.firebaseapp.com',
  projectId: 'cashflow-9cbbc',
  storageBucket: 'cashflow-9cbbc.appspot.com',
  messagingSenderId: '221005846539',
  appId: '1:221005846539:web:b51908636c88cb25998f0e',
})
const db = getFirestore(app)

const snap = await getDocs(collection(db, 'taxi_liquidaciones'))

const toFix = []
for (const d of snap.docs) {
  const data = d.data()
  if (data.driver !== 'Jorge') continue
  if (data.amount !== 71000) continue
  toFix.push({ id: d.id, date: data.date })
}

if (toFix.length === 0) {
  console.log('Sin registros con 71000.')
  process.exit(0)
}

console.log(`Actualizando ${toFix.length} registros de 71000 → 70000...`)
for (const r of toFix) {
  await updateDoc(doc(db, 'taxi_liquidaciones', r.id), { amount: 70000 })
  console.log(`  ✓ ${r.date} [${r.id}]`)
}

console.log('\nDone.')
process.exit(0)
