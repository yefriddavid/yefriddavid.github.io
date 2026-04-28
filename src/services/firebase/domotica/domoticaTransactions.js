import { db, COL_DOMOTICA_TRANSACTIONS } from '../settings'
import { firestoreCall } from '../firebaseClient'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  where,
  Timestamp,
  limit,
  serverTimestamp,
} from 'firebase/firestore'

const todayStart = () => Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0)))

const mapDoc = (d) => {
  const data = d.data()
  const ts = data.createdAt
  return {
    id: d.id,
    type: data.type ?? null,
    device: data.device ?? null,
    description: data.description ?? null,
    amount: data.amount ?? null,
    unit: data.unit ?? null,
    date: data.date?.toDate?.()?.toISOString() ?? data.date ?? null,
    notes: data.notes ?? null,
    value: data.voltage ?? data.value ?? data.amps ?? null,
    percent: data.percent ?? data.soc ?? null,
    solar: data.solar ?? null,
    status: data.status ?? null,
    createdAt: ts?.toDate?.()?.toISOString() ?? null,
  }
}

export const fetchVoltageHistory = async () => {
  const q = query(
    collection(db, COL_DOMOTICA_TRANSACTIONS),
    where('createdAt', '>=', todayStart()),
    orderBy('createdAt', 'asc'),
    limit(500),
  )
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map(mapDoc).filter((r) => r.type === 'voltaje')
}

export const fetchCurrentHistory = async () => {
  const q = query(
    collection(db, COL_DOMOTICA_TRANSACTIONS),
    where('createdAt', '>=', todayStart()),
    orderBy('createdAt', 'asc'),
    limit(500),
  )
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map(mapDoc).filter((r) => r.type === 'corriente')
}

export const fetchTransactions = async () => {
  const q = query(collection(db, COL_DOMOTICA_TRANSACTIONS), orderBy('createdAt', 'desc'))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map(mapDoc)
}

export const createTransaction = async (data) => {
  const ref = await firestoreCall(() =>
    addDoc(collection(db, COL_DOMOTICA_TRANSACTIONS), {
      type: data.type,
      description: data.description || null,
      amount: data.amount != null ? Number(data.amount) : null,
      unit: data.unit || null,
      device: data.device || null,
      date: data.date,
      notes: data.notes || null,
      createdAt: serverTimestamp(),
    }),
  )
  return ref.id
}

export const updateTransaction = async (id, data) => {
  await firestoreCall(() =>
    updateDoc(doc(db, COL_DOMOTICA_TRANSACTIONS, id), {
      type: data.type,
      description: data.description || null,
      amount: data.amount != null ? Number(data.amount) : null,
      unit: data.unit || null,
      device: data.device || null,
      date: data.date,
      notes: data.notes || null,
    }),
  )
}

export const deleteTransaction = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL_DOMOTICA_TRANSACTIONS, id)))
}
