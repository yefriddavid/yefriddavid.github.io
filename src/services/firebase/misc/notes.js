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
  serverTimestamp,
} from 'firebase/firestore'
import { firestoreCall } from '../firebaseClient'

export const getNotes = async () => {
  const q = query(collection(db, COL_MISC_NOTES), orderBy('updatedAt', 'desc'))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const createNote = async ({ title, content, color }) => {
  const now = new Date()
  const ref = await firestoreCall(() =>
    addDoc(collection(db, COL_MISC_NOTES), {
      title,
      content,
      color,
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
