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

const COL = 'CashFlow_taxi_conductores'

export const getDrivers = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => {
      const data = d.data()
      return {
        id: d.id,
        name: data.name,
        idNumber: data.idNumber,
        phone: data.phone,
        defaultAmount: data.defaultAmount,
        defaultAmountSunday: data.defaultAmountSunday,
        defaultVehicle: data.defaultVehicle,
        active: data.active !== false,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
      }
    })
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
}

export const addDriver = async ({
  name,
  idNumber,
  phone,
  defaultAmount,
  defaultAmountSunday,
  defaultVehicle,
  active,
  startDate,
}) => {
  const ref = await addDoc(collection(db, COL), {
    name,
    idNumber,
    phone: phone || null,
    defaultAmount: defaultAmount ? Number(defaultAmount) : null,
    defaultAmountSunday: defaultAmountSunday ? Number(defaultAmountSunday) : null,
    defaultVehicle: defaultVehicle || null,
    active: active !== false,
    startDate: startDate || null,
    endDate: null,
    tenantId: getTenantId(),
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const updateDriver = async (
  id,
  {
    name,
    idNumber,
    phone,
    defaultAmount,
    defaultAmountSunday,
    defaultVehicle,
    active,
    startDate,
    endDate,
  },
) => {
  await updateDoc(doc(db, COL, id), {
    name,
    idNumber,
    phone: phone || null,
    defaultAmount: defaultAmount ? Number(defaultAmount) : null,
    defaultAmountSunday: defaultAmountSunday ? Number(defaultAmountSunday) : null,
    defaultVehicle: defaultVehicle || null,
    active: active !== false,
    startDate: startDate || null,
    endDate: endDate || null,
  })
}

export const deleteDriver = async (id) => {
  await deleteDoc(doc(db, COL, id))
}
