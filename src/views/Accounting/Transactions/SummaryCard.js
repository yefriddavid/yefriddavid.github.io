import React from 'react'

export default function SummaryCard({ label, value, color, bg, sub }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 160,
        background: bg,
        border: `1px solid ${color}33`,
        borderRadius: 10,
        padding: '14px 20px',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color, opacity: 0.75, marginTop: 2 }}>{sub}</div>}
    </div>
  )
}
