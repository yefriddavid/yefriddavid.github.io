import React, { useState } from 'react'
import './EditableTable.scss'

/**
 * columns: Array<{
 *   key: string,
 *   label: string,
 *   type: 'text' | 'number' | 'calc' | 'select',
 *   calc?: (row) => number,                        // required when type === 'calc'
 *   options?: Array<{ value: string, label: string }>, // required when type === 'select'
 *   width?: number | string,
 *   align?: 'left' | 'right',    // default: 'left' for text/select, 'right' for number/calc
 *   format?: (value) => string,  // optional display formatter
 * }>
 */
function BudgetRow({ columns, totalColumn, budget, onBudgetChange }) {
  const [editing, setEditing] = useState(false)
  const totalCol = columns.find((c) => c.key === totalColumn)

  return (
    <tr className="editable-table__budget-row">
      {columns.map((col, i) => (
        <td key={col.key} className={col.key === totalColumn ? 'editable-table__td--calc' : ''}>
          {i === 0 ? (
            <span className="editable-table__total-label">Presupuesto</span>
          ) : col.key === totalColumn ? (
            editing ? (
              <input
                className="editable-table__budget-input"
                type="number"
                defaultValue={budget ?? ''}
                placeholder="0"
                autoFocus
                onBlur={(e) => {
                  const val = parseFloat(e.target.value)
                  onBudgetChange(isNaN(val) ? 0 : val)
                  setEditing(false)
                }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') e.target.blur() }}
              />
            ) : (
              <span
                className="editable-table__budget-display"
                onClick={() => setEditing(true)}
                title="Click para editar"
              >
                {budget != null && budget !== 0
                  ? (totalCol?.format ? totalCol.format(budget) : budget)
                  : <span className="editable-table__budget-placeholder">Click para definir</span>}
              </span>
            )
          ) : null}
        </td>
      ))}
      <td />
    </tr>
  )
}

export default function EditableTable({
  columns = [],
  rows = [],
  keyExpr = 'id',
  onRowChange,
  onRowAdd,
  onRowDelete,
  onRowNote,
  totalColumn,
  budget,
  onBudgetChange,
  emptyText = 'No hay filas.',
}) {
  const calcTotalValue = (row) => {
    if (!totalColumn) return null
    const col = columns.find((c) => c.key === totalColumn)
    return col?.calc ? col.calc(row) : null
  }

  const grandTotal =
    totalColumn != null ? rows.reduce((sum, r) => sum + (calcTotalValue(r) ?? 0), 0) : null

  const displayValue = (col, row) => {
    const raw = col.type === 'calc' ? col.calc(row) : row[col.key]
    return col.format ? col.format(raw) : raw
  }

  const alignClass = (col) => {
    if (col.align) return col.align === 'right' ? '--right' : ''
    return col.type === 'number' || col.type === 'calc' ? '--right' : ''
  }

  return (
    <div className="editable-table">
      <div className="editable-table__scroll-wrap">
      <table className="editable-table__table">
        <thead className="editable-table__thead">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={[
                  'editable-table__th',
                  alignClass(col) ? `editable-table__th${alignClass(col)}` : '',
                  col.type === 'calc' ? 'editable-table__th--total' : '',
                ].filter(Boolean).join(' ')}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
            <th className="editable-table__th editable-table__th--actions" />
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + 1} className="editable-table__empty">
                {emptyText}
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr key={row[keyExpr]} className="editable-table__tr">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`editable-table__td${col.type === 'calc' ? ' editable-table__td--calc' : ''}`}
                  data-label={col.label}
                >
                  {col.type === 'calc' ? (
                    <span className="editable-table__calc-cell">
                      {displayValue(col, row) ?? '—'}
                    </span>
                  ) : col.type === 'select' ? (
                    <select
                      className="editable-table__select"
                      value={row[col.key] ?? col.options?.[0]?.value ?? ''}
                      onChange={(e) => onRowChange?.(row[keyExpr], col.key, e.target.value)}
                    >
                      {col.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className={`editable-table__input${alignClass(col) ? ` editable-table__input${alignClass(col)}` : ''}`}
                      type={col.type === 'number' ? 'number' : 'text'}
                      value={row[col.key] ?? ''}
                      onChange={(e) =>
                        onRowChange?.(
                          row[keyExpr],
                          col.key,
                          col.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value,
                        )
                      }
                    />
                  )}
                </td>
              ))}
              <td className="editable-table__td editable-table__td--actions">
                {onRowNote && (
                  <button
                    className={`editable-table__note-btn${row.note ? ' editable-table__note-btn--active' : ''}`}
                    onClick={() => onRowNote(row[keyExpr])}
                    title={row.note || 'Agregar nota'}
                  >
                    ✎
                  </button>
                )}
                <button
                  className="editable-table__delete-btn"
                  onClick={() => onRowDelete?.(row[keyExpr])}
                  title="Eliminar"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        {grandTotal != null && (
          <tfoot className="editable-table__footer">
            <tr>
              {columns.map((col, i) => (
                <td key={col.key} className={col.key === totalColumn ? 'editable-table__td--calc' : ''}>
                  {i === 0 ? (
                    <span className="editable-table__total-label">Total</span>
                  ) : col.key === totalColumn ? (
                    <span className="editable-table__total-value">
                      {columns.find((c) => c.key === totalColumn)?.format
                        ? columns.find((c) => c.key === totalColumn).format(grandTotal)
                        : grandTotal}
                    </span>
                  ) : null}
                </td>
              ))}
              <td />
            </tr>
            {onBudgetChange != null && (
              <BudgetRow
                columns={columns}
                totalColumn={totalColumn}
                budget={budget}
                onBudgetChange={onBudgetChange}
              />
            )}
          </tfoot>
        )}
      </table>
      </div>
      {onRowAdd && (
        <button className="editable-table__add-row" onClick={onRowAdd}>
          + Add row
        </button>
      )}
    </div>
  )
}
