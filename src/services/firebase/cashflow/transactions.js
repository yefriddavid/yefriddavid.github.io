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

const mapDoc = (d) => {
  const data = d.data()
  return { id: d.id, ...data, created_at: data.created_at?.toMillis?.() ?? null }
}

// Firestore 'in' filters accept at most 30 values.
const chunk = (arr, size) => {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

// month omitted → full history (optionally narrowed to `year` client-side),
// used by Reports/Analysis which need multi-year data.
// month given → period-scoped query (accountMonth == month) plus, for accounts
// in debtAccountIds (targetAmount debts), their full payment history — needed
// so the cumulative-paid total stays correct without downloading everything.
export const getTransactions = async ({ year, month, debtAccountIds = [] } = {}) => {
  const tenantFilter = where('tenantId', '==', getTenantId())

  if (!month) {
    const q = query(collection(db, COL), tenantFilter)
    const snap = await firestoreCall(() => getDocs(q))
    return snap.docs
      .map(mapDoc)
      .filter((d) => !year || (d.date >= `${year}-01-01` && d.date <= `${year}-12-31`))
      .sort((a, b) => b.date.localeCompare(a.date))
  }

  const periodQuery = query(collection(db, COL), tenantFilter, where('accountMonth', '==', month))
  const periodSnap = await firestoreCall(() => getDocs(periodQuery))
  const byId = new Map(periodSnap.docs.map((d) => [d.id, mapDoc(d)]))

  for (const ids of chunk(debtAccountIds, 30)) {
    const debtQuery = query(collection(db, COL), tenantFilter, where('accountMasterId', 'in', ids))
    const debtSnap = await firestoreCall(() => getDocs(debtQuery))
    debtSnap.docs.forEach((d) => byId.set(d.id, mapDoc(d)))
  }

  return [...byId.values()].sort((a, b) => b.date.localeCompare(a.date))
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
