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

const COL = 'Contratos_Propietarios'

export const getOwners = async () => {
  const q = query(collection(db, COL), orderBy('full_name', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      full_name: data.full_name,
      identification_number: data.identification_number,
      identification_city: data.identification_city,
    }
  })
}

export const addOwner = async (payload) => {
  const ref = await addDoc(collection(db, COL), { ...payload, createdAt: serverTimestamp() })
  return ref.id
}

export const updateOwner = async (id, payload) => {
  await updateDoc(doc(db, COL, id), payload)
}

export const deleteOwner = async (id) => {
  await deleteDoc(doc(db, COL, id))
}
