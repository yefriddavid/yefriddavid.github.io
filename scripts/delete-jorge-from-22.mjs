import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore'

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

const toDelete = []
for (const d of snap.docs) {
  const data = d.data()
  if (data.driver !== 'Jorge') continue
  if (!data.date) continue
  const [y, m, day] = data.date.split('-').map(Number)
  if (y === 2026 && m === 3 && day >= 22) {
    toDelete.push({ id: d.id, date: data.date })
  }
}

if (toDelete.length === 0) {
  console.log('Sin registros para eliminar.')
  process.exit(0)
}

console.log(`Eliminando ${toDelete.length} registros (2026-03-22 al 2026-03-31)...`)
for (const r of toDelete) {
  await deleteDoc(doc(db, 'taxi_liquidaciones', r.id))
  console.log(`  ✓ ${r.date} [${r.id}]`)
}

console.log('\nDone.')
process.exit(0)
