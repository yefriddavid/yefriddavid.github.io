import React from 'react'
import GridChart from './GridChart'
import { fmtPrice, fmtUSD, fmtDate, calcLoanCost } from './utils'

export default function TradeDetail({ trade, onEdit, onDelete }) {
  const isActive = !trade.endDate
  const step = trade.gridCount > 0 ? (trade.upperPrice - trade.lowerPrice) / trade.gridCount : 0
  const investPerGrid = trade.gridCount > 0 ? trade.investment / trade.gridCount : 0

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
