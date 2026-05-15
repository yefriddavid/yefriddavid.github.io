import { db, COL_CONTRATOS_PROPERTIES as COL } from '../settings'
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


export const getProperties = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs
    .map((d) => {
      const data = d.data()
      return {
        id: d.id,
        alias: data.alias,
        full_address: data.full_address,
        address: data.address,
        appartment_number: data.appartment_number,
        city: data.city,
        state: data.state,
        urbanization_name: data.urbanization_name,
        rental_value: data.rental_value,
        default_canon_value: data.default_canon_value ?? 0,
      }
    })
    .sort((a, b) => (a.alias ?? '').localeCompare(b.alias ?? ''))
}

export const addProperty = async (payload) => {
  const ref = await firestoreCall(() =>
    addDoc(collection(db, COL), {
      ...payload,
      tenantId: getTenantId(),
      createdAt: serverTimestamp(),
    }),
  )
  return ref.id
}

export const updateProperty = async (id, payload) => {
  await firestoreCall(() => updateDoc(doc(db, COL, id), payload))
}

export const deleteProperty = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL, id)))
}
