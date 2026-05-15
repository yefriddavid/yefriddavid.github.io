import { db, COL_FINANCE_CUSTOM_GRID_TRADES as COL } from '../settings'
import {
  collection,
  doc,
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
      price: data.price ?? 0,
      quantity: data.quantity ?? 0,
      fecha: data.fecha ?? null,
      notes: data.notes ?? '',
      hidden: data.hidden ?? false,
      sellPrice: data.sellPrice ?? null,
      sellDate: data.sellDate ?? null,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt ?? null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? data.updatedAt ?? null,
    }
  })
}

export const saveTrade = async (trade) => {
  const { id, ...data } = trade
  const ref = id ? doc(collection(db, COL), id) : doc(collection(db, COL))
  await firestoreCall(() =>
    setDoc(
      ref,
      {
        ...data,
        tenantId: getTenantId(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    ),
  )
  return ref.id
}

export const deleteTrade = async (id) => {
  await firestoreCall(() => deleteDoc(doc(collection(db, COL), id)))
}

export const deleteAll = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await firestoreCall(() => getDocs(q))
  await firestoreCall(() => Promise.all(snap.docs.map((d) => deleteDoc(d.ref))))
}
