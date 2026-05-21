export const today = () => new Date().toISOString().split('T')[0]

export const fmtDateDisplay = (iso) => {
  if (!iso) return iso
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export const getPicoPlacaWarning = (plate, date, vehiclesMap) => {
  if (!plate || !date) return null
  const [, monthStr, dayStr] = date.split('-')
  const month = parseInt(monthStr, 10)
  const day = parseInt(dayStr, 10)
  const vehicle = vehiclesMap.get(plate)
  const restr = vehicle?.restrictions?.[month] ?? vehicle?.restrictions?.[String(month)]
  if (restr && new Set([restr.d1, restr.d2].filter(Boolean).map(Number)).has(day)) {
    return `⚠ Pico y placa: ${plate} no puede circular el día ${day}`
  }
  return null
}
