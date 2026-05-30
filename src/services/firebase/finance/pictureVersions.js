import { db, COL_FINANCE_PICTURES, COL_FINANCE_PICTURE_VERSIONS } from '../settings'
import {
  collection, addDoc, getDocs, deleteDoc, doc,
  query, orderBy, serverTimestamp, increment, updateDoc,
} from 'firebase/firestore'
import { firestoreCall } from '../firebaseClient'

const versionsCol = (pictureId) =>
  collection(db, COL_FINANCE_PICTURES, pictureId, COL_FINANCE_PICTURE_VERSIONS)

const toStr = (ts) => ts?.toDate?.()?.toISOString() ?? ts ?? null

export const getPictureVersions = async (pictureId) => {
  const q = query(versionsCol(pictureId), orderBy('createdAt', 'desc'))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map((d) => {
    const data = d.data()
    return { id: d.id, ...data, createdAt: toStr(data.createdAt) }
  })
}

const pictureDoc = (pictureId) => doc(db, COL_FINANCE_PICTURES, pictureId)

export const addPictureVersion = async (pictureId, payload) => {
  const ref = await firestoreCall(() =>
    addDoc(versionsCol(pictureId), { ...payload, createdAt: serverTimestamp() }),
  )
  await firestoreCall(() => updateDoc(pictureDoc(pictureId), { versionCount: increment(1) }))
  return ref.id
}

export const deletePictureVersion = async (pictureId, versionId) => {
  await firestoreCall(() =>
    deleteDoc(doc(db, COL_FINANCE_PICTURES, pictureId, COL_FINANCE_PICTURE_VERSIONS, versionId)),
  )
  await firestoreCall(() => updateDoc(pictureDoc(pictureId), { versionCount: increment(-1) }))
}
