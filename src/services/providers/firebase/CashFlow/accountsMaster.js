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

export { MONTH_LABELS, ACCOUNT_CATEGORIES, PAYMENT_METHODS } from 'src/constants/cashFlow'
export { MONTH_NAMES } from 'src/constants/commons'


export const getAccountsMaster = async () => {
  const q = query(collection(db, COL), orderBy('name'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
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
