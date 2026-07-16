import React, { useState } from 'react'
import { fmt, fmtNum } from './assetHelpers'
import { TYPES, TYPE_COLOR, HORIZON_COLOR, LIVE_PRICE_SYMBOLS } from './assetConstants'
import './AssetsTable.scss'

const AssetsTable = ({ data, onEdit, onDelete, onQuickUpdate }) => {
  const [editingCell, setEditingCell] = useState(null) // { id, field }

  const totalValue = data.reduce((s, a) => s + a.valueCOP, 0)
  const totalMonthlyGain = data.reduce((s, a) => s + (Number(a.monthlyGain) || 0), 0)

  const isEditing = (id, field) => editingCell?.id === id && editingCell?.field === field
  const startEdit = (id, field) => setEditingCell({ id, field })
  const stopEdit = () => setEditingCell(null)

  return (
    <table className="assets-table">
      <thead>
        <tr>
          <th />
          <th>Nombre</th>
          <th>Tipo</th>
          <th>Símbolo</th>
          <th>Cantidad</th>
          <th>Precio unit.</th>
          <th>Valor COP</th>
          <th>Líquido</th>
          <th>Horizonte</th>
          <th>Ganancia/mes</th>
          <th>Proyección</th>
        </tr>
      </thead>
      <tbody>
        {data.map((a) => (
          <tr key={a.id} className={a.archived ? 'assets-table__row--archived' : ''}>
            <td className="assets-table__actions">
              <button onClick={() => onEdit(a)} title="Editar">
                ✏️
              </button>
              <button onClick={() => onDelete(a)} title="Eliminar">
                🗑
              </button>
            </td>
            <td className="assets-table__name">{a.name}</td>
            <td
              className={isEditing(a.id, 'type') ? '' : 'assets-table__editable-cell'}
              title="Doble clic para editar"
              onDoubleClick={() => startEdit(a.id, 'type')}
            >
              {isEditing(a.id, 'type') ? (
                <select
                  className="assets-table__cell-select"
                  autoFocus
                  defaultValue={a.type}
                  onChange={(e) => {
                    onQuickUpdate(a, { type: e.target.value })
                    stopEdit()
                  }}
                  onBlur={stopEdit}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              ) : (
                <span style={{ color: TYPE_COLOR[a.type] }} className="assets-table__tag">
                  {a.type}
                </span>
              )}
            </td>
            <td
              className={isEditing(a.id, 'liveSymbol') ? '' : 'assets-table__editable-cell'}
              title="Doble clic para editar"
              onDoubleClick={() => startEdit(a.id, 'liveSymbol')}
            >
              {isEditing(a.id, 'liveSymbol') ? (
                <select
                  className="assets-table__cell-select"
                  autoFocus
                  defaultValue={a.liveSymbol ?? ''}
                  onChange={(e) => {
                    const value = e.target.value
                    onQuickUpdate(
                      a,
                      value ? { liveSymbol: value, type: 'crypto' } : { liveSymbol: '' },
                    )
                    stopEdit()
                  }}
                  onBlur={stopEdit}
                >
                  <option value="">manual</option>
                  {LIVE_PRICE_SYMBOLS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              ) : a.liveSymbol ? (
                <span className="assets-table__tag assets-table__live-dot">
                  ● {a.liveSymbol.replace(/USDT$/, '')}
                </span>
              ) : (
                '—'
              )}
            </td>
            <td>{fmtNum(a.quantity, 1)}</td>
            <td>{fmt(a.unitPrice)}</td>
            <td className="assets-table__value">{fmt(a.valueCOP)}</td>
            <td>{a.liquid ? '✓' : '—'}</td>
            <td>
              {a.horizon && (
                <span style={{ color: HORIZON_COLOR[a.horizon] }} className="assets-table__tag">
                  {a.horizon}
                </span>
              )}
            </td>
            <td>{a.monthlyGain ? fmt(a.monthlyGain) : '—'}</td>
            <td>{a.projection ? '✓' : '—'}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="assets-table__total-row">
          <td />
          <td colSpan={5}>Total</td>
          <td className="assets-table__value">{fmt(totalValue)}</td>
          <td colSpan={2} />
          <td>{totalMonthlyGain ? fmt(totalMonthlyGain) : '—'}</td>
          <td />
        </tr>
      </tfoot>
    </table>
  )
}

export default AssetsTable
