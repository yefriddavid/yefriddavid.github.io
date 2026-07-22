import { db, COL_FINANCE_CRYPTO_WITHDRAWALS as COL } from '../settings'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { firestoreCall } from '../firebaseClient'
import { getTenantId } from 'src/services/tenantContext'

// Read-only: records are written by scripts/sync-crypto-withdrawals (Go), not from the app.
export const fetchAll = async () => {
  const q = query(collection(db, COL), where('tenantId', '==', getTenantId()))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      coin: data.coin ?? '',
      amount: data.amount ?? 0,
      network: data.network ?? '',
      status: data.status ?? null,
      applyTime: data.applyTime ?? '',
      txId: data.txId ?? '',
      binanceWithdrawId: data.binanceWithdrawId ?? '',
    }
  })
}
