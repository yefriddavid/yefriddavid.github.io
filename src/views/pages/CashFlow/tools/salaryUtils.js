import { useState, useEffect } from 'react'

export const fmt = (n) =>
  Number(n).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

export const TYPE_LABELS = { percent: 'Porcentaje', value: 'Valor fijo', remainder: 'Restante' }
export const TARGET_OPTIONS = ['bnc col', 'col-bnc', 'bnc arg', 'bnc loan', 'ctb']

export let nextId = Date.now()
export const bumpId = () => ++nextId

export function computeDistribution(salary, invert, rows) {
  const base = salary - invert
  let remaining = base
  const results = []

  for (const row of rows) {
    if (row.type === 'percent') {
      const amount = Math.round(base * (row.value / 100))
      remaining -= amount
      results.push({ ...row, amount })
    } else if (row.type === 'value') {
      const amount = Number(row.value)
      remaining -= amount
      results.push({ ...row, amount })
    } else if (row.type === 'remainder') {
      results.push({ ...row, amount: remaining })
    }
  }

  return rows.map((r) => results.find((res) => res.id === r.id)).filter(Boolean)
}

export function parseRangeFromName(name) {
  const match = name?.match(/\(([<>]?\d+(?:-\d+)?)\)/)
  if (!match) return null
  const expr = match[1]
  if (expr.startsWith('<')) return { type: 'lt', value: Number(expr.slice(1)) }
  if (expr.startsWith('>')) return { type: 'gt', value: Number(expr.slice(1)) }
  const parts = expr.split('-')
  if (parts.length === 2) return { type: 'between', min: Number(parts[0]), max: Number(parts[1]) }
  return null
}

export function matchesRange(range, price) {
  if (!range || price === null || price === undefined || price === '') return false
  const p = Number(price)
  if (isNaN(p)) return false
  if (range.type === 'lt') return p < range.value
  if (range.type === 'gt') return p > range.value
  if (range.type === 'between') return p >= range.min && p <= range.max
  return false
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}
