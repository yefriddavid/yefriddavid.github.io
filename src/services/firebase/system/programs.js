import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db, COL_SYSTEM_PROGRAMS as COL } from '../settings'
import { firestoreCall } from '../firebaseClient'

export const getPrograms = async () => {
  const snap = await firestoreCall(() => getDocs(collection(db, COL)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const addProgram = async (data) => {
  const ref = await firestoreCall(() =>
    addDoc(collection(db, COL), { ...data, createdAt: serverTimestamp() }),
  )
  return ref.id
}

export const updateProgram = async (id, data) => {
  await firestoreCall(() => updateDoc(doc(db, COL, id), data))
}

export const deleteProgram = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL, id)))
}
