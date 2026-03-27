import { db } from '../settings'
import {
  collection,
  addDoc,
  getDocs,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'

const COL = 'Contratos_contract_attachments'

export const getAttachments = async (contractId) => {
  const q = query(
    collection(db, COL),
    where('contractId', '==', contractId),
    where('active', '==', true),
    orderBy('createdAt', 'asc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
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
