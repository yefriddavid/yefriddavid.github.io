import { restrictedDaysFor } from 'src/views/taxis/picoPlacaHelpers'

export const today = () => new Date().toISOString().split('T')[0]

export const fmtDateDisplay = (iso) => {
  if (!iso) return iso
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export const getPicoPlacaWarning = (plate, date, vehiclesMap) => {
  if (!plate || !date) return null
  const [yearStr, monthStr, dayStr] = date.split('-')
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10)
  const day = parseInt(dayStr, 10)
  const vehicle = vehiclesMap.get(plate)
  const restrictedDays = restrictedDaysFor(vehicle?.restrictions, year, month)
  if (restrictedDays.includes(day)) {
    return `⚠ Pico y placa: ${plate} no puede circular el día ${day}`
  }
  return null
}
