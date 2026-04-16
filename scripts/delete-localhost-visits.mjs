/**
 * Deletes all documents in `page_visits` where url contains localhost.
 *
 * Usage:
 *   ADMIN_USER=tu_usuario ADMIN_PASS=tu_password node scripts/delete-localhost-visits.mjs
 *
 * Requires the user to have write/delete permissions in Firestore.
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where, writeBatch } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

const config = {
  apiKey: 'AIzaSyBCul4mFCoDYWWKwBjNUrkPQSbmq6vXi4g',
  authDomain: 'cashflow-9cbbc.firebaseapp.com',
  projectId: 'cashflow-9cbbc',
}

const USERNAME = process.env.ADMIN_USER
const PASSWORD = process.env.ADMIN_PASS

if (!USERNAME || !PASSWORD) {
  console.error('Falta ADMIN_USER o ADMIN_PASS')
  console.error('Uso: ADMIN_USER=usuario ADMIN_PASS=contraseña node scripts/delete-localhost-visits.mjs')
  process.exit(1)
}

const app = initializeApp(config)
const db = getFirestore(app)
const auth = getAuth(app)

// Firebase Auth uses synthetic email: username@cashflow.app
const email = `${USERNAME}@cashflow.app`

console.log(`Autenticando como ${email}...`)
await signInWithEmailAndPassword(auth, email, PASSWORD)
console.log('Autenticado.')

// Firestore no soporta "contains", usamos rango sobre el campo url
// localhost URLs empiezan con "http://localhost"
const col = collection(db, 'page_visits')
const snap = await getDocs(query(col, where('url', '>=', 'http://localhost'), where('url', '<', 'http://localhostz')))

const docs = snap.docs
console.log(`Encontrados ${docs.length} documentos de localhost.`)

if (docs.length === 0) {
  console.log('Nada que borrar.')
  process.exit(0)
}

// Delete in batches of 500 (Firestore limit)
let deleted = 0
for (let i = 0; i < docs.length; i += 500) {
  const batch = writeBatch(db)
  docs.slice(i, i + 500).forEach((d) => batch.delete(doc(col, d.id)))
  await batch.commit()
  deleted += Math.min(500, docs.length - i)
  console.log(`Borrados ${deleted}/${docs.length}...`)
}

console.log(`Listo. ${deleted} documentos eliminados.`)
process.exit(0)
