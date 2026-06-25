import { dbDomotica as db, COL_DOMOTICA_SOLAR_CALC } from '../settings'
import { domoticaCall as firestoreCall } from '../firebaseClient'
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

export const fetchSolarCalcConfigs = async () => {
  const q = query(collection(db, COL_DOMOTICA_SOLAR_CALC), orderBy('createdAt', 'desc'))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      name: data.name ?? '',
      mode: data.mode ?? 'from_system',
      panels: data.panels ?? null,
      controller: data.controller ?? null,
      battery: data.battery ?? null,
      inverter: data.inverter ?? null,
      consumption: data.consumption ?? null,
      appliances: data.appliances ?? [],
      location: data.location ?? null,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
    }
  })
}

export const createSolarCalcConfig = async (data) => {
  const ref = await firestoreCall(() =>
    addDoc(collection(db, COL_DOMOTICA_SOLAR_CALC), {
      name: data.name,
      mode: data.mode,
      panels: data.panels,
      controller: data.controller,
      battery: data.battery,
      inverter: data.inverter,
      consumption: data.consumption,
      appliances: data.appliances ?? [],
      location: data.location ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  )
  return ref.id
}

export const updateSolarCalcConfig = async (id, data) => {
  await firestoreCall(() =>
    updateDoc(doc(db, COL_DOMOTICA_SOLAR_CALC, id), {
      name: data.name,
      mode: data.mode,
      panels: data.panels,
      controller: data.controller,
      battery: data.battery,
      inverter: data.inverter,
      consumption: data.consumption,
      appliances: data.appliances ?? [],
      location: data.location ?? null,
      updatedAt: serverTimestamp(),
    }),
  )
}

export const deleteSolarCalcConfig = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL_DOMOTICA_SOLAR_CALC, id)))
}
