import { initializeApp } from 'firebase/app'
import { getFirestore, doc, deleteDoc } from 'firebase/firestore'

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

const toDelete = [
  '2ROszkgvU44c2t8P7pJS', // 2026-03-12 TPV655 Guillermo
  'TNR6XioSyWMGaSaW2DnL', // 2026-03-12 TPV655 Jorge
]

for (const id of toDelete) {
  await deleteDoc(doc(db, 'taxi_liquidaciones', id))
  console.log(`  ✓ Eliminado: ${id}`)
}

console.log('Done.')
process.exit(0)
