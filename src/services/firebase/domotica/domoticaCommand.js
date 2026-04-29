import { db, COL_DOMOTICA_COMMAND } from '../settings'
import { firestoreCall } from '../firebaseClient'
import { collection, getDocs, doc, setDoc } from 'firebase/firestore'

const mapDoc = (d) => {
  const data = d.data()
  // Serializar fechas para evitar errores en Redux (non-serializable values)
  return {
    ...data,
    id: d.id,
    timestamp: data.timestamp?.toDate?.()?.toISOString() ?? data.timestamp ?? null,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? data.updatedAt ?? null,
  }
}

export const fetchCommands = async () => {
  const snap = await firestoreCall(() => getDocs(collection(db, COL_DOMOTICA_COMMAND)))
  const result = {}
  snap.docs.forEach((d) => {
    result[d.id] = mapDoc(d)
  })
  return result
}

export const updateCommand = async (id, fields) => {
  await firestoreCall(() => setDoc(doc(db, COL_DOMOTICA_COMMAND, id), fields, { merge: true }))
}
