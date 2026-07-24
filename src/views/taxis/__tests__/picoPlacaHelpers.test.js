import { describe, it, expect } from 'vitest'
import {
  isYearKeyedRestrictions,
  getMonthRestriction,
  restrictedDaysFor,
  emptyRestrictions,
  toYearKeyedRestrictions,
  monthFormFor,
  cleanMonthForm,
} from '../picoPlacaHelpers'

describe('isYearKeyedRestrictions', () => {
  it('is false for a legacy flat table (month keys 1-12)', () => {
    expect(isYearKeyedRestrictions({ 1: {}, 7: {}, 12: {} })).toBe(false)
  })

  it('is true when any key looks like a year', () => {
    expect(isYearKeyedRestrictions({ 2026: {} })).toBe(true)
  })

  it('is false for an empty or missing table', () => {
    expect(isYearKeyedRestrictions({})).toBe(false)
    expect(isYearKeyedRestrictions(undefined)).toBe(false)
  })
})

describe('getMonthRestriction', () => {
  it('reads directly from a legacy flat table regardless of the year requested', () => {
    const restrictions = { 7: { d1: 9, d2: 23 } }
    expect(getMonthRestriction(restrictions, 2026, 7)).toEqual({ d1: 9, d2: 23 })
    expect(getMonthRestriction(restrictions, 2030, 7)).toEqual({ d1: 9, d2: 23 })
  })

  it('reads the matching year from a year-keyed table', () => {
    const restrictions = {
      2026: { 8: { d1: 9, d2: null } },
      2027: { 1: { d1: 4, d2: null } },
    }
    expect(getMonthRestriction(restrictions, 2026, 8)).toEqual({ d1: 9, d2: null })
    expect(getMonthRestriction(restrictions, 2027, 1)).toEqual({ d1: 4, d2: null })
  })

  it('returns null for a year not present in a year-keyed table (no legacy fallback once migrated)', () => {
    const restrictions = { 2026: { 8: { d1: 9, d2: null } } }
    expect(getMonthRestriction(restrictions, 2028, 8)).toBeNull()
  })

  it('returns null when restrictions is missing entirely', () => {
    expect(getMonthRestriction(undefined, 2026, 8)).toBeNull()
  })
})

describe('restrictedDaysFor', () => {
  it('returns d1, d2 and d3 as numbers, dropping falsy values', () => {
    const restrictions = { 2026: { 8: { d1: 9, d2: null, d3: 24 } } }
    expect(restrictedDaysFor(restrictions, 2026, 8)).toEqual([9, 24])
  })

  it('returns an empty array when there is no entry for that month/year', () => {
    expect(restrictedDaysFor({ 2026: { 8: { d1: 9 } } }, 2026, 9)).toEqual([])
  })

  it('supports legacy two-day entries with no d3 field', () => {
    expect(restrictedDaysFor({ 2: { d1: 12, d2: 26 } }, 2026, 2)).toEqual([12, 26])
  })
})

// ── Vehicles.js "Pico y placa" modal — save/reopen flow ─────────────────────
// These mirror exactly what Vehicles.js does in openRestrictModal /
// handleRestrictYearChange / handleSaveRestrictions, using the real exported
// helpers (not re-implemented in the test) so a regression here fails a test
// instead of only surfacing when someone clicks around in the browser.
describe('pico y placa — Vehicles.js save/reopen flow', () => {
  it('a vehicle with no restrictions yet starts from a blank form', () => {
    const allRestrictions = toYearKeyedRestrictions(undefined, 2026)
    expect(allRestrictions).toEqual({})
    expect(monthFormFor(allRestrictions[2026])).toEqual(emptyRestrictions())
  })

  it('migrates a legacy flat table under the current year without losing data', () => {
    const legacyFlat = { 2: { d1: 12, d2: 26 }, 7: { d1: 9, d2: 23 } }
    const allRestrictions = toYearKeyedRestrictions(legacyFlat, 2026)

    expect(allRestrictions).toEqual({ 2026: legacyFlat })
    expect(monthFormFor(allRestrictions[2026])[7]).toEqual({ d1: '9', d2: '23', d3: '' })
  })

  it('editing one month and saving preserves the other untouched months', () => {
    const legacyFlat = { 2: { d1: 12, d2: 26 }, 7: { d1: 9, d2: 23 } }
    const allRestrictions = toYearKeyedRestrictions(legacyFlat, 2026)
    const form = monthFormFor(allRestrictions[2026])

    // Simulate the DevExtreme grid cell edit: August (month 8), Día 1 = 9
    const editedForm = { ...form, 8: { ...form[8], d1: '9' } }

    const merged = { ...allRestrictions, 2026: cleanMonthForm(editedForm) }

    expect(merged[2026][8]).toEqual({ d1: 9, d2: null, d3: null })
    expect(merged[2026][2]).toEqual({ d1: 12, d2: 26, d3: null })
    expect(merged[2026][7]).toEqual({ d1: 9, d2: 23, d3: null })
  })

  it('reopening after save shows the edited value back in the form', () => {
    const legacyFlat = { 7: { d1: 9, d2: 23 } }
    const allRestrictions = toYearKeyedRestrictions(legacyFlat, 2026)
    const form = monthFormFor(allRestrictions[2026])
    const editedForm = { ...form, 8: { ...form[8], d1: '9' } }
    const savedRestrictions = { ...allRestrictions, 2026: cleanMonthForm(editedForm) }

    // Reopen — vehicle.restrictions is now what was just saved
    const reopened = toYearKeyedRestrictions(savedRestrictions, 2026)
    const reopenedForm = monthFormFor(reopened[2026])

    expect(reopenedForm[8]).toEqual({ d1: '9', d2: '', d3: '' })
  })

  it('editing two different years before saving keeps both years intact', () => {
    const legacyFlat = { 7: { d1: 9, d2: 23 } }
    let allRestrictions = toYearKeyedRestrictions(legacyFlat, 2026)
    let year = 2026
    let form = monthFormFor(allRestrictions[year])

    // Edit August 2026
    form = { ...form, 8: { ...form[8], d1: '9' } }

    // Switch to 2027 — commit 2026's form first (handleRestrictYearChange)
    allRestrictions = { ...allRestrictions, [year]: cleanMonthForm(form) }
    year = 2027
    form = monthFormFor(allRestrictions[year])

    // Edit January 2027
    form = { ...form, 1: { ...form[1], d1: '1' } }

    // Save (handleSaveRestrictions)
    const merged = { ...allRestrictions, [year]: cleanMonthForm(form) }

    expect(merged[2026][8]).toEqual({ d1: 9, d2: null, d3: null })
    expect(merged[2026][7]).toEqual({ d1: 9, d2: 23, d3: null }) // untouched legacy month preserved
    expect(merged[2027][1]).toEqual({ d1: 1, d2: null, d3: null })
  })

  it('a year already year-keyed is used as-is, not re-wrapped', () => {
    const alreadyKeyed = { 2026: { 8: { d1: 9, d2: null } } }
    expect(toYearKeyedRestrictions(alreadyKeyed, 2026)).toBe(alreadyKeyed)
  })
})
