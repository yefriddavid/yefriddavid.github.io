import React, { useState, useEffect, useCallback } from 'react'
import { CCard, CCardBody, CCardHeader } from '@coreui/react'

const STORAGE_KEY = 'salary-distribution-config'
const DEFAULT_CONFIG = {
  salary: 5000,
  invert: 2000,
  rows: [
    { id: 1, name: 'car', type: 'percent', value: 10 },
    { id: 2, name: 'col', type: 'percent', value: 20 },
    { id: 3, name: 'ocio', type: 'remainder', value: 0 },
  ],
}

function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_CONFIG
  } catch {
    return DEFAULT_CONFIG
  }
}

function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

const fmt = (n) =>
  Number(n).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

function computeDistribution(salary, invert, rows) {
  const base = salary - invert
  let remaining = base
  const results = []

  for (const row of rows) {
    if (row.type === 'percent') {
      const amount = Math.round(base * (row.value / 100))
      remaining -= amount
      results.push({ ...row, amount })
    } else if (row.type === 'value') {
      const amount = Number(row.value)
      remaining -= amount
      results.push({ ...row, amount })
    } else if (row.type === 'remainder') {
      results.push({ ...row, amount: remaining })
    }
  }

  // Keep original order
  return rows.map((r) => results.find((res) => res.id === r.id)).filter(Boolean)
}

let nextId = Date.now()

export default function SalaryDistribution() {
  const [config, setConfig] = useState(loadConfig)

  const { salary, invert, rows } = config

  useEffect(() => {
    saveConfig(config)
  }, [config])

  const update = useCallback((patch) => setConfig((c) => ({ ...c, ...patch })), [])

  const updateRow = useCallback(
    (id, patch) =>
      setConfig((c) => ({
        ...c,
        rows: c.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      })),
    [],
  )

  const addRow = useCallback(() => {
    const hasRemainder = config.rows.some((r) => r.type === 'remainder')
    setConfig((c) => ({
      ...c,
      rows: [
        ...c.rows,
        {
          id: ++nextId,
          name: '',
          type: hasRemainder ? 'value' : 'remainder',
          value: 0,
        },
      ],
    }))
  }, [config.rows])

  const removeRow = useCallback(
    (id) => setConfig((c) => ({ ...c, rows: c.rows.filter((r) => r.id !== id) })),
    [],
  )

  const moveRow = useCallback((id, dir) => {
    setConfig((c) => {
      const rows = [...c.rows]
      const idx = rows.findIndex((r) => r.id === id)
      const newIdx = idx + dir
      if (newIdx < 0 || newIdx >= rows.length) return c
      ;[rows[idx], rows[newIdx]] = [rows[newIdx], rows[idx]]
      return { ...c, rows }
    })
  }, [])

  const distribution = computeDistribution(salary, invert, rows)
  const base = salary - invert
  const totalPercent = rows.filter((r) => r.type === 'percent').reduce((s, r) => s + Number(r.value), 0)
  const hasRemainder = rows.some((r) => r.type === 'remainder')
  const overflowWarning = totalPercent > 100

  const inputStyle = {
    padding: '6px 10px',
    borderRadius: 6,
    border: '1px solid #ced4da',
    fontSize: 14,
    width: '100%',
    background: '#fff',
  }

  const labelStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: '#6c757d',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 4,
    display: 'block',
  }

  return (
    <div style={{ padding: 16, maxWidth: 720, margin: '0 auto' }}>
      <h5 style={{ fontWeight: 700, marginBottom: 16, color: '#1a1a2e' }}>Salary Distribution</h5>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {/* Salary */}
        <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 8, padding: 14 }}>
          <label style={labelStyle}>Salario</label>
          <input
            style={inputStyle}
            type="number"
            value={salary}
            onChange={(e) => update({ salary: Number(e.target.value) })}
          />
          <div style={{ marginTop: 6, fontSize: 20, fontWeight: 700, color: '#2f9e44', textAlign: 'right' }}>
            {fmt(salary)}
          </div>
        </div>

        {/* Invert */}
        <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 8, padding: 14 }}>
          <label style={labelStyle}>Inversión</label>
          <input
            style={inputStyle}
            type="number"
            value={invert}
            onChange={(e) => update({ invert: Number(e.target.value) })}
          />
          <div style={{ marginTop: 6, fontSize: 20, fontWeight: 700, color: '#7c3aed', textAlign: 'right' }}>
            {fmt(invert)}
          </div>
        </div>
      </div>

      {/* Distribution rows editor */}
      <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 8, marginBottom: 20 }}>
        <div
          style={{
            padding: '10px 14px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#495057' }}>
            Distribución del resto
          </span>
          <span style={{ fontSize: 12, color: overflowWarning ? '#e03131' : '#6c757d' }}>
            {overflowWarning ? `⚠ ${totalPercent}% (supera 100%)` : `${totalPercent}% asignado`}
          </span>
        </div>

        {/* Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 110px 90px 60px',
            gap: 8,
            padding: '8px 14px',
            background: '#f8f9fa',
            borderBottom: '1px solid #f1f5f9',
            fontSize: 11,
            fontWeight: 600,
            color: '#adb5bd',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <span>Nombre</span>
          <span>Tipo</span>
          <span>%</span>
          <span />
        </div>

        {rows.map((row, idx) => (
          <div
            key={row.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 110px 90px 60px',
              gap: 8,
              padding: '8px 14px',
              alignItems: 'center',
              borderBottom: idx < rows.length - 1 ? '1px solid #f8f9fa' : 'none',
              background: idx % 2 === 0 ? '#fff' : '#fafbfc',
            }}
          >
            <input
              style={{ ...inputStyle, padding: '4px 8px', fontSize: 13 }}
              type="text"
              value={row.name}
              placeholder="Nombre"
              onChange={(e) => updateRow(row.id, { name: e.target.value })}
            />
            <select
              style={{ ...inputStyle, padding: '4px 8px', fontSize: 13, cursor: 'pointer' }}
              value={row.type}
              onChange={(e) => updateRow(row.id, { type: e.target.value })}
            >
              <option value="percent">Porcentaje</option>
              <option value="value">Valor fijo</option>
              <option value="remainder">Restante</option>
            </select>
            {row.type === 'percent' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input
                  style={{ ...inputStyle, padding: '4px 8px', fontSize: 13 }}
                  type="number"
                  min={0}
                  max={100}
                  value={row.value}
                  onChange={(e) => updateRow(row.id, { value: Number(e.target.value) })}
                />
                <span style={{ fontSize: 13, color: '#6c757d' }}>%</span>
              </div>
            ) : row.type === 'value' ? (
              <input
                style={{ ...inputStyle, padding: '4px 8px', fontSize: 13 }}
                type="number"
                min={0}
                value={row.value}
                onChange={(e) => updateRow(row.id, { value: Number(e.target.value) })}
              />
            ) : (
              <span style={{ fontSize: 12, color: '#adb5bd', paddingLeft: 8 }}>auto</span>
            )}
            <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
              <button
                onClick={() => moveRow(row.id, -1)}
                disabled={idx === 0}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: idx === 0 ? 'default' : 'pointer',
                  color: idx === 0 ? '#dee2e6' : '#6c757d',
                  fontSize: 14,
                  padding: '2px 4px',
                }}
                title="Subir"
              >
                ↑
              </button>
              <button
                onClick={() => moveRow(row.id, 1)}
                disabled={idx === rows.length - 1}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: idx === rows.length - 1 ? 'default' : 'pointer',
                  color: idx === rows.length - 1 ? '#dee2e6' : '#6c757d',
                  fontSize: 14,
                  padding: '2px 4px',
                }}
                title="Bajar"
              >
                ↓
              </button>
              <button
                onClick={() => removeRow(row.id)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#e03131',
                  fontSize: 16,
                  padding: '2px 4px',
                  lineHeight: 1,
                }}
                title="Eliminar"
              >
                ×
              </button>
            </div>
          </div>
        ))}

        <div style={{ padding: '10px 14px' }}>
          <button
            onClick={addRow}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px dashed #ced4da',
              background: '#f8f9fa',
              cursor: 'pointer',
              color: '#495057',
            }}
          >
            + Agregar fila
          </button>
        </div>
      </div>

      {/* Result */}
      <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 8, overflow: 'hidden' }}>
        <div
          style={{
            padding: '10px 14px',
            background: '#1a1a2e',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Resultado
        </div>

        {/* Salary row */}
        <ResultRow label="Salario" amount={salary} color="#2f9e44" bg="#f0fff4" />
        <ResultRow label="Inversión" amount={-invert} color="#7c3aed" note={`(−${fmt(invert)})`} bg="#faf5ff" />

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 14px',
            background: '#f8f9fa',
            borderTop: '2px solid #1a1a2e',
            borderBottom: '2px solid #1a1a2e',
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          <span>Resto a distribuir</span>
          <span style={{ color: base < 0 ? '#e03131' : '#1a1a2e' }}>{fmt(base)}</span>
        </div>

        {/* Distribution rows */}
        {distribution.map((row, idx) => {
          const badge =
            row.type === 'percent' ? `${row.value}%` : row.type === 'value' ? fmt(row.value) : 'restante'
          return (
            <div
              key={row.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: 8,
                padding: '10px 14px',
                alignItems: 'center',
                background: idx % 2 === 0 ? '#fff' : '#fafbfc',
                borderBottom: idx < distribution.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}
            >
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>
                  {row.name || <span style={{ color: '#adb5bd', fontStyle: 'italic' }}>Sin nombre</span>}
                </span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 10,
                  background:
                    row.type === 'remainder' ? '#e9ecef' : row.type === 'value' ? '#fff3cd' : '#e8f4fd',
                  color:
                    row.type === 'remainder' ? '#6c757d' : row.type === 'value' ? '#856404' : '#0c63e4',
                }}
              >
                {badge}
              </span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: row.amount < 0 ? '#e03131' : '#1a1a2e',
                  minWidth: 100,
                  textAlign: 'right',
                }}
              >
                {fmt(row.amount)}
              </span>
            </div>
          )
        })}

        {!hasRemainder && (
          <div style={{ padding: '8px 14px', background: '#fff8e1', fontSize: 12, color: '#e67700' }}>
            Sin fila de tipo "Restante" — el sobrante no está asignado.
          </div>
        )}
      </div>

      <p style={{ marginTop: 12, fontSize: 11, color: '#adb5bd', textAlign: 'right' }}>
        Configuración guardada automáticamente en este navegador.
      </p>
    </div>
  )
}

function ResultRow({ label, amount, color, note, bg }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 14px',
        background: bg ?? '#fff',
        borderBottom: '1px solid #f1f5f9',
      }}
    >
      <span style={{ fontSize: 13, color: '#495057' }}>
        {label}
        {note && <span style={{ marginLeft: 6, fontSize: 11, color: '#adb5bd' }}>{note}</span>}
      </span>
      <span style={{ fontSize: 15, fontWeight: 700, color: color ?? '#1a1a2e' }}>
        {amount < 0 ? `−${fmt(Math.abs(amount))}` : fmt(amount)}
      </span>
    </div>
  )
}
