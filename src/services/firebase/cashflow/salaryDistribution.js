import { db } from '../settings'
import { collection, doc, setDoc, getDocs, serverTimestamp } from 'firebase/firestore'

const COL = 'CashFlow_salary_distribution'

export const syncAllToFirebase = async (distributions) => {
  for (let i = 0; i < distributions.length; i++) {
    const { id, ...data } = distributions[i]
    await setDoc(doc(collection(db, COL), id), {
      ...data,
      order: i,
      syncedAt: serverTimestamp(),
    })
  }
}

export const fetchAllFromFirebase = async () => {
  const snap = await getDocs(collection(db, COL))
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
