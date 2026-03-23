import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore'

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

const snap = await getDocs(query(collection(db, 'taxi_liquidaciones'), where('driver', '==', 'Guillermo')))
console.log(`Records found for Guillermo: ${snap.size}`)
snap.docs.forEach((d) => {
  const data = d.data()
  console.log(` - ${data.date} | ${data.plate} | ${data.amount}`)
})
process.exit(0)
