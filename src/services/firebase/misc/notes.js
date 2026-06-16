import { db, COL_MISC_NOTES } from '../settings'
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { firestoreCall } from '../firebaseClient'
import { getTenantId } from 'src/services/tenantContext'

const serializeTs = (ts) => ts?.toDate?.()?.toISOString() ?? null

export const getNotes = async () => {
  const q = query(
    collection(db, COL_MISC_NOTES),
    where('tenantId', '==', getTenantId()),
    orderBy('updatedAt', 'desc'),
  )
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      ...data,
      createdAt: serializeTs(data.createdAt),
      updatedAt: serializeTs(data.updatedAt),
    }
  })
}

export const createNote = async ({ title, content, color }) => {
  const now = new Date().toISOString()
  const ref = await firestoreCall(() =>
    addDoc(collection(db, COL_MISC_NOTES), {
      title,
      content,
      color,
      tenantId: getTenantId(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  )
  return { id: ref.id, title, content, color, createdAt: now, updatedAt: now }
}

export const updateNote = async ({ id, title, content, color }) => {
  await firestoreCall(() =>
    updateDoc(doc(db, COL_MISC_NOTES, id), { title, content, color, updatedAt: serverTimestamp() }),
  )
}

export const deleteNote = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL_MISC_NOTES, id)))
}
