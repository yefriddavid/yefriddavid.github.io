export const fmt = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n)

export const fmtDate = (dateStr) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const weekday = date.toLocaleDateString('es-CO', { weekday: 'short' })
  const day = String(d).padStart(2, '0')
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${day}`
}

export const today = () => new Date().toISOString().split('T')[0]

export const EMPTY = { driver: '', plate: '', amount: '', date: today(), comment: '' }
