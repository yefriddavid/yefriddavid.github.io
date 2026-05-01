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
  limit,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'

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
    value: data.voltage ?? data.value ?? data.amps ?? data.amount ?? null,
    percent: data.percent ?? data.soc ?? null,
    solar: data.solar ?? null,
    status: data.status ?? null,
    createdAt: ts?.toDate?.()?.toISOString() ?? null,
  }
}

export const fetchVoltageHistory = async ({ startDate, endDate } = {}) => {
  const constraints = [where('type', '==', 'voltaje'), orderBy('createdAt', 'asc'), limit(500)]

  if (startDate) constraints.push(where('createdAt', '>=', startDate))
  if (endDate) constraints.push(where('createdAt', '<=', endDate))

  const q = query(collection(db, COL_DOMOTICA_TRANSACTIONS), ...constraints)
  let data = []
  try {
    const snap = await firestoreCall(() => getDocs(q))
    data = snap.docs.map(mapDoc)
    return data
  } catch (e) {
    console.log(e)
  }
  return data
}

export const fetchCurrentHistory = async ({ startDate, endDate } = {}) => {
  const constraints = [where('type', '==', 'corriente'), orderBy('createdAt', 'asc'), limit(500)]

  if (startDate) constraints.push(where('createdAt', '>=', startDate))
  if (endDate) constraints.push(where('createdAt', '<=', endDate))

  const q = query(collection(db, COL_DOMOTICA_TRANSACTIONS), ...constraints)
  //const snap = await firestoreCall(() => getDocs(q))
  //return snap.docs.map(mapDoc)
  let data = []
  try {
    const snap = await firestoreCall(() => getDocs(q))
    data = snap.docs.map(mapDoc)
    return data
  } catch (e) {
    console.log(e)
  }
  return data
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

const buildRangeConstraints = ({ from, to, type }) => {
  const constraints = [
    where('createdAt', '>=', Timestamp.fromDate(new Date(from))),
    where('createdAt', '<=', Timestamp.fromDate(new Date(to))),
  ]
  if (type) constraints.push(where('type', '==', type))
  return constraints
}

export const countTransactionsByRange = async (params) => {
  const q = query(collection(db, COL_DOMOTICA_TRANSACTIONS), ...buildRangeConstraints(params))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.size
}

export const fetchTransactionsByRange = async (params) => {
  const q = query(
    collection(db, COL_DOMOTICA_TRANSACTIONS),
    ...buildRangeConstraints(params),
    orderBy('createdAt', 'asc'),
  )
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map(mapDoc)
}

export const deleteTransactionsByRange = async (params) => {
  const q = query(collection(db, COL_DOMOTICA_TRANSACTIONS), ...buildRangeConstraints(params))
  const snap = await firestoreCall(() => getDocs(q))
  const docs = snap.docs

  for (let i = 0; i < docs.length; i += 500) {
    const batch = writeBatch(db)
    docs.slice(i, i + 500).forEach((d) => batch.delete(d.ref))
    await firestoreCall(() => batch.commit())
  }

  return docs.length
}
