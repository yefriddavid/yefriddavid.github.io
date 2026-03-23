// Migration: rename driver "Bladimir" → "Vladimir" across all collections
// Collections affected: taxi_conductores, taxi_liquidaciones, taxi_audit_notas

import { initializeApp } from 'firebase/app'
import {
  getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, setDoc, query, where,
} from 'firebase/firestore'

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

const OLD = 'Bladimir'
const NEW = 'Vladimir'

async function main() {
  let total = 0

  // 1. taxi_conductores
  const driversSnap = await getDocs(collection(db, 'taxi_conductores'))
  for (const d of driversSnap.docs) {
    if (d.data().name === OLD) {
      await updateDoc(doc(db, 'taxi_conductores', d.id), { name: NEW })
      console.log(`[conductores] ${d.id}: "${OLD}" → "${NEW}"`)
      total++
    }
  }

  // 2. taxi_liquidaciones
  const settlementsSnap = await getDocs(query(collection(db, 'taxi_liquidaciones'), where('driver', '==', OLD)))
  for (const d of settlementsSnap.docs) {
    await updateDoc(doc(db, 'taxi_liquidaciones', d.id), { driver: NEW })
    console.log(`[liquidaciones] ${d.id} (${d.data().date}): driver "${OLD}" → "${NEW}"`)
    total++
  }

  // 3. taxi_audit_notas — IDs are date__driver_slug; need to recreate docs with new ID
  const notesSnap = await getDocs(collection(db, 'taxi_audit_notas'))
  for (const d of notesSnap.docs) {
    const data = d.data()
    if (data.driver === OLD) {
      const newId = d.id.replace(OLD.replace(/\s+/g, '_'), NEW.replace(/\s+/g, '_'))
      await setDoc(doc(db, 'taxi_audit_notas', newId), { ...data, driver: NEW })
      await deleteDoc(doc(db, 'taxi_audit_notas', d.id))
      console.log(`[audit_notas] "${d.id}" → "${newId}"`)
      total++
    }
  }

  console.log(`\nDone. ${total} document(s) updated.`)
}

main().catch(console.error)
