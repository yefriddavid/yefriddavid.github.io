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

export const getHistory = async (vehicleId, plate) => {
  try {
    const tenantId = getTenantId()
    if (!tenantId) return []

    // Primary query by vehicleId
    let q = query(
      collection(db, COL),
      where('tenantId', '==', tenantId),
      where('vehicleId', '==', vehicleId),
      orderBy('timestamp', 'desc'),
      limit(5)
    )

    let snap = await getDocs(q)

    // Fallback to plate if no results (sometimes IDs change or are different in history)
    if (snap.empty && plate) {
      q = query(
        collection(db, COL),
        where('tenantId', '==', tenantId),
        where('plate', '==', plate),
        orderBy('timestamp', 'desc'),
        limit(5)
      )
      snap = await getDocs(q)
    }

    return snap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        ...data,
        // Ensure latitude and longitude are available even if saved with different names
        latitude: data.latitude || data.lat,
        longitude: data.longitude || data.lng,
        timestamp: data.timestamp?.toDate?.()?.toISOString() ?? data.timestamp ?? data.createdAt,
      }
    })
  } catch (error) {
    console.error('Error fetching vehicle location history:', error)
    // If it's an index error, it will be in the console
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
