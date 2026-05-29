import { db, COL_FINANCE_PICTURES as COL } from '../settings'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  serverTimestamp,
  updateDoc,
  getDoc,
  where,
} from 'firebase/firestore'
import { firestoreCall } from '../firebaseClient'
import { getTenantId } from 'src/services/tenantContext'

const toStr = (ts) => ts?.toDate?.()?.toISOString() ?? ts ?? null

export const getPictures = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs
    .map((d) => {
      const data = d.data()
      return { id: d.id, ...data, createdAt: toStr(data.createdAt), updatedAt: toStr(data.updatedAt) }
    })
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
}

export const getPicture = async (id) => {
  const snap = await firestoreCall(() => getDoc(doc(db, COL, id)))
  if (!snap.exists()) throw new Error('Cuadro no encontrado')
  const data = snap.data()
  return { id: snap.id, ...data, createdAt: toStr(data.createdAt), updatedAt: toStr(data.updatedAt) }
}

export const addPicture = async (payload) => {
  const ref = await firestoreCall(() =>
    addDoc(collection(db, COL), {
      ...payload,
      tenantId: getTenantId(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  )
  return ref.id
}

export const updatePicture = async (id, payload) => {
  await firestoreCall(() =>
    updateDoc(doc(db, COL, id), { ...payload, updatedAt: serverTimestamp() }),
  )
}

export const deletePicture = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL, id)))
}
