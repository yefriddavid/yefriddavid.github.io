import { db } from '../settings'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { getTenantId } from 'src/services/tenantContext'

const COL = 'CashFlow_taxi_vehiculos'

export const getVehicles = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => {
      const data = d.data()
      return {
        id: d.id,
        plate: data.plate,
        brand: data.brand,
        model: data.model,
        year: data.year,
        restrictions: data.restrictions ?? {},
      }
    })
    .sort((a, b) => (a.plate ?? '').localeCompare(b.plate ?? ''))
}

export const addVehicle = async ({ plate, brand, model, year }) => {
  const ref = await addDoc(collection(db, COL), {
    plate: plate.toUpperCase(),
    brand,
    model,
    year,
    restrictions: {},
    tenantId: getTenantId(),
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const updateVehicle = async (id, { plate, brand, model, year }) => {
  await updateDoc(doc(db, COL, id), {
    plate: plate.toUpperCase(),
    brand,
    model,
    year,
  })
}

export const updateRestrictions = async (id, restrictions) => {
  await updateDoc(doc(db, COL, id), { restrictions })
}

export const deleteVehicle = async (id) => {
  await deleteDoc(doc(db, COL, id))
}
