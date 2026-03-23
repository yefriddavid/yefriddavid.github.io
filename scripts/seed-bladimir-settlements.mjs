// Creates settlements for driver "bladimir" from March 19 to March 22, 2026
// Uses his defaultAmount / defaultAmountSunday / defaultVehicle from taxi_conductores

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore'

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

const isSunday = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).getDay() === 0
}

const dates = ['2026-03-19', '2026-03-20', '2026-03-21', '2026-03-22']

async function main() {
  // 1. Find bladimir in taxi_conductores
  const driversSnap = await getDocs(query(collection(db, 'taxi_conductores'), orderBy('name')))
  const drivers = driversSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

  const driver = drivers.find((d) =>
    d.name?.toLowerCase().includes('bladimir') || d.name?.toLowerCase().includes('bladymir')
  )

  if (!driver) {
    console.error('Driver "bladimir" not found. Available drivers:')
    drivers.forEach((d) => console.log(' -', d.name))
    process.exit(1)
  }

  console.log('Found driver:', driver.name)
  console.log('  defaultVehicle:', driver.defaultVehicle)
  console.log('  defaultAmount:', driver.defaultAmount)
  console.log('  defaultAmountSunday:', driver.defaultAmountSunday)

  // 2. Create settlements
  for (const date of dates) {
    const sunday = isSunday(date)
    const amount = sunday && driver.defaultAmountSunday
      ? Number(driver.defaultAmountSunday)
      : Number(driver.defaultAmount)
    const plate = driver.defaultVehicle || ''

    const doc = {
      driver: driver.name,
      plate: plate.toUpperCase(),
      amount,
      date,
      comment: null,
      createdAt: serverTimestamp(),
    }

    const ref = await addDoc(collection(db, 'taxi_liquidaciones'), doc)
    console.log(`  Created ${date} (${sunday ? 'domingo' : 'normal'}) — $${amount} — ${plate} — id: ${ref.id}`)
  }

  console.log('\nDone.')
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
