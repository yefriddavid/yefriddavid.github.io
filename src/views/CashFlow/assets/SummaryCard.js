import React from 'react'

export default function SummaryCard({ label, value, sub, color = '#1a1a2e', bg = '#f8f9fa', border = '#e9ecef', wide = false }) {
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 12,
        padding: '10px 14px',
        gridColumn: wide ? '1 / -1' : undefined,
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, color: '#adb5bd', letterSpacing: '0.05em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 16, fontWeight: 800, color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#6c757d', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}
