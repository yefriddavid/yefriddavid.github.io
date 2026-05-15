import { db, COL_CONTRATOS_OWNERS as COL } from '../settings'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { firestoreCall } from '../firebaseClient'
import { getTenantId } from 'src/services/tenantContext'


export const getOwners = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs
    .map((d) => {
      const data = d.data()
      return {
        id: d.id,
        full_name: data.full_name,
        identification_number: data.identification_number,
        identification_city: data.identification_city,
      }
    })
    .sort((a, b) => (a.full_name ?? '').localeCompare(b.full_name ?? ''))
}

export const addOwner = async (payload) => {
  const ref = await firestoreCall(() =>
    addDoc(collection(db, COL), {
      ...payload,
      tenantId: getTenantId(),
      createdAt: serverTimestamp(),
    }),
  )
  return ref.id
}

export const updateOwner = async (id, payload) => {
  await firestoreCall(() => updateDoc(doc(db, COL, id), payload))
}

export const deleteOwner = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL, id)))
}
