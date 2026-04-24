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
  limit,
  orderBy,
  onSnapshot,
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
    const docs = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      timestamp: d.data().timestamp?.toDate?.()?.toISOString() ?? d.data().timestamp,
    }))

    console.log("docs");
    console.log(docs);
    return docs

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

export const subscribeToRecentLocations = (onUpdate) => {
  const q = query(
    collection(db, COL),
    where('tenantId', '==', getTenantId()),
    orderBy('timestamp', 'desc'),
    limit(20),
  )
  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type !== 'added') return
      const entry = change.doc.data()
      if (!entry.vehicleId) return
      onUpdate({
        vehicleId: entry.vehicleId,
        lat: parseFloat(entry.latitude),
        lng: parseFloat(entry.longitude),
        timestamp: entry.timestamp?.toDate?.()?.toISOString() ?? entry.timestamp,
      })
    })
  })
}
