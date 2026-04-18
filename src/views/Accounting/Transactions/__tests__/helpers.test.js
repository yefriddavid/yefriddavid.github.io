// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll } from 'vitest'

vi.mock('src/constants/commons', () => ({
  MONTH_NAMES: [
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
  ],
}))

import { fmt, isApplicableToMonth, guessCategory, toISODate } from '../helpers'

describe('fmt', () => {
  it('formats positive integer as COP currency', () => {
    const result = fmt(1000)
    expect(result).toContain('1.000')
  })

  it('formats zero', () => {
    const result = fmt(0)
    expect(result).toContain('0')
  })

  it('handles null/undefined as zero', () => {
    expect(fmt(null)).toContain('0')
    expect(fmt(undefined)).toContain('0')
  })

  it('formats large amounts', () => {
    const result = fmt(3259000)
    expect(result).toContain('3.259.000')
  })
})

describe('isApplicableToMonth', () => {
  it('returns false for inactive accounts', () => {
    expect(isApplicableToMonth({ active: false, period: 'Mensuales' }, 1)).toBe(false)
  })

  it('returns true for monthly accounts', () => {
    expect(isApplicableToMonth({ active: true, period: 'Mensuales' }, 5)).toBe(true)
  })

  it('returns true for annual accounts on their start month', () => {
    const account = { active: true, period: 'Anuales', monthStartAt: 'March' }
    expect(isApplicableToMonth(account, 3)).toBe(true)
    expect(isApplicableToMonth(account, 4)).toBe(false)
  })

  it('returns true for quarterly accounts on correct months', () => {
    const account = { active: true, period: 'Trimestrales', monthStartAt: 'January' }
    expect(isApplicableToMonth(account, 1)).toBe(true)
    expect(isApplicableToMonth(account, 4)).toBe(true)
    expect(isApplicableToMonth(account, 7)).toBe(true)
    expect(isApplicableToMonth(account, 10)).toBe(true)
    expect(isApplicableToMonth(account, 2)).toBe(false)
  })

  it('returns true for semi-annual accounts on correct months', () => {
    const account = { active: true, period: 'Semestrales', monthStartAt: 'January' }
    expect(isApplicableToMonth(account, 1)).toBe(true)
    expect(isApplicableToMonth(account, 7)).toBe(true)
    expect(isApplicableToMonth(account, 4)).toBe(false)
  })

  it('returns true for four-monthly accounts on correct months', () => {
    const account = { active: true, period: 'Cuatrimestrales', monthStartAt: 'January' }
    expect(isApplicableToMonth(account, 1)).toBe(true)
    expect(isApplicableToMonth(account, 5)).toBe(true)
    expect(isApplicableToMonth(account, 9)).toBe(true)
    expect(isApplicableToMonth(account, 3)).toBe(false)
  })

  it('returns false for quarterly account with invalid monthStartAt', () => {
    const account = { active: true, period: 'Trimestrales', monthStartAt: '' }
    expect(isApplicableToMonth(account, 1)).toBe(false)
  })
})

describe('guessCategory', () => {
  it('matches arriendo → Hogar', () => {
    expect(guessCategory('Arriendo apartamento')).toBe('Hogar')
  })

  it('matches energia → Servicios públicos', () => {
    expect(guessCategory('Factura energía EPM')).toBe('Servicios públicos')
  })

  it('matches internet → Servicios públicos', () => {
    expect(guessCategory('Internet Claro mensual')).toBe('Servicios públicos')
  })

  it('matches mercado → Alimentación', () => {
    expect(guessCategory('Mercado semanal')).toBe('Alimentación')
  })

  it('matches taxi → Transporte', () => {
    expect(guessCategory('Taxi aeropuerto')).toBe('Transporte')
  })

  it('matches uber → Transporte', () => {
    expect(guessCategory('Pago Uber mensual')).toBe('Transporte')
  })

  it('matches eps → Salud', () => {
    expect(guessCategory('Pago EPS mensual')).toBe('Salud')
  })

  it('matches universidad → Educación', () => {
    expect(guessCategory('Matrícula universidad')).toBe('Educación')
  })

  it('returns Otros for unknown keywords', () => {
    expect(guessCategory('Compra aleatoria xyz')).toBe('Otros')
  })

  it('handles empty string', () => {
    expect(guessCategory('')).toBe('Otros')
  })

  it('handles null/undefined', () => {
    expect(guessCategory(null)).toBe('Otros')
    expect(guessCategory(undefined)).toBe('Otros')
  })

  it('is case-insensitive', () => {
    expect(guessCategory('ARRIENDO FINCA')).toBe('Hogar')
  })
})

describe('toISODate', () => {
  it('returns today for null input', () => {
    const today = new Date().toISOString().slice(0, 10)
    expect(toISODate(null)).toBe(today)
  })

  it('returns today for undefined input', () => {
    const today = new Date().toISOString().slice(0, 10)
    expect(toISODate(undefined)).toBe(today)
  })

  it('parses a valid ISO date string', () => {
    expect(toISODate('2026-04-15')).toBe('2026-04-15')
  })

  it('parses a valid date with time component', () => {
    expect(toISODate('2026-04-15T12:00:00Z')).toBe('2026-04-15')
  })

  it('returns raw string for invalid date', () => {
    expect(toISODate('not-a-date')).toBe('not-a-date')
  })
})
