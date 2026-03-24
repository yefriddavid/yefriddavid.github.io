import { db } from './settings'
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'

const COL = 'fcm_tokens'

export const saveFcmToken = async (token) => {
  await setDoc(doc(db, COL, token), {
    token,
    createdAt: serverTimestamp(),
    userAgent: navigator.userAgent,
  })
}

export const deleteFcmToken = async (token) => {
  await deleteDoc(doc(db, COL, token))
}
