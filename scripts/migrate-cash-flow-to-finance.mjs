// One-time migration: replace /cash_flow/ → /finance/ in users.landingPage
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROD_SA = resolve(__dirname, '../notifier/service-account.json')

const app = admin.initializeApp({ credential: admin.credential.cert(PROD_SA) }, 'migration')
const db = admin.firestore(app)

const snap = await db.collection('users').get()

let updated = 0
let skipped = 0

for (const docSnap of snap.docs) {
  const { landingPage } = docSnap.data()

  if (landingPage && landingPage.includes('/cash_flow/')) {
    const newLandingPage = landingPage.replace('/cash_flow/', '/finance/')
    await docSnap.ref.update({ landingPage: newLandingPage })
    console.log(`  ✓ ${docSnap.id}: ${landingPage} → ${newLandingPage}`)
    updated++
  } else {
    console.log(`  - ${docSnap.id}: sin cambios (${landingPage ?? 'null'})`)
    skipped++
  }
}

console.log(`\nResumen: ${updated} actualizados, ${skipped} sin cambios`)
process.exit(0)
