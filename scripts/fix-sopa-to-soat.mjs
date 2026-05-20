// Fix typo: expense category 'SOPA' → 'SOAT' in Taxi_gastos (tapsi-f2345)
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))
const SA = resolve(__dirname, '../notifier/taxi-service-account.json')

const app = admin.initializeApp({ credential: admin.credential.cert(SA) })
const db = app.firestore()

const snap = await db.collection('Taxi_gastos').where('category', '==', 'SOPA').get()

console.log(`Found ${snap.size} document(s) with category "SOPA".`)

for (const d of snap.docs) {
  await d.ref.update({ category: 'SOAT' })
  console.log(`[${d.id}] ${d.data().date} — ${d.data().plate ?? '—'}: "SOPA" → "SOAT"`)
}

console.log('Done.')
