import { collection, getDocs, deleteDoc, doc, query, orderBy, limit } from 'firebase/firestore'
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
