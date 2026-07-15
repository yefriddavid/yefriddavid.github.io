// One-time migration: converts users/{username}.tenantId (single string) into
// tenantIds (array), so a user can belong to more than one tenant.
// Usage: MIGRATION_USERNAME=... MIGRATION_PASSWORD=... node scripts/migrate-user-tenantids.mjs
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, collection, getDocs, doc, updateDoc, deleteField } from 'firebase/firestore'

const COL = 'users'

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
const auth = getAuth(app)

const username = process.env.MIGRATION_USERNAME
const password = process.env.MIGRATION_PASSWORD
if (!username || !password) {
  console.error('Set MIGRATION_USERNAME and MIGRATION_PASSWORD env vars before running.')
  process.exit(1)
}
const toAuthEmail = (u) => `${u.toLowerCase().trim()}@cashflow.app`
await signInWithEmailAndPassword(auth, toAuthEmail(username), password)

console.log(`Migrating: ${COL}.tenantId → ${COL}.tenantIds`)

const snap = await getDocs(collection(db, COL))

if (snap.empty) {
  console.log('Users collection is empty, nothing to migrate.')
  process.exit(0)
}

let migrated = 0
let skipped = 0
let failed = 0

for (const userDoc of snap.docs) {
  const data = userDoc.data()

  if (Array.isArray(data.tenantIds)) {
    console.log(`  – ${userDoc.id}: already has tenantIds, skipped`)
    skipped++
    continue
  }

  if (!data.tenantId) {
    console.log(`  – ${userDoc.id}: no tenantId, skipped`)
    skipped++
    continue
  }

  try {
    await updateDoc(doc(db, COL, userDoc.id), {
      tenantIds: [data.tenantId],
      tenantId: deleteField(),
    })
    console.log(`  ✓ ${userDoc.id}: tenantId "${data.tenantId}" → tenantIds ["${data.tenantId}"]`)
    migrated++
  } catch (err) {
    console.error(`  ✗ ${userDoc.id}: ${err.message}`)
    failed++
  }
}

console.log(`\nDone. ${migrated} migrated, ${skipped} skipped, ${failed} failed.`)
process.exit(failed > 0 ? 1 : 0)
