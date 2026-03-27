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

export const EXPENSE_CATEGORIES = [
  'Alimentación',
  'Transporte',
  'Servicios públicos',
  'Salud',
  'Educación',
  'Entretenimiento',
  'Ropa y calzado',
  'Hogar',
  'Tecnología',
  'Otros',
]

export const INCOME_CATEGORIES = ['Salario', 'Freelance', 'Inversiones', 'Alquiler', 'Otros']

export const getTransactions = async (year) => {
  const q = query(
    collection(db, COL),
    where('date', '>=', `${year}-01-01`),
    where('date', '<=', `${year}-12-31`),
    orderBy('date', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
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
