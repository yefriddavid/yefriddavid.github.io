import { db } from '../settings'
import {
  collection,
  addDoc,
  getDocs,
  doc,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'

const COL = 'Contratos_contract_attachments'

export const getAttachments = async (contractId) => {
  const q = query(collection(db, COL), where('contractId', '==', contractId))
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((r) => r.active !== false)
    .sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0))
}

export const addAttachment = async (payload) => {
  const ref = await addDoc(collection(db, COL), {
    ...payload,
    active: true,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const deactivateAttachment = async (id) => {
  await updateDoc(doc(db, COL, id), { active: false })
}
