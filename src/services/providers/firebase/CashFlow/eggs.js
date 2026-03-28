import { db } from '../settings'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'

const COL = 'CashFlow_eggs'

export const fetchEggs = async () => {
  const q = query(collection(db, COL), orderBy('date', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      name: data.name,
      date: data.date,
      quantity: data.quantity,
      price: data.price,
    }
  })
}

export const createEgg = async ({ name, date, quantity, price }) => {
  const ref = await addDoc(collection(db, COL), {
    name,
    date,
    quantity: Number(quantity),
    price: Number(price),
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const updateEgg = async (id, { name, date, quantity, price }) => {
  await updateDoc(doc(db, COL, id), {
    name,
    date,
    quantity: Number(quantity),
    price: Number(price),
  })
}

export const deleteEgg = async (id) => {
  await deleteDoc(doc(db, COL, id))
}
