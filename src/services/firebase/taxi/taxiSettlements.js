import { dbTaxi as db, COL_TAXI_SETTLEMENTS as COL } from '../settings'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { taxiCall } from '../firebaseClient'
import { getTenantId } from 'src/services/tenantContext'

// filter: { from, to } | undefined (no date filter)
export const getSettlements = async (filter) => {
  const constraints = [where('tenantId', '==', getTenantId())]
  if (filter?.from && filter?.to)
    constraints.push(where('date', '>=', filter.from), where('date', '<=', filter.to))
  const q = query(collection(db, COL), ...constraints)
  const snap = await taxiCall(() => getDocs(q))
  return snap.docs
    .map((d) => {
      const data = d.data()
      return {
        id: d.id,
        driver: data.driver,
        plate: data.plate,
        amount: data.amount,
        date: data.date,
        comment: data.comment ?? null,
        paid_at: data.paid_at ?? null,
      }
    })
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
}

export const addSettlement = async ({ driver, plate, amount, date, comment }) => {
  const ref = await taxiCall(() =>
    addDoc(collection(db, COL), {
      driver,
      plate: plate.toUpperCase(),
      amount: Number(amount),
      date,
      comment: comment || null,
      tenantId: getTenantId(),
      createdAt: serverTimestamp(),
    }),
  )
  return ref.id
}

export const updateSettlement = async (id, { driver, plate, amount, date, comment, paid_at }) => {
  await taxiCall(() =>
    updateDoc(doc(db, COL, id), {
      driver,
      plate: plate?.toUpperCase() ?? '',
      amount: Number(amount),
      date,
      comment: comment || null,
      paid_at: paid_at || null,
    }),
  )
}

export const deleteSettlement = async (id) => {
  await taxiCall(() => deleteDoc(doc(db, COL, id)))
}
