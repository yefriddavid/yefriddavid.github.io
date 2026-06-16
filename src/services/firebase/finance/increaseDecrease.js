import { db, COL_FINANCE_INCREASE_DECREASE as COL } from '../settings'
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore'
import { firestoreCall } from '../firebaseClient'
import { getTenantId } from 'src/services/tenantContext'

export const fetchAll = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      name: data.name ?? '',
      initialValue: data.initialValue ?? 0,
      finalValue: data.finalValue ?? 0,
      diff: data.diff ?? 0,
      increaseValue: data.increaseValue ?? null,
      decreaseValue: data.decreaseValue ?? null,
      inversionValue: data.inversionValue ?? 0,
      profit: data.profit ?? null,
      loss: data.loss ?? null,
      earnUSD: data.earnUSD ?? null,
      earnCOP: data.earnCOP ?? null,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt ?? null,
    }
  })
}

export const saveEntry = async (entry) => {
  const { id, ...data } = entry
  const ref = await firestoreCall(() =>
    addDoc(collection(db, COL), {
      ...data,
      tenantId: getTenantId(),
      createdAt: serverTimestamp(),
    }),
  )
  return ref.id
}

export const updateEntry = async (entry) => {
  const { id, ...data } = entry
  await firestoreCall(() =>
    setDoc(
      doc(collection(db, COL), id),
      { ...data, updatedAt: serverTimestamp() },
      { merge: true },
    ),
  )
}

export const deleteEntry = async (id) => {
  await firestoreCall(() => deleteDoc(doc(collection(db, COL), id)))
}
