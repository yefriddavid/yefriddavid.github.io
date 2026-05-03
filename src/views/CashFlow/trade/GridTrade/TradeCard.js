import React from 'react'
import GridChart from './GridChart'
import { fmtPrice, fmtUSD, fmtDate, calcLoanCost } from './utils'

export default function TradeCard({
  trade,
  onEdit,
  onClone,
  onDelete,
  expanded,
  onToggle,
  desktop = false,
  isSelected = false,
  onSelect,
}) {
  const isActive = !trade.endDate
  const step = trade.gridCount > 0 ? (trade.upperPrice - trade.lowerPrice) / trade.gridCount : 0
  const investPerGrid = trade.gridCount > 0 ? trade.investment / trade.gridCount : 0

  return (
    <div
      onClick={desktop ? onSelect : undefined}
      style={{
        background: isSelected ? '#f8f9fa' : '#fff',
        borderRadius: 14,
        marginBottom: 10,
        boxShadow: isSelected ? '0 2px 12px rgba(0,0,0,0.12)' : '0 1px 6px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        border: isSelected ? '2px solid #0d1117' : '1px solid #e9ecef',
        cursor: desktop ? 'pointer' : 'default',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      <div style={{ padding: '14px 14px 12px' }}>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 6,
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 17, fontWeight: 800, color: '#0d1117' }}>{trade.asset}</span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 20,
                  background: '#f1f3f5',
                  color: '#495057',
                  whiteSpace: 'nowrap',
                }}
              >
                {trade.platform}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 20,
                  background: trade.gridType === 'short' ? '#fff0f0' : '#e8f5e9',
                  color: trade.gridType === 'short' ? '#c62828' : '#2e7d32',
                  whiteSpace: 'nowrap',
                }}
              >
                {trade.gridType === 'short' ? '📉 SHORT' : '📈 LONG'}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 20,
                  background: isActive ? '#d3f9d8' : '#f1f3f5',
                  color: isActive ? '#2f9e44' : '#868e96',
                  whiteSpace: 'nowrap',
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
            <div style={{ fontSize: 17, fontWeight: 800, color: '#0d1117' }}>
              {fmtUSD(trade.investment)}
            </div>
            <div style={{ fontSize: 11, color: '#868e96' }}>{trade.gridCount} grids</div>
          </div>
        </div>

        {/* Stats 2×2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 10 }}>
          {[
            { label: 'Precio central', value: fmtPrice(trade.centerPrice) },
            { label: 'Paso / grid', value: fmtPrice(step) },
            { label: 'Mínimo', value: fmtPrice(trade.lowerPrice) },
            { label: 'Máximo', value: fmtPrice(trade.upperPrice) },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: '#f8f9fa', borderRadius: 8, padding: '6px 8px' }}>
              <div style={{ fontSize: 9, color: '#adb5bd', fontWeight: 700, marginBottom: 2 }}>
                {label.toUpperCase()}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#343a40' }}>{value}</div>
            </div>
          ))}
        </div>

        {investPerGrid > 0 && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#868e96' }}>
            {fmtUSD(investPerGrid)} / grid
          </div>
        )}

        {/* Loan cost */}
        {(() => {
          const loan = calcLoanCost(trade)
          if (!loan) return null
          return (
            <div
              style={{
                marginTop: 8,
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 8,
                padding: '7px 10px',
                fontSize: 12,
                color: '#92400e',
              }}
            >
              <span style={{ fontWeight: 700 }}>💸 Costo préstamo: {fmtUSD(loan.cost)}</span>
              <span style={{ color: '#b45309', marginLeft: 6 }}>
                ({loan.rate}% anual · {loan.days} días)
              </span>
            </div>
          )
        })()}

        {trade.notes && (
          <div style={{ marginTop: 5, fontSize: 12, color: '#adb5bd', fontStyle: 'italic' }}>
            {trade.notes}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {!desktop && (
            <button
              onClick={onToggle}
              style={{
                flex: 1,
                minHeight: 44,
                padding: '10px 8px',
                borderRadius: 10,
                border: '1px solid #dee2e6',
                background: expanded ? '#0d1117' : '#fff',
                color: expanded ? '#fbbf24' : '#495057',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                touchAction: 'manipulation',
              }}
            >
              {expanded ? 'Ocultar grid' : 'Ver grid'}
            </button>
          )}
          <button
            onClick={(e) => {
              if (desktop) e.stopPropagation()
              onEdit(trade)
            }}
            style={{
              flex: desktop ? 1 : undefined,
              minHeight: 44,
              padding: '10px 16px',
              borderRadius: 10,
              border: 'none',
              background: '#eef4ff',
              color: '#1e3a5f',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            Editar
          </button>
          <button
            onClick={(e) => {
              if (desktop) e.stopPropagation()
              onClone(trade)
            }}
            style={{
              minHeight: 44,
              padding: '10px 14px',
              borderRadius: 10,
              border: 'none',
              background: '#f8f9fa',
              color: '#495057',
              fontSize: 15,
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
            title="Clonar"
          >
            ⧉
          </button>
          <button
            onClick={(e) => {
              if (desktop) e.stopPropagation()
              onDelete(trade)
            }}
            style={{
              minHeight: 44,
              padding: '10px 14px',
              borderRadius: 10,
              border: 'none',
              background: '#fff5f5',
              color: '#e03131',
              fontSize: 16,
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Expanded chart — mobile only */}
      {!desktop && expanded && (
        <div style={{ padding: '0 12px 14px' }}>
          <GridChart
            centerPrice={trade.centerPrice}
            upperPrice={trade.upperPrice}
            lowerPrice={trade.lowerPrice}
            gridCount={trade.gridCount}
            investment={trade.investment}
            gridType={trade.gridType}
          />
        </div>
      )}
    </div>
  )
}
