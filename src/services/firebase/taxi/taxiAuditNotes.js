import { db } from '../settings'
import { collection, getDocs, setDoc, deleteDoc, doc, query, where } from 'firebase/firestore'
import { getTenantId } from 'src/services/tenantContext'

const COL = 'CashFlow_taxi_audit_notas'

const noteId = (date, driver, noteType = '') => {
  const base = `${date}__${driver.replace(/\s+/g, '_')}`
  return noteType ? `${noteType}__${base}` : base
}

export const getNotes = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      date: data.date ?? null,
      driver: data.driver ?? null,
      note: data.note ?? null,
      resolved: data.resolved === true,
      noteType: data.noteType ?? '',
    }
  })
}

export const upsertNote = async ({ date, driver, note, resolved = false, noteType = '' }) => {
  const id = noteId(date, driver, noteType)
  await setDoc(doc(db, COL, id), {
    date,
    driver,
    note,
    resolved,
    noteType,
    tenantId: getTenantId(),
  })
  return id
}

export const deleteNote = async ({ date, driver, noteType = '' }) => {
  await deleteDoc(doc(db, COL, noteId(date, driver, noteType)))
}
