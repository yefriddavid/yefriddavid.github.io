import { db, COL_FCM_TOKENS as COL } from '../settings'
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { firestoreCall } from '../firebaseClient'


export const getTokens = async () => {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      token: data.token,
      userAgent: data.userAgent ?? '',
      origin: data.origin ?? '',
      createdAt: data.createdAt?.toDate() ?? null,
    }
  })
}

export const saveFcmToken = async (token) => {
  await firestoreCall(() =>
    setDoc(doc(db, COL, token), {
      token,
      createdAt: serverTimestamp(),
      userAgent: navigator.userAgent,
      origin: window.location.origin,
    }),
  )
}

export const deleteFcmToken = async (token) => {
  await firestoreCall(() => deleteDoc(doc(db, COL, token)))
}
