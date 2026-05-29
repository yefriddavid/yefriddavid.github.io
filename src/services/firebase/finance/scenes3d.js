import { db, COL_FINANCE_SCENES_3D as COL } from '../settings'
import {
  collection, addDoc, getDocs, deleteDoc, doc,
  query, serverTimestamp, updateDoc, getDoc, where,
} from 'firebase/firestore'
import { firestoreCall } from '../firebaseClient'
import { getTenantId } from 'src/services/tenantContext'

const toStr = (ts) => ts?.toDate?.()?.toISOString() ?? ts ?? null

export const getScenes3d = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs
    .map((d) => {
      const data = d.data()
      return { id: d.id, ...data, createdAt: toStr(data.createdAt), updatedAt: toStr(data.updatedAt) }
    })
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
}

export const getScene3d = async (id) => {
  const snap = await firestoreCall(() => getDoc(doc(db, COL, id)))
  if (!snap.exists()) throw new Error('Escena no encontrada')
  const data = snap.data()
  return { id: snap.id, ...data, createdAt: toStr(data.createdAt), updatedAt: toStr(data.updatedAt) }
}

export const addScene3d = async (payload) => {
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

export const updateScene3d = async (id, payload) => {
  await firestoreCall(() =>
    updateDoc(doc(db, COL, id), { ...payload, updatedAt: serverTimestamp() }),
  )
}

export const deleteScene3d = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL, id)))
}
