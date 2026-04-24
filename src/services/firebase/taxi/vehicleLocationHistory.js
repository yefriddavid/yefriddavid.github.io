import { db } from '../settings'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  serverTimestamp,
  where,
  limit,
  orderBy,
} from 'firebase/firestore'
import { getTenantId } from 'src/services/tenantContext'

const COL = 'Taxi_vehicle_location_history'

export const getHistory = async (vehicleId) => {
  try {
    let q = query(
      collection(db, COL),
      where('tenantId', '==', getTenantId()),
      orderBy('timestamp', 'desc'),
      limit(100)
    )
    if (vehicleId) {
      q = query(q, where('vehicleId', '==', vehicleId))
    }
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      timestamp: d.data().timestamp?.toDate?.()?.toISOString() ?? d.data().timestamp,
    }))
  } catch (error) {
    console.error('Error fetching vehicle location history:', error)
    return []
  }
}

export const addHistoryEntry = async (data) => {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    tenantId: getTenantId(),
    timestamp: serverTimestamp(),
  })
  return ref.id
}

export const deleteHistoryEntry = async (id) => {
  await deleteDoc(doc(db, COL, id))
}
