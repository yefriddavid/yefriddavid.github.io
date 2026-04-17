// @vitest-environment node
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'

// moment locale mock — MONTH_NAMES comes from moment EN months
vi.mock('src/utils/moment', () => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  return {
    default: {
      localeData: () => ({ months: () => months }),
    },
  }
})

vi.mock('src/routes', () => ({ default: [] }))

import { fmt, isApplicableToMonth, getStatus } from '../AccountStatus'

// ── fmt ───────────────────────────────────────────────────────────────────────
describe('fmt', () => {
  it('formats positive integer as COP currency', () => {
    const result = fmt(1000)
    expect(result).toMatch(/1\.000/)
    expect(result).toMatch(/\$/)
  })

  it('formats zero', () => {
    const result = fmt(0)
    expect(result).toMatch(/0/)
  })

  it('treats null/undefined as 0', () => {
    expect(fmt(null)).toBe(fmt(0))
    expect(fmt(undefined)).toBe(fmt(0))
  })

  it('formats large numbers with thousands separator', () => {
    const result = fmt(1500000)
    expect(result).toMatch(/1\.500\.000/)
  })
})

// ── isApplicableToMonth ───────────────────────────────────────────────────────
describe('isApplicableToMonth', () => {
  const base = { active: true, monthStartAt: 'January' }

  it('returns false when account is inactive', () => {
    expect(isApplicableToMonth({ ...base, active: false, period: 'Mensuales' }, 3)).toBe(false)
  })

  it('Mensuales applies to every month', () => {
    const account = { ...base, period: 'Mensuales' }
    for (let m = 1; m <= 12; m++) {
      expect(isApplicableToMonth(account, m)).toBe(true)
    }
  })

  it('Anuales only applies to the start month', () => {
    const account = { ...base, period: 'Anuales', monthStartAt: 'March' }
    expect(isApplicableToMonth(account, 3)).toBe(true)
    expect(isApplicableToMonth(account, 4)).toBe(false)
    expect(isApplicableToMonth(account, 1)).toBe(false)
  })

  it('Trimestrales applies every 3 months from start', () => {
    const account = { ...base, period: 'Trimestrales', monthStartAt: 'January' }
    // January(1), April(4), July(7), October(10)
    expect(isApplicableToMonth(account, 1)).toBe(true)
    expect(isApplicableToMonth(account, 4)).toBe(true)
    expect(isApplicableToMonth(account, 7)).toBe(true)
    expect(isApplicableToMonth(account, 10)).toBe(true)
    expect(isApplicableToMonth(account, 2)).toBe(false)
    expect(isApplicableToMonth(account, 5)).toBe(false)
  })

  it('Cuatrimestrales applies every 4 months from start', () => {
    const account = { ...base, period: 'Cuatrimestrales', monthStartAt: 'February' }
    // February(2), June(6), October(10)
    expect(isApplicableToMonth(account, 2)).toBe(true)
    expect(isApplicableToMonth(account, 6)).toBe(true)
    expect(isApplicableToMonth(account, 10)).toBe(true)
    expect(isApplicableToMonth(account, 3)).toBe(false)
  })

  it('Semestrales applies every 6 months from start', () => {
    const account = { ...base, period: 'Semestrales', monthStartAt: 'March' }
    // March(3), September(9)
    expect(isApplicableToMonth(account, 3)).toBe(true)
    expect(isApplicableToMonth(account, 9)).toBe(true)
    expect(isApplicableToMonth(account, 4)).toBe(false)
  })

  it('returns true for unknown period (fallthrough)', () => {
    const account = { ...base, period: 'N/A' }
    expect(isApplicableToMonth(account, 6)).toBe(true)
  })

  it('Trimestrales with invalid monthStartAt returns false', () => {
    const account = { ...base, period: 'Trimestrales', monthStartAt: 'InvalidMonth' }
    // indexOf returns -1 → startMonth = 0 → returns false
    expect(isApplicableToMonth(account, 3)).toBe(false)
  })
})

// ── getStatus ────────────────────────────────────────────────────────────────
describe('getStatus', () => {
  const FUTURE = '2099-12'
  const PAST = '2020-01'

  describe('with targetAmount', () => {
    const account = { targetAmount: 1000, maxDatePay: 15 }

    it('returns Pagado when cumulative paid >= target', () => {
      const status = getStatus(account, [], FUTURE, 1000)
      expect(status.label).toBe('Pagado')
      expect(status.remaining).toBe(0)
      expect(status.paid).toBe(1000)
    })

    it('returns Pagado when payments sum >= target', () => {
      const status = getStatus(account, [{ amount: 500 }, { amount: 500 }], FUTURE)
      expect(status.label).toBe('Pagado')
    })

    it('returns Parcial when paid > 0 but < target', () => {
      const status = getStatus(account, [{ amount: 400 }], FUTURE)
      expect(status.label).toBe('Parcial')
      expect(status.paid).toBe(400)
      expect(status.remaining).toBe(600)
    })

    it('returns Vencido when nothing paid and due date is in the past', () => {
      const status = getStatus(account, [], PAST)
      expect(status.label).toBe('Vencido')
      expect(status.paid).toBe(0)
    })

    it('returns Pendiente when nothing paid and due date is in the future', () => {
      const status = getStatus(account, [], FUTURE)
      expect(status.label).toBe('Pendiente')
    })

    it('prefers cumulativePaid over summing payments', () => {
      const payments = [{ amount: 300 }, { amount: 300 }]
      const status = getStatus(account, payments, FUTURE, 1200)
      expect(status.label).toBe('Pagado')
      expect(status.paid).toBe(1200)
    })
  })

  describe('without targetAmount (targetAmount = 0)', () => {
    const account = { targetAmount: 0, defaultValue: 500, maxDatePay: 10 }

    it('returns Pagado when any amount paid and equals/exceeds defaultValue', () => {
      const status = getStatus(account, [{ amount: 500 }], FUTURE)
      expect(status.label).toBe('Pagado')
    })

    it('returns Pagado when paid exceeds defaultValue', () => {
      const status = getStatus(account, [{ amount: 700 }], FUTURE)
      expect(status.label).toBe('Pagado')
    })

    it('returns Parcial when 0 < paid < defaultValue', () => {
      const status = getStatus(account, [{ amount: 200 }], FUTURE)
      expect(status.label).toBe('Parcial')
      expect(status.paid).toBe(200)
    })

    it('returns Vencido when nothing paid and past due', () => {
      const status = getStatus(account, [], PAST)
      expect(status.label).toBe('Vencido')
    })

    it('returns Pendiente when nothing paid and not past due', () => {
      const status = getStatus(account, [], FUTURE)
      expect(status.label).toBe('Pendiente')
    })

    it('returns Pagado with no defaultValue constraint when paid > 0 and defaultValue is 0', () => {
      const acc = { targetAmount: 0, defaultValue: 0, maxDatePay: 10 }
      const status = getStatus(acc, [{ amount: 1 }], FUTURE)
      expect(status.label).toBe('Pagado')
    })
  })

  it('all status labels have expected color fields', () => {
    const account = { targetAmount: 1000, maxDatePay: 10 }
    const statuses = [
      getStatus(account, [], FUTURE, 1000),   // Pagado
      getStatus(account, [], FUTURE, 400),    // Parcial
      getStatus(account, [], PAST),           // Vencido
      getStatus(account, [], FUTURE),         // Pendiente
    ]
    for (const s of statuses) {
      expect(s).toHaveProperty('label')
      expect(s).toHaveProperty('color')
      expect(s).toHaveProperty('bg')
      expect(s).toHaveProperty('border')
    }
  })
})
