import { db } from './settings'
import {
  collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, serverTimestamp, updateDoc,
} from 'firebase/firestore'

const COL = 'taxi_conductores'

export const getDrivers = async () => {
  const q = query(collection(db, COL), orderBy('nombre', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      name: data.nombre,
      idNumber: data.cedula,
      phone: data.telefono,
      defaultAmount: data.defaultAmount,
      defaultAmountSunday: data.defaultAmountSunday,
      defaultVehicle: data.defaultVehicle,
    }
  })
}

export const addDriver = async ({ name, idNumber, phone, defaultAmount, defaultAmountSunday, defaultVehicle }) => {
  const ref = await addDoc(collection(db, COL), {
    nombre: name,
    cedula: idNumber,
    telefono: phone,
    defaultAmount: defaultAmount ? Number(defaultAmount) : null,
    defaultAmountSunday: defaultAmountSunday ? Number(defaultAmountSunday) : null,
    defaultVehicle: defaultVehicle || null,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const updateDriver = async (id, { name, idNumber, phone, defaultAmount, defaultAmountSunday, defaultVehicle }) => {
  await updateDoc(doc(db, COL, id), {
    nombre: name,
    cedula: idNumber,
    telefono: phone,
    defaultAmount: defaultAmount ? Number(defaultAmount) : null,
    defaultAmountSunday: defaultAmountSunday ? Number(defaultAmountSunday) : null,
    defaultVehicle: defaultVehicle || null,
  })
}

export const deleteDriver = async (id) => {
  await deleteDoc(doc(db, COL, id))
}
