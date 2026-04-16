/**
 * Unit tests for the pure domain helpers embedded in AccountStatus.js.
 * Functions are defined here verbatim so the component file does not need
 * to export them — same pattern used in accountSagas.test.js.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ── MONTH_NAMES (matches src/services/firebase/cashflow/accountsMaster.js) ──
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

// ── Domain helpers (verbatim copy from AccountStatus.js) ──────────────────────
function isApplicableToMonth(account, month) {
  if (!account.active) return false
  if (account.period === 'Mensuales') return true
  if (account.period === 'Anuales') return MONTH_NAMES.indexOf(account.monthStartAt) + 1 === month
  if (
    account.period === 'Trimestrales' ||
    account.period === 'Cuatrimestrales' ||
    account.period === 'Semestrales'
  ) {
    const startMonth = MONTH_NAMES.indexOf(account.monthStartAt) + 1
    if (startMonth === 0) return false
    const interval =
      account.period === 'Trimestrales' ? 3 : account.period === 'Cuatrimestrales' ? 4 : 6
    return (month - startMonth + 12) % interval === 0
  }
  return true
}

function getStatus(account, payments, monthStr) {
  const paid = payments.reduce((s, t) => s + (t.amount || 0), 0)
  if (paid > 0 && account.defaultValue > 0 && paid < account.defaultValue)
    return { label: 'Parcial', color: '#0ea5e9', bg: '#f0f9ff', border: '#7dd3fc', paid }
  if (paid > 0) return { label: 'Pagado', color: '#2f9e44', bg: '#f0fdf4', border: '#86efac', paid }
  const today = new Date()
  const [y, m] = monthStr.split('-').map(Number)
  const due = new Date(y, m - 1, account.maxDatePay || 31)
  if (today > due)
    return { label: 'Vencido', color: '#e03131', bg: '#fff5f5', border: '#fca5a5', paid: 0 }
  return { label: 'Pendiente', color: '#f59f00', bg: '#fff9db', border: '#ffe066', paid: 0 }
}

// ── Factories ─────────────────────────────────────────────────────────────────
const makeAccountMaster = (overrides = {}) => ({
  id: 'master-1',
  name: 'Internet',
  active: true,
  type: 'Outcoming',
  period: 'Mensuales',
  defaultValue: 100000,
  maxDatePay: 15,
  category: 'Servicios',
  monthStartAt: null,
  ...overrides,
})

const makeTx = (overrides = {}) => ({
  id: 'tx-1',
  amount: 100000,
  date: '2026-04-10',
  accountMasterId: 'master-1',
  ...overrides,
})

// ── isApplicableToMonth ───────────────────────────────────────────────────────
describe('isApplicableToMonth', () => {
  it('returns false for inactive accounts regardless of period', () => {
    const account = makeAccountMaster({ active: false, period: 'Mensuales' })
    expect(isApplicableToMonth(account, 4)).toBe(false)
  })

  describe('Mensuales', () => {
    it('is applicable to every month', () => {
      const account = makeAccountMaster({ period: 'Mensuales' })
      for (let m = 1; m <= 12; m++) {
        expect(isApplicableToMonth(account, m)).toBe(true)
      }
    })
  })

  describe('Anuales', () => {
    it('is applicable only in the matching month', () => {
      const account = makeAccountMaster({ period: 'Anuales', monthStartAt: 'April' })
      expect(isApplicableToMonth(account, 4)).toBe(true)
    })

    it('is not applicable in non-matching months', () => {
      const account = makeAccountMaster({ period: 'Anuales', monthStartAt: 'April' })
      expect(isApplicableToMonth(account, 3)).toBe(false)
      expect(isApplicableToMonth(account, 5)).toBe(false)
      expect(isApplicableToMonth(account, 1)).toBe(false)
    })
  })

  describe('Trimestrales (every 3 months)', () => {
    it('fires in start month and each subsequent 3-month interval', () => {
      const account = makeAccountMaster({ period: 'Trimestrales', monthStartAt: 'January' })
      expect(isApplicableToMonth(account, 1)).toBe(true) // Jan
      expect(isApplicableToMonth(account, 4)).toBe(true) // Apr
      expect(isApplicableToMonth(account, 7)).toBe(true) // Jul
      expect(isApplicableToMonth(account, 10)).toBe(true) // Oct
    })

    it('does not fire in off-cycle months', () => {
      const account = makeAccountMaster({ period: 'Trimestrales', monthStartAt: 'January' })
      expect(isApplicableToMonth(account, 2)).toBe(false)
      expect(isApplicableToMonth(account, 3)).toBe(false)
      expect(isApplicableToMonth(account, 5)).toBe(false)
    })

    it('returns false when monthStartAt is unknown', () => {
      const account = makeAccountMaster({ period: 'Trimestrales', monthStartAt: 'Unknown' })
      expect(isApplicableToMonth(account, 1)).toBe(false)
    })
  })

  describe('Cuatrimestrales (every 4 months)', () => {
    it('fires in start month and each subsequent 4-month interval', () => {
      const account = makeAccountMaster({ period: 'Cuatrimestrales', monthStartAt: 'February' })
      expect(isApplicableToMonth(account, 2)).toBe(true) // Feb
      expect(isApplicableToMonth(account, 6)).toBe(true) // Jun
      expect(isApplicableToMonth(account, 10)).toBe(true) // Oct
    })

    it('does not fire in off-cycle months', () => {
      const account = makeAccountMaster({ period: 'Cuatrimestrales', monthStartAt: 'February' })
      expect(isApplicableToMonth(account, 3)).toBe(false)
      expect(isApplicableToMonth(account, 5)).toBe(false)
    })
  })

  describe('Semestrales (every 6 months)', () => {
    it('fires in start month and 6 months later', () => {
      const account = makeAccountMaster({ period: 'Semestrales', monthStartAt: 'March' })
      expect(isApplicableToMonth(account, 3)).toBe(true) // Mar
      expect(isApplicableToMonth(account, 9)).toBe(true) // Sep
    })

    it('does not fire in off-cycle months', () => {
      const account = makeAccountMaster({ period: 'Semestrales', monthStartAt: 'March' })
      expect(isApplicableToMonth(account, 4)).toBe(false)
      expect(isApplicableToMonth(account, 6)).toBe(false)
    })
  })

  it('returns true for unrecognised period (fallback)', () => {
    const account = makeAccountMaster({ period: 'Desconocido' })
    expect(isApplicableToMonth(account, 4)).toBe(true)
  })
})

// ── getStatus ─────────────────────────────────────────────────────────────────
describe('getStatus', () => {
  // Pin "today" so tests that depend on due-date comparison are deterministic.
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-15'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns Pagado when full amount has been paid', () => {
    const account = makeAccountMaster({ defaultValue: 100000 })
    const payments = [makeTx({ amount: 100000 })]
    expect(getStatus(account, payments, '2026-04').label).toBe('Pagado')
  })

  it('returns Pagado when paid exceeds defaultValue', () => {
    const account = makeAccountMaster({ defaultValue: 100000 })
    const payments = [makeTx({ amount: 120000 })]
    expect(getStatus(account, payments, '2026-04').label).toBe('Pagado')
  })

  it('returns Pagado (and paid amount) for accounts with defaultValue = 0 that received any payment', () => {
    const account = makeAccountMaster({ defaultValue: 0 })
    const payments = [makeTx({ amount: 50000 })]
    const status = getStatus(account, payments, '2026-04')
    expect(status.label).toBe('Pagado')
    expect(status.paid).toBe(50000)
  })

  it('returns Parcial when partial payment exists and defaultValue > 0', () => {
    const account = makeAccountMaster({ defaultValue: 100000 })
    const payments = [makeTx({ amount: 40000 })]
    const status = getStatus(account, payments, '2026-04')
    expect(status.label).toBe('Parcial')
    expect(status.paid).toBe(40000)
  })

  it('accumulates multiple payments for Parcial', () => {
    const account = makeAccountMaster({ defaultValue: 100000 })
    const payments = [makeTx({ amount: 30000 }), makeTx({ id: 'tx-2', amount: 20000 })]
    const status = getStatus(account, payments, '2026-04')
    expect(status.label).toBe('Parcial')
    expect(status.paid).toBe(50000)
  })

  describe('with no payments', () => {
    it('returns Vencido when today is past the due date (maxDatePay)', () => {
      // today = 2026-04-15, due = 2026-04-10
      const account = makeAccountMaster({ defaultValue: 100000, maxDatePay: 10 })
      const status = getStatus(account, [], '2026-04')
      expect(status.label).toBe('Vencido')
    })

    it('returns Pendiente when today is before the due date', () => {
      // today = 2026-04-15, due = 2026-04-20
      const account = makeAccountMaster({ defaultValue: 100000, maxDatePay: 20 })
      const status = getStatus(account, [], '2026-04')
      expect(status.label).toBe('Pendiente')
    })

    it('returns Pendiente when today equals the due date', () => {
      // today = 2026-04-15, due = 2026-04-15 → NOT strictly greater, so Pendiente
      const account = makeAccountMaster({ defaultValue: 100000, maxDatePay: 15 })
      const status = getStatus(account, [], '2026-04')
      expect(status.label).toBe('Pendiente')
    })

    it('falls back to day 31 when maxDatePay is not set', () => {
      // today = 2026-04-15, due = 2026-04-30 (April clamps to 30) → Pendiente
      const account = makeAccountMaster({ defaultValue: 100000, maxDatePay: null })
      const status = getStatus(account, [], '2026-04')
      expect(status.label).toBe('Pendiente')
    })

    it('evaluates correctly for a past month (always Vencido)', () => {
      // today = 2026-04-15; monthStr = 2026-02 (February is fully past)
      const account = makeAccountMaster({ defaultValue: 50000, maxDatePay: 28 })
      const status = getStatus(account, [], '2026-02')
      expect(status.label).toBe('Vencido')
    })

    it('evaluates correctly for a future month (always Pendiente)', () => {
      // today = 2026-04-15; monthStr = 2026-12
      const account = makeAccountMaster({ defaultValue: 50000, maxDatePay: 5 })
      const status = getStatus(account, [], '2026-12')
      expect(status.label).toBe('Pendiente')
    })
  })
})

// ── masterPaymentsMap logic ───────────────────────────────────────────────────
describe('masterPaymentsMap logic', () => {
  // Mirrors what the useMemo builds in AccountStatus
  function buildMasterPaymentsMap(transactions, monthStr) {
    const map = {}
    transactions.forEach((t) => {
      if (t.accountMasterId && t.date?.startsWith(monthStr)) {
        if (!map[t.accountMasterId]) map[t.accountMasterId] = []
        map[t.accountMasterId].push(t)
      }
    })
    return map
  }

  it('groups transactions by accountMasterId for the correct month', () => {
    const transactions = [
      makeTx({ id: 'tx-1', accountMasterId: 'master-1', date: '2026-04-10' }),
      makeTx({ id: 'tx-2', accountMasterId: 'master-1', date: '2026-04-20' }),
      makeTx({ id: 'tx-3', accountMasterId: 'master-2', date: '2026-04-05' }),
    ]
    const map = buildMasterPaymentsMap(transactions, '2026-04')
    expect(map['master-1']).toHaveLength(2)
    expect(map['master-2']).toHaveLength(1)
  })

  it('excludes transactions from other months', () => {
    const transactions = [
      makeTx({ id: 'tx-march', accountMasterId: 'master-1', date: '2026-03-31' }),
      makeTx({ id: 'tx-april', accountMasterId: 'master-1', date: '2026-04-01' }),
    ]
    const map = buildMasterPaymentsMap(transactions, '2026-04')
    expect(map['master-1']).toHaveLength(1)
    expect(map['master-1'][0].id).toBe('tx-april')
  })

  it('excludes transactions without accountMasterId', () => {
    const transactions = [makeTx({ id: 'tx-free', accountMasterId: null, date: '2026-04-10' })]
    const map = buildMasterPaymentsMap(transactions, '2026-04')
    expect(map).toEqual({})
  })

  it('returns empty map for empty transactions array', () => {
    expect(buildMasterPaymentsMap([], '2026-04')).toEqual({})
  })

  it('a transaction saved in march does NOT appear in april map', () => {
    const transactions = [
      makeTx({ id: 'tx-wrong', accountMasterId: 'master-1', date: '2026-03-15' }),
    ]
    const aprilMap = buildMasterPaymentsMap(transactions, '2026-04')
    expect(aprilMap['master-1']).toBeUndefined()
  })
})

// ── PayModal defaultDate logic ────────────────────────────────────────────────
describe('PayModal defaultDate', () => {
  // Mirrors the IIFE in PayModal
  function buildDefaultDate(year, month, maxDatePay) {
    const lastDay = new Date(year, month, 0).getDate()
    const day = Math.min(maxDatePay || 15, lastDay)
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  it('builds a date in the selected month', () => {
    const date = buildDefaultDate(2026, 4, 15)
    expect(date).toMatch(/^2026-04-/)
  })

  it('uses maxDatePay as day when it fits within the month', () => {
    expect(buildDefaultDate(2026, 4, 10)).toBe('2026-04-10')
  })

  it('clamps to last day of month when maxDatePay exceeds it (e.g. 31 in April)', () => {
    // April has 30 days
    expect(buildDefaultDate(2026, 4, 31)).toBe('2026-04-30')
  })

  it('falls back to day 15 when maxDatePay is not set', () => {
    expect(buildDefaultDate(2026, 4, null)).toBe('2026-04-15')
    expect(buildDefaultDate(2026, 4, 0)).toBe('2026-04-15')
  })

  it('handles February correctly (28 days in non-leap year)', () => {
    expect(buildDefaultDate(2026, 2, 31)).toBe('2026-02-28')
  })

  it('handles February correctly (29 days in leap year)', () => {
    expect(buildDefaultDate(2024, 2, 31)).toBe('2024-02-29')
  })

  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])(
    'month %i always generates a date string starting with that month',
    (m) => {
      const date = buildDefaultDate(2026, m, 10)
      const paddedMonth = String(m).padStart(2, '0')
      expect(date).toMatch(new RegExp(`^2026-${paddedMonth}-`))
    },
  )
})
