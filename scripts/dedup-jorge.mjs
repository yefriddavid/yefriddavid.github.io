import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, where, orderBy, doc, deleteDoc } from 'firebase/firestore'

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

// Group by date — keep the one with createdAt earliest, delete the rest
const byDate = {}
for (const d of snap.docs) {
  const data = d.data()
  if (data.driver !== 'Jorge') continue
  const key = data.date
  if (!key) continue
  if (!byDate[key]) byDate[key] = []
  byDate[key].push({ id: d.id, ...data })
}

const toDelete = []
for (const [date, docs] of Object.entries(byDate)) {
  if (docs.length <= 1) continue
  // Sort by createdAt asc, keep first, delete the rest
  docs.sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0))
  const [keep, ...dupes] = docs
  console.log(`  ${date}: ${docs.length} registros — conservar [${keep.id}], eliminar ${dupes.map((d) => `[${d.id}]`).join(', ')}`)
  toDelete.push(...dupes.map((d) => d.id))
}

if (toDelete.length === 0) {
  console.log('Sin duplicados encontrados.')
  process.exit(0)
}

console.log(`\nEliminando ${toDelete.length} duplicados...`)
for (const id of toDelete) {
  await deleteDoc(doc(db, 'taxi_liquidaciones', id))
  console.log(`  ✓ ${id}`)
}

console.log('\nDone.')
process.exit(0)
