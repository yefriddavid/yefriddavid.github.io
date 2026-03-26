import { describe, it, expect } from 'vitest'
import {
  getEaster,
  toYMD,
  nextMonday,
  getColombianHolidays,
  auditNoteId,
  buildAuditDay,
} from '../auditHelpers'
import { makeDriver, makeSettlement } from '../../../../../../__tests__/factories'

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

  it('advances Tuesday to the following Monday', () => {
    expect(toYMD(nextMonday(new Date(2024, 0, 9)))).toBe('2024-01-15')  // Tue → next Mon
  })

  it('advances Wednesday to the following Monday', () => {
    expect(toYMD(nextMonday(new Date(2024, 0, 10)))).toBe('2024-01-15') // Wed → next Mon
  })

  it('advances Thursday to the following Monday', () => {
    expect(toYMD(nextMonday(new Date(2024, 0, 11)))).toBe('2024-01-15') // Thu → next Mon
  })

  it('advances Friday to the following Monday', () => {
    expect(toYMD(nextMonday(new Date(2024, 0, 12)))).toBe('2024-01-15') // Fri → next Mon
  })

  it('does not mutate the original date', () => {
    const original = new Date(2024, 0, 9) // Tuesday
    nextMonday(original)
    expect(toYMD(original)).toBe('2024-01-09')
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

  describe('Ley Emiliani — remaining 6 holidays (2024)', () => {
    // San José: Mar 19 (Tue) → Mar 25 (Mon)
    it('San José Mar 19 (Tuesday) → moves to Mar 25 (Monday)', () => {
      expect(h2024.has('2024-03-25')).toBe(true)
      expect(h2024.has('2024-03-19')).toBe(false)
    })

    // San Pedro y San Pablo: Jun 29 (Sat) → Jul 1 (Mon)
    it('San Pedro y San Pablo Jun 29 (Saturday) → moves to Jul 1 (Monday)', () => {
      expect(h2024.has('2024-07-01')).toBe(true)
      expect(h2024.has('2024-06-29')).toBe(false)
    })

    // Asunción de la Virgen: Aug 15 (Thu) → Aug 19 (Mon)
    it('Asunción Aug 15 (Thursday) → moves to Aug 19 (Monday)', () => {
      expect(h2024.has('2024-08-19')).toBe(true)
      expect(h2024.has('2024-08-15')).toBe(false)
    })

    // Día de la Raza: Oct 12 (Sat) → Oct 14 (Mon)
    it('Día de la Raza Oct 12 (Saturday) → moves to Oct 14 (Monday)', () => {
      expect(h2024.has('2024-10-14')).toBe(true)
      expect(h2024.has('2024-10-12')).toBe(false)
    })

    // Todos Santos: Nov 1 (Fri) → Nov 4 (Mon)
    it('Todos Santos Nov 1 (Friday) → moves to Nov 4 (Monday)', () => {
      expect(h2024.has('2024-11-04')).toBe(true)
      expect(h2024.has('2024-11-01')).toBe(false)
    })

    // Independencia Cartagena: Nov 11 (Mon) → stays Nov 11
    it('Independencia Cartagena Nov 11 (Monday) → stays Nov 11', () => {
      expect(h2024.has('2024-11-11')).toBe(true)
    })
  })

  describe('Easter-based moveable holidays (2024, Easter = Mar 31)', () => {
    // Ascensión: Easter + 39 = May 9 (Thu) → May 13 (Mon)
    it('Ascensión (Easter+39) May 9 (Thursday) → moves to May 13 (Monday)', () => {
      expect(h2024.has('2024-05-13')).toBe(true)
      expect(h2024.has('2024-05-09')).toBe(false)
    })

    // Corpus Christi: Easter + 60 = May 30 (Thu) → Jun 3 (Mon)
    it('Corpus Christi (Easter+60) May 30 (Thursday) → moves to Jun 3 (Monday)', () => {
      expect(h2024.has('2024-06-03')).toBe(true)
      expect(h2024.has('2024-05-30')).toBe(false)
    })

    // Sagrado Corazón: Easter + 68 = Jun 7 (Fri) → Jun 10 (Mon)
    it('Sagrado Corazón (Easter+68) Jun 7 (Friday) → moves to Jun 10 (Monday)', () => {
      expect(h2024.has('2024-06-10')).toBe(true)
      expect(h2024.has('2024-06-07')).toBe(false)
    })
  })

  it('a random non-holiday date is not in the set', () => {
    expect(h2024.has('2024-04-15')).toBe(false) // Regular Monday in April
    expect(h2024.has('2024-09-20')).toBe(false) // Random September date
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

  // ── isFuture with auditToday=null ───────────────────────────────────────
  describe('isFuture when auditToday is null', () => {
    const nullTodayBase = { ...baseParams, auditToday: null, periodRecords: [] }

    it('past year → not future', () => {
      const day = buildAuditDay(1, { ...nullTodayBase, year: 2023, month: 3, monthStr: '2023-03', now: new Date(2024, 2, 20) })
      expect(day.isFuture).toBe(false)
    })

    it('current year and current month → not future', () => {
      const day = buildAuditDay(1, { ...nullTodayBase, year: 2024, month: 3, monthStr: '2024-03', now: new Date(2024, 2, 20) })
      expect(day.isFuture).toBe(false)
    })

    it('current year but future month → future', () => {
      const day = buildAuditDay(1, { ...nullTodayBase, year: 2024, month: 6, monthStr: '2024-06', now: new Date(2024, 2, 20), holidays: getColombianHolidays(2024) })
      expect(day.isFuture).toBe(true)
    })

    it('future year → future', () => {
      const day = buildAuditDay(1, { ...nullTodayBase, year: 2026, month: 1, monthStr: '2026-01', now: new Date(2024, 2, 20), holidays: getColombianHolidays(2026) })
      expect(day.isFuture).toBe(true)
    })

    it('isToday is always false when auditToday is null', () => {
      const day = buildAuditDay(20, { ...nullTodayBase, year: 2024, month: 3, monthStr: '2024-03', now: new Date(2024, 2, 20) })
      expect(day.isToday).toBe(false)
    })

    it('status is "future" even when records exist for the day', () => {
      const records = [makeSettlement({ plate: 'ABC123', amount: 50000, date: '2024-06-05' })]
      const day = buildAuditDay(5, {
        ...nullTodayBase, year: 2024, month: 6, monthStr: '2024-06',
        now: new Date(2024, 2, 20), holidays: getColombianHolidays(2024),
        periodRecords: records,
      })
      expect(day.status).toBe('future')
    })
  })

  // ── Multiple settlements for same plate same day (paidTotal sum) ────────
  describe('multiple settlements same plate same day', () => {
    it('sums all amounts — total >= expected → not underpaid', () => {
      const records = [
        makeSettlement({ id: 's1', plate: 'ABC123', amount: 30000, date: '2024-03-05' }),
        makeSettlement({ id: 's2', plate: 'ABC123', amount: 20000, date: '2024-03-05' }),
      ]
      const day = buildAuditDay(5, { ...baseParams, periodRecords: records })
      expect(day.total).toBe(50000)
      expect(day.underpaidVehicles).toHaveLength(0)
      expect(day.status).toBe('full')
    })

    it('sums all amounts — total < expected → underpaid', () => {
      const records = [
        makeSettlement({ id: 's1', plate: 'ABC123', amount: 20000, date: '2024-03-05' }),
        makeSettlement({ id: 's2', plate: 'ABC123', amount: 10000, date: '2024-03-05' }),
      ]
      const day = buildAuditDay(5, { ...baseParams, periodRecords: records })
      expect(day.total).toBe(30000)
      expect(day.underpaidVehicles).toContain('ABC123')
    })

    it('exact boundary: paid = expected → not underpaid', () => {
      const records = [makeSettlement({ plate: 'ABC123', amount: 50000, date: '2024-03-05' })]
      const day = buildAuditDay(5, { ...baseParams, periodRecords: records })
      expect(day.underpaidVehicles).toHaveLength(0)
    })

    it('one below boundary: paid = expected - 1 → underpaid', () => {
      const records = [makeSettlement({ plate: 'ABC123', amount: 49999, date: '2024-03-05' })]
      const day = buildAuditDay(5, { ...baseParams, periodRecords: records })
      expect(day.underpaidVehicles).toContain('ABC123')
    })
  })

  // ── defaultAmount edge cases ────────────────────────────────────────────
  describe('defaultAmount = 0 or null skips underpaid check', () => {
    it('defaultAmount = 0 → no underpaid even when paid is 0', () => {
      const zeroDriver = makeDriver({ ...driver, defaultAmount: 0, defaultAmountSunday: 0 })
      const params = { ...baseParams, periodDrivers: [zeroDriver] }
      const records = [makeSettlement({ plate: 'ABC123', amount: 0, date: '2024-03-05' })]
      const day = buildAuditDay(5, { ...params, periodRecords: records })
      expect(day.underpaidVehicles).toHaveLength(0)
    })

    it('defaultAmount = null → no underpaid', () => {
      const nullDriver = makeDriver({ ...driver, defaultAmount: null, defaultAmountSunday: null })
      const params = { ...baseParams, periodDrivers: [nullDriver] }
      const records = [makeSettlement({ plate: 'ABC123', amount: 1000, date: '2024-03-05' })]
      const day = buildAuditDay(5, { ...params, periodRecords: records })
      expect(day.underpaidVehicles).toHaveLength(0)
    })
  })

  // ── Driver without defaultVehicle ───────────────────────────────────────
  describe('driver without defaultVehicle', () => {
    const noPlateDriver = makeDriver({ name: 'Sin Placa', defaultVehicle: null, defaultAmount: 40000 })
    const noPlateParams = {
      ...baseParams,
      periodDrivers: [noPlateDriver],
      auditVehicles: [],
      auditDrivers: ['Sin Placa'],
    }

    it('driver without plate appears in missing when not in settled names', () => {
      const day = buildAuditDay(5, { ...noPlateParams, periodRecords: [] })
      expect(day.missing).toContain('Sin Placa')
    })

    it('driver without plate not in missing when their name is in settled', () => {
      const records = [makeSettlement({ driver: 'Sin Placa', plate: null, amount: 40000, date: '2024-03-05' })]
      const day = buildAuditDay(5, { ...noPlateParams, periodRecords: records })
      expect(day.missing).not.toContain('Sin Placa')
    })
  })

  // ── Pico y placa (vehicleRestrictions) ─────────────────────────────────
  describe('pico y placa (vehicleRestrictions)', () => {
    const driverB = makeDriver({ id: 'driver-2', name: 'Ana Garcia', defaultVehicle: 'XYZ999', defaultAmount: 40000 })
    const multiParams = {
      ...baseParams,
      periodDrivers: [driver, driverB],
      auditVehicles: ['ABC123', 'XYZ999'],
      auditDrivers: ['Ana Garcia', 'Juan Perez'],
    }
    // ABC123 restricted on days 5 and 10
    const restrictions = new Map([
      ['ABC123', new Set([5, 10])],
    ])

    it('restricted vehicle is not in missingVehicles on its restricted day', () => {
      const day = buildAuditDay(5, { ...baseParams, periodRecords: [], vehicleRestrictions: restrictions })
      expect(day.missingVehicles).not.toContain('ABC123')
    })

    it('hasPicoPlaca is true when any expected vehicle is restricted that day', () => {
      const day = buildAuditDay(5, { ...baseParams, periodRecords: [], vehicleRestrictions: restrictions })
      expect(day.hasPicoPlaca).toBe(true)
    })

    it('hasPicoPlaca is false when restriction does not apply to that day', () => {
      const day = buildAuditDay(6, { ...baseParams, periodRecords: [], vehicleRestrictions: restrictions })
      expect(day.hasPicoPlaca).toBe(false)
    })

    it('status is "full" (not "none") when only restricted vehicles are missing', () => {
      const day = buildAuditDay(5, { ...baseParams, periodRecords: [], vehicleRestrictions: restrictions })
      expect(day.status).toBe('full')
    })

    it('status is "none" when no records and no pico y placa', () => {
      const day = buildAuditDay(6, { ...baseParams, periodRecords: [], vehicleRestrictions: restrictions })
      expect(day.status).toBe('none')
    })

    it('status is "partial" when one vehicle settled and another (non-restricted) is missing', () => {
      const records = [makeSettlement({ plate: 'ABC123', amount: 50000, date: '2024-03-05' })]
      const day = buildAuditDay(5, { ...multiParams, periodRecords: records, vehicleRestrictions: restrictions })
      expect(day.status).toBe('partial')
      expect(day.missingVehicles).toContain('XYZ999')
    })

    it('status is "full" when the only non-restricted vehicle settled', () => {
      const records = [makeSettlement({ plate: 'XYZ999', amount: 40000, date: '2024-03-05' })]
      const day = buildAuditDay(5, { ...multiParams, periodRecords: records, vehicleRestrictions: restrictions })
      expect(day.status).toBe('full')
      expect(day.missingVehicles).toHaveLength(0)
    })

    it('picoPlacaVehicles contains the restricted plate', () => {
      const day = buildAuditDay(5, { ...baseParams, periodRecords: [], vehicleRestrictions: restrictions })
      expect(day.picoPlacaVehicles).toContain('ABC123')
    })

    it('picoPlacaDrivers contains the driver of the restricted vehicle', () => {
      const day = buildAuditDay(5, { ...baseParams, periodRecords: [], vehicleRestrictions: restrictions })
      expect(day.picoPlacaDrivers).toContain('Juan Perez')
    })

    it('driver of restricted vehicle is not in missing', () => {
      const day = buildAuditDay(5, { ...baseParams, periodRecords: [], vehicleRestrictions: restrictions })
      expect(day.missing).not.toContain('Juan Perez')
    })

    it('restricted vehicle still in missingVehicles on non-restricted day', () => {
      const day = buildAuditDay(6, { ...baseParams, periodRecords: [], vehicleRestrictions: restrictions })
      expect(day.missingVehicles).toContain('ABC123')
    })

    it('works correctly with no vehicleRestrictions passed (backward compat)', () => {
      const day = buildAuditDay(5, { ...baseParams, periodRecords: [] })
      expect(day.hasPicoPlaca).toBe(false)
      expect(day.picoPlacaVehicles).toHaveLength(0)
      expect(day.picoPlacaDrivers).toHaveLength(0)
    })
  })

  // ── Plate in auditVehicles with no matching driver ──────────────────────
  describe('orphan plate (no driver in periodDrivers)', () => {
    it('plate with no driver is excluded from expectedVehicles and missingVehicles', () => {
      const params = {
        ...baseParams,
        auditVehicles: ['ABC123', 'ORPHAN'],
        periodDrivers: [driver], // only ABC123 has a driver
      }
      const day = buildAuditDay(5, { ...params, periodRecords: [] })
      expect(day.missingVehicles).not.toContain('ORPHAN')
      expect(day.missingVehicles).toContain('ABC123')
    })
  })

  // ── Records with missing driver / plate fields ──────────────────────────
  describe('records with falsy driver or plate', () => {
    it('records without driver field are excluded from settled names', () => {
      const records = [makeSettlement({ driver: null, plate: 'ABC123', amount: 50000, date: '2024-03-05' })]
      const day = buildAuditDay(5, { ...baseParams, periodRecords: records })
      expect(day.settled).toHaveLength(0)
      expect(day.settledVehicles).toContain('ABC123')
    })

    it('records without plate field are excluded from settledVehicles', () => {
      const records = [makeSettlement({ driver: 'Juan Perez', plate: null, amount: 50000, date: '2024-03-05' })]
      const day = buildAuditDay(5, { ...baseParams, periodRecords: records })
      expect(day.settled).toContain('Juan Perez')
      expect(day.settledVehicles).toHaveLength(0)
    })
  })

  // ── dayRecords only includes records for the exact date ─────────────────
  describe('dayRecords date filtering', () => {
    it('only records matching the exact dateStr are included', () => {
      const records = [
        makeSettlement({ id: 's1', plate: 'ABC123', amount: 50000, date: '2024-03-05' }),
        makeSettlement({ id: 's2', plate: 'ABC123', amount: 50000, date: '2024-03-06' }),
        makeSettlement({ id: 's3', plate: 'ABC123', amount: 50000, date: '2024-03-04' }),
      ]
      const day = buildAuditDay(5, { ...baseParams, periodRecords: records })
      expect(day.dayRecords).toHaveLength(1)
      expect(day.dayRecords[0].id).toBe('s1')
    })

    it('total only counts amounts from the matching day', () => {
      const records = [
        makeSettlement({ id: 's1', amount: 50000, date: '2024-03-05', plate: 'ABC123' }),
        makeSettlement({ id: 's2', amount: 99999, date: '2024-03-06', plate: 'ABC123' }),
      ]
      const day = buildAuditDay(5, { ...baseParams, periodRecords: records })
      expect(day.total).toBe(50000)
    })
  })

  // ── dow value ──────────────────────────────────────────────────────────
  describe('dow (day of week) value', () => {
    it('Monday = 1', () => expect(buildAuditDay(4, { ...baseParams, periodRecords: [] }).dow).toBe(1))   // Mar 4 2024 = Mon
    it('Tuesday = 2', () => expect(buildAuditDay(5, { ...baseParams, periodRecords: [] }).dow).toBe(2))  // Mar 5 2024 = Tue
    it('Wednesday = 3', () => expect(buildAuditDay(6, { ...baseParams, periodRecords: [] }).dow).toBe(3))
    it('Thursday = 4', () => expect(buildAuditDay(7, { ...baseParams, periodRecords: [] }).dow).toBe(4))
    it('Friday = 5', () => expect(buildAuditDay(8, { ...baseParams, periodRecords: [] }).dow).toBe(5))
    it('Saturday = 6', () => expect(buildAuditDay(9, { ...baseParams, periodRecords: [] }).dow).toBe(6))
    it('Sunday = 0', () => expect(buildAuditDay(10, { ...baseParams, periodRecords: [] }).dow).toBe(0))  // Mar 10 2024 = Sun
  })
})
