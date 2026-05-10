import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import * as actions from 'src/actions/cashflow/gridTradeActions'
import GridChart from './GridChart'
import { fmtPrice, fmtUSD, fmtDate, calcLoanCost } from './utils'

const today = () => new Date().toISOString().slice(0, 10)

export default function TradeDetail({ trade, onEdit, onDelete }) {
  const dispatch = useDispatch()
  const isActive = !trade.endDate
  const step = trade.gridCount > 0 ? (trade.upperPrice - trade.lowerPrice) / trade.gridCount : 0
  const investPerGrid = trade.gridCount > 0 ? trade.investment / trade.gridCount : 0

  const [newItem, setNewItem] = useState({ value: '', date: today(), type: 'buy' })
  const [showForm, setShowForm] = useState(false)

  const items = trade.items ?? []

  const handleAddItem = () => {
    const value = Number(newItem.value)
    if (!value || !newItem.date) return
    const item = { id: Date.now().toString(), value, date: newItem.date, type: newItem.type }
    dispatch(actions.saveRequest({ ...trade, items: [...items, item] }))
    setNewItem({ value: '', date: today(), type: 'buy' })
    setShowForm(false)
  }

  const handleDeleteItem = (id) => {
    dispatch(actions.saveRequest({ ...trade, items: items.filter((it) => it.id !== id) }))
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: '20px 22px 24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        border: '1px solid #e9ecef',
        position: 'sticky',
        top: 76,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16,
        }}
      >
        <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 7,
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 800, color: '#0d1117' }}>{trade.asset}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 9px',
                borderRadius: 20,
                background: '#f1f3f5',
                color: '#495057',
              }}
            >
              {trade.platform}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 9px',
                borderRadius: 20,
                background: trade.gridType === 'short' ? '#fff0f0' : '#e8f5e9',
                color: trade.gridType === 'short' ? '#c62828' : '#2e7d32',
              }}
            >
              {trade.gridType === 'short' ? '📉 SHORT' : '📈 LONG'}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 9px',
                borderRadius: 20,
                background: isActive ? '#d3f9d8' : '#f1f3f5',
                color: isActive ? '#2f9e44' : '#868e96',
              }}
            >
              {isActive ? 'ACTIVO' : 'CERRADO'}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#868e96' }}>
            {fmtDate(trade.startDate)}
            {trade.endDate ? ` → ${fmtDate(trade.endDate)}` : ' → hoy'}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0d1117' }}>
            {fmtUSD(trade.investment)}
          </div>
          <div style={{ fontSize: 12, color: '#868e96' }}>{trade.gridCount} grids</div>
        </div>
      </div>

      {/* Chart */}
      <GridChart
        centerPrice={trade.centerPrice}
        upperPrice={trade.upperPrice}
        lowerPrice={trade.lowerPrice}
        gridCount={trade.gridCount}
        investment={trade.investment}
        gridType={trade.gridType}
        items={items}
      />

      {/* Stats 3-column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 14 }}>
        {[
          { label: 'Precio central', value: fmtPrice(trade.centerPrice) },
          { label: 'Paso / grid', value: fmtPrice(step) },
          { label: 'Inv / grid', value: fmtUSD(investPerGrid) },
          { label: 'Mínimo', value: fmtPrice(trade.lowerPrice) },
          { label: 'Máximo', value: fmtPrice(trade.upperPrice) },
          { label: 'Niveles', value: String(Number(trade.gridCount) + 1) },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: '#f8f9fa', borderRadius: 8, padding: '8px 10px' }}>
            <div style={{ fontSize: 9, color: '#adb5bd', fontWeight: 700, marginBottom: 2 }}>
              {label.toUpperCase()}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#343a40' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Loan cost */}
      {(() => {
        const loan = calcLoanCost(trade)
        if (!loan) return null
        return (
          <div
            style={{
              marginTop: 12,
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 10,
              padding: '10px 14px',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: '#b45309', marginBottom: 4 }}>
              COSTO DEL PRÉSTAMO
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#92400e' }}>
              {fmtUSD(loan.cost)}
            </div>
            <div style={{ fontSize: 12, color: '#b45309', marginTop: 2 }}>
              {loan.rate}% anual · {loan.days} días desde inicio del préstamo
            </div>
          </div>
        )
      })()}

      {trade.notes && (
        <div style={{ marginTop: 10, fontSize: 12, color: '#adb5bd', fontStyle: 'italic' }}>
          {trade.notes}
        </div>
      )}

      {/* Trade items */}
      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#868e96', letterSpacing: '0.06em' }}>
            OPERACIONES ({items.length})
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            style={{ fontSize: 12, fontWeight: 700, color: '#0d1117', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
          >
            {showForm ? '✕' : '+ Agregar'}
          </button>
        </div>

        {showForm && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <input
              type="number"
              placeholder="Precio"
              value={newItem.value}
              onChange={(e) => setNewItem((p) => ({ ...p, value: e.target.value }))}
              style={{ flex: '1 1 90px', minWidth: 80, border: 'none', borderBottom: '2px solid #dee2e6', outline: 'none', fontSize: 14, padding: '4px 0', background: 'transparent' }}
            />
            <input
              type="date"
              value={newItem.date}
              onChange={(e) => setNewItem((p) => ({ ...p, date: e.target.value }))}
              style={{ flex: '1 1 120px', minWidth: 110, border: 'none', borderBottom: '2px solid #dee2e6', outline: 'none', fontSize: 14, padding: '4px 0', background: 'transparent' }}
            />
            <select
              value={newItem.type}
              onChange={(e) => setNewItem((p) => ({ ...p, type: e.target.value }))}
              style={{ border: 'none', borderBottom: '2px solid #dee2e6', outline: 'none', fontSize: 14, padding: '4px 0', background: 'transparent', cursor: 'pointer' }}
            >
              <option value="buy">Compra</option>
              <option value="sell">Venta</option>
            </select>
            <button
              onClick={handleAddItem}
              style={{ minHeight: 32, padding: '4px 14px', borderRadius: 8, border: 'none', background: '#0d1117', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              OK
            </button>
          </div>
        )}

        {items.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[...items].sort((a, b) => b.date.localeCompare(a.date)).map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 8px', borderRadius: 8, background: item.type === 'buy' ? '#f0fdf4' : '#fff5f5' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: item.type === 'buy' ? '#2f9e44' : '#e03131' }}>
                    {item.type === 'buy' ? '▲ COMPRA' : '▼ VENTA'}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0d1117' }}>{fmtPrice(item.value)}</span>
                  <span style={{ fontSize: 11, color: '#868e96' }}>{fmtDate(item.date)}</span>
                </div>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  style={{ background: 'none', border: 'none', color: '#dee2e6', cursor: 'pointer', fontSize: 14, padding: '0 4px' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button
          onClick={() => onEdit(trade)}
          style={{
            flex: 1,
            minHeight: 44,
            padding: '10px',
            borderRadius: 10,
            border: 'none',
            background: '#eef4ff',
            color: '#1e3a5f',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(trade)}
          style={{
            minHeight: 44,
            padding: '10px 20px',
            borderRadius: 10,
            border: 'none',
            background: '#fff5f5',
            color: '#e03131',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}
