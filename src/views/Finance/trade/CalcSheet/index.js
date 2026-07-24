import React, { useMemo, useRef, useState } from 'react'
import { computeSheet, colLetters } from './calcSheetEngine'
import './CalcSheet.scss'

const INITIAL_ROWS = 20
const MAX_ROWS = 100
const ROWS_STEP = 10
const COLS = 10 // A..J

const fmtValue = (v) => {
  if (typeof v !== 'number') return v ?? ''
  if (!isFinite(v)) return '#ERROR!'
  const r = Math.round((v + Number.EPSILON) * 1e6) / 1e6
  return r.toLocaleString('es-CO', { maximumFractionDigits: 6 })
}

const CalcSheet = () => {
  const [data, setData] = useState({})
  const [rowCount, setRowCount] = useState(INITIAL_ROWS)
  const [selected, setSelected] = useState('A1')
  const [editingId, setEditingId] = useState(null)
  const inputRefs = useRef({})

  const results = useMemo(() => computeSheet(data), [data])

  const setCell = (id, raw) => setData((prev) => ({ ...prev, [id]: raw }))

  const handleClear = () => {
    setData({})
    setSelected('A1')
  }

  const focusCell = (id) => {
    const el = inputRefs.current[id]
    if (el) {
      el.focus()
      el.select()
    }
  }

  const handleKeyDown = (e, col, row) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (row < rowCount) focusCell(`${colLetters(col)}${row + 1}`)
    }
  }

  const displayFor = (id) => {
    const res = results[id]
    if (!res) return ''
    return res.error ? res.error : fmtValue(res.value)
  }

  return (
    <div className="calc-sheet">
      <div className="calc-sheet__header">
        <h2 className="calc-sheet__title">Hoja de cálculo</h2>
        <div className="calc-sheet__actions">
          <button className="calc-sheet__btn" onClick={handleClear}>
            Limpiar
          </button>
        </div>
      </div>

      <div className="calc-sheet__formula-bar">
        <span className="calc-sheet__formula-bar-label">{selected}</span>
        <input
          className="calc-sheet__formula-bar-input"
          value={data[selected] || ''}
          placeholder="Valor o fórmula, ej: =A1+B2 · =SUM(A1:A5)"
          onChange={(e) => setCell(selected, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') focusCell(selected)
          }}
        />
      </div>

      <div className="calc-sheet__scroll">
        <table className="calc-sheet__table">
          <thead>
            <tr>
              <th className="calc-sheet__corner" />
              {Array.from({ length: COLS }, (_, c) => (
                <th key={c} className="calc-sheet__col-header">
                  {colLetters(c + 1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }, (_, r) => {
              const row = r + 1
              return (
                <tr key={row}>
                  <th className="calc-sheet__row-header">{row}</th>
                  {Array.from({ length: COLS }, (__, c) => {
                    const col = c + 1
                    const id = `${colLetters(col)}${row}`
                    const isSelected = selected === id
                    const isEditing = editingId === id
                    const error = results[id]?.error
                    return (
                      <td
                        key={id}
                        className={`calc-sheet__cell${isSelected ? ' calc-sheet__cell--selected' : ''}${error ? ' calc-sheet__cell--error' : ''}`}
                      >
                        <input
                          ref={(el) => (inputRefs.current[id] = el)}
                          className="calc-sheet__input"
                          value={isEditing ? data[id] || '' : displayFor(id)}
                          onFocus={() => {
                            setSelected(id)
                            setEditingId(id)
                          }}
                          onBlur={() => setEditingId((cur) => (cur === id ? null : cur))}
                          onChange={(e) => setCell(id, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, col, row)}
                        />
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {rowCount < MAX_ROWS && (
        <button
          className="calc-sheet__btn calc-sheet__btn--add-rows"
          onClick={() => setRowCount((n) => Math.min(MAX_ROWS, n + ROWS_STEP))}
        >
          + {ROWS_STEP} filas
        </button>
      )}
    </div>
  )
}

export default CalcSheet
