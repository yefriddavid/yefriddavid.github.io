import { db, COL_MISC_NOTES } from '../settings'
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { firestoreCall } from '../firebaseClient'
import { getTenantId } from 'src/services/tenantContext'

const serializeTs = (ts) => ts?.toDate?.()?.toISOString() ?? null

export const getNotes = async () => {
  const q = query(
    collection(db, COL_MISC_NOTES),
    where('tenantId', '==', getTenantId()),
    orderBy('updatedAt', 'desc'),
  )
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      ...data,
      createdAt: serializeTs(data.createdAt),
      updatedAt: serializeTs(data.updatedAt),
    }
  })
}

export const createNote = async ({ title, content, color, mode, category }) => {
  const now = new Date().toISOString()
  const ref = await firestoreCall(() =>
    addDoc(collection(db, COL_MISC_NOTES), {
      title,
      content,
      color,
      mode: mode || 'textarea',
      category: category || 'general',
      tenantId: getTenantId(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  )
  return { id: ref.id, title, content, color, mode: mode || 'textarea', category: category || 'general', createdAt: now, updatedAt: now }
}

export const updateNote = async ({ id, title, content, color, mode, archived, category }) => {
  const patch = { updatedAt: serverTimestamp() }
  if (title !== undefined) patch.title = title
  if (content !== undefined) patch.content = content
  if (color !== undefined) patch.color = color
  if (mode !== undefined) patch.mode = mode
  if (archived !== undefined) patch.archived = archived
  if (category !== undefined) patch.category = category
  await firestoreCall(() => updateDoc(doc(db, COL_MISC_NOTES, id), patch))
}

export const deleteNote = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL_MISC_NOTES, id)))
}

export const reorderNotes = async (updates) => {
  const batch = writeBatch(db)
  updates.forEach(({ id, order }) => batch.update(doc(db, COL_MISC_NOTES, id), { order }))
  await firestoreCall(() => batch.commit())
}

export const subscribeNotes = (onData) => {
  const q = query(
    collection(db, COL_MISC_NOTES),
    where('tenantId', '==', getTenantId()),
    orderBy('updatedAt', 'desc'),
  )
  return onSnapshot(q, (snap) => {
    onData(
      snap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          ...data,
          createdAt: serializeTs(data.createdAt),
          updatedAt: serializeTs(data.updatedAt),
        }
      }),
    )
  })
}
