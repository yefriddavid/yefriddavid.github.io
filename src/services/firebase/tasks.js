import { collection, getDocs, setDoc, deleteDoc, doc, query, where, serverTimestamp } from 'firebase/firestore'
import { db, COL_MISC_TASKS as COL } from './settings'
import { firestoreCall } from './firebaseClient'
import { getTenantId } from 'src/services/tenantContext'

export const fetchAllTasks = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      title: data.title ?? '',
      notes: data.notes ?? '',
      priority: data.priority ?? 'medium',
      dueDate: data.dueDate ?? null,
      tags: data.tags ?? [],
      done: data.done ?? false,
      doneAt: data.doneAt ?? null,
      listMode: data.listMode ?? false,
      createdAt: data.createdAt ?? new Date().toISOString(),
      localUpdatedAt: data.localUpdatedAt ?? null,
      syncedAt: data.syncedAt?.toDate?.()?.toISOString() ?? data.syncedAt ?? null,
    }
  })
}

export const upsertTask = async (task) => {
  const { id, syncedAt: _syncedAt, ...data } = task
  await firestoreCall(() =>
    setDoc(doc(collection(db, COL), id), {
      ...data,
      tenantId: getTenantId(),
      syncedAt: serverTimestamp(),
    }),
  )
}

export const removeTask = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL, id)))
}
