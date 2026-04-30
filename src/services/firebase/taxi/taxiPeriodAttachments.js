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
import { getTenantId } from 'src/services/tenantContext'

const COL = 'CashFlow_taxi_period_attachments'

export const fetchPeriodAttachments = async (period) => {
  const q = query(
    collection(db, COL),
    where('tenantId', '==', getTenantId()),
    where('period', '==', period),
  )
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => {
      const data = d.data()
      return {
        id: d.id,
        period: data.period,
        image: data.image,
        description: data.description ?? '',
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
      }
    })
    .sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''))
}

export const createPeriodAttachment = async ({ period, image, description }) => {
  const ref = await addDoc(collection(db, COL), {
    period,
    image,
    description: description ?? '',
    tenantId: getTenantId(),
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const updatePeriodAttachment = async (id, { description }) => {
  await updateDoc(doc(db, COL, id), { description: description ?? '' })
}

export const deletePeriodAttachment = async (id) => {
  await deleteDoc(doc(db, COL, id))
}
