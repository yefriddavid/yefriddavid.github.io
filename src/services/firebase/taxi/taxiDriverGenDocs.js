import { dbTaxi as db, COL_TAXI_DRIVER_GEN_DOCS as COL } from '../settings'
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

export const getDriverGenDocs = async (driverId) => {
  const q = query(
    collection(db, COL),
    where('tenantId', '==', getTenantId()),
    where('driverId', '==', driverId),
  )
  const snap = await taxiCall(() => getDocs(q))
  return snap.docs
    .map((d) => ({
      id: d.id,
      driverId: d.data().driverId,
      templateId: d.data().templateId ?? '',
      templateName: d.data().templateName ?? '',
      title: d.data().title,
      content: d.data().content,
      createdAt: d.data().createdAt?.toMillis?.() ?? 0,
    }))
    .sort((a, b) => b.createdAt - a.createdAt)
}

export const addDriverGenDoc = async ({ driverId, templateId, templateName, title, content }) => {
  const ref = await taxiCall(() =>
    addDoc(collection(db, COL), {
      driverId,
      templateId: templateId ?? '',
      templateName: templateName ?? '',
      title,
      content,
      tenantId: getTenantId(),
      createdAt: serverTimestamp(),
    }),
  )
  return ref.id
}

export const updateDriverGenDoc = async (id, { title, content }) => {
  await taxiCall(() => updateDoc(doc(db, COL, id), { title, content }))
}

export const deleteDriverGenDoc = async (id) => {
  await taxiCall(() => deleteDoc(doc(db, COL, id)))
}
