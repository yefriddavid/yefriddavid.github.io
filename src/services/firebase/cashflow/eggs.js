import { db, COL_CASHFLOW_EGGS as COL } from '../settings'
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


export const fetchEggs = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs
    .map((d) => {
      const data = d.data()
      return {
        id: d.id,
        name: data.name,
        date: data.date,
        quantity: data.quantity,
        price: data.price,
      }
    })
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
}

export const createEgg = async ({ name, date, quantity, price }) => {
  const ref = await firestoreCall(() =>
    addDoc(collection(db, COL), {
      name,
      date,
      quantity: Number(quantity),
      price: Number(price),
      tenantId: getTenantId(),
      createdAt: serverTimestamp(),
    }),
  )
  return ref.id
}

export const updateEgg = async (id, { name, date, quantity, price }) => {
  await firestoreCall(() =>
    updateDoc(doc(db, COL, id), {
      name,
      date,
      quantity: Number(quantity),
      price: Number(price),
    }),
  )
}

export const deleteEgg = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL, id)))
}
