import { db } from '../settings'
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
import { getTenantId } from 'src/services/tenantContext'

const COL = 'CashFlow_taxi_distributions'

export const getDistributions = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => ({
      id: d.id,
      period: d.data().period,
      date: d.data().date,
      totalIncome: d.data().totalIncome,
      totalExpenses: d.data().totalExpenses,
      net: d.data().net,
      payments: d.data().payments ?? {},
    }))
    .sort((a, b) => (b.period ?? '').localeCompare(a.period ?? ''))
}

export const createDistribution = async (data) => {
  const ref = await addDoc(collection(db, COL), {
    period: data.period,
    date: data.date,
    totalIncome: data.totalIncome,
    totalExpenses: data.totalExpenses,
    net: data.net,
    payments: data.payments,
    tenantId: getTenantId(),
    createdAt: serverTimestamp(),
  })
  return ref.id
}

// payments is a map keyed by partnerId; update one partner entry using dot-notation
export const updatePartnerPayment = async (distributionId, partnerId, paymentData) => {
  await updateDoc(doc(db, COL, distributionId), {
    [`payments.${partnerId}`]: paymentData,
  })
}

export const deleteDistribution = async (id) => {
  await deleteDoc(doc(db, COL, id))
}
