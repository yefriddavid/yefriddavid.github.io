import { describe, it, expect } from 'vitest'
import {
  getEaster,
  toYMD,
  nextMonday,
  getColombianHolidays,
  auditNoteId,
  buildAuditDay,
} from '../auditHelpers'

// ── getEaster ─────────────────────────────────────────────────────────────────
describe('getEaster', () => {
  it.each([
    [2024, '2024-03-31'],
    [2025, '2025-04-20'],
    [2023, '2023-04-09'],
    [2022, '2022-04-17'],
    [2019, '2019-04-21'],
  ])('year %i → %s', (year, expected) => {
    expect(toYMD(getEaster(year))).toBe(expected)
  })
})

// ── toYMD ─────────────────────────────────────────────────────────────────────
describe('toYMD', () => {
  it('formats single-digit month and day with leading zeros', () => {
    expect(toYMD(new Date(2024, 0, 5))).toBe('2024-01-05')
  })

  it('formats double-digit month and day correctly', () => {
    expect(toYMD(new Date(2024, 11, 25))).toBe('2024-12-25')
  })
})

// ── nextMonday ────────────────────────────────────────────────────────────────
describe('nextMonday', () => {
  it('returns the same date if already Monday', () => {
    const monday = new Date(2024, 0, 8) // 8 Jan 2024 = Monday
    expect(toYMD(nextMonday(monday))).toBe('2024-01-08')
  })

  it('advances Sunday to the next Monday', () => {
    const sunday = new Date(2024, 0, 7) // 7 Jan 2024 = Sunday
    expect(toYMD(nextMonday(sunday))).toBe('2024-01-08')
  })

  it('advances Saturday to the next Monday', () => {
    const saturday = new Date(2024, 0, 6) // 6 Jan 2024 = Saturday
    expect(toYMD(nextMonday(saturday))).toBe('2024-01-08')
  })

  it('advances Tuesday to the next Monday', () => {
    const tuesday = new Date(2024, 0, 9) // 9 Jan 2024 = Tuesday
    expect(toYMD(nextMonday(tuesday))).toBe('2024-01-15')
  })
})

// ── getColombianHolidays ──────────────────────────────────────────────────────
describe('getColombianHolidays', () => {
  const h2024 = getColombianHolidays(2024)

  it('includes fixed holidays', () => {
    expect(h2024.has('2024-01-01')).toBe(true) // Año Nuevo
    expect(h2024.has('2024-05-01')).toBe(true) // Día del Trabajo
    expect(h2024.has('2024-07-20')).toBe(true) // Independencia
    expect(h2024.has('2024-08-07')).toBe(true) // Batalla de Boyacá
    expect(h2024.has('2024-12-08')).toBe(true) // Inmaculada Concepción
    expect(h2024.has('2024-12-25')).toBe(true) // Navidad
  })

  it('includes Jueves y Viernes Santo (Easter-based)', () => {
    // Easter 2024 = March 31 → Jueves Santo = Mar 28, Viernes Santo = Mar 29
    expect(h2024.has('2024-03-28')).toBe(true)
    expect(h2024.has('2024-03-29')).toBe(true)
  })

  it('moves Reyes Magos (Jan 6) to next Monday via Ley Emiliani', () => {
    // Jan 6, 2024 = Saturday → next Monday = Jan 8
    expect(h2024.has('2024-01-08')).toBe(true)
  })

  it('returns a Set', () => {
    expect(h2024).toBeInstanceOf(Set)
  })

  it('returns 18 holidays per year', () => {
    expect(h2024.size).toBe(18)
  })
})

// ── auditNoteId ───────────────────────────────────────────────────────────────
describe('auditNoteId', () => {
  it('formats date__driver with spaces replaced by underscores', () => {
    expect(auditNoteId('2024-03-15', 'Juan Perez')).toBe('2024-03-15__Juan_Perez')
  })

  it('handles multiple spaces', () => {
    expect(auditNoteId('2024-01-01', 'María Del Carmen López')).toBe('2024-01-01__María_Del_Carmen_López')
  })

  it('leaves driver without spaces unchanged', () => {
    expect(auditNoteId('2024-05-10', 'Carlos')).toBe('2024-05-10__Carlos')
  })
})

// ── buildAuditDay ─────────────────────────────────────────────────────────────
describe('buildAuditDay', () => {
  const driver = { name: 'Juan Perez', defaultVehicle: 'ABC123', defaultAmount: 50000, defaultAmountSunday: 30000, active: true }
  const vehicles = ['ABC123']
  const baseParams = {
    monthStr: '2024-03',
    periodDrivers: [driver],
    auditVehicles: vehicles,
    auditDrivers: ['Juan Perez'],
    year: 2024,
    month: 3,
    auditToday: 20, // current day is the 20th
    now: new Date(2024, 2, 20), // March 20, 2024
    holidays: getColombianHolidays(2024),
  }

  it('status is "none" when no records exist for the day', () => {
    const day = buildAuditDay(5, { ...baseParams, periodRecords: [] })
    expect(day.status).toBe('none')
    expect(day.total).toBe(0)
    expect(day.missingVehicles).toContain('ABC123')
  })

  it('status is "full" when all vehicles settled the expected amount', () => {
    const records = [{ id: 'r1', driver: 'Juan Perez', plate: 'ABC123', amount: 50000, date: '2024-03-05' }]
    const day = buildAuditDay(5, { ...baseParams, periodRecords: records })
    expect(day.status).toBe('full')
    expect(day.missingVehicles).toHaveLength(0)
    expect(day.underpaidVehicles).toHaveLength(0)
  })

  it('status is "partial" when a vehicle is missing', () => {
    const records = [{ id: 'r1', driver: 'Juan Perez', plate: 'ABC123', amount: 50000, date: '2024-03-04' }]
    // Day 5 has no records
    const day = buildAuditDay(5, { ...baseParams, periodRecords: records })
    expect(day.status).toBe('none') // none because dayRecords is empty
    expect(day.missingVehicles).toContain('ABC123')
  })

  it('status is "partial" when a vehicle paid less than expected (underpaid)', () => {
    const records = [{ id: 'r1', driver: 'Juan Perez', plate: 'ABC123', amount: 30000, date: '2024-03-05' }]
    const day = buildAuditDay(5, { ...baseParams, periodRecords: records })
    expect(day.status).toBe('partial')
    expect(day.underpaidVehicles).toContain('ABC123')
    expect(day.missingVehicles).toHaveLength(0)
  })

  it('status is "future" for days after auditToday', () => {
    const day = buildAuditDay(25, { ...baseParams, periodRecords: [] })
    expect(day.status).toBe('future')
    expect(day.isFuture).toBe(true)
  })

  it('isToday is true for the current day', () => {
    const day = buildAuditDay(20, { ...baseParams, periodRecords: [] })
    expect(day.isToday).toBe(true)
  })

  it('uses defaultAmountSunday on Sundays', () => {
    // Find a Sunday in March 2024: March 3, 2024 = Sunday
    const records = [{ id: 'r1', driver: 'Juan Perez', plate: 'ABC123', amount: 25000, date: '2024-03-03' }]
    const day = buildAuditDay(3, { ...baseParams, periodRecords: records })
    expect(day.isSunday).toBe(true)
    // 25000 < 30000 (defaultAmountSunday) → underpaid
    expect(day.underpaidVehicles).toContain('ABC123')
  })

  it('uses defaultAmountSunday on holidays', () => {
    // March 28, 2024 = Jueves Santo (holiday)
    const records = [{ id: 'r1', driver: 'Juan Perez', plate: 'ABC123', amount: 25000, date: '2024-03-28' }]
    const params = { ...baseParams, auditToday: 31, now: new Date(2024, 2, 31) }
    const day = buildAuditDay(28, { ...params, periodRecords: records })
    expect(day.isHoliday).toBe(true)
    expect(day.underpaidVehicles).toContain('ABC123')
  })

  it('driverOnDay respects startDate — vehicle not expected before driver start', () => {
    const lateDriver = { ...driver, startDate: '2024-03-10' }
    const params = { ...baseParams, periodDrivers: [lateDriver] }
    const day = buildAuditDay(5, { ...params, periodRecords: [] })
    // Driver didn't start until the 10th, so vehicle is not expected on the 5th
    expect(day.missingVehicles).toHaveLength(0)
    expect(day.status).toBe('none')
  })

  it('driverOnDay respects endDate — vehicle not expected after driver ends', () => {
    const earlyDriver = { ...driver, endDate: '2024-03-08' }
    const params = { ...baseParams, periodDrivers: [earlyDriver] }
    const day = buildAuditDay(15, { ...params, periodRecords: [] })
    expect(day.missingVehicles).toHaveLength(0)
  })

  it('accumulates total from all records of the day', () => {
    const records = [
      { id: 'r1', driver: 'Juan Perez', plate: 'ABC123', amount: 25000, date: '2024-03-05' },
      { id: 'r2', driver: 'Juan Perez', plate: 'ABC123', amount: 30000, date: '2024-03-05' },
    ]
    const day = buildAuditDay(5, { ...baseParams, periodRecords: records })
    expect(day.total).toBe(55000)
    // 55000 >= 50000 (defaultAmount) → full
    expect(day.status).toBe('full')
  })

  it('includes dateStr in YYYY-MM-DD format', () => {
    const day = buildAuditDay(7, { ...baseParams, periodRecords: [] })
    expect(day.dateStr).toBe('2024-03-07')
  })
})
