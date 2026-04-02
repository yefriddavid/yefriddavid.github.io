import { db } from './settings'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'

const COL = 'sessions'

export const createSession = async (sessionId, username, token) => {
  await setDoc(doc(db, COL, sessionId), {
    username,
    token,
    createdAt: serverTimestamp(),
    userAgent: navigator.userAgent,
  })
}

export const validateSession = async (sessionId) => {
  const snap = await getDoc(doc(db, COL, sessionId))
  return snap.exists()
}

export const getSessionsByUser = async (username) => {
  const q = query(collection(db, COL), where('username', '==', username))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({
    sessionId: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate().toISOString() ?? null,
  }))
}

export const deleteSession = async (sessionId) => {
  await deleteDoc(doc(db, COL, sessionId))
}
