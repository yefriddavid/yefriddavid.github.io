import { dbDomotica as db, COL_DOMOTICA_COMMAND_DICTIONARY } from '../settings'
import { domoticaCall as firestoreCall } from '../firebaseClient'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'

const mapDoc = (d) => {
  const data = d.data()
  return {
    id: d.id,
    category: data.category ?? '',
    command: data.command ?? '',
    name: data.name ?? '',
    description: data.description ?? '',
    queryFormat: data.queryFormat ?? 'N/A',
    readFormat: data.readFormat ?? 'N/A',
    writeFormat: data.writeFormat ?? 'N/A',
    params: data.params ?? '',
    notes: data.notes ?? '',
    isCustom: data.isCustom ?? false,
  }
}

export const fetchCommandDictionary = async () => {
  const q = query(
    collection(db, COL_DOMOTICA_COMMAND_DICTIONARY),
    orderBy('category', 'asc'),
  )
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map(mapDoc)
}

export const createCommandEntry = async (data) => {
  const ref = await firestoreCall(() =>
    addDoc(collection(db, COL_DOMOTICA_COMMAND_DICTIONARY), {
      category: data.category,
      command: data.command,
      name: data.name,
      description: data.description || '',
      queryFormat: data.queryFormat || 'N/A',
      readFormat: data.readFormat || 'N/A',
      writeFormat: data.writeFormat || 'N/A',
      params: data.params || '',
      notes: data.notes || '',
      isCustom: true,
      createdAt: serverTimestamp(),
    }),
  )
  return ref.id
}

export const updateCommandEntry = async (id, data) => {
  await firestoreCall(() =>
    updateDoc(doc(db, COL_DOMOTICA_COMMAND_DICTIONARY, id), {
      category: data.category,
      command: data.command,
      name: data.name,
      description: data.description || '',
      queryFormat: data.queryFormat || 'N/A',
      readFormat: data.readFormat || 'N/A',
      writeFormat: data.writeFormat || 'N/A',
      params: data.params || '',
      notes: data.notes || '',
    }),
  )
}

export const deleteCommandEntry = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL_DOMOTICA_COMMAND_DICTIONARY, id)))
}

export const seedCommandDictionary = async (commands) => {
  const col = collection(db, COL_DOMOTICA_COMMAND_DICTIONARY)
  const CHUNK = 400
  for (let i = 0; i < commands.length; i += CHUNK) {
    const batch = writeBatch(db)
    for (const cmd of commands.slice(i, i + CHUNK)) {
      batch.set(doc(col), {
        category: cmd.category,
        command: cmd.command,
        name: cmd.name,
        description: cmd.description || '',
        queryFormat: cmd.queryFormat || 'N/A',
        readFormat: cmd.readFormat || 'N/A',
        writeFormat: cmd.writeFormat || 'N/A',
        params: cmd.params || '',
        notes: cmd.notes || '',
        isCustom: false,
        createdAt: serverTimestamp(),
      })
    }
    await firestoreCall(() => batch.commit())
  }
}
