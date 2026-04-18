/**
 * Locally backs up all production Firestore collections as JSON files.
 *
 * Usage:
 *   node scripts/backup-prod.mjs
 */

import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const require = createRequire(import.meta.url)
const admin = require('firebase-admin')

const __dirname = dirname(fileURLToPath(import.meta.url))

const PROD_SA = resolve(__dirname, '../notifier/service-account.json')
const BACKUP_ROOT = resolve(__dirname, '../prod-backups')

// Initialize Production App
const prodApp = admin.initializeApp(
  { credential: admin.credential.cert(PROD_SA) },
  'prod-backup',
)
const db = admin.firestore(prodApp)

async function backupCollection(colName, backupPath) {
  const snap = await db.collection(colName).get()
  if (snap.empty) {
    console.log(`  ↷ ${colName} — vacía, se omite`)
    return 0
  }

  const data = snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))

  const filePath = resolve(backupPath, `${colName}.json`)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  
  process.stdout.write(`\r  📥 ${colName}... ✓ ${data.length} docs guardados`)
  console.log()
  return data.length
}

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const currentBackupPath = resolve(BACKUP_ROOT, timestamp)

  console.log(`🚀 Iniciando backup local de PROD en: ${currentBackupPath}\n`)

  if (!fs.existsSync(BACKUP_ROOT)) fs.mkdirSync(BACKUP_ROOT)
  fs.mkdirSync(currentBackupPath)

  const collections = await db.listCollections()
  let totalDocs = 0

  for (const col of collections) {
    const count = await backupCollection(col.id, currentBackupPath)
    totalDocs += count
  }

  console.log(`\n✅ Backup completado.`)
  console.log(`📊 Total colecciones: ${collections.length}`)
  console.log(`📊 Total documentos: ${totalDocs}`)
  console.log(`📂 Ubicación: ./prod-backups/${timestamp}/`)
  
  process.exit(0)
}

main().catch((err) => {
  console.error('\n❌ Error fatal durante el backup:', err)
  process.exit(1)
})
