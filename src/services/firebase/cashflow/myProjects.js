import { db, COL_CASHFLOW_MY_PROJECTS as COL } from '../settings'
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore'
import { firestoreCall } from '../firebaseClient'
import { getTenantId } from 'src/services/tenantContext'


export const syncProjectToFirebase = async (project) => {
  const { id, ...data } = project
  await firestoreCall(() =>
    setDoc(doc(collection(db, COL), id), {
      ...data,
      tenantId: getTenantId(),
      syncedAt: serverTimestamp(),
    }),
  )
}

export const fetchAllFromFirebase = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      description: data.description ?? '',
      date: data.date ?? '',
      goal: data.goal ?? 0,
      notes: data.notes ?? '',
      items: data.items ?? [],
      projectNotes: data.projectNotes ?? [],
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
      syncedAt: data.syncedAt?.toDate?.()?.toISOString() ?? null,
    }
  })
}

export const deleteProjectFromFirebase = async (id) => {
  await firestoreCall(() => deleteDoc(doc(collection(db, COL), id)))
}
