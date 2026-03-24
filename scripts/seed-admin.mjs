// One-time script — creates initial admin user in Firestore with hashed password
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc } from 'firebase/firestore'
import { createHash } from 'crypto' // Node.js built-in

const firebaseConfig = {
  apiKey: 'AIzaSyBCul4mFCoDYWWKwBjNUrkPQSbmq6vXi4g',
  authDomain: 'cashflow-9cbbc.firebaseapp.com',
  projectId: 'cashflow-9cbbc',
  storageBucket: 'cashflow-9cbbc.appspot.com',
  messagingSenderId: '221005846539',
  appId: '1:221005846539:web:b51908636c88cb25998f0e',
}

const USERNAME = 'yefriddavid'
const PASSWORD = 'admin123'

const app = initializeApp(firebaseConfig)
const db  = getFirestore(app)

const passwordHash = createHash('sha256').update(PASSWORD).digest('hex')

await setDoc(doc(db, 'users', USERNAME), {
  name: 'Yefrid David',
  role: 'superAdmin',
  email: 'yefriddavid@cashflow.app',
  avatar: null,
  active: true,
  passwordHash,
}, { merge: true })

console.log('✓ Usuario creado/actualizado en Firestore')
console.log(`  Username : ${USERNAME}`)
console.log(`  Password : ${PASSWORD}`)
process.exit(0)
