import { db, COL_CONTRATOS as COL } from '../settings'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  serverTimestamp,
  updateDoc,
  getDoc,
  where,
} from 'firebase/firestore'
import { firestoreCall } from '../firebaseClient'
import { getTenantId } from 'src/services/tenantContext'


export const getContracts = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs
    .map((d) => ({
      id: d.id,
      name: d.data().name,
      archived: d.data().archived === true,
    }))
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
}

export const archiveContract = async (id, archived) => {
  await firestoreCall(() =>
    updateDoc(doc(db, COL, id), { archived, updatedAt: serverTimestamp() }),
  )
}

export const getContract = async (id) => {
  const snap = await firestoreCall(() => getDoc(doc(db, COL, id)))
  if (!snap.exists()) throw new Error('Contrato no encontrado')
  const data = snap.data()
  return {
    id: snap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt ?? null,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? data.updatedAt ?? null,
  }
}

export const addContract = async (name, payload) => {
  const ref = await firestoreCall(() =>
    addDoc(collection(db, COL), {
      name,
      ...payload,
      tenantId: getTenantId(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  )
  return ref.id
}

export const updateContract = async (id, payload) => {
  await firestoreCall(() =>
    updateDoc(doc(db, COL, id), { ...payload, updatedAt: serverTimestamp() }),
  )
}

export const cloneContract = async (sourceId, newName) => {
  const snap = await firestoreCall(() => getDoc(doc(db, COL, sourceId)))
  if (!snap.exists()) throw new Error('Contrato origen no encontrado')
  const { name: _name, createdAt: _c, updatedAt: _u, ...rest } = snap.data()
  const ref = await firestoreCall(() =>
    addDoc(collection(db, COL), {
      ...rest,
      name: newName,
      tenantId: getTenantId(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  )
  return { id: ref.id, name: newName }
}

export const deleteContract = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL, id)))
}

export const getContractsSummary = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs
    .map((d) => {
      const data = d.data()
      return {
        id: d.id,
        name: data.name ?? '',
        archived: data.archived === true,
        tenant_name: data.tenant?.full_name ?? '',
        property_address: data.property?.full_address ?? '',
        rental_start_date: data.rental?.start_date ?? '',
        rental_value: data.rental?.value ? Number(data.rental.value) : null,
        rental_duration: data.rental?.duration ? Number(data.rental.duration) : null,
        rental_payment_day: data.rental?.payment_day != null ? Number(data.rental.payment_day) : null,
        canon_history: data.rental?.canon_history ?? [],
        payments: data.rental?.payments ?? [],
      }
    })
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
}

export const updateCanonHistory = async (id, history) => {
  await firestoreCall(() =>
    updateDoc(doc(db, COL, id), { 'rental.canon_history': history, updatedAt: serverTimestamp() }),
  )
}

export const updatePayments = async (id, payments) => {
  await firestoreCall(() =>
    updateDoc(doc(db, COL, id), { 'rental.payments': payments, updatedAt: serverTimestamp() }),
  )
}
