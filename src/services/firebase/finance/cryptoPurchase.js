import { db, COL_FINANCE_CRYPTO_PURCHASES as COL } from '../settings'
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore'
import { firestoreCall } from '../firebaseClient'
import { getTenantId } from 'src/services/tenantContext'

export const fetchAll = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      type: data.type ?? 'buy',
      symbol: data.symbol ?? '',
      platform: data.platform ?? '',
      quantity: data.quantity ?? 0,
      purchasePrice: data.purchasePrice ?? 0,
      purchaseDate: data.purchaseDate ?? '',
      purchaseTime: data.purchaseTime ?? '',
      binanceOrderId: data.binanceOrderId ?? null,
      usdCopRate: data.usdCopRate ?? null,
      isAdjustment: data.isAdjustment ?? false,
      fundedByLoan: data.fundedByLoan ?? false,
      profitPending: data.profitPending ?? false,
      needsRepurchase: data.needsRepurchase ?? false,
      style: data.style ?? null,
      active: data.active ?? true,
      notes: data.notes ?? '',
      matchGroupId: data.matchGroupId ?? null,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt ?? null,
    }
  })
}

export const saveEntry = async (entry) => {
  const { id, ...data } = entry
  const ref = await firestoreCall(() =>
    addDoc(collection(db, COL), {
      ...data,
      tenantId: getTenantId(),
      createdAt: serverTimestamp(),
    }),
  )
  return ref.id
}

// Binance-derived fields (binanceTradeId, binanceOrderId, purchaseTime) are
// written only by scripts/sync-crypto-purchases and scripts/backfill-crypto-
// purchase-field — never by the app. CryptoPurchaseForm never registers them,
// so `entry` here never carries them on an edit and `merge: true` leaves
// whatever is already in Firestore untouched. Do not add them to the edit
// form under any circumstance.
export const updateEntry = async (entry) => {
  const { id, ...data } = entry
  await firestoreCall(() =>
    setDoc(
      doc(collection(db, COL), id),
      { ...data, updatedAt: serverTimestamp() },
      { merge: true },
    ),
  )
}

export const deleteEntry = async (id) => {
  await firestoreCall(() => deleteDoc(doc(collection(db, COL), id)))
}
