import React, { useState, useCallback } from 'react'
import './CalcPercentage.scss'

const FIELDS = ['initial', 'pct', 'change', 'final']

const LABELS = {
  initial: 'Valor inicial',
  pct: 'Porcentaje',
  change: 'Cambio',
  final: 'Valor final',
}

const SUFFIX = { pct: '%' }

const parse = (v) => {
  const n = parseFloat(String(v).replace(/,/g, '.'))
  return isFinite(n) ? n : null
}

const fmt = (n) =>
  n === null || n === undefined
    ? ''
    : Number.isInteger(n * 1e10)
    ? n.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 10 })
    : n.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 6 })

// Given 2 source fields + their values, compute the other 2.
// sign: +1 = increase, -1 = decrease
function computeDerived(srcA, srcB, vals, sign) {
  const i = parse(vals.initial)
  const p = parse(vals.pct)
  const c = parse(vals.change)
  const f = parse(vals.final)

  const pair = [srcA, srcB].sort().join('+')
  const out = {}

  switch (pair) {
    case 'initial+pct':
      if (i !== null && p !== null) {
        const ch = (i * p) / 100
        out.change = fmt(ch)
        out.final = fmt(i + sign * ch)
      }
      break

    case 'change+initial':
      if (i !== null && c !== null && i !== 0) {
        out.pct = fmt((c / i) * 100)
        out.final = fmt(i + sign * c)
      }
      break

    case 'final+initial':
      if (i !== null && f !== null && i !== 0) {
        const ch = sign * (f - i)
        out.change = fmt(ch)
        out.pct = fmt((ch / i) * 100)
      }
      break

    case 'change+pct':
      if (p !== null && c !== null && p !== 0) {
        const ini = (c / p) * 100
        out.initial = fmt(ini)
        out.final = fmt(ini + sign * c)
      }
      break

    case 'final+pct':
      if (p !== null && f !== null) {
        const ini = f / (1 + (sign * p) / 100)
        const ch = sign > 0 ? f - ini : ini - f
        out.initial = fmt(ini)
        out.change = fmt(ch)
      }
      break

    case 'change+final':
      if (c !== null && f !== null) {
        const ini = sign > 0 ? f - c : f + c
        out.initial = fmt(ini)
        out.pct = ini !== 0 ? fmt((c / ini) * 100) : ''
      }
      break

    default:
      break
  }

  return out
}

const CalcPercentage = () => {
  const [mode, setMode] = useState('increase')
  const [vals, setVals] = useState({ initial: '', pct: '', change: '', final: '' })
  // last 2 fields the user has typed in (most recent first)
  const [sources, setSources] = useState(['initial', 'pct'])

  const sign = mode === 'increase' ? 1 : -1

  const handleChange = useCallback(
    (field, raw) => {
      // Update sources: this field is now the most recent
      setSources((prev) => {
        const next = [field, ...prev.filter((f) => f !== field)].slice(0, 2)
        return next
      })

      setVals((prev) => {
        const updated = { ...prev, [field]: raw }

        // Compute the new sources list (field + the other in prev sources)
        const nextSources = [field, ...sources.filter((f) => f !== field)].slice(0, 2)
        const [srcA, srcB] = nextSources
        const derived = srcA && srcB ? computeDerived(srcA, srcB, updated, sign) : {}

        // Only update derived fields (not the 2 source fields)
        const result = { ...updated }
        for (const k of FIELDS) {
          if (k !== srcA && k !== srcB && derived[k] !== undefined) {
            result[k] = derived[k]
          }
        }
        return result
      })
    },
    [sources, sign],
  )

  const handleModeChange = useCallback(
    (newMode) => {
      setMode(newMode)
      const newSign = newMode === 'increase' ? 1 : -1
      setVals((prev) => {
        const [srcA, srcB] = sources
        const derived = srcA && srcB ? computeDerived(srcA, srcB, prev, newSign) : {}
        const result = { ...prev }
        for (const k of FIELDS) {
          if (k !== srcA && k !== srcB && derived[k] !== undefined) {
            result[k] = derived[k]
          }
        }
        return result
      })
    },
    [sources],
  )

  const handleClear = () => {
    setVals({ initial: '', pct: '', change: '', final: '' })
    setSources(['initial', 'pct'])
  }

  const isSource = (f) => sources.includes(f)

  return (
    <div className="cp-page">
      <div className="cp-header">
        <h2 className="cp-header__title">Calc Porcentaje</h2>
        <button className="cp-header__clear" onClick={handleClear}>
          Limpiar
        </button>
      </div>

      <div className="cp-mode">
        <button
          className={`cp-mode__btn${mode === 'increase' ? ' cp-mode__btn--active cp-mode__btn--increase' : ''}`}
          onClick={() => handleModeChange('increase')}
        >
          ▲ Incremento
        </button>
        <button
          className={`cp-mode__btn${mode === 'decrease' ? ' cp-mode__btn--active cp-mode__btn--decrease' : ''}`}
          onClick={() => handleModeChange('decrease')}
        >
          ▼ Descuento
        </button>
      </div>

      <div className="cp-grid">
        {FIELDS.map((field) => (
          <div
            key={field}
            className={`cp-card${isSource(field) ? ' cp-card--source' : ' cp-card--derived'}`}
          >
            <label className="cp-card__label">{LABELS[field]}</label>
            <div className="cp-card__input-wrap">
              <input
                className="cp-card__input"
                type="number"
                inputMode="decimal"
                value={vals[field]}
                placeholder="0"
                onChange={(e) => handleChange(field, e.target.value)}
              />
              {SUFFIX[field] && <span className="cp-card__suffix">{SUFFIX[field]}</span>}
            </div>
            {!isSource(field) && vals[field] !== '' && (
              <span className="cp-card__computed-badge">calculado</span>
            )}
          </div>
        ))}
      </div>

      {vals.initial !== '' && vals.pct !== '' && (
        <div className="cp-summary">
          <span className={`cp-summary__arrow${mode === 'increase' ? ' cp-summary__arrow--up' : ' cp-summary__arrow--down'}`}>
            {mode === 'increase' ? '▲' : '▼'}
          </span>
          <span className="cp-summary__text">
            {vals.initial} {mode === 'increase' ? '+' : '−'} {vals.pct}% = <strong>{vals.final}</strong>
          </span>
        </div>
      )}
    </div>
  )
}

export default CalcPercentage
