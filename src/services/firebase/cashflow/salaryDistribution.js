import { db } from '../settings'
import { collection, doc, setDoc, getDocs, serverTimestamp, query, where } from 'firebase/firestore'
import { getTenantId } from 'src/services/tenantContext'

const COL = 'CashFlow_salary_distribution'

export const syncAllToFirebase = async (distributions) => {
  for (let i = 0; i < distributions.length; i++) {
    const { id, ...data } = distributions[i]
    await setDoc(doc(collection(db, COL), id), {
      ...data,
      order: i,
      tenantId: getTenantId(),
      syncedAt: serverTimestamp(),
    })
  }
}

export const fetchAllFromFirebase = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => {
      const data = d.data()
      return {
        id: d.id,
        name: data.name ?? 'Sin nombre',
        salary: data.salary ?? 0,
        invert: data.invert ?? 0,
        invertTarget: data.invertTarget ?? '',
        rows: data.rows ?? [],
        order: data.order ?? 0,
        syncedAt: data.syncedAt?.toDate?.()?.toISOString() ?? null,
      }
    })
    .sort((a, b) => a.order - b.order)
}
