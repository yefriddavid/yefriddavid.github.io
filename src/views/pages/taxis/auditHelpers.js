// Pure audit utility functions extracted from Settlements.js for testability

// ── Easter (Computus algorithm) ───────────────────────────────────────────────
export const getEaster = (year) => {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

export const toYMD = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export const nextMonday = (date) => {
  const d = new Date(date)
  const dow = d.getDay()
  if (dow === 1) return d
  d.setDate(d.getDate() + (dow === 0 ? 1 : 8 - dow))
  return d
}

// ── Colombian public holidays ─────────────────────────────────────────────────
export const getColombianHolidays = (year) => {
  const h = new Set()
  const add = (date) => h.add(toYMD(date))
  const fixed = (m, d) => add(new Date(year, m - 1, d))
  const emiliani = (m, d) => add(nextMonday(new Date(year, m - 1, d)))
  // Fixed
  fixed(1, 1); fixed(5, 1); fixed(7, 20); fixed(8, 7); fixed(12, 8); fixed(12, 25)
  // Ley Emiliani
  emiliani(1, 6); emiliani(3, 19); emiliani(6, 29)
  emiliani(8, 15); emiliani(10, 12); emiliani(11, 1); emiliani(11, 11)
  // Easter-based
  const easter = getEaster(year)
  const easterOffset = (n) => { const d = new Date(easter); d.setDate(d.getDate() + n); return d }
  add(easterOffset(-3)); add(easterOffset(-2))           // Jueves y Viernes Santo
  add(nextMonday(easterOffset(39)))                       // Ascensión
  add(nextMonday(easterOffset(60)))                       // Corpus Christi
  add(nextMonday(easterOffset(68)))                       // Sagrado Corazón
  return h
}

// ── Audit note ID (must match taxiAuditNoteReducer.js) ───────────────────────
export const auditNoteId = (date, driver) => `${date}__${driver.replace(/\s+/g, '_')}`

// ── Build audit data for a single calendar day ────────────────────────────────
// Parameters:
//   d              - day number (1–31)
//   monthStr       - 'YYYY-MM'
//   periodRecords  - settlement records for the month
//   periodDrivers  - drivers active during the period
//   auditVehicles  - sorted unique plates of period drivers
//   auditDrivers   - sorted driver names of period drivers
//   year, month    - period year/month numbers
//   auditToday     - current day number if this is the current period, else null
//   now            - reference Date (for isFuture when auditToday is null)
//   holidays       - Set of 'YYYY-MM-DD' strings for the year
export const buildAuditDay = (d, {
  monthStr, periodRecords, periodDrivers, auditVehicles, auditDrivers,
  year, month, auditToday, now, holidays, vehicleRestrictions,
}) => {
  const dateStr = `${monthStr}-${String(d).padStart(2, '0')}`
  const dayRecords = periodRecords.filter((r) => r.date === dateStr)
  const settled = new Set(dayRecords.map((r) => r.driver).filter(Boolean))
  const settledVehicles = new Set(dayRecords.map((r) => r.plate).filter(Boolean))
  const dow = new Date(year, month - 1, d).getDay()
  const isSunday = dow === 0
  const isHoliday = holidays.has(dateStr)

  const driverOnDay = (pl) => periodDrivers.find((dr) => {
    if (dr.defaultVehicle !== pl) return false
    if (dr.startDate && dr.startDate > dateStr) return false
    if (dr.endDate && dr.endDate < dateStr) return false
    return true
  })

  const expectedVehicles = auditVehicles.filter((pl) => !!driverOnDay(pl))

  // Vehicles restricted by pico y placa on this specific day number
  const picoPlacaVehicles = expectedVehicles.filter((pl) => vehicleRestrictions?.get(pl)?.has(d))
  const picoPlacaSet = new Set(picoPlacaVehicles)

  const missingVehicles = expectedVehicles.filter((pl) => !settledVehicles.has(pl) && !picoPlacaSet.has(pl))

  const underpaidVehicles = expectedVehicles.filter((pl) => {
    if (!settledVehicles.has(pl)) return false
    const driver = driverOnDay(pl)
    if (!driver) return false
    const expected = (isSunday || isHoliday)
      ? (driver.defaultAmountSunday || driver.defaultAmount || 0)
      : (driver.defaultAmount || 0)
    if (!expected) return false
    const paidTotal = dayRecords.filter((r) => r.plate === pl).reduce((s, r) => s + (r.amount || 0), 0)
    return paidTotal < expected
  })

  const missing = auditDrivers.filter((dr) => {
    const driverObj = periodDrivers.find((d) => d.name === dr)
    if (!driverObj) return false
    if (driverObj.startDate && driverObj.startDate > dateStr) return false
    if (driverObj.endDate && driverObj.endDate < dateStr) return false
    const plate = driverObj.defaultVehicle
    if (plate && picoPlacaSet.has(plate)) return false
    return plate ? missingVehicles.includes(plate) : !settled.has(dr)
  })

  const picoPlacaDrivers = auditDrivers.filter((dr) => {
    const driverObj = periodDrivers.find((d) => d.name === dr)
    if (!driverObj) return false
    if (driverObj.startDate && driverObj.startDate > dateStr) return false
    if (driverObj.endDate && driverObj.endDate < dateStr) return false
    const plate = driverObj.defaultVehicle
    return !!plate && picoPlacaSet.has(plate)
  })

  const hasPicoPlaca = picoPlacaVehicles.length > 0
  const total = dayRecords.reduce((s, r) => s + (r.amount || 0), 0)
  const isFuture = auditToday !== null
    ? d > auditToday
    : year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth() + 1)
  const isToday = d === auditToday
  const hasIssue = missingVehicles.length > 0 || underpaidVehicles.length > 0
  const status = isFuture ? 'future'
    : (dayRecords.length === 0 && !hasPicoPlaca) ? 'none'
    : hasIssue ? 'partial'
    : 'full'

  return {
    d, dateStr, dayRecords,
    settled: [...settled], settledVehicles: [...settledVehicles],
    missing, missingVehicles, underpaidVehicles,
    picoPlacaVehicles, picoPlacaDrivers, hasPicoPlaca,
    total, dow, isFuture, isToday, isSunday, isHoliday, status,
  }
}
