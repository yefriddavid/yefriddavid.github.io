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

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}
