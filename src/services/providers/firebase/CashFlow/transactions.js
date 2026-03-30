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
  where,
} from 'firebase/firestore'

const COL = 'CashFlow_Transactions'

export { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from 'src/constants/cashFlow'

export const getTransactions = async (year) => {
  const q = query(
    collection(db, COL),
    where('date', '>=', `${year}-01-01`),
    where('date', '<=', `${year}-12-31`),
    orderBy('date', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      ...data,
      created_at: data.created_at?.toMillis?.() ?? null,
    }
  })
}

export const addTransaction = async (payload) => {
  const ref = await addDoc(collection(db, COL), { ...payload, created_at: serverTimestamp() })
  return ref.id
}

export const updateTransaction = async (id, payload) => {
  const { id: _id, created_at: _ca, ...rest } = payload
  await updateDoc(doc(db, COL, id), rest)
}

export const deleteTransaction = async (id) => {
  await deleteDoc(doc(db, COL, id))
}
