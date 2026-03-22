import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'

const app = initializeApp({
  apiKey: 'AIzaSyBCul4mFCoDYWWKwBjNUrkPQSbmq6vXi4g',
  authDomain: 'cashflow-9cbbc.firebaseapp.com',
  projectId: 'cashflow-9cbbc',
  storageBucket: 'cashflow-9cbbc.appspot.com',
  messagingSenderId: '221005846539',
  appId: '1:221005846539:web:b51908636c88cb25998f0e',
})
const db = getFirestore(app)

const DRIVER = 'Jorge'
const PLATE = 'TPV655'
const AMOUNT_REGULAR = 85000
const AMOUNT_SUNDAY = 70000
const RESTRICTED_DAYS = [12, 25] // pico y placa March 2026
const YEAR = 2026
const MONTH = 3

function pad(n) { return String(n).padStart(2, '0') }
function getDaysInMonth(y, m) { return new Date(y, m, 0).getDate() }
function isSunday(y, m, d) { return new Date(y, m - 1, d).getDay() === 0 }

const totalDays = getDaysInMonth(YEAR, MONTH)
const settlements = []

for (let day = 1; day <= 21; day++) {
  if (RESTRICTED_DAYS.includes(day)) continue
  const date = `${YEAR}-${pad(MONTH)}-${pad(day)}`
  const amount = isSunday(YEAR, MONTH, day) ? AMOUNT_SUNDAY : AMOUNT_REGULAR
  settlements.push({ driver: DRIVER, plate: PLATE, amount, date, comment: null })
}

console.log(`Settlements to insert: ${settlements.length}`)
settlements.forEach((s) => {
  const dow = new Date(s.date).toLocaleDateString('es-CO', { weekday: 'short' })
  console.log(`  ${s.date} (${dow}) — $${s.amount.toLocaleString('es-CO')}`)
})

const col = collection(db, 'taxi_liquidaciones')
for (const s of settlements) {
  await addDoc(col, { ...s, createdAt: serverTimestamp() })
}

console.log('\n✓ All settlements inserted successfully')
process.exit(0)
