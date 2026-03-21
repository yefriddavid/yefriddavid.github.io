import { db } from './settings'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'

const COL = 'taxi_liquidaciones'

export const getLiquidaciones = async () => {
  const q = query(collection(db, COL), orderBy('fecha', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const addLiquidacion = async ({ conductor, placa, valor, fecha }) => {
  const ref = await addDoc(collection(db, COL), {
    conductor,
    placa: placa.toUpperCase(),
    valor: Number(valor),
    fecha,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const deleteLiquidacion = async (id) => {
  await deleteDoc(doc(db, COL, id))
}
