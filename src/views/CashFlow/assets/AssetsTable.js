import React, { useState } from 'react'
import { fmt, fmtNum } from './assetHelpers'
import {
  TYPES,
  LOCATIONS,
  HORIZONS,
  TYPE_COLOR,
  HORIZON_COLOR,
  LIVE_PRICE_SYMBOLS,
  FIXED_SYMBOLS,
} from './assetConstants'
import IconClone from 'src/components/shared/IconClone'
import './AssetsTable.scss'

const AssetsTable = ({ data, groupByType, onEdit, onDelete, onClone, onQuickUpdate }) => {
  const [editingCell, setEditingCell] = useState(null) // { id, field }

  const totalValue = data.reduce((s, a) => s + a.valueCOP, 0)
  const totalMonthlyGain = data.reduce((s, a) => s + (Number(a.monthlyGain) || 0), 0)
  const totalQuantity = data.reduce((s, a) => s + (Number(a.quantity) || 0), 0)

  const groupCounts = {}
  const groupTotals = {}
  data.forEach((a) => {
    groupCounts[a.type] = (groupCounts[a.type] || 0) + 1
    groupTotals[a.type] = (groupTotals[a.type] || 0) + a.valueCOP
  })

  const isEditing = (id, field) => editingCell?.id === id && editingCell?.field === field
  const startEdit = (id, field) => setEditingCell({ id, field })
  const stopEdit = () => setEditingCell(null)

  let lastType = null

  return (
    <table className="assets-table">
      <thead>
        <tr>
          <th />
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Tipo</th>
          <th>Símbolo</th>
          <th>Cantidad</th>
          <th>Precio unit.</th>
          <th>Valor COP</th>
          <th>Líquido</th>
          <th>Horizonte</th>
          <th>Ubicación</th>
          <th>Ganancia/mes</th>
          <th>Proyección</th>
        </tr>
      </thead>
      <tbody>
        {data.map((a) => {
          const isNewGroup = groupByType && a.type !== lastType
          lastType = a.type
          return (
            <React.Fragment key={a.id}>
              {isNewGroup && (
                <tr className="assets-table__group-row">
                  <td colSpan={13}>
                    <span style={{ color: TYPE_COLOR[a.type] }}>{a.type}</span>
                    <span className="assets-table__group-meta">
                      {groupCounts[a.type]} · {fmt(groupTotals[a.type])}
                    </span>
                  </td>
                </tr>
              )}
              <tr className={a.archived ? 'assets-table__row--archived' : ''}>
                <td className="assets-table__actions">
                  <button onClick={() => onEdit(a)} title="Editar">
                    ✏️
                  </button>
                  <button onClick={() => onClone(a)} title="Clonar">
                    <IconClone />
                  </button>
                  <button
                    onClick={() => onQuickUpdate(a, { archived: !a.archived })}
                    title={a.archived ? 'Desarchivar' : 'Archivar'}
                  >
                    {a.archived ? '📤' : '📦'}
                  </button>
                  <button onClick={() => onDelete(a)} title="Eliminar">
                    🗑
                  </button>
                </td>
                <td
                  className={`assets-table__name ${isEditing(a.id, 'name') ? '' : 'assets-table__editable-cell'}`}
                  title="Doble clic para editar"
                  onDoubleClick={() => startEdit(a.id, 'name')}
                >
                  {isEditing(a.id, 'name') ? (
                    <input
                      className="assets-table__cell-input assets-table__cell-input--text"
                      type="text"
                      autoFocus
                      defaultValue={a.name}
                      onFocus={(e) => e.target.select()}
                      onBlur={(e) => {
                        const value = e.target.value.trim()
                        if (value && value !== a.name) onQuickUpdate(a, { name: value })
                        stopEdit()
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.target.blur()
                        if (e.key === 'Escape') stopEdit()
                      }}
                    />
                  ) : (
                    a.name
                  )}
                </td>
                <td
                  className={isEditing(a.id, 'description') ? '' : 'assets-table__editable-cell'}
                  title="Doble clic para editar"
                  onDoubleClick={() => startEdit(a.id, 'description')}
                >
                  {isEditing(a.id, 'description') ? (
                    <input
                      className="assets-table__cell-input assets-table__cell-input--text"
                      type="text"
                      autoFocus
                      defaultValue={a.description ?? ''}
                      onFocus={(e) => e.target.select()}
                      onBlur={(e) => {
                        const value = e.target.value.trim()
                        if (value !== (a.description ?? ''))
                          onQuickUpdate(a, { description: value })
                        stopEdit()
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.target.blur()
                        if (e.key === 'Escape') stopEdit()
                      }}
                    />
                  ) : (
                    a.description || '—'
                  )}
                </td>
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
                        if (a.type === 'fixed') {
                          onQuickUpdate(a, { liveSymbol: value })
                        } else {
                          onQuickUpdate(
                            a,
                            value ? { liveSymbol: value, type: 'crypto' } : { liveSymbol: '' },
                          )
                        }
                        stopEdit()
                      }}
                      onBlur={stopEdit}
                    >
                      <option value="">manual</option>
                      {(a.type === 'fixed' ? FIXED_SYMBOLS : LIVE_PRICE_SYMBOLS).map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  ) : a.liveSymbol ? (
                    <span className="assets-table__tag assets-table__live-dot">
                      {a.type === 'crypto'
                        ? `● ${a.liveSymbol.replace(/USDT$/, '')}`
                        : a.liveSymbol.toUpperCase()}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td
                  className={isEditing(a.id, 'quantity') ? '' : 'assets-table__editable-cell'}
                  title="Doble clic para editar"
                  onDoubleClick={() => startEdit(a.id, 'quantity')}
                >
                  {isEditing(a.id, 'quantity') ? (
                    <input
                      className="assets-table__cell-input"
                      type="number"
                      step="any"
                      autoFocus
                      defaultValue={a.quantity}
                      onFocus={(e) => e.target.select()}
                      onBlur={(e) => {
                        const value = Number(e.target.value)
                        if (!Number.isNaN(value) && value !== a.quantity)
                          onQuickUpdate(a, { quantity: value })
                        stopEdit()
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.target.blur()
                        if (e.key === 'Escape') stopEdit()
                      }}
                    />
                  ) : (
                    fmtNum(a.quantity)
                  )}
                </td>
                <td
                  className={
                    a.type === 'crypto' && a.liveSymbol
                      ? ''
                      : isEditing(a.id, 'unitPrice')
                        ? ''
                        : 'assets-table__editable-cell'
                  }
                  title={
                    a.type === 'crypto' && a.liveSymbol
                      ? 'Precio en vivo — no editable'
                      : 'Doble clic para editar'
                  }
                  onDoubleClick={() =>
                    !(a.type === 'crypto' && a.liveSymbol) && startEdit(a.id, 'unitPrice')
                  }
                >
                  {isEditing(a.id, 'unitPrice') ? (
                    <input
                      className="assets-table__cell-input"
                      type="number"
                      step="any"
                      autoFocus
                      defaultValue={a.unitPrice}
                      onFocus={(e) => e.target.select()}
                      onBlur={(e) => {
                        const value = Number(e.target.value)
                        if (!Number.isNaN(value) && value !== a.unitPrice)
                          onQuickUpdate(a, { unitPrice: value })
                        stopEdit()
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.target.blur()
                        if (e.key === 'Escape') stopEdit()
                      }}
                    />
                  ) : (
                    fmt(a.unitPrice)
                  )}
                </td>
                <td className="assets-table__value">{fmt(a.valueCOP)}</td>
                <td
                  className="assets-table__editable-cell"
                  title="Clic para cambiar"
                  onClick={() => onQuickUpdate(a, { liquid: !a.liquid })}
                >
                  {a.liquid ? '✓' : '—'}
                </td>
                <td
                  className={isEditing(a.id, 'horizon') ? '' : 'assets-table__editable-cell'}
                  title="Doble clic para editar"
                  onDoubleClick={() => startEdit(a.id, 'horizon')}
                >
                  {isEditing(a.id, 'horizon') ? (
                    <select
                      className="assets-table__cell-select"
                      autoFocus
                      defaultValue={a.horizon ?? ''}
                      onChange={(e) => {
                        onQuickUpdate(a, { horizon: e.target.value })
                        stopEdit()
                      }}
                      onBlur={stopEdit}
                    >
                      <option value="">—</option>
                      {HORIZONS.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  ) : a.horizon ? (
                    <span style={{ color: HORIZON_COLOR[a.horizon] }} className="assets-table__tag">
                      {a.horizon}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td
                  className={isEditing(a.id, 'location') ? '' : 'assets-table__editable-cell'}
                  title="Doble clic para editar"
                  onDoubleClick={() => startEdit(a.id, 'location')}
                >
                  {isEditing(a.id, 'location') ? (
                    <select
                      className="assets-table__cell-select"
                      autoFocus
                      defaultValue={a.location ?? ''}
                      onChange={(e) => {
                        onQuickUpdate(a, { location: e.target.value })
                        stopEdit()
                      }}
                      onBlur={stopEdit}
                    >
                      <option value="">—</option>
                      {LOCATIONS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  ) : (
                    a.location || '—'
                  )}
                </td>
                <td>{a.monthlyGain ? fmt(a.monthlyGain) : '—'}</td>
                <td
                  className="assets-table__editable-cell"
                  title="Clic para cambiar"
                  onClick={() => onQuickUpdate(a, { projection: !a.projection })}
                >
                  {a.projection ? '✓' : '—'}
                </td>
              </tr>
            </React.Fragment>
          )
        })}
      </tbody>
      <tfoot>
        <tr className="assets-table__total-row">
          <td />
          <td colSpan={4}>Total</td>
          <td>{fmtNum(totalQuantity)}</td>
          <td />
          <td className="assets-table__value">{fmt(totalValue)}</td>
          <td colSpan={3} />
          <td>{totalMonthlyGain ? fmt(totalMonthlyGain) : '—'}</td>
          <td />
        </tr>
      </tfoot>
    </table>
  )
}

export default AssetsTable
