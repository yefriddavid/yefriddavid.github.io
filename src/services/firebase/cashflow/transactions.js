import { db, COL_CASHFLOW_TRANSACTIONS as COL } from '../settings'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { firestoreCall } from '../firebaseClient'
import { getTenantId } from 'src/services/tenantContext'

export { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from 'src/constants/cashFlow'

// year omitted → returns every transaction across all years (used by the Analysis screen)
export const getTransactions = async (year) => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs
    .map((d) => {
      const data = d.data()
      return {
        id: d.id,
        ...data,
        created_at: data.created_at?.toMillis?.() ?? null,
      }
    })
    .filter((d) => !year || (d.date >= `${year}-01-01` && d.date <= `${year}-12-31`))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export const addTransaction = async (payload) => {
  const ref = await firestoreCall(() =>
    addDoc(collection(db, COL), {
      ...payload,
      tenantId: getTenantId(),
      created_at: serverTimestamp(),
    }),
  )
  return ref.id
}

export const updateTransaction = async (id, payload) => {
  const { id: _id, created_at: _ca, ...rest } = payload
  await firestoreCall(() => updateDoc(doc(db, COL, id), rest))
}

export const deleteTransaction = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL, id)))
}
