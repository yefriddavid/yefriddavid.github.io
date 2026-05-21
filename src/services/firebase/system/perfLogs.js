import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore'
import { db, COL_SYSTEM_PERF_LOGS } from '../settings'
import { firestoreCall } from '../firebaseClient'
import { authStorage } from 'src/utils/storage'

const SLOW_THRESHOLD_MS = 2000

export const writePerfLog = async (entry) => {
  try {
    await addDoc(collection(db, COL_SYSTEM_PERF_LOGS), {
      ...entry,
      timestamp: serverTimestamp(),
    })
  } catch {
    // Never throw from perf logging
  }
}

export const getPerfLogs = async () => {
  const q = query(collection(db, COL_SYSTEM_PERF_LOGS), orderBy('timestamp', 'desc'), limit(200))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    timestamp: d.data().timestamp?.toDate?.() ?? null,
  }))
}

export const measureAndLog = async (label, operation) => {
  const start = performance.now()
  try {
    const result = await operation()
    const ms = Math.round(performance.now() - start)
    if (ms > SLOW_THRESHOLD_MS) {
      writePerfLog({
        label,
        durationMs: ms,
        route: window.location.hash,
        username: authStorage.getUsername(),
        slow: true,
      })
    }
    return result
  } catch (err) {
    const ms = Math.round(performance.now() - start)
    writePerfLog({
      label,
      durationMs: ms,
      route: window.location.hash,
      username: authStorage.getUsername(),
      slow: ms > SLOW_THRESHOLD_MS,
      error: err?.message ?? String(err),
    })
    throw err
  }
}
