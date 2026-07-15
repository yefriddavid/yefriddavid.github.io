export const groupByYear = (transactions) => {
  const map = {}
  transactions.forEach((t) => {
    const y = t.date?.slice(0, 4)
    if (!y) return
    if (!map[y]) map[y] = []
    map[y].push(t)
  })
  return map
}

export const yearlyTotals = (transactions) => {
  const grouped = groupByYear(transactions)
  return Object.keys(grouped)
    .sort()
    .map((year) => {
      const income = grouped[year]
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + (t.amount || 0), 0)
      const expense = grouped[year]
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + (t.amount || 0), 0)
      return { year: Number(year), income, expense, net: income - expense }
    })
}

/**
 * Category × month breakdown for a single year and type, keeping the top
 * `maxCategories` (by yearly total) and folding the rest into "Otros" —
 * mirrors dashboardHelpers.aggregateByField's fold rule, kept per-month here.
 * Feeds both CategoryTrendChart and PivotTable.
 */
export const categoryMonthMatrix = (transactions, type, year, maxCategories = 5) => {
  const scoped = transactions.filter((t) => t.type === type && t.date?.slice(0, 4) === String(year))
  const byCategory = {}
  scoped.forEach((t) => {
    const cat = t.category || 'Otros'
    const m = Number(t.date.slice(5, 7)) - 1
    if (m < 0 || m > 11) return
    if (!byCategory[cat]) byCategory[cat] = Array(12).fill(0)
    byCategory[cat][m] += t.amount || 0
  })
  const total = (row) => row.reduce((s, v) => s + v, 0)
  const sorted = Object.keys(byCategory).sort((a, b) => total(byCategory[b]) - total(byCategory[a]))
  if (sorted.length <= maxCategories) {
    const categoryGroups = Object.fromEntries(sorted.map((c) => [c, [c]]))
    return { categories: sorted, matrix: sorted.map((c) => byCategory[c]), categoryGroups }
  }
  const top = sorted.slice(0, maxCategories)
  const rest = sorted.slice(maxCategories)
  const otherRow = Array(12)
    .fill(0)
    .map((_, m) => rest.reduce((s, c) => s + byCategory[c][m], 0))
  const categories = top.includes('Otros') ? top : [...top, 'Otros']
  const matrix = top.map((c) =>
    c === 'Otros' ? byCategory[c].map((v, m) => v + otherRow[m]) : byCategory[c],
  )
  if (!top.includes('Otros')) matrix.push(otherRow)

  // categoryGroups maps each displayed category (incl. the "Otros" fold) back to
  // every raw category value it represents, so callers can filter the original
  // transactions for a drill-down without re-deriving the fold logic.
  const categoryGroups = {}
  top.forEach((c) => {
    categoryGroups[c] = c === 'Otros' ? [c, ...rest] : [c]
  })
  if (!top.includes('Otros')) categoryGroups.Otros = rest

  return { categories, matrix, categoryGroups }
}

export const buildPivotAoa = (categories, matrix, monthLabels) => {
  const header = ['Categoría', ...monthLabels, 'Total']
  const rows = categories.map((cat, i) => {
    const row = matrix[i]
    const total = row.reduce((s, v) => s + v, 0)
    return [cat, ...row, total]
  })
  const monthTotals = monthLabels.map((_, m) => matrix.reduce((s, row) => s + row[m], 0))
  const grandTotal = monthTotals.reduce((s, v) => s + v, 0)
  return [header, ...rows, ['Total', ...monthTotals, grandTotal]]
}
