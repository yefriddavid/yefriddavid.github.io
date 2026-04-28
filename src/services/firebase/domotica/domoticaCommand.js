import { db, COL_DOMOTICA_COMMAND } from '../settings'
import { firestoreCall } from '../firebaseClient'
import { collection, getDocs, doc, setDoc } from 'firebase/firestore'

export const fetchCommands = async () => {
  const snap = await firestoreCall(() => getDocs(collection(db, COL_DOMOTICA_COMMAND)))
  const result = {}
  snap.docs.forEach((d) => {
    result[d.id] = { id: d.id, ...d.data() }
  })
  return result
}

export const updateCommand = async (id, read) => {
  await firestoreCall(() => setDoc(doc(db, COL_DOMOTICA_COMMAND, id), { read }, { merge: true }))
}
