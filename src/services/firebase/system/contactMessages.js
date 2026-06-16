import { db, COL_CONTACT_MESSAGES } from '../settings'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { firestoreCall, publicCall } from '../firebaseClient'

export const saveContactMessage = async ({ name, email, message }) => {
  await publicCall(() =>
    addDoc(collection(db, COL_CONTACT_MESSAGES), {
      name,
      email,
      message,
      read: false,
      createdAt: serverTimestamp(),
    }),
  )
}

export const getContactMessages = async () => {
  const q = query(collection(db, COL_CONTACT_MESSAGES), orderBy('createdAt', 'desc'))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const updateContactMessage = async ({ id, ...fields }) => {
  await firestoreCall(() => updateDoc(doc(db, COL_CONTACT_MESSAGES, id), fields))
}

export const deleteContactMessage = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL_CONTACT_MESSAGES, id)))
}
