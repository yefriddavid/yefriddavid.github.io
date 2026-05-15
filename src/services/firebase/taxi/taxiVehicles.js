import { dbTaxi as db, COL_TAXI_VEHICLES as COL } from '../settings'
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
import { taxiCall } from '../firebaseClient'
import { getTenantId } from 'src/services/tenantContext'


export const getVehicles = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await taxiCall(() => getDocs(q))
  return snap.docs
    .map((d) => {
      const data = d.data()
      return {
        id: d.id,
        plate: data.plate,
        brand: data.brand,
        model: data.model,
        year: data.year,
        active: data.active !== false,
        restrictions: data.restrictions ?? {},
      }
    })
    .sort((a, b) => (a.plate ?? '').localeCompare(b.plate ?? ''))
}

export const addVehicle = async ({ plate, brand, model, year, active }) => {
  const ref = await taxiCall(() =>
    addDoc(collection(db, COL), {
      plate: plate.toUpperCase(),
      brand,
      model,
      year,
      active: active !== false,
      restrictions: {},
      tenantId: getTenantId(),
      createdAt: serverTimestamp(),
    }),
  )
  return ref.id
}

export const updateVehicle = async (id, { plate, brand, model, year, active }) => {
  await taxiCall(() =>
    updateDoc(doc(db, COL, id), {
      plate: plate.toUpperCase(),
      brand,
      model,
      year,
      active: active !== false,
    }),
  )
}

export const updateRestrictions = async (id, restrictions) => {
  await taxiCall(() => updateDoc(doc(db, COL, id), { restrictions }))
}

export const deleteVehicle = async (id) => {
  await taxiCall(() => deleteDoc(doc(db, COL, id)))
}
