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

const COL = 'CashFlow_AccountsMaster'

export { ACCOUNT_CATEGORIES, PAYMENT_METHODS } from 'src/constants/cashFlow'
export { MONTH_NAMES } from 'src/constants/commons'


export const getAccountsMaster = async () => {
  const q = query(collection(db, COL), orderBy('name'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      name: data.name ?? null,
      type: data.type ?? null,
      code: data.code ?? null,
      period: data.period ?? null,
      classification: data.classification ?? null,
      category: data.category ?? null,
      paymentMethod: data.paymentMethod ?? null,
      active: data.active !== false,
      accountingName: data.accountingName ?? null,
      defaultValue: data.defaultValue ?? 0,
      targetAmount: data.targetAmount ?? 0,
      maxDatePay: data.maxDatePay ?? null,
      monthStartAt: data.monthStartAt ?? null,
      important: data.important ?? false,
      description: data.description ?? null,
      notes: data.notes ?? null,
      definition: data.definition ?? null,
      created_at: data.created_at?.toDate?.()?.toISOString() ?? null,
    }
  })
}

export const addAccountMaster = async (payload) => {
  const ref = await addDoc(collection(db, COL), {
    ...payload,
    active: true,
    created_at: serverTimestamp(),
  })
  return ref.id
}

export const updateAccountMaster = async (id, payload) => {
  const { id: _id, created_at: _ca, ...rest } = payload
  await updateDoc(doc(db, COL, id), rest)
}

export const deleteAccountMaster = async (id) => {
  await deleteDoc(doc(db, COL, id))
}
