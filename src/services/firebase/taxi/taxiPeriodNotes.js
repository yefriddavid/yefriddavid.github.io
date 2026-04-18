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

const COL = 'CashFlow_taxi_period_notes'

export const fetchPeriodNotes = async (period) => {
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
        text: data.text,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
      }
    })
    .sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''))
}

export const createPeriodNote = async ({ period, text }) => {
  const ref = await addDoc(collection(db, COL), {
    period,
    text,
    tenantId: getTenantId(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export const updatePeriodNote = async (id, text) => {
  await updateDoc(doc(db, COL, id), { text, updatedAt: serverTimestamp() })
}

export const deletePeriodNote = async (id) => {
  await deleteDoc(doc(db, COL, id))
}
