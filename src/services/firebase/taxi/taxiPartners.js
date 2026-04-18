import { db } from '../settings'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { getTenantId } from 'src/services/tenantContext'

const COL = 'CashFlow_taxi_partners'

export const getPartners = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => ({
      id: d.id,
      name: d.data().name,
      percentage: d.data().percentage,
    }))
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
}

export const addPartner = async ({ name, percentage }) => {
  const ref = await addDoc(collection(db, COL), {
    name,
    percentage: Number(percentage),
    tenantId: getTenantId(),
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
