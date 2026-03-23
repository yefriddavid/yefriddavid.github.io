import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, query, where, serverTimestamp } from 'firebase/firestore'

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

// Delete 2018 records
const snap2018 = await getDocs(query(collection(db, 'taxi_liquidaciones'), where('driver', '==', 'Guillermo')))
const toDelete = snap2018.docs.filter((d) => d.data().date?.startsWith('2018-03'))
console.log(`Deleting ${toDelete.length} records from 2018...`)
for (const d of toDelete) {
  await deleteDoc(doc(db, 'taxi_liquidaciones', d.id))
}
console.log('Deleted.')

// Create 2026 records
const dates = []
for (let day = 1; day <= 18; day++) {
  const d = new Date(2026, 2, day)
  const iso = `2026-03-${String(day).padStart(2, '0')}`
  dates.push({ iso, dayOfWeek: d.getDay() })
}

console.log(`\nCreating ${dates.length} settlements for Guillermo (March 2026)...`)
for (const { iso, dayOfWeek } of dates) {
  const amount = dayOfWeek === 0 ? 70000 : 85000
  const label = dayOfWeek === 0 ? 'domingo' : 'día normal'
  await addDoc(collection(db, 'taxi_liquidaciones'), {
    driver: 'Guillermo',
    plate: 'TSK086',
    amount,
    date: iso,
    comment: null,
    createdAt: serverTimestamp(),
  })
  console.log(`  ✓ ${iso} (${label}) — ${amount.toLocaleString('es-CO')}`)
}

console.log('\nDone.')
process.exit(0)
