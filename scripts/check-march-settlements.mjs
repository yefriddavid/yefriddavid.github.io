import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBCul4mFCoDYWWKwBjNUrkPQSbmq6vXi4g',
  projectId: 'cashflow-9cbbc',
  storageBucket: 'cashflow-9cbbc.appspot.com',
  appId: '1:221005846539:web:b51908636c88cb25998f0e',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const snap = await getDocs(query(collection(db, 'taxi_liquidaciones'), orderBy('date')))
const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

const march = all.filter((r) => r.date?.startsWith('2026-03'))
march.sort((a, b) => a.date.localeCompare(b.date))

const byDay = {}
march.forEach((r) => {
  byDay[r.date] = (byDay[r.date] || 0) + r.amount
})

console.log('=== Liquidaciones marzo 2026 ===')
let total = 0
Object.entries(byDay).sort().forEach(([date, sum]) => {
  console.log(`  ${date}  $${sum.toLocaleString('es-CO')}`)
  total += sum
})

const daysElapsed = 22
const daysInMonth = 31
const projection = Math.round((total / daysElapsed) * daysInMonth)

console.log('\n--- Totales ---')
console.log(`Total acumulado (${daysElapsed} días): $${total.toLocaleString('es-CO')}`)
console.log(`Promedio diario:  $${Math.round(total / daysElapsed).toLocaleString('es-CO')}`)
console.log(`Proyección (×${daysInMonth}/${daysElapsed}): $${projection.toLocaleString('es-CO')}`)

console.log('\n=== Detalle por conductor ===')
const byDriver = {}
march.forEach((r) => {
  if (!byDriver[r.driver]) byDriver[r.driver] = { count: 0, total: 0 }
  byDriver[r.driver].count++
  byDriver[r.driver].total += r.amount
})
Object.entries(byDriver).sort((a, b) => b[1].total - a[1].total).forEach(([name, v]) => {
  console.log(`  ${name}: ${v.count} días — $${v.total.toLocaleString('es-CO')}`)
})

process.exit(0)
