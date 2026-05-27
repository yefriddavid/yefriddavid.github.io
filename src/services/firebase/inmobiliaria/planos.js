import { db, COL_INMOBILIARIA_PLANOS as COL } from '../settings'
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

export const getPlanos = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await firestoreCall(() => getDocs(q))
  const toStr = (ts) => ts?.toDate?.()?.toISOString() ?? ts ?? null
  return snap.docs
    .map((d) => {
      const data = d.data()
      return {
        id: d.id,
        ...data,
        createdAt: toStr(data.createdAt),
        updatedAt: toStr(data.updatedAt),
      }
    })
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
}

export const getPlano = async (id) => {
  const snap = await firestoreCall(() => getDoc(doc(db, COL, id)))
  if (!snap.exists()) throw new Error('Plano no encontrado')
  const data = snap.data()
  return {
    id: snap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt ?? null,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? data.updatedAt ?? null,
  }
}

export const addPlano = async (payload) => {
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

export const updatePlano = async (id, payload) => {
  await firestoreCall(() =>
    updateDoc(doc(db, COL, id), { ...payload, updatedAt: serverTimestamp() }),
  )
}

export const deletePlano = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL, id)))
}
