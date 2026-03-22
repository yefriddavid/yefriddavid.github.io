import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore'

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

// Load vehicles with restrictions
const vehiclesSnap = await getDocs(collection(db, 'taxi_vehiculos'))
const restrictionsByPlate = {}
for (const d of vehiclesSnap.docs) {
  const data = d.data()
  if (data.restrictions) {
    restrictionsByPlate[data.placa] = data.restrictions
  }
}

console.log('\n=== Restricciones por placa ===')
for (const [plate, restr] of Object.entries(restrictionsByPlate)) {
  const entries = Object.entries(restr)
    .filter(([, v]) => v.d1 || v.d2)
    .map(([m, v]) => {
      const days = [v.d1, v.d2].filter(Boolean).join(' y ')
      return `mes ${m}: día ${days}`
    })
  if (entries.length) console.log(`  ${plate}: ${entries.join(' | ')}`)
}

// Load settlements
const settlementsSnap = await getDocs(query(collection(db, 'taxi_liquidaciones'), orderBy('fecha', 'asc')))

const hits = []
for (const d of settlementsSnap.docs) {
  const data = d.data()
  const plate = data.placa
  const fecha = data.fecha // 'YYYY-MM-DD'
  if (!fecha || !plate) continue

  const [, monthStr, dayStr] = fecha.split('-')
  const month = parseInt(monthStr, 10)
  const day = parseInt(dayStr, 10)

  const restr = restrictionsByPlate[plate]
  if (!restr) continue

  const monthRestr = restr[month] || restr[String(month)]
  if (!monthRestr) continue

  const restricted = [monthRestr.d1, monthRestr.d2].filter(Boolean).map(Number)
  if (restricted.includes(day)) {
    hits.push({ id: d.id, fecha, plate, conductor: data.conductor, valor: data.valor })
  }
}

console.log(`\n=== Liquidaciones en días de pico y placa (${hits.length} registros) ===`)
if (hits.length === 0) {
  console.log('  Ninguna.')
} else {
  for (const h of hits) {
    console.log(`  [${h.id}] ${h.fecha}  ${h.plate}  ${h.conductor}  $${h.valor?.toLocaleString('es-CO')}`)
  }
}

process.exit(0)
