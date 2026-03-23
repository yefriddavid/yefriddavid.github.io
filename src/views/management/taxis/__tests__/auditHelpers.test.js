import { describe, it, expect } from 'vitest'
import {
  getEaster,
  toYMD,
  nextMonday,
  getColombianHolidays,
  auditNoteId,
  buildAuditDay,
} from '../auditHelpers'
import { makeDriver, makeSettlement } from '../../../../__tests__/factories'

// ── getEaster ─────────────────────────────────────────────────────────────────
describe('getEaster', () => {
  it.each([
    [2024, '2024-03-31'],
    [2025, '2025-04-20'],
    [2023, '2023-04-09'],
    [2022, '2022-04-17'],
    [2019, '2019-04-21'],
    [2000, '2000-04-23'],
  ])('year %i → Easter on %s', (year, expected) => {
    expect(toYMD(getEaster(year))).toBe(expected)
  })
})

// ── toYMD ─────────────────────────────────────────────────────────────────────
describe('toYMD', () => {
  it('pads single-digit month and day with leading zeros', () => {
    expect(toYMD(new Date(2024, 0, 5))).toBe('2024-01-05')
  })

  it('handles double-digit month and day', () => {
    expect(toYMD(new Date(2024, 11, 25))).toBe('2024-12-25')
  })
})

// ── nextMonday ────────────────────────────────────────────────────────────────
describe('nextMonday', () => {
  it('returns same date when already Monday', () => {
    expect(toYMD(nextMonday(new Date(2024, 0, 8)))).toBe('2024-01-08')  // Mon
  })

  it('advances Sunday to the following Monday', () => {
    expect(toYMD(nextMonday(new Date(2024, 0, 7)))).toBe('2024-01-08')  // Sun → Mon
  })

  it('advances Saturday to the following Monday', () => {
    expect(toYMD(nextMonday(new Date(2024, 0, 6)))).toBe('2024-01-08')  // Sat → Mon
  })

  it('advances mid-week (Tue–Fri) to the following Monday', () => {
    expect(toYMD(nextMonday(new Date(2024, 0, 9)))).toBe('2024-01-15')  // Tue → next Mon
    expect(toYMD(nextMonday(new Date(2024, 0, 12)))).toBe('2024-01-15') // Fri → next Mon
  })
})

// ── getColombianHolidays ──────────────────────────────────────────────────────
describe('getColombianHolidays', () => {
  const h2024 = getColombianHolidays(2024)

  describe('fixed holidays', () => {
    it.each([
      ['2024-01-01', 'Año Nuevo'],
      ['2024-05-01', 'Día del Trabajo'],
      ['2024-07-20', 'Independencia'],
      ['2024-08-07', 'Batalla de Boyacá'],
      ['2024-12-08', 'Inmaculada Concepción'],
      ['2024-12-25', 'Navidad'],
    ])('%s (%s) is a holiday', (date) => {
      expect(h2024.has(date)).toBe(true)
    })
  })

  describe('Easter-based holidays 2024 (Easter = March 31)', () => {
    it('Jueves Santo (Mar 28) is a holiday', () => expect(h2024.has('2024-03-28')).toBe(true))
    it('Viernes Santo (Mar 29) is a holiday', () => expect(h2024.has('2024-03-29')).toBe(true))
  })

  describe('Ley Emiliani (moves to next Monday)', () => {
    it('Reyes Magos Jan 6 (Saturday) → moves to Jan 8 (Monday)', () => {
      expect(h2024.has('2024-01-08')).toBe(true)
      expect(h2024.has('2024-01-06')).toBe(false)
    })
  })

  it('returns exactly 18 holidays per year', () => {
    expect(h2024.size).toBe(18)
  })

  it('returns a Set', () => {
    expect(h2024).toBeInstanceOf(Set)
  })

  it('works correctly for a different year (2025)', () => {
    const h2025 = getColombianHolidays(2025)
    expect(h2025.has('2025-01-01')).toBe(true)   // Año Nuevo
    expect(h2025.has('2025-04-17')).toBe(true)   // Jueves Santo (Easter 2025 = Apr 20)
    expect(h2025.has('2025-04-18')).toBe(true)   // Viernes Santo
    // Count is ≥17 (may be 17 or 18 depending on Emiliani collisions)
    expect(h2025.size).toBeGreaterThanOrEqual(17)
  })
})

// ── auditNoteId ───────────────────────────────────────────────────────────────
describe('auditNoteId', () => {
  it('formats as date__driver with spaces → underscores', () => {
    expect(auditNoteId('2024-03-15', 'Juan Perez')).toBe('2024-03-15__Juan_Perez')
  })

  it('handles multiple spaces', () => {
    expect(auditNoteId('2024-01-01', 'María Del Carmen López')).toBe('2024-01-01__María_Del_Carmen_López')
  })

  it('leaves single-word driver name unchanged', () => {
    expect(auditNoteId('2024-05-10', 'Carlos')).toBe('2024-05-10__Carlos')
  })
})

// ── buildAuditDay ─────────────────────────────────────────────────────────────
describe('buildAuditDay', () => {
  const driver = makeDriver({
    name: 'Juan Perez',
    defaultVehicle: 'ABC123',
    defaultAmount: 50000,
    defaultAmountSunday: 30000,
    startDate: null,
    endDate: null,
  })

  const baseParams = {
    monthStr: '2024-03',
    periodDrivers: [driver],
    auditVehicles: ['ABC123'],
    auditDrivers: ['Juan Perez'],
    year: 2024,
    month: 3,
    auditToday: 20,
    now: new Date(2024, 2, 20),
    holidays: getColombianHolidays(2024),
  }

  // ── Status logic ────────────────────────────────────────────────────────
  describe('status', () => {
    it('"none" when no records exist for the day', () => {
      const day = buildAuditDay(5, { ...baseParams, periodRecords: [] })
      expect(day.status).toBe('none')
    })

    it('"full" when every expected vehicle settled the expected amount', () => {
      const records = [makeSettlement({ plate: 'ABC123', amount: 50000, date: '2024-03-05' })]
      const day = buildAuditDay(5, { ...baseParams, periodRecords: records })
      expect(day.status).toBe('full')
    })

    it('"partial" when a vehicle settled less than expected (underpaid)', () => {
      const records = [makeSettlement({ plate: 'ABC123', amount: 30000, date: '2024-03-05' })]
      const day = buildAuditDay(5, { ...baseParams, periodRecords: records })
      expect(day.status).toBe('partial')
      expect(day.underpaidVehicles).toContain('ABC123')
    })

    it('"none" (dayRecords empty) when records belong to other days', () => {
      const records = [makeSettlement({ plate: 'ABC123', amount: 50000, date: '2024-03-04' })]
      const day = buildAuditDay(5, { ...baseParams, periodRecords: records })
      expect(day.status).toBe('none')
      expect(day.missingVehicles).toContain('ABC123')
    })

    it('"future" for days after auditToday', () => {
      const day = buildAuditDay(25, { ...baseParams, periodRecords: [] })
      expect(day.status).toBe('future')
      expect(day.isFuture).toBe(true)
    })

    it('"future" for entire future month', () => {
      const futureParams = {
        ...baseParams,
        year: 2025,
        month: 6,
        monthStr: '2025-06',
        auditToday: null,
        now: new Date(2024, 2, 20),
        holidays: getColombianHolidays(2025),
        periodRecords: [],
      }
      expect(buildAuditDay(1, futureParams).status).toBe('future')
    })
  })

  // ── Day metadata ────────────────────────────────────────────────────────
  describe('metadata', () => {
    it('isToday is true only for auditToday', () => {
      expect(buildAuditDay(20, { ...baseParams, periodRecords: [] }).isToday).toBe(true)
      expect(buildAuditDay(19, { ...baseParams, periodRecords: [] }).isToday).toBe(false)
    })

    it('dateStr is formatted as YYYY-MM-DD with leading zeros', () => {
      expect(buildAuditDay(7, { ...baseParams, periodRecords: [] }).dateStr).toBe('2024-03-07')
    })

    it('isSunday is true for Sundays (March 3 2024)', () => {
      expect(buildAuditDay(3, { ...baseParams, periodRecords: [] }).isSunday).toBe(true)
    })

    it('isHoliday is true for Jueves Santo (March 28 2024)', () => {
      expect(buildAuditDay(28, { ...baseParams, periodRecords: [] }).isHoliday).toBe(true)
    })

    it('total sums all amounts for the day', () => {
      const records = [
        makeSettlement({ amount: 25000, date: '2024-03-05', plate: 'ABC123' }),
        makeSettlement({ id: 's2', amount: 30000, date: '2024-03-05', plate: 'ABC123' }),
      ]
      expect(buildAuditDay(5, { ...baseParams, periodRecords: records }).total).toBe(55000)
    })
  })

  // ── Sunday & holiday rate ───────────────────────────────────────────────
  describe('Sunday / holiday expected amount', () => {
    it('uses defaultAmountSunday on Sundays (Mar 3 2024)', () => {
      // 30000 < 30000 is false → exact match = full
      const records = [makeSettlement({ plate: 'ABC123', amount: 30000, date: '2024-03-03' })]
      const day = buildAuditDay(3, { ...baseParams, periodRecords: records })
      expect(day.isSunday).toBe(true)
      expect(day.underpaidVehicles).toHaveLength(0)
      expect(day.status).toBe('full')
    })

    it('marks underpaid on Sunday when paid < defaultAmountSunday', () => {
      const records = [makeSettlement({ plate: 'ABC123', amount: 20000, date: '2024-03-03' })]
      const day = buildAuditDay(3, { ...baseParams, periodRecords: records })
      expect(day.underpaidVehicles).toContain('ABC123')
    })

    it('uses defaultAmountSunday on holidays (Jueves Santo Mar 28 2024)', () => {
      const params = { ...baseParams, auditToday: 31, now: new Date(2024, 2, 31) }
      const records = [makeSettlement({ plate: 'ABC123', amount: 20000, date: '2024-03-28' })]
      const day = buildAuditDay(28, { ...params, periodRecords: records })
      expect(day.isHoliday).toBe(true)
      expect(day.underpaidVehicles).toContain('ABC123')
    })

    it('falls back to defaultAmount on holiday if no defaultAmountSunday set', () => {
      const noSundayRate = makeDriver({ ...driver, defaultAmountSunday: null })
      const params = {
        ...baseParams,
        periodDrivers: [noSundayRate],
        auditToday: 31, now: new Date(2024, 2, 31),
      }
      const records = [makeSettlement({ plate: 'ABC123', amount: 50000, date: '2024-03-28' })]
      const day = buildAuditDay(28, { ...params, periodRecords: records })
      expect(day.underpaidVehicles).toHaveLength(0)
    })
  })

  // ── driverOnDay date range ──────────────────────────────────────────────
  describe('driverOnDay (startDate / endDate)', () => {
    it('vehicle not expected before driver startDate', () => {
      const lateDriver = makeDriver({ ...driver, startDate: '2024-03-10', endDate: null })
      const params = { ...baseParams, periodDrivers: [lateDriver] }
      // Day 5 — driver hasn't started yet
      const day = buildAuditDay(5, { ...params, periodRecords: [] })
      expect(day.missingVehicles).toHaveLength(0)
      expect(day.expectedVehicles ?? day.missingVehicles).toHaveLength(0)
    })

    it('vehicle not expected after driver endDate', () => {
      const earlyDriver = makeDriver({ ...driver, startDate: null, endDate: '2024-03-08' })
      const params = { ...baseParams, periodDrivers: [earlyDriver] }
      // Day 15 — driver has already left
      const day = buildAuditDay(15, { ...params, periodRecords: [] })
      expect(day.missingVehicles).toHaveLength(0)
    })

    it('vehicle IS expected within startDate–endDate window', () => {
      const boundedDriver = makeDriver({ ...driver, startDate: '2024-03-01', endDate: '2024-03-31' })
      const params = { ...baseParams, periodDrivers: [boundedDriver] }
      const day = buildAuditDay(15, { ...params, periodRecords: [] })
      expect(day.missingVehicles).toContain('ABC123')
    })
  })

  // ── Multiple vehicles ───────────────────────────────────────────────────
  describe('multiple vehicles', () => {
    const driverB = makeDriver({ id: 'driver-2', name: 'Ana Garcia', defaultVehicle: 'XYZ999', defaultAmount: 40000, defaultAmountSunday: 25000 })
    const multiParams = {
      ...baseParams,
      periodDrivers: [driver, driverB],
      auditVehicles: ['ABC123', 'XYZ999'],
      auditDrivers: ['Ana Garcia', 'Juan Perez'],
    }

    it('"partial" when one vehicle settled and one is missing', () => {
      const records = [makeSettlement({ plate: 'ABC123', amount: 50000, date: '2024-03-05' })]
      const day = buildAuditDay(5, { ...multiParams, periodRecords: records })
      expect(day.status).toBe('partial')
      expect(day.missingVehicles).toContain('XYZ999')
      expect(day.settledVehicles).toContain('ABC123')
    })

    it('"full" when all vehicles settle correctly', () => {
      const records = [
        makeSettlement({ id: 's1', plate: 'ABC123', amount: 50000, date: '2024-03-05' }),
        makeSettlement({ id: 's2', plate: 'XYZ999', amount: 40000, date: '2024-03-05' }),
      ]
      const day = buildAuditDay(5, { ...multiParams, periodRecords: records })
      expect(day.status).toBe('full')
      expect(day.missingVehicles).toHaveLength(0)
      expect(day.underpaidVehicles).toHaveLength(0)
    })

    it('settled list contains driver names for that day', () => {
      const records = [makeSettlement({ driver: 'Juan Perez', plate: 'ABC123', amount: 50000, date: '2024-03-05' })]
      const day = buildAuditDay(5, { ...multiParams, periodRecords: records })
      expect(day.settled).toContain('Juan Perez')
      expect(day.missing).toContain('Ana Garcia')
    })
  })
})
