import { db } from '../settings'
import {
  collection, addDoc, getDocs, deleteDoc, doc, updateDoc, orderBy, query, serverTimestamp,
} from 'firebase/firestore'

const COL = 'taxi_distributions'

export const getDistributions = async () => {
  const q = query(collection(db, COL), orderBy('period', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({
    id: d.id,
    period: d.data().period,
    date: d.data().date,
    totalIncome: d.data().totalIncome,
    totalExpenses: d.data().totalExpenses,
    net: d.data().net,
    payments: d.data().payments ?? {},
  }))
}

export const createDistribution = async (data) => {
  const ref = await addDoc(collection(db, COL), {
    period: data.period,
    date: data.date,
    totalIncome: data.totalIncome,
    totalExpenses: data.totalExpenses,
    net: data.net,
    payments: data.payments,
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
