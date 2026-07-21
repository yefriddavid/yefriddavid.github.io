import { db, COL_FINANCE_CRYPTO_PURCHASES as COL } from '../settings'
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
      type: data.type ?? 'buy',
      symbol: data.symbol ?? '',
      platform: data.platform ?? '',
      quantity: data.quantity ?? 0,
      purchasePrice: data.purchasePrice ?? 0,
      purchaseDate: data.purchaseDate ?? '',
      usdCopRate: data.usdCopRate ?? null,
      isAdjustment: data.isAdjustment ?? false,
      active: data.active ?? true,
      notes: data.notes ?? '',
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
