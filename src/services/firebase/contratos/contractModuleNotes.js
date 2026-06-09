import { db, COL_CONTRATOS_MODULE_NOTES as COL } from '../settings'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { firestoreCall } from '../firebaseClient'
import { getTenantId } from 'src/services/tenantContext'

export const fetchModuleNotes = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs
    .map((d) => {
      const data = d.data()
      return {
        id: d.id,
        text: data.text,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
      }
    })
    .sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''))
}

export const createModuleNote = async (text) => {
  const ref = await firestoreCall(() =>
    addDoc(collection(db, COL), {
      text,
      tenantId: getTenantId(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  )
  return ref.id
}

export const updateModuleNote = async (id, text) => {
  await firestoreCall(() =>
    updateDoc(doc(db, COL, id), { text, updatedAt: serverTimestamp() }),
  )
}

export const deleteModuleNote = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL, id)))
}
