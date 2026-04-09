import { db } from '../settings'
import {
  collection, addDoc, getDocs, deleteDoc, doc, updateDoc, orderBy, query, serverTimestamp,
} from 'firebase/firestore'

const COL = 'CashFlow_taxi_partners'

export const getPartners = async () => {
  const q = query(collection(db, COL), orderBy('name'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({
    id: d.id,
    name: d.data().name,
    percentage: d.data().percentage,
  }))
}

export const addPartner = async ({ name, percentage }) => {
  const ref = await addDoc(collection(db, COL), {
    name,
    percentage: Number(percentage),
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const updatePartner = async (id, data) => {
  await updateDoc(doc(db, COL, id), {
    name: data.name,
    percentage: Number(data.percentage),
  })
}

export const deletePartner = async (id) => {
  await deleteDoc(doc(db, COL, id))
}
