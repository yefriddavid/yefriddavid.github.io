export const today = () => new Date().toISOString().split('T')[0]

export const monthKey = (date) => (date ? date.slice(0, 7) : '')

const MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

export const monthLabel = (key) => {
  if (!key) return ''
  const [year, month] = key.split('-')
  return `${MONTH_LABELS[Number(month) - 1]} ${year}`
}

// Groups savings by YYYY-MM, returns entries sorted from most to least recent month.
export const groupByMonth = (savings) => {
  const byMonth = {}
  savings.forEach((s) => {
    const key = monthKey(s.date)
    if (!key) return
    if (!byMonth[key]) byMonth[key] = { key, total: 0, count: 0 }
    byMonth[key].total += Number(s.value) || 0
    byMonth[key].count += 1
  })
  return Object.values(byMonth).sort((a, b) => b.key.localeCompare(a.key))
}
