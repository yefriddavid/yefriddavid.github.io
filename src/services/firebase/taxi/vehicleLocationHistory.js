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

const mapHistoryDoc = (d) => {
  const data = d.data()
  return {
    id: d.id,
    ...data,
    latitude: data.latitude || data.lat,
    longitude: data.longitude || data.lng,
    timestamp: data.timestamp?.toDate?.()?.toISOString() ?? data.timestamp ?? data.createdAt,
  }
}

export const getHistory = (vehicleId, plate) =>
  firestoreCall(async () => {
    const tenantId = getTenantId()
    if (!tenantId) return []

    let q = query(
      collection(db, COL),
      where('tenantId', '==', tenantId),
      where('vehicleId', '==', vehicleId),
      orderBy('timestamp', 'desc'),
      limit(5),
    )
    let snap = await getDocs(q)

    if (snap.empty && plate) {
      q = query(
        collection(db, COL),
        where('tenantId', '==', tenantId),
        where('plate', '==', plate),
        orderBy('timestamp', 'desc'),
        limit(5),
      )
      snap = await getDocs(q)
    }

    return snap.docs.map(mapHistoryDoc)
  })

export const addHistoryEntry = (data) =>
  firestoreCall(async () => {
    const ref = await addDoc(collection(db, COL), {
      ...data,
      tenantId: getTenantId(),
      timestamp: serverTimestamp(),
    })
    return ref.id
  })

export const deleteHistoryEntry = (id) =>
  firestoreCall(async () => {
    await deleteDoc(doc(db, COL, id))
  })

export const getLastKnownPosition = (vehicleId) =>
  firestoreCall(async () => {
    const q = query(
      collection(db, COL),
      where('tenantId', '==', getTenantId()),
      where('vehicleId', '==', vehicleId),
      orderBy('timestamp', 'desc'),
      limit(1),
    )
    const snap = await getDocs(q)
    if (snap.empty) return null
    return mapHistoryDoc(snap.docs[0])
  })

// Requires Firestore composite index: tenantId + vehicleId + timestamp (ASC)
export const getHistoryByRange = (vehicleId, startDate, endDate) =>
  firestoreCall(async () => {
    const q = query(
      collection(db, COL),
      where('tenantId', '==', getTenantId()),
      where('vehicleId', '==', vehicleId),
      where('timestamp', '>=', Timestamp.fromDate(new Date(startDate))),
      where('timestamp', '<=', Timestamp.fromDate(new Date(endDate))),
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
