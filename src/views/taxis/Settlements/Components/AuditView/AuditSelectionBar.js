import React from 'react'
import { fmt } from '../utils'

const OPERATIONS = [
  { value: 'sum', label: 'Suma' },
  { value: 'max', label: 'Máximo' },
  { value: 'min', label: 'Mínimo' },
  { value: 'avg', label: 'Promedio' },
]

const aggregate = (values, operation) => {
  if (values.length === 0) return 0
  switch (operation) {
    case 'max':
      return Math.max(...values)
    case 'min':
      return Math.min(...values)
    case 'avg':
      return values.reduce((s, v) => s + v, 0) / values.length
    default:
      return values.reduce((s, v) => s + v, 0)
  }
}

const AuditSelectionBar = ({
  auditFilteredDays,
  selectedAuditRows,
  getDayTotals,
  auditSummaryOperation,
  setAuditSummaryOperation,
  clearAuditRowSelection,
  net,
  pendingTotal,
}) => {
  if (selectedAuditRows.size === 0) return null

  const totals = auditFilteredDays
    .filter((day) => selectedAuditRows.has(day.d))
    .map((day) => getDayTotals(day))

  const realResult = aggregate(
    totals.map((t) => t.real),
    auditSummaryOperation,
  )
  const idealResult = aggregate(
    totals.map((t) => t.ideal),
    auditSummaryOperation,
  )
  const netPlusItems = net + idealResult
  const netPlusItemsPlusPending = netPlusItems + pendingTotal

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1100,
        background: '#1e3a5f',
        color: '#fff',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        flexWrap: 'wrap',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.15)',
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>
        {selectedAuditRows.size} liquidación{selectedAuditRows.size === 1 ? '' : 'es'} seleccionada
        {selectedAuditRows.size === 1 ? '' : 's'}
      </span>

      <select
        value={auditSummaryOperation}
        onChange={(e) => setAuditSummaryOperation(e.target.value)}
        style={{
          fontSize: 12,
          padding: '4px 10px',
          borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.3)',
          background: '#fff',
          color: '#1e3a5f',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {OPERATIONS.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>

      <span style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Real: </span>
        {fmt(realResult)}
      </span>

      <span style={{ fontSize: 13, fontWeight: 700, color: '#d8b4fe', whiteSpace: 'nowrap' }}>
        <span style={{ color: 'rgba(216,180,254,0.7)', fontWeight: 500 }}>Esperado: </span>
        {fmt(idealResult)}
      </span>

      <span style={{ fontSize: 13, fontWeight: 700, color: '#74c0fc', whiteSpace: 'nowrap' }}>
        <span style={{ color: 'rgba(116,192,252,0.7)', fontWeight: 500 }}>Net + items: </span>
        {fmt(netPlusItems)}
      </span>

      <span style={{ fontSize: 13, fontWeight: 700, color: '#ffd43b', whiteSpace: 'nowrap' }}>
        <span style={{ color: 'rgba(255,212,59,0.7)', fontWeight: 500 }}>
          Net + items + pending drivers:{' '}
        </span>
        {fmt(netPlusItemsPlusPending)}
      </span>

      <button
        onClick={clearAuditRowSelection}
        style={{
          fontSize: 11,
          padding: '4px 10px',
          borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.3)',
          background: 'none',
          color: '#fff',
          cursor: 'pointer',
          marginLeft: 'auto',
        }}
        title="Limpiar selección"
      >
        ✕ Limpiar
      </button>
    </div>
  )
}

export default AuditSelectionBar
