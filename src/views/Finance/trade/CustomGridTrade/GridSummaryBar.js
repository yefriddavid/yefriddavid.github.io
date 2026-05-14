import React from 'react'

const METRICS = (totals) => [
  { label: 'TOTAL INVERTIDO', value: totals.investedSum, color: '#60a5fa', alwaysPositive: true },
  { label: 'INTERESES PAGADOS', value: totals.loanSum, color: '#fbbf24', alwaysPositive: true },
  {
    label: 'PÉRDIDA NO REALIZADA',
    value: totals.grossSum,
    color: totals.grossSum >= 0 ? '#4ade80' : '#f87171',
  },
  {
    label: 'TOTAL (INTERESES + PÉRDIDA)',
    value: totals.total,
    color: totals.total >= 0 ? '#4ade80' : '#f87171',
    alwaysPositive: true,
  },
]

const GridSummaryBar = ({ totals }) => (
  <div
    style={{
      display: 'flex',
      gap: 10,
      padding: '10px 0 14px',
      justifyContent: 'center',
      flexWrap: 'wrap',
    }}
  >
    {METRICS(totals).map(({ label, value, color, alwaysPositive }) => (
      <div
        key={label}
        style={{
          background: '#161b22',
          border: `1px solid ${color}33`,
          borderRadius: 10,
          padding: '8px 20px',
          textAlign: 'center',
          minWidth: 180,
        }}
      >
        <div
          style={{
            fontSize: 9,
            color: '#8b949e',
            fontWeight: 700,
            letterSpacing: '0.07em',
            marginBottom: 4,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color,
            fontFamily: 'monospace',
            letterSpacing: '-0.01em',
          }}
        >
          {!alwaysPositive && value >= 0 ? '+' : ''}
          {alwaysPositive ? '' : value < 0 ? '-' : ''}${Math.abs(value).toFixed(2)}
        </div>
      </div>
    ))}
  </div>
)

export default GridSummaryBar
