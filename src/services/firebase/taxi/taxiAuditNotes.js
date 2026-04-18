import { db } from '../settings'
import { collection, getDocs, setDoc, deleteDoc, doc, query, where } from 'firebase/firestore'
import { getTenantId } from 'src/services/tenantContext'

const COL = 'CashFlow_taxi_audit_notas'

const noteId = (date, driver) => `${date}__${driver.replace(/\s+/g, '_')}`

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
    }
  })
}

export const upsertNote = async ({ date, driver, note, resolved = false }) => {
  const id = noteId(date, driver)
  await setDoc(doc(db, COL, id), { date, driver, note, resolved, tenantId: getTenantId() })
  return id
}

export const deleteNote = async ({ date, driver }) => {
  await deleteDoc(doc(db, COL, noteId(date, driver)))
}
