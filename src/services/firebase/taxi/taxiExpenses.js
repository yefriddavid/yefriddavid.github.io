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

const COL = 'CashFlow_taxi_gastos'

export const fetchExpenses = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => {
      const data = d.data()
      return {
        id: d.id,
        description: data.description,
        category: data.category,
        amount: data.amount,
        date: data.date,
        plate: data.plate ?? null,
        comment: data.comment ?? null,
        paid: data.paid === true,
        nextDate: data.nextDate ?? null,
        payedAt: data.payedAt ?? null,
        receipt: data.receipt ?? null,
        receiptName: data.receiptName ?? null,
      }
    })
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
}

export const createExpense = async ({
  description,
  category,
  amount,
  date,
  plate,
  nextDate,
  payedAt,
  receipt,
  receiptName,
}) => {
  const ref = await addDoc(collection(db, COL), {
    description,
    category,
    amount: Number(amount),
    date,
    plate: plate || null,
    nextDate: nextDate || null,
    payedAt: payedAt || null,
    receipt: receipt || null,
    receiptName: receiptName || null,
    tenantId: getTenantId(),
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const updateExpense = async (id, data) => {
  await updateDoc(doc(db, COL, id), {
    description: data.description,
    category: data.category,
    amount: Number(data.amount),
    date: data.date,
    plate: data.plate || null,
    comment: data.comment || null,
    paid: data.paid === true,
    nextDate: data.nextDate || null,
    payedAt: data.payedAt || null,
    receipt: data.receipt || null,
    receiptName: data.receiptName || null,
  })
}

export const toggleExpensePaid = async (id, paid) => {
  const payedAt = paid ? new Date().toISOString().split('T')[0] : null
  await updateDoc(doc(db, COL, id), { paid, payedAt })
  return payedAt
}

export const deleteExpense = async (id) => {
  await deleteDoc(doc(db, COL, id))
}
