import { createSelector } from '@reduxjs/toolkit'

const selectTransactions = (s) => s.transaction.data

// Builds { [accountMasterId]: totalPaid } across ALL time (used for targetAmount accounts).
// Memoized — only recomputes when transactions array reference changes.
export const selectCumulativePaymentsMap = createSelector(selectTransactions, (transactions) => {
  if (!transactions) return {}
  const map = {}
  transactions.forEach((t) => {
    if (!t.accountMasterId) return
    map[t.accountMasterId] = (map[t.accountMasterId] ?? 0) + (t.amount || 0)
  })
  return map
})
