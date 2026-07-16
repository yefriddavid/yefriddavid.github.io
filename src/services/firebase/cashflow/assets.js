import { db, COL_CASHFLOW_ASSETS as COL } from '../settings'
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

export const syncAssetToFirebase = async (asset) => {
  const { id, ...data } = asset
  await firestoreCall(() =>
    setDoc(doc(collection(db, COL), id), {
      ...data,
      tenantId: getTenantId(),
      syncedAt: serverTimestamp(),
    }),
  )
}

export const fetchAll = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      name: data.name ?? '',
      quantity: data.quantity ?? 0,
      unitPrice: data.unitPrice ?? 0,
      type: data.type ?? 'financial',
      liveSymbol: data.liveSymbol ?? '',
      liquid: data.liquid ?? false,
      projection: data.projection ?? false,
      horizon: data.horizon ?? '',
      location: data.location ?? '',
      monthlyGain: data.monthlyGain ?? 0,
      archived: data.archived ?? false,
      notes: data.notes ?? '',
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt ?? null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? data.updatedAt ?? null,
      syncedAt: data.syncedAt?.toDate?.()?.toISOString() ?? null,
    }
  })
}

export const deleteAssetFromFirebase = async (id) => {
  await firestoreCall(() => deleteDoc(doc(collection(db, COL), id)))
}

export const saveAsset = async ({
  id,
  archived,
  horizon,
  liquid,
  liveSymbol,
  location,
  monthlyGain,
  notes,
  projection,
  quantity,
  type,
  unitPrice,
  createdAt,
  updatedAt,
  name,
  date,
  price,
}) => {
  await firestoreCall(() =>
    setDoc(doc(collection(db, COL), id), {
      archived,
      horizon,
      liquid,
      liveSymbol: liveSymbol ?? '',
      location: location ?? '',
      monthlyGain,
      name,
      notes,
      projection,
      quantity: Number(quantity),
      type,
      unitPrice,
      date: date ? date : null,
      price: price ? Number(price) : null,
      tenantId: getTenantId(),
      createdAt: createdAt ?? serverTimestamp(),
      updatedAt: updatedAt ?? serverTimestamp(),
    }),
  )
  return id
}
