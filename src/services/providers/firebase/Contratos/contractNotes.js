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

const COL = 'Contratos_contract_notes'

export const fetchContractNotes = async (contractId) => {
  const q = query(collection(db, COL), where('contractId', '==', contractId))
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => {
      const data = d.data()
      return {
        id: d.id,
        contractId: data.contractId,
        text: data.text,
        resolved: data.resolved ?? false,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
      }
    })
    .sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''))
}

export const createContractNote = async ({ contractId, text }) => {
  const ref = await addDoc(collection(db, COL), {
    contractId,
    text,
    resolved: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export const updateContractNote = async (id, { text, resolved }) => {
  await updateDoc(doc(db, COL, id), { text, resolved, updatedAt: serverTimestamp() })
}

export const deleteContractNote = async (id) => {
  await deleteDoc(doc(db, COL, id))
}
