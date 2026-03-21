import { db } from './settings'
import {
  collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, serverTimestamp, updateDoc,
} from 'firebase/firestore'

const COL = 'taxi_vehiculos'

export const getVehiculos = async () => {
  const q = query(collection(db, COL), orderBy('placa', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const addVehiculo = async ({ placa, marca, modelo, anio }) => {
  const ref = await addDoc(collection(db, COL), {
    placa: placa.toUpperCase(),
    marca,
    modelo,
    anio,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const updateVehiculo = async (id, { placa, marca, modelo, anio }) => {
  await updateDoc(doc(db, COL, id), {
    placa: placa.toUpperCase(),
    marca,
    modelo,
    anio,
  })
}

export const deleteVehiculo = async (id) => {
  await deleteDoc(doc(db, COL, id))
}
