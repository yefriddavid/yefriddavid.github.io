import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore'
import { db, COL_SYSTEM_AUDIT_LOGS } from '../settings'
import { firestoreCall } from '../firebaseClient'

export const writeAuditLog = async (entry) => {
  try {
    await addDoc(collection(db, COL_SYSTEM_AUDIT_LOGS), {
      ...entry,
      timestamp: serverTimestamp(),
    })
  } catch {
    // Never throw from audit logging
  }
}

export const getAuditLogs = async () => {
  const q = query(collection(db, COL_SYSTEM_AUDIT_LOGS), orderBy('timestamp', 'desc'), limit(500))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    timestamp: d.data().timestamp?.toDate?.() ?? null,
  }))
}
