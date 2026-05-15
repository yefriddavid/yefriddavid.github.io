import { db, COL_SESSIONS as COL } from '../settings'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { firestoreCall } from '../firebaseClient'


export const createSession = async (sessionId, username, token) => {
  await firestoreCall(() =>
    setDoc(doc(db, COL, sessionId), {
      username,
      token,
      createdAt: serverTimestamp(),
      userAgent: navigator.userAgent,
    }),
  )
}

export const validateSession = async (sessionId) => {
  const snap = await firestoreCall(() => getDoc(doc(db, COL, sessionId)))
  return snap.exists()
}

export const getSessionsByUser = async (username) => {
  const q = query(collection(db, COL), where('username', '==', username))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map((d) => ({
    sessionId: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate().toISOString() ?? null,
  }))
}

export const deleteSession = async (sessionId) => {
  await firestoreCall(() => deleteDoc(doc(db, COL, sessionId)))
}

export const deleteAllSessionsByUser = async (username) => {
  const q = query(collection(db, COL), where('username', '==', username))
  const snap = await firestoreCall(() => getDocs(q))
  const batch = writeBatch(db)
  snap.docs.forEach((d) => batch.delete(d.ref))
  await firestoreCall(() => batch.commit())
}
