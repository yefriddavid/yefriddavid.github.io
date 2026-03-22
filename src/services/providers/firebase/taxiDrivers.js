import { db } from './settings'
import {
  collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, serverTimestamp, updateDoc,
} from 'firebase/firestore'

const COL = 'taxi_conductores'

export const getDrivers = async () => {
  const q = query(collection(db, COL), orderBy('name', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      name: data.name,
      idNumber: data.idNumber,
      phone: data.phone,
      defaultAmount: data.defaultAmount,
      defaultAmountSunday: data.defaultAmountSunday,
      defaultVehicle: data.defaultVehicle,
    }
  })
}

export const addDriver = async ({ name, idNumber, phone, defaultAmount, defaultAmountSunday, defaultVehicle }) => {
  const ref = await addDoc(collection(db, COL), {
    name,
    idNumber,
    phone: phone || null,
    defaultAmount: defaultAmount ? Number(defaultAmount) : null,
    defaultAmountSunday: defaultAmountSunday ? Number(defaultAmountSunday) : null,
    defaultVehicle: defaultVehicle || null,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const updateDriver = async (id, { name, idNumber, phone, defaultAmount, defaultAmountSunday, defaultVehicle }) => {
  await updateDoc(doc(db, COL, id), {
    name,
    idNumber,
    phone: phone || null,
    defaultAmount: defaultAmount ? Number(defaultAmount) : null,
    defaultAmountSunday: defaultAmountSunday ? Number(defaultAmountSunday) : null,
    defaultVehicle: defaultVehicle || null,
  })
}

export const deleteDriver = async (id) => {
  await deleteDoc(doc(db, COL, id))
}
