export const now = new Date()
export const CURRENT_YEAR = now.getFullYear()
export const CURRENT_MONTH = now.getMonth() + 1

export const aggregateMonthly = (transactions) => {
  const income = Array(12).fill(0)
  const expense = Array(12).fill(0)
  transactions.forEach((t) => {
    const m = Number(t.date?.slice(5, 7)) - 1
    if (m < 0 || m > 11) return
    if (t.type === 'income') income[m] += t.amount || 0
    else expense[m] += t.amount || 0
  })
  return { income, expense }
}

/**
 * Groups transactions of a given type by field, keeping the top `maxSlices`
 * entries and folding the remainder into an "Otros" bucket. Suited for
 * composition charts (doughnut, stacked) where slices must sum to the total.
 */
export const aggregateByField = (transactions, type, field, maxSlices = 5) => {
  const map = {}
  transactions
    .filter((t) => t.type === type)
    .forEach((t) => {
      const key = t[field] || 'Otros'
      map[key] = (map[key] || 0) + (t.amount || 0)
    })
  const sorted = Object.entries(map)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
  if (sorted.length <= maxSlices) return sorted.map(([label, value]) => ({ label, value }))
  const top = sorted.slice(0, maxSlices).map(([label, value]) => ({ label, value }))
  const rest = sorted.slice(maxSlices).reduce((s, [, v]) => s + v, 0)
  return [...top, { label: 'Otros', value: rest }]
}

/**
 * Top N entries of a given type grouped by field, for ranking charts.
 * Unlike aggregateByField, entries beyond the limit are dropped, not bucketed.
 */
export const topByField = (transactions, type, field, limit = 6) => {
  const map = {}
  transactions
    .filter((t) => t.type === type)
    .forEach((t) => {
      const key = t[field]?.trim()
      if (!key) return
      map[key] = (map[key] || 0) + (t.amount || 0)
    })
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
}
