import { db, COL_DOMOTICA_DEVICES } from '../settings'
import { firestoreCall } from '../firebaseClient'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'

export const fetchDevices = async () => {
  const q = query(collection(db, COL_DOMOTICA_DEVICES), orderBy('name', 'asc'))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      name: data.name,
      type: data.type ?? null,
      location: data.location ?? null,
      status: data.status ?? null,
      ipAddress: data.ipAddress ?? null,
      notes: data.notes ?? null,
    }
  })
}

export const createDevice = async (data) => {
  const ref = await firestoreCall(() =>
    addDoc(collection(db, COL_DOMOTICA_DEVICES), {
      name: data.name,
      type: data.type || null,
      location: data.location || null,
      status: data.status || null,
      ipAddress: data.ipAddress || null,
      notes: data.notes || null,
      createdAt: serverTimestamp(),
    }),
  )
  return ref.id
}

export const updateDevice = async (id, data) => {
  await firestoreCall(() =>
    updateDoc(doc(db, COL_DOMOTICA_DEVICES, id), {
      name: data.name,
      type: data.type || null,
      location: data.location || null,
      status: data.status || null,
      ipAddress: data.ipAddress || null,
      notes: data.notes || null,
    }),
  )
}

export const deleteDevice = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL_DOMOTICA_DEVICES, id)))
}
