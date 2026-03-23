import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore'

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

// Fetch driver named Guillermo
const driversSnap = await getDocs(query(collection(db, 'taxi_conductores'), orderBy('name', 'asc')))
const drivers = driversSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
const guillermo = drivers.find((d) => d.name.toLowerCase().includes('guillermo'))

if (!guillermo) {
  console.error('Driver "Guillermo" not found. Existing drivers:')
  drivers.forEach((d) => console.log(' -', d.name))
  process.exit(1)
}

console.log('Found driver:', guillermo.name)
console.log('  Default amount (weekday):', guillermo.defaultAmount)
console.log('  Default amount (sunday):', guillermo.defaultAmountSunday)
console.log('  Default vehicle:', guillermo.defaultVehicle)

const plate = (guillermo.defaultVehicle ?? '').toUpperCase()
const weekdayAmount = Number(guillermo.defaultAmount ?? 0)
const sundayAmount = Number(guillermo.defaultAmountSunday ?? weekdayAmount)

if (!plate) {
  console.error('No default vehicle set for this driver. Aborting.')
  process.exit(1)
}

// Generate dates March 1–18, 2018
const dates = []
for (let day = 1; day <= 18; day++) {
  const d = new Date(2018, 2, day) // month is 0-indexed: 2 = March
  const iso = `2018-03-${String(day).padStart(2, '0')}`
  dates.push({ iso, dayOfWeek: d.getDay() }) // 0 = Sunday
}

console.log(`\nCreating ${dates.length} settlements for ${guillermo.name}...`)

for (const { iso, dayOfWeek } of dates) {
  const amount = dayOfWeek === 0 ? sundayAmount : weekdayAmount
  const label = dayOfWeek === 0 ? 'domingo' : 'día normal'
  await addDoc(collection(db, 'taxi_liquidaciones'), {
    driver: guillermo.name,
    plate,
    amount,
    date: iso,
    comment: null,
    createdAt: serverTimestamp(),
  })
  console.log(`  ✓ ${iso} (${label}) — ${amount.toLocaleString('es-CO')}`)
}

console.log('\nDone.')
process.exit(0)
