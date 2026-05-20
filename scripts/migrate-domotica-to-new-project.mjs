// One-time migration: copy all Domotica collections + RTDB from cashflow → domotica-eb00c
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))

const SOURCE_SA = resolve(__dirname, '../notifier/service-account.json')
const DEST_SA = resolve(__dirname, '../notifier/domotica-service-account.json')

const SOURCE_RTDB_URL = 'https://cashflow-9cbbc-default-rtdb.firebaseio.com'
const DOMOTICA_RTDB_URL = 'https://domotica-eb00c-default-rtdb.firebaseio.com'

const FIRESTORE_COLLECTIONS = [
  'Domotica_Solar',
  'Domotica_transactions',
  'Domotica_current',
  'Domotica_devices',
  'Domotica_command',
]

// RTDB paths to copy (full subtree)
const RTDB_PATHS = ['solar']

// ── Init apps ─────────────────────────────────────────────────────────────────

const sourceApp = admin.initializeApp(
  { credential: admin.credential.cert(SOURCE_SA), databaseURL: SOURCE_RTDB_URL },
  'source',
)

const destApp = admin.initializeApp(
  {
    credential: admin.credential.cert(DEST_SA),
    databaseURL: DOMOTICA_RTDB_URL,
  },
  'dest',
)

const sourceDb = admin.firestore(sourceApp)
const destDb = admin.firestore(destApp)
const sourceRtdb = admin.database(sourceApp)
const destRtdb = admin.database(destApp)

// ── Helpers ───────────────────────────────────────────────────────────────────

const BATCH_SIZE = 400

async function migrateCollection(collectionName) {
  console.log(`\n  Leyendo ${collectionName}...`)
  const snap = await sourceDb.collection(collectionName).get()

  if (snap.empty) {
    console.log(`  (vacía, omitida)`)
    return 0
  }

  console.log(`  ${snap.size} documentos encontrados, escribiendo...`)

  const docs = snap.docs
  let written = 0

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = destDb.batch()
    const chunk = docs.slice(i, i + BATCH_SIZE)

    for (const docSnap of chunk) {
      const destRef = destDb.collection(collectionName).doc(docSnap.id)
      batch.set(destRef, docSnap.data())
    }

    await batch.commit()
    written += chunk.length
    console.log(`  ✓ ${written}/${snap.size}`)
  }

  return written
}

async function migrateRtdbPath(path) {
  console.log(`\n  Leyendo RTDB /${path}...`)
  const snap = await sourceRtdb.ref(path).once('value')
  const data = snap.val()

  if (data === null) {
    console.log(`  (vacío, omitido)`)
    return
  }

  await destRtdb.ref(path).set(data)
  console.log(`  ✓ /${path} copiado`)
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log('=== Migración Domotica: cashflow → domotica-eb00c ===\n')

console.log('── Firestore ─────────────────────────────────────────')
let totalDocs = 0
for (const col of FIRESTORE_COLLECTIONS) {
  const count = await migrateCollection(col)
  totalDocs += count
}

console.log('\n── Realtime Database ─────────────────────────────────')
for (const path of RTDB_PATHS) {
  await migrateRtdbPath(path)
}

console.log(`\n=== Listo: ${totalDocs} documentos Firestore migrados ===`)
process.exit(0)
