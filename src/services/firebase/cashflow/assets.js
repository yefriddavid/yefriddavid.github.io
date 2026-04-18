import { db } from '../settings'
import {
  addDoc,
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

const COL = 'CashFlow_assets'

export const syncAssetToFirebase = async (asset) => {
  const { id, ...data } = asset
  await setDoc(doc(collection(db, COL), id), {
    ...data,
    tenantId: getTenantId(),
    syncedAt: serverTimestamp(),
  })
}

export const fetchAll = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      name: data.name ?? '',
      quantity: data.quantity ?? 0,
      unitPrice: data.unitPrice ?? 0,
      type: data.type ?? 'financial',
      liquid: data.liquid ?? false,
      projection: data.projection ?? false,
      horizon: data.horizon ?? '',
      monthlyGain: data.monthlyGain ?? 0,
      archived: data.archived ?? false,
      notes: data.notes ?? '',
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
      syncedAt: data.syncedAt?.toDate?.()?.toISOString() ?? null,
    }
  })
}

export const deleteAssetFromFirebase = async (id) => {
  await deleteDoc(doc(collection(db, COL), id))
}

export const createAsset = async ({
  archived,
  horizon,
  liquid,
  monthlyGain,
  notes,
  projection,
  quantity,
  type,
  unitPrice,
  createdAt: _createdAt,
  name,
  date,
  price,
}) => {
  const ref = await addDoc(collection(db, COL), {
    archived,
    horizon,
    liquid,
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
    createdAt: serverTimestamp(),
  })
  return ref.id
}
