import { db } from './settings'
import {
  collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, serverTimestamp,
} from 'firebase/firestore'

const COL = 'taxi_gastos'

export const fetchExpenses = async () => {
  const q = query(collection(db, COL), orderBy('date', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      description: data.description,
      category: data.category,
      amount: data.amount,
      date: data.date,
      plate: data.plate ?? null,
    }
  })
}

export const createExpense = async ({ description, category, amount, date, plate }) => {
  const ref = await addDoc(collection(db, COL), {
    description,
    category,
    amount: Number(amount),
    date,
    plate: plate || null,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const deleteExpense = async (id) => {
  await deleteDoc(doc(db, COL, id))
}
