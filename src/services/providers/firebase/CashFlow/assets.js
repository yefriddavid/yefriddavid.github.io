import { db } from '../settings'
import { addDoc, collection, doc, setDoc, getDocs, deleteDoc, serverTimestamp } from 'firebase/firestore'

const COL = 'CashFlow_assets'

export const syncAssetToFirebase = async (asset) => {
  const { id, ...data } = asset
  await setDoc(doc(collection(db, COL), id), { ...data, syncedAt: serverTimestamp() })
}

// export const fetchAllFromFirebase = async () => {
export const fetchAll = async () => {
  const snap = await getDocs(collection(db, COL))
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

//export const createAsset = async ({ name, date, quantity, price }) => {
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
    createdAt,
    name,
    date,
    price
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
    createdAt: serverTimestamp(),
  })
  return ref.id
}
