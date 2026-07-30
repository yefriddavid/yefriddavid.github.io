import { useMemo } from 'react'

const identity = (v) => v

// MultiSelectDropdown represents "Todos unchecked to none" with an internal Symbol
// so a URL-backed Set needs its own URL-safe stand-in for that "none" state.
const NONE_MARKER = 'multi-param:none'

const parseMultiParam = (raw, parse) =>
  raw === NONE_MARKER
    ? new Set([NONE_MARKER])
    : new Set((raw || '').split(',').filter(Boolean).map(parse))

// Backs a MultiSelectDropdown filter with a comma-joined URL param instead of useState.
// `parse` converts each raw string back to its real type (e.g. Number for months).
const useMultiParam = (searchParams, setSearchParams, key, parse = identity) => {
  const selected = useMemo(
    () => parseMultiParam(searchParams.get(key), parse),
    [searchParams, key, parse],
  )

  const setSelected = (updater) =>
    setSearchParams((prev) => {
      const current = parseMultiParam(prev.get(key), parse)
      const updated = typeof updater === 'function' ? updater(current) : updater
      const next = new URLSearchParams(prev)
      const realValues = [...updated].filter((v) => typeof v !== 'symbol')
      if (realValues.length !== updated.size) next.set(key, NONE_MARKER)
      else if (updated.size === 0) next.delete(key)
      else next.set(key, realValues.join(','))
      return next
    })
  return [selected, setSelected]
}

export default useMultiParam
