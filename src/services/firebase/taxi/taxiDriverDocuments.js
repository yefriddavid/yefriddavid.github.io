import { dbTaxi as db, COL_TAXI_DRIVER_DOCUMENTS as COL } from '../settings'
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

export const getDriverDocuments = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await taxiCall(() => getDocs(q))
  return snap.docs
    .map((d) => ({
      id: d.id,
      name: d.data().name,
      template: d.data().template,
      comment: d.data().comment ?? '',
    }))
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
}

export const addDriverDocument = async ({ name, template, comment }) => {
  const ref = await taxiCall(() =>
    addDoc(collection(db, COL), {
      name,
      template,
      comment: comment ?? '',
      tenantId: getTenantId(),
      createdAt: serverTimestamp(),
    }),
  )
  return ref.id
}

export const updateDriverDocument = async (id, data) => {
  await taxiCall(() =>
    updateDoc(doc(db, COL, id), {
      name: data.name,
      template: data.template,
      comment: data.comment ?? '',
    }),
  )
}

export const deleteDriverDocument = async (id) => {
  await taxiCall(() => deleteDoc(doc(db, COL, id)))
}
