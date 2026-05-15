import { db, COL_CONTRATOS_BANK_ACCOUNTS as COL } from '../settings'
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


export const getBankAccounts = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await firestoreCall(() => getDocs(q))
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
  const ref = await firestoreCall(() =>
    addDoc(collection(db, COL), {
      ...payload,
      tenantId: getTenantId(),
      createdAt: serverTimestamp(),
    }),
  )
  return ref.id
}

export const updateBankAccount = async (id, payload) => {
  await firestoreCall(() => updateDoc(doc(db, COL, id), payload))
}

export const deleteBankAccount = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL, id)))
}
