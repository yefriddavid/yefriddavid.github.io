import React, { useState, useCallback, useEffect } from 'react'
import { calcPercentageStorage } from 'src/utils/storage'
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

const round = (n, decimals = 6) => {
  const f = 10 ** decimals
  return Math.round((n + Number.EPSILON) * f) / f
}

// Canonical value fed into <input type="number"> — this input type is locale-independent
// (always expects '.' as the decimal point, no thousands grouping), so it must NEVER
// receive a toLocaleString-formatted string (e.g. "510,00" or "6.000") or the browser
// silently rejects/misreads it, showing a blank or wrong value.
const fmtValue = (n) => (n === null || n === undefined || !isFinite(n) ? '' : String(round(n)))

// Human-readable, locale-formatted — only safe for plain-text display (summary
// sentence, reference-value result), never for an <input> value.
const fmtDisplay = (n) => {
  if (n === null || n === undefined || !isFinite(n)) return ''
  const r = round(n, 10)
  return Number.isInteger(r)
    ? r.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 10 })
    : n.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 6 })
}

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
        out.change = fmtValue(ch)
        out.final = fmtValue(i + sign * ch)
      }
      break

    case 'change+initial':
      if (i !== null && c !== null) {
        out.final = fmtValue(i + sign * c)
        out.pct = i !== 0 ? fmtValue((c / i) * 100) : ''
      }
      break

    case 'final+initial':
      if (i !== null && f !== null) {
        const ch = sign * (f - i)
        out.change = fmtValue(ch)
        out.pct = i !== 0 ? fmtValue((ch / i) * 100) : ''
      }
      break

    case 'change+pct':
      if (p !== null && c !== null && p !== 0) {
        const ini = (c / p) * 100
        out.initial = fmtValue(ini)
        out.final = fmtValue(ini + sign * c)
      }
      break

    case 'final+pct': {
      const denom = 1 + (sign * p) / 100
      if (p !== null && f !== null && denom !== 0) {
        const ini = f / denom
        const ch = sign > 0 ? f - ini : ini - f
        out.initial = fmtValue(ini)
        out.change = fmtValue(ch)
      }
      break
    }

    case 'change+final':
      if (c !== null && f !== null) {
        const ini = sign > 0 ? f - c : f + c
        out.initial = fmtValue(ini)
        out.pct = ini !== 0 ? fmtValue((c / ini) * 100) : ''
      }
      break

    default:
      break
  }

  return out
}

const CalcPercentage = () => {
  const [stored] = useState(() => calcPercentageStorage.get() || {})
  const [mode, setMode] = useState(stored.mode || 'increase')
  const [vals, setVals] = useState(stored.vals || { initial: '', pct: '', change: '', final: '' })
  const [sources, setSources] = useState(stored.sources || ['initial', 'pct'])
  const [refVal, setRefVal] = useState(stored.refVal || '')

  const sign = mode === 'increase' ? 1 : -1

  useEffect(() => {
    calcPercentageStorage.set({ mode, vals, sources, refVal })
  }, [mode, vals, sources, refVal])

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

        // Derived fields always reflect the latest computation — clear them
        // instead of leaving a stale value when they can no longer be derived
        const result = { ...updated }
        for (const k of FIELDS) {
          if (k !== srcA && k !== srcB) {
            result[k] = derived[k] !== undefined ? derived[k] : ''
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
          if (k !== srcA && k !== srcB) {
            result[k] = derived[k] !== undefined ? derived[k] : ''
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
    setRefVal('')
  }

  const refNum = parse(refVal)
  const pctNum = parse(vals.pct)
  const refResult =
    refNum !== null && pctNum !== null
      ? refNum + sign * (refNum * pctNum) / 100
      : null
  const refChange = refNum !== null && pctNum !== null ? (refNum * pctNum) / 100 : null

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
            {fmtDisplay(parse(vals.initial))} {mode === 'increase' ? '+' : '−'}{' '}
            {fmtDisplay(parse(vals.pct))}% = <strong>{fmtDisplay(parse(vals.final))}</strong>
          </span>
        </div>
      )}

      <div className="cp-ref">
        <label className="cp-ref__label">Valor de referencia <span className="cp-ref__optional">(opcional)</span></label>
        <div className="cp-ref__row">
          <input
            className="cp-ref__input"
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={refVal}
            onChange={(e) => setRefVal(e.target.value)}
          />
          {refResult !== null && (
            <div className="cp-ref__result">
              <span className={`cp-ref__arrow${mode === 'increase' ? ' cp-ref__arrow--up' : ' cp-ref__arrow--down'}`}>
                {mode === 'increase' ? '▲' : '▼'}
              </span>
              <span className="cp-ref__change">{mode === 'increase' ? '+' : '−'}{fmtDisplay(refChange)}</span>
              <span className="cp-ref__final">{fmtDisplay(refResult)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CalcPercentage
