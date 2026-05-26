import { db, COL_INMOBILIARIA_DESIGNS as COL } from '../settings'
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

export const getDesigns = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
}

export const getDesign = async (id) => {
  const snap = await firestoreCall(() => getDoc(doc(db, COL, id)))
  if (!snap.exists()) throw new Error('Diseño no encontrado')
  const data = snap.data()
  return {
    id: snap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt ?? null,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? data.updatedAt ?? null,
  }
}

export const addDesign = async (payload) => {
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

export const updateDesign = async (id, payload) => {
  await firestoreCall(() =>
    updateDoc(doc(db, COL, id), { ...payload, updatedAt: serverTimestamp() }),
  )
}

export const deleteDesign = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL, id)))
}
