import { dbTaxi as db, COL_TAXI_EXPENSES as COL } from '../settings'
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
import { taxiCall as firestoreCall } from '../firebaseClient'
import { getTenantId } from 'src/services/tenantContext'


export const fetchExpenses = async (period) => {
  const constraints = [where('tenantId', '==', getTenantId())]
  if (period?.year && period?.month !== undefined) {
    const { month, year } = period
    const pad = (n) => String(n).padStart(2, '0')
    const from = month === 0 ? `${year}-01-01` : `${year}-${pad(month)}-01`
    const to = month === 0 ? `${year}-12-31` : `${year}-${pad(month)}-${pad(new Date(year, month, 0).getDate())}`
    constraints.push(where('date', '>=', from), where('date', '<=', to))
  }
  const q = query(collection(db, COL), ...constraints)
  const snap = await firestoreCall(() => getDocs(q))
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
  comment,
  nextDate,
  payedAt,
  receipt,
  receiptName,
}) => {
  const ref = await firestoreCall(() =>
    addDoc(collection(db, COL), {
      description,
      category,
      amount: Number(amount),
      date,
      plate: plate || null,
      comment: comment || null,
      nextDate: nextDate || null,
      payedAt: payedAt || null,
      receipt: receipt || null,
      receiptName: receiptName || null,
      tenantId: getTenantId(),
      createdAt: serverTimestamp(),
    }),
  )
  return ref.id
}

export const updateExpense = async (id, data) => {
  await firestoreCall(() =>
    updateDoc(doc(db, COL, id), {
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
    }),
  )
}

export const toggleExpensePaid = async (id, paid) => {
  const payedAt = paid ? new Date().toISOString().split('T')[0] : null
  await firestoreCall(() => updateDoc(doc(db, COL, id), { paid, payedAt }))
  return payedAt
}

export const deleteExpense = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL, id)))
}
