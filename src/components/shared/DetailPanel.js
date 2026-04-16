import React from 'react'

export const DetailRow = ({ label, value, mono }) =>
  value != null && value !== '' ? (
    <div
      style={{
        display: 'flex',
        gap: 8,
        padding: '5px 0',
        borderBottom: '1px solid var(--cui-border-color, #e8e8e8)',
      }}
    >
      <span
        style={{
          minWidth: 150,
          fontSize: 12,
          color: 'var(--cui-secondary-color, #6c757d)',
          fontWeight: 500,
        }}
      >
        {label}
      </span>
      <span
        style={{ fontSize: 12, fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}
      >
        {value}
      </span>
    </div>
  ) : null

export const DetailSection = ({ title, children }) => (
  <div>
    <p
      style={{
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 1,
        color: 'var(--cui-secondary-color, #6c757d)',
        margin: '0 0 6px',
      }}
    >
      {title}
    </p>
    {children}
  </div>
)

// columns: number of side-by-side sections (default 1)
const DetailPanel = ({ children, columns = 1 }) => (
  <div
    style={{
      margin: '0 8px 12px 32px',
      background: 'var(--cui-card-bg, #fff)',
      border: '1px solid var(--cui-border-color, #dee2e6)',
      borderRadius: 10,
      padding: '16px 20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    }}
  >
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '0 32px',
      }}
    >
      {children}
    </div>
  </div>
)

export default DetailPanel
