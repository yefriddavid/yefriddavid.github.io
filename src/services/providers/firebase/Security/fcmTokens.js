import { db } from '../settings'
import { collection, doc, setDoc, deleteDoc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore'

const COL = 'fcm_tokens'

export const getTokens = async () => {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
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
  await setDoc(doc(db, COL, token), {
    token,
    createdAt: serverTimestamp(),
    userAgent: navigator.userAgent,
    origin: window.location.origin,
  })
}

export const deleteFcmToken = async (token) => {
  await deleteDoc(doc(db, COL, token))
}
