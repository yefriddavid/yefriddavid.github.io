import { db } from '../settings'
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
import { getTenantId } from 'src/services/tenantContext'

const COL = 'Contratos_CuentasBancarias'

export const getBankAccounts = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => {
      const data = d.data()
      return {
        id: d.id,
        bank_name: data.bank_name,
        type: data.type,
        number: data.number,
        name: data.name,
      }
    })
    .sort((a, b) => (a.bank_name ?? '').localeCompare(b.bank_name ?? ''))
}

export const addBankAccount = async (payload) => {
  const ref = await addDoc(collection(db, COL), {
    ...payload,
    tenantId: getTenantId(),
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const updateBankAccount = async (id, payload) => {
  await updateDoc(doc(db, COL, id), payload)
}

export const deleteBankAccount = async (id) => {
  await deleteDoc(doc(db, COL, id))
}
