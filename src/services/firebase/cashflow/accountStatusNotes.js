import { db, COL_CASHFLOW_ACCOUNT_STATUS_NOTES as COL } from '../settings'
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
import { firestoreCall } from '../firebaseClient'
import { getTenantId } from 'src/services/tenantContext'


export const fetchPeriodNotes = async (period) => {
  const q = query(
    collection(db, COL),
    where('tenantId', '==', getTenantId()),
    where('period', '==', period),
  )
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs
    .map((d) => {
      const data = d.data()
      return {
        id: d.id,
        period: data.period,
        text: data.text,
        checked: data.checked ?? false,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
      }
    })
    .sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''))
}

export const createPeriodNote = async ({ period, text }) => {
  const ref = await firestoreCall(() =>
    addDoc(collection(db, COL), {
      period,
      text,
      checked: false,
      tenantId: getTenantId(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  )
  return ref.id
}

export const updatePeriodNote = async (id, fields) => {
  await firestoreCall(() =>
    updateDoc(doc(db, COL, id), { ...fields, updatedAt: serverTimestamp() }),
  )
}

export const deletePeriodNote = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL, id)))
}
