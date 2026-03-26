import { db } from '../settings'
import {
  collection, addDoc, getDocs, deleteDoc, doc, updateDoc, orderBy, query, serverTimestamp,
} from 'firebase/firestore'

const COL = 'taxi_liquidaciones'

export const getSettlements = async () => {
  const q = query(collection(db, COL), orderBy('date', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      driver: data.driver,
      plate: data.plate,
      amount: data.amount,
      date: data.date,
      comment: data.comment ?? null,
    }
  })
}

export const addSettlement = async ({ driver, plate, amount, date, comment }) => {
  const ref = await addDoc(collection(db, COL), {
    driver,
    plate: plate.toUpperCase(),
    amount: Number(amount),
    date,
    comment: comment || null,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const updateSettlement = async (id, { driver, plate, amount, date, comment }) => {
  await updateDoc(doc(db, COL, id), {
    driver,
    plate: plate?.toUpperCase() ?? '',
    amount: Number(amount),
    date,
    comment: comment || null,
  })
}

export const deleteSettlement = async (id) => {
  await deleteDoc(doc(db, COL, id))
}
