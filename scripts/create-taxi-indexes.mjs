// Creates composite Firestore indexes for the taxi project via REST API
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const { GoogleAuth } = require('google-auth-library')

const __dirname = dirname(fileURLToPath(import.meta.url))
const TAXI_SA = resolve(__dirname, '../notifier/taxi-service-account.json')
const PROJECT = 'tapsi-f2345'
const DATABASE = '(default)'

const INDEXES = [
  // Settlements — filter by tenantId + date range
  { collection: 'Taxi_liquidaciones', fields: [{ f: 'tenantId', o: 'ASCENDING' }, { f: 'date', o: 'ASCENDING' }] },

  // Expenses — filter by tenantId + date range
  { collection: 'Taxi_gastos', fields: [{ f: 'tenantId', o: 'ASCENDING' }, { f: 'date', o: 'ASCENDING' }] },

  // Period notes — filter by tenantId + period
  { collection: 'Taxi_period_notes', fields: [{ f: 'tenantId', o: 'ASCENDING' }, { f: 'period', o: 'ASCENDING' }] },

  // Period attachments — filter by tenantId + period
  { collection: 'Taxi_period_attachments', fields: [{ f: 'tenantId', o: 'ASCENDING' }, { f: 'period', o: 'ASCENDING' }] },

  // Vehicle location history — tenantId + vehicleId + timestamp desc
  { collection: 'Taxi_vehicle_location_history', fields: [{ f: 'tenantId', o: 'ASCENDING' }, { f: 'vehicleId', o: 'ASCENDING' }, { f: 'timestamp', o: 'DESCENDING' }] },

  // Vehicle location history — tenantId + plate + timestamp desc
  { collection: 'Taxi_vehicle_location_history', fields: [{ f: 'tenantId', o: 'ASCENDING' }, { f: 'plate', o: 'ASCENDING' }, { f: 'timestamp', o: 'DESCENDING' }] },

  // Vehicle location history — tenantId + vehicleId + timestamp asc (range query)
  { collection: 'Taxi_vehicle_location_history', fields: [{ f: 'tenantId', o: 'ASCENDING' }, { f: 'vehicleId', o: 'ASCENDING' }, { f: 'timestamp', o: 'ASCENDING' }] },
]

const auth = new GoogleAuth({
  keyFile: TAXI_SA,
  scopes: ['https://www.googleapis.com/auth/datastore'],
})

const client = await auth.getClient()
const { token } = await client.getAccessToken()

for (const { collection, fields } of INDEXES) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/${DATABASE}/collectionGroups/${collection}/indexes`

  const body = {
    queryScope: 'COLLECTION',
    fields: fields.map(({ f, o }) => ({ fieldPath: f, order: o })),
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const json = await res.json()

  if (res.ok) {
    console.log(`✓ ${collection} — índice creado (estado: ${json.state ?? 'CREATING'})`)
  } else if (json.error?.status === 'ALREADY_EXISTS') {
    console.log(`- ${collection} — índice ya existe`)
  } else {
    console.error(`✗ ${collection} — error: ${json.error?.message ?? JSON.stringify(json)}`)
  }
}

console.log('\nLos índices pueden tardar 1-2 minutos en estar listos.')
process.exit(0)
