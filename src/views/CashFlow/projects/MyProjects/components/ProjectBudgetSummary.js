import React from 'react'
import { fmt } from '../helpers'

export default function ProjectBudgetSummary({ total, paid, goal, remaining, paidOverrun, hasItems }) {
  if (remaining === null) return null

  return (
    <div
      style={{
        borderTop: hasItems ? 'none' : '1px solid #f1f5f9',
        paddingTop: hasItems ? 0 : 8,
        marginBottom: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          padding: '8px 10px',
          borderRadius: 10,
          background: paidOverrun > 0 ? '#fff5f5' : remaining <= 0 ? '#f0fdf4' : '#fff8e1',
          border: `1px solid ${paidOverrun > 0 ? '#ffa8a8' : remaining <= 0 ? '#86efac' : '#ffe066'}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#6c757d', fontWeight: 600 }}>Proyectado</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{fmt(total)}</span>
        </div>
        {paid > 0 && (
          <div
            style={{
              borderTop: '1px solid rgba(0,0,0,0.07)',
              paddingTop: 6,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: paidOverrun > 0 ? '#e03131' : '#2f9e44' }}>
              ✅ Efectuado
            </span>
            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: paidOverrun > 0 ? '#e03131' : '#2f9e44',
                  display: 'block',
                }}
              >
                {fmt(paid)}
              </span>
              {paidOverrun > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, color: '#e03131' }}>
                  +{fmt(paidOverrun)} sobre presupuesto
                </span>
              )}
            </div>
          </div>
        )}
        <div
          style={{
            borderTop: '1px solid rgba(0,0,0,0.07)',
            paddingTop: 6,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: remaining <= 0 ? '#2f9e44' : '#e67700' }}>
            {remaining <= 0 ? '✅ Meta alcanzada' : '⏳ Falta'}
          </span>
          <span style={{ fontSize: 15, fontWeight: 800, color: remaining <= 0 ? '#2f9e44' : '#e67700' }}>
            {remaining <= 0 ? fmt(0) : fmt(remaining)}
          </span>
        </div>
      </div>
    </div>
  )
}
