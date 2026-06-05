import { collection, getDocs, deleteDoc, doc, query, orderBy, limit, writeBatch } from 'firebase/firestore'
import { db, COL_SYSTEM_ERROR_LOGS } from '../settings'
import { firestoreCall } from 'src/services/firebase/firebaseClient'

export const getErrorLogs = async () => {
  const q = query(collection(db, COL_SYSTEM_ERROR_LOGS), orderBy('timestamp', 'desc'), limit(500))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    timestamp: d.data().timestamp?.toDate?.()?.toISOString() ?? null,
  }))
}

export const deleteErrorLog = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL_SYSTEM_ERROR_LOGS, id)))
}

export const clearAllErrorLogs = async () => {
  const snap = await firestoreCall(() => getDocs(collection(db, COL_SYSTEM_ERROR_LOGS)))
  const BATCH_SIZE = 500
  const docs = snap.docs
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = writeBatch(db)
    docs.slice(i, i + BATCH_SIZE).forEach((d) => batch.delete(d.ref))
    await firestoreCall(() => batch.commit())
  }
}
