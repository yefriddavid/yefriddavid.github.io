import { db } from '../settings'
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
import { getTenantId } from 'src/services/tenantContext'

const COL = 'Finance_grid_trades'

export const fetchAll = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      asset: data.asset ?? '',
      platform: data.platform ?? '',
      centerPrice: data.centerPrice ?? 0,
      upperPrice: data.upperPrice ?? 0,
      lowerPrice: data.lowerPrice ?? 0,
      gridCount: data.gridCount ?? 0,
      investment: data.investment ?? 0,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      notes: data.notes ?? '',
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt ?? null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? data.updatedAt ?? null,
    }
  })
}

export const saveTrade = async (trade) => {
  const { id, ...data } = trade
  const ref = id ? doc(collection(db, COL), id) : doc(collection(db, COL))
  await setDoc(
    ref,
    {
      ...data,
      tenantId: getTenantId(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
  return ref.id
}

export const deleteTrade = async (id) => {
  await deleteDoc(doc(collection(db, COL), id))
}
