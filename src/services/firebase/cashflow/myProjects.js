import { db } from '../settings'
import { collection, doc, setDoc, getDocs, deleteDoc, serverTimestamp } from 'firebase/firestore'

const COL = 'CashFlow_my_projects'

export const syncProjectToFirebase = async (project) => {
  const { id, ...data } = project
  await setDoc(doc(collection(db, COL), id), {
    ...data,
    syncedAt: serverTimestamp(),
  })
}

export const fetchAllFromFirebase = async () => {
  const snap = await getDocs(collection(db, COL))
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
  await deleteDoc(doc(collection(db, COL), id))
}
