import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fmt, fmtDate, today, EMPTY } from '../utils'

describe('fmt', () => {
  it('formats positive integer as COP currency', () => {
    const result = fmt(50000)
    expect(result).toContain('50')
    expect(result).toContain('000')
    // COP currency symbol or code should appear
    expect(result.match(/\$|COP/)).toBeTruthy()
  })

  it('formats zero', () => {
    expect(fmt(0)).toContain('0')
  })

  it('formats large amounts with thousands separator and no decimal digits', () => {
    const result = fmt(1500000)
    // es-CO uses '.' as thousands separator: '$ 1.500.000'
    expect(result).toMatch(/1[.,\s]?500[.,\s]?000/)
    // maximumFractionDigits: 0 — no decimal part after the last digit group
    expect(result).not.toMatch(/[.,]\d{1,2}$/)
  })

  it('formats negative amount', () => {
    const result = fmt(-30000)
    expect(result).toContain('-')
  })
})

describe('fmtDate', () => {
  it('returns empty string for null', () => {
    expect(fmtDate(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(fmtDate(undefined)).toBe('')
  })

  it('returns empty string for empty string', () => {
    expect(fmtDate('')).toBe('')
  })

  it('formats date to weekday + zero-padded day', () => {
    // 2024-04-01 is a Monday (Lunes)
    const result = fmtDate('2024-04-01')
    expect(result).toMatch(/^[A-ZÁÉÍÓÚÜ][a-záéíóúü]+\s01$/)
  })

  it('zero-pads single-digit day', () => {
    const result = fmtDate('2024-04-05')
    expect(result).toMatch(/05$/)
  })

  it('capitalizes the weekday abbreviation', () => {
    const result = fmtDate('2024-04-01')
    expect(result[0]).toBe(result[0].toUpperCase())
  })

  it('correctly parses date without timezone offset', () => {
    // Verify that day-31 doesn't overflow to next month
    const result = fmtDate('2024-01-31')
    expect(result).toMatch(/31$/)
  })
})

describe('today', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns ISO date string in YYYY-MM-DD format', () => {
    vi.setSystemTime(new Date(2024, 3, 15)) // April 15, 2024
    expect(today()).toBe('2024-04-15')
  })

  it('returns current date matching system time', () => {
    vi.setSystemTime(new Date(2024, 11, 1)) // December 1, 2024
    expect(today()).toBe('2024-12-01')
  })
})

describe('EMPTY', () => {
  it('has empty string for driver, plate, amount, comment', () => {
    expect(EMPTY.driver).toBe('')
    expect(EMPTY.plate).toBe('')
    expect(EMPTY.amount).toBe('')
    expect(EMPTY.comment).toBe('')
  })

  it('has date set to today', () => {
    // EMPTY.date is evaluated at module load time; just verify format
    expect(EMPTY.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
