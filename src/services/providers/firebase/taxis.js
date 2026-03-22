import { db } from './settings'
import {
  collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, serverTimestamp,
} from 'firebase/firestore'

const COL = 'taxi_liquidaciones'

export const getSettlements = async () => {
  const q = query(collection(db, COL), orderBy('fecha', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return { id: d.id, driver: data.conductor, plate: data.placa, amount: data.valor, date: data.fecha }
  })
}

export const addSettlement = async ({ driver, plate, amount, date }) => {
  const ref = await addDoc(collection(db, COL), {
    conductor: driver,
    placa: plate.toUpperCase(),
    valor: Number(amount),
    fecha: date,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const deleteSettlement = async (id) => {
  await deleteDoc(doc(db, COL, id))
}
