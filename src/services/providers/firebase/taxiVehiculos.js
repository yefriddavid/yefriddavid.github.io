import { db } from './settings'
import {
  collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, serverTimestamp, updateDoc,
} from 'firebase/firestore'

const COL = 'taxi_vehiculos'

export const getVehicles = async () => {
  const q = query(collection(db, COL), orderBy('placa', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      plate: data.placa,
      brand: data.marca,
      model: data.modelo,
      year: data.anio,
      restrictions: data.restrictions ?? {},
    }
  })
}

export const addVehicle = async ({ plate, brand, model, year }) => {
  const ref = await addDoc(collection(db, COL), {
    placa: plate.toUpperCase(),
    marca: brand,
    modelo: model,
    anio: year,
    restrictions: {},
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const updateVehicle = async (id, { plate, brand, model, year }) => {
  await updateDoc(doc(db, COL, id), {
    placa: plate.toUpperCase(),
    marca: brand,
    modelo: model,
    anio: year,
  })
}

export const updateRestrictions = async (id, restrictions) => {
  await updateDoc(doc(db, COL, id), { restrictions })
}

export const deleteVehicle = async (id) => {
  await deleteDoc(doc(db, COL, id))
}
