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
  Timestamp,
} from 'firebase/firestore'
import { getTenantId } from 'src/services/tenantContext'
import { firestoreCall } from 'src/services/firebase/firebaseClient'

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

// Requires Firestore composite index: tenantId + vehicleId + timestamp (ASC)
export const getHistoryByRange = (vehicleId, startDate, endDate) =>
  firestoreCall(async () => {
    const q = query(
      collection(db, COL),
      where('tenantId', '==', getTenantId()),
      where('vehicleId', '==', vehicleId),
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      where('timestamp', '<=', Timestamp.fromDate(endDate)),
      orderBy('timestamp', 'asc'),
      limit(500),
    )
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({
      id: d.id,
      lat: parseFloat(d.data().latitude),
      lng: parseFloat(d.data().longitude),
      timestamp: d.data().timestamp?.toDate?.()?.toISOString() ?? d.data().timestamp,
      source: d.data().source ?? 'unknown',
    }))
  })
