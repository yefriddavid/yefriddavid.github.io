import { db, COL_CONTRATOS_ATTACHMENTS as COL } from '../settings'
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
import { firestoreCall } from '../firebaseClient'
import { getTenantId } from 'src/services/tenantContext'


export const getAttachments = async (contractId) => {
  const q = query(
    collection(db, COL),
    where('tenantId', '==', getTenantId()),
    where('contractId', '==', contractId),
  )
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs
    .map((d) => {
      const data = d.data()
      return {
        id: d.id,
        ...data,
      }
    })
    .filter((r) => r.active !== false)
    .sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0))
    .map((r) => ({
      ...r,
      createdAt: r.createdAt?.toDate?.()?.toISOString() ?? r.createdAt ?? null,
    }))
}

export const addAttachment = async (payload) => {
  const ref = await firestoreCall(() =>
    addDoc(collection(db, COL), {
      ...payload,
      tenantId: getTenantId(),
      active: true,
      createdAt: serverTimestamp(),
    }),
  )
  return ref.id
}

export const deactivateAttachment = async (id) => {
  await firestoreCall(() => updateDoc(doc(db, COL, id), { active: false }))
}
