import { db } from './settings'
import {
  collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, serverTimestamp, updateDoc,
} from 'firebase/firestore'

const COL = 'taxi_conductores'

export const getConductores = async () => {
  const q = query(collection(db, COL), orderBy('nombre', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const addConductor = async ({ nombre, cedula, telefono, defaultAmount }) => {
  const ref = await addDoc(collection(db, COL), {
    nombre,
    cedula,
    telefono,
    defaultAmount: defaultAmount ? Number(defaultAmount) : null,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const updateConductor = async (id, { nombre, cedula, telefono, defaultAmount }) => {
  await updateDoc(doc(db, COL, id), {
    nombre,
    cedula,
    telefono,
    defaultAmount: defaultAmount ? Number(defaultAmount) : null,
  })
}

export const deleteConductor = async (id) => {
  await deleteDoc(doc(db, COL, id))
}
