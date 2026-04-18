import { db } from '../settings'
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
import { getTenantId } from 'src/services/tenantContext'

const COL = 'Contratos_Propietarios'

export const getOwners = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await getDocs(q)
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
  const ref = await addDoc(collection(db, COL), {
    ...payload,
    tenantId: getTenantId(),
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const updateOwner = async (id, payload) => {
  await updateDoc(doc(db, COL, id), payload)
}

export const deleteOwner = async (id) => {
  await deleteDoc(doc(db, COL, id))
}
