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
  getDoc,
  where,
} from 'firebase/firestore'
import { getTenantId } from 'src/services/tenantContext'

const COL = 'Contratos_Contratos'

export const getContracts = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => ({
      id: d.id,
      name: d.data().name,
      archived: d.data().archived === true,
    }))
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
}

export const archiveContract = async (id, archived) => {
  await updateDoc(doc(db, COL, id), { archived, updatedAt: serverTimestamp() })
}

export const getContract = async (id) => {
  const snap = await getDoc(doc(db, COL, id))
  if (!snap.exists()) throw new Error('Contrato no encontrado')
  return { id: snap.id, ...snap.data() }
}

export const addContract = async (name, payload) => {
  const ref = await addDoc(collection(db, COL), {
    name,
    ...payload,
    tenantId: getTenantId(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export const updateContract = async (id, payload) => {
  await updateDoc(doc(db, COL, id), { ...payload, updatedAt: serverTimestamp() })
}

export const cloneContract = async (sourceId, newName) => {
  const snap = await getDoc(doc(db, COL, sourceId))
  if (!snap.exists()) throw new Error('Contrato origen no encontrado')
  const { name: _name, createdAt: _c, updatedAt: _u, ...rest } = snap.data()
  const ref = await addDoc(collection(db, COL), {
    ...rest,
    name: newName,
    tenantId: getTenantId(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return { id: ref.id, name: newName }
}

export const deleteContract = async (id) => {
  await deleteDoc(doc(db, COL, id))
}
