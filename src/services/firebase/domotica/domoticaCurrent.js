import { db, COL_DOMOTICA_CURRENT, COL_DOMOTICA_TRANSACTIONS } from '../settings'
import { firestoreCall } from '../firebaseClient'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore'

export const fetchCurrentRecords = async (filters = {}) => {
  const constraints = []
  if (filters.device) constraints.push(where('device', '==', filters.device))
  if (filters.type) constraints.push(where('type', '==', filters.type))

  const q = query(collection(db, COL_DOMOTICA_CURRENT), ...constraints)
  const snap = await firestoreCall(() => getDocs(q))

  return snap.docs.map((d) => {
    const data = d.data()
    const ts = data.updatedAt ?? data.createdAt ?? null
    return {
      id: d.id,
      type: data.type ?? null,
      device: data.device ?? null,
      value: data.value ?? data.voltage ?? null,
      amps: data.amps ?? null,
      watts: data.watts ?? null,
      status: data.status ?? null,
      solar: data.solar ?? null,
      percent: data.percent ?? data.soc ?? null,
      soc: data.soc ?? data.percent ?? null,
      date: data.date ?? null,
      updatedAt: ts?.toDate?.()?.toISOString() ?? null,
      notes: data.notes ?? null,
    }
  })
}

export const createCurrentRecord = async (data) => {
  const ref = await firestoreCall(() =>
    addDoc(collection(db, COL_DOMOTICA_CURRENT), {
      type: data.type || null,
      device: data.device || null,
      value: data.value != null ? Number(data.value) : null,
      amps: data.amps != null ? Number(data.amps) : null,
      watts: data.watts != null ? Number(data.watts) : null,
      date: data.date || null,
      notes: data.notes || null,
      createdAt: serverTimestamp(),
    }),
  )
  return ref.id
}

export const updateCurrentRecord = async (id, data) => {
  await firestoreCall(() =>
    updateDoc(doc(db, COL_DOMOTICA_CURRENT, id), {
      type: data.type || null,
      device: data.device || null,
      value: data.value != null ? Number(data.value) : null,
      amps: data.amps != null ? Number(data.amps) : null,
      watts: data.watts != null ? Number(data.watts) : null,
      date: data.date || null,
      notes: data.notes || null,
    }),
  )
}

export const deleteCurrentRecord = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL_DOMOTICA_CURRENT, id)))
}

export const fetchVoltageHistory = async () => {
  const startOfToday = Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0)))
  const q = query(
    collection(db, COL_DOMOTICA_TRANSACTIONS),
    where('device', '==', 'esp8266-battery'),
    where('type', '==', 'voltaje'),
    where('createdAt', '>=', startOfToday),
    orderBy('createdAt', 'asc'),
    limit(200),
  )
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      value: data.voltage ?? data.value ?? null,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
    }
  })
}
