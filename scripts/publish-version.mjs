// Publishes build/version.json to Firestore (System_app_version/current) after
// a build/deploy, so useVersionCheck can detect updates via a realtime
// onSnapshot listener instead of polling /version.json.
//
// Uses the Admin SDK (service account) so it bypasses Firestore security rules.
//
// Usage:
//   node scripts/publish-version.mjs
import { createRequire } from 'module'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))

const COLLECTION = 'System_app_version'
const SA_PATH = resolve(__dirname, '../notifier/service-account.json')
const VERSION_PATH = resolve(__dirname, '../build/version.json')

const version = JSON.parse(readFileSync(VERSION_PATH, 'utf8'))

admin.initializeApp({ credential: admin.credential.cert(require(SA_PATH)) })

await admin.firestore().collection(COLLECTION).doc('current').set(version)

console.log(`✅ Published version doc: ${version.hash} — ${version.commitMessage}`)
