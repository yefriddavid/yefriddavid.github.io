import { db } from '../settings'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { firestoreCall } from '../firebaseClient'

const COL = 'Admin_Tenants'

export const getTenants = async () => {
  const q = query(collection(db, COL), orderBy('name', 'asc'))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map((d) => {
    const { createdAt, ...rest } = d.data()
    return { id: d.id, ...rest, createdAt: createdAt?.toDate().toISOString() ?? null }
  })
}

export const addTenant = async (payload) => {
  const { name, slug, plan, contactName, contactEmail, active } = payload
  const ref = await firestoreCall(() =>
    addDoc(collection(db, COL), {
      name,
      slug,
      plan,
      contactName: contactName || null,
      contactEmail: contactEmail || null,
      active: active !== false,
      createdAt: serverTimestamp(),
    }),
  )
  return ref.id
}

export const updateTenant = async (id, payload) => {
  const { id: _id, createdAt: _ca, ...rest } = payload
  await firestoreCall(() => updateDoc(doc(db, COL, id), rest))
}

export const deleteTenant = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL, id)))
}
