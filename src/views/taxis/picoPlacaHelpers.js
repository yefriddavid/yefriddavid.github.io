// Pico y placa restrictions used to be keyed only by month (`{ [month]: { d1, d2 } }`),
// which meant editing it rewrote the same rule for that month across every year. The
// current shape is year-scoped (`{ [year]: { [month]: { d1, d2 } } }`) so a new decree
// only overrides the years/months it actually applies to. Vehicles not yet touched by
// the new UI still carry the old flat shape, so every reader falls back to it.
export const isYearKeyedRestrictions = (restrictions) =>
  Object.keys(restrictions ?? {}).some((k) => Number(k) > 12)

export const getMonthRestriction = (restrictions, year, month) => {
  if (!restrictions) return null
  if (isYearKeyedRestrictions(restrictions)) {
    const yearData = restrictions[year] ?? restrictions[String(year)]
    return yearData?.[month] ?? yearData?.[String(month)] ?? null
  }
  return restrictions[month] ?? restrictions[String(month)] ?? null
}

export const restrictedDaysFor = (restrictions, year, month) => {
  const r = getMonthRestriction(restrictions, year, month)
  if (!r) return []
  return [r.d1, r.d2, r.d3].filter(Boolean).map(Number)
}

// ── Editable-form shape (Vehicles.js "Pico y placa" modal) ──────────────────
// The form holds one year's 12 months as string inputs ('' for empty); these
// convert between that shape and the persisted { d1, d2, d3: number|null } shape.
export const emptyRestrictions = () =>
  Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i + 1, { d1: '', d2: '', d3: '' }]))

// A legacy flat table (month → {d1,d2}, no year) applied to every year forever —
// editing it retroactively changed already-audited months. Keeping it under the
// current year the first time it's touched preserves that history: other years
// simply fall back to it until they get their own entry.
export const toYearKeyedRestrictions = (restrictions, fallbackYear) => {
  if (!restrictions || Object.keys(restrictions).length === 0) return {}
  if (isYearKeyedRestrictions(restrictions)) return restrictions
  return { [fallbackYear]: restrictions }
}

export const monthFormFor = (yearData) => {
  const base = emptyRestrictions()
  if (yearData) {
    Object.entries(yearData).forEach(([m, v]) => {
      if (base[m]) {
        base[m] = {
          d1: v?.d1 ? String(v.d1) : '',
          d2: v?.d2 ? String(v.d2) : '',
          d3: v?.d3 ? String(v.d3) : '',
        }
      }
    })
  }
  return base
}

export const cleanMonthForm = (form) =>
  Object.fromEntries(
    Object.entries(form).map(([m, v]) => [
      m,
      {
        d1: v.d1 ? Number(v.d1) : null,
        d2: v.d2 ? Number(v.d2) : null,
        d3: v.d3 ? Number(v.d3) : null,
      },
    ]),
  )
