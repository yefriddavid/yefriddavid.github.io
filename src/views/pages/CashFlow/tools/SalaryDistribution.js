import React, { useEffect, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as actions from 'src/actions/CashFlow/salaryDistributionActions'

const fmt = (n) =>
  Number(n).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

const uid = () => crypto.randomUUID()

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

  return rows.map((r) => results.find((res) => res.id === r.id)).filter(Boolean)
}

let nextId = Date.now()

export default function SalaryDistribution() {
  const dispatch = useDispatch()
  const { data: distributions, fetching, saving, syncing, importing } = useSelector((s) => s.salaryDistribution)
  const [activeId, setActiveId] = useState(null)
  const [editingTabId, setEditingTabId] = useState(null)
  const [editingTabName, setEditingTabName] = useState('')
  const [dragRowId, setDragRowId] = useState(null)
  const [dragOverRowId, setDragOverRowId] = useState(null)
  const [dirty, setDirty] = useState(false)

  // Load on mount
  useEffect(() => {
    dispatch(actions.fetchRequest())
  }, [dispatch])

  // Set first active when data loads
  useEffect(() => {
    if (distributions?.length && !activeId) {
      setActiveId(distributions[0].id)
    }
  }, [distributions, activeId])

  const activeConfig = distributions?.find((d) => d.id === activeId) ?? distributions?.[0]

  const saveLocal = useCallback(() => {
    if (!distributions) return
    dispatch(actions.saveRequest(distributions))
    setDirty(false)
  }, [dispatch, distributions])

  const patchActive = useCallback(
    (patch) => {
      if (!activeConfig) return
      const newDists = distributions.map((d) => (d.id === activeConfig.id ? { ...d, ...patch } : d))
      dispatch(actions.successRequestSave(newDists))
      setDirty(true)
    },
    [distributions, activeConfig, dispatch],
  )

  const update = useCallback((patch) => patchActive(patch), [patchActive])

  const updateRow = useCallback(
    (id, patch) => {
      if (!activeConfig) return
      patchActive({ rows: activeConfig.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)) })
    },
    [activeConfig, patchActive],
  )

  const addRow = useCallback(() => {
    if (!activeConfig) return
    const hasRemainder = activeConfig.rows.some((r) => r.type === 'remainder')
    patchActive({
      rows: [...activeConfig.rows, { id: ++nextId, name: '', type: hasRemainder ? 'value' : 'remainder', value: 0 }],
    })
  }, [activeConfig, patchActive])

  const removeRow = useCallback(
    (id) => {
      if (!activeConfig) return
      patchActive({ rows: activeConfig.rows.filter((r) => r.id !== id) })
    },
    [activeConfig, patchActive],
  )

  const reorderRows = useCallback(
    (fromId, toId) => {
      if (!activeConfig || fromId === toId) return
      const rows = [...activeConfig.rows]
      const fromIdx = rows.findIndex((r) => r.id === fromId)
      const toIdx = rows.findIndex((r) => r.id === toId)
      const [item] = rows.splice(fromIdx, 1)
      rows.splice(toIdx, 0, item)
      patchActive({ rows })
    },
    [activeConfig, patchActive],
  )

  const addDistribution = useCallback(() => {
    const newDist = {
      id: uid(),
      name: 'Nueva',
      salary: 0,
      invert: 0,
      invertTarget: '',
      rows: [{ id: ++nextId, name: '', type: 'remainder', value: 0 }],
    }
    const newDists = [...(distributions ?? []), newDist]
    dispatch(actions.successRequestSave(newDists))
    setDirty(true)
    setActiveId(newDist.id)
  }, [distributions, dispatch])

  const removeDistribution = useCallback(
    (id) => {
      if (!distributions || distributions.length <= 1) return
      const newDists = distributions.filter((d) => d.id !== id)
      dispatch(actions.successRequestSave(newDists))
      setDirty(true)
      if (activeId === id) setActiveId(newDists[0].id)
    },
    [distributions, activeId, dispatch],
  )

  const commitTabRename = useCallback(
    (id) => {
      const trimmed = editingTabName.trim()
      if (trimmed) {
        const newDists = distributions.map((d) => (d.id === id ? { ...d, name: trimmed } : d))
        dispatch(actions.successRequestSave(newDists))
        setDirty(true)
      }
      setEditingTabId(null)
    },
    [editingTabName, distributions, dispatch],
  )

  if (fetching || !distributions || !activeConfig) return null

  const { salary, invert, rows } = activeConfig
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h5 style={{ fontWeight: 700, margin: 0, color: '#1a1a2e' }}>Salary Distribution</h5>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={saveLocal}
            disabled={!dirty || saving}
            title="Guardar en IndexedDB local"
            style={{
              padding: '6px 12px', borderRadius: 6, border: 'none',
              background: dirty ? '#2f9e44' : '#e9ecef',
              cursor: dirty && !saving ? 'pointer' : 'not-allowed',
              fontSize: 13, fontWeight: 600, color: dirty ? '#fff' : '#adb5bd',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'background 0.2s',
            }}
          >
            {saving ? '…' : '💾'} {saving ? 'Guardando' : 'Guardar local'}
          </button>
          <button
            onClick={() => dispatch(actions.importRequest())}
            disabled={importing || syncing}
            title="Importar desde Firebase"
            style={{
              padding: '6px 12px', borderRadius: 6, border: '1px solid #dee2e6',
              background: '#fff', cursor: importing ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 600, color: importing ? '#adb5bd' : '#1e3a5f',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {importing ? '…' : '☁️'} Importar
          </button>
          <button
            onClick={() => distributions && dispatch(actions.syncRequest(distributions))}
            disabled={syncing || saving || !distributions}
            title="Sincronizar a Firebase"
            style={{
              padding: '6px 12px', borderRadius: 6, border: 'none',
              background: syncing ? '#e9ecef' : '#1e3a5f',
              cursor: syncing ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 600, color: syncing ? '#adb5bd' : '#fff',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {syncing ? '…' : '☁️'} Sync
          </button>
        </div>
      </div>

      {/* Distribution tabs */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          marginBottom: 20,
          overflowX: 'auto',
          overflowY: 'hidden',
          borderBottom: '2px solid #e9ecef',
        }}
      >
        {distributions.map((d) => (
          <div
            key={d.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '8px 14px',
              borderBottom: d.id === activeConfig.id ? '2px solid #1e3a5f' : '2px solid transparent',
              marginBottom: -2,
              cursor: 'pointer',
              background: d.id === activeConfig.id ? '#f8f9fa' : 'transparent',
              borderRadius: '6px 6px 0 0',
              flexShrink: 0,
            }}
            onClick={() => setActiveId(d.id)}
          >
            {editingTabId === d.id ? (
              <input
                autoFocus
                value={editingTabName}
                onChange={(e) => setEditingTabName(e.target.value)}
                onBlur={() => commitTabRename(d.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitTabRename(d.id)
                  if (e.key === 'Escape') setEditingTabId(null)
                }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  border: 'none', borderBottom: '2px solid #1e3a5f', outline: 'none',
                  background: 'transparent', fontSize: 13, fontWeight: 600,
                  color: '#1a1a2e', width: 100, padding: '0 0 1px',
                }}
              />
            ) : (
              <span
                style={{
                  fontSize: 13,
                  fontWeight: d.id === activeConfig.id ? 700 : 500,
                  color: d.id === activeConfig.id ? '#1e3a5f' : '#6c757d',
                  userSelect: 'none',
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation()
                  setEditingTabId(d.id)
                  setEditingTabName(d.name)
                }}
                title="Doble clic para renombrar"
              >
                {d.name}
              </span>
            )}
            {distributions.length > 1 && d.id === activeConfig.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (window.confirm(`¿Eliminar distribución "${d.name}"?`)) removeDistribution(d.id)
                }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#e03131', fontSize: 14, lineHeight: 1, padding: '0 0 0 4px',
                }}
                title="Eliminar distribución"
              >×</button>
            )}
          </div>
        ))}
        <button
          onClick={addDistribution}
          style={{
            padding: '8px 12px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: '#6c757d',
            fontSize: 18,
            lineHeight: 1,
            flexShrink: 0,
            marginBottom: -2,
          }}
          title="Agregar distribución"
        >+</button>
      </div>

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
          <select
            style={{ ...inputStyle, marginTop: 8, cursor: 'pointer' }}
            value={activeConfig.invertTarget ?? ''}
            onChange={(e) => update({ invertTarget: e.target.value })}
          >
            <option value="">— Target —</option>
            <option value="bnc col">bnc col</option>
            <option value="col-bnc">col-bnc</option>
            <option value="bnc arg">bnc arg</option>
            <option value="bnc loan">bnc loan</option>
            <option value="ctb">ctb market</option>
          </select>
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

        <div style={{ overflowX: 'auto' }}>
          {/* Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '24px 1fr 110px 90px 110px 36px',
              gap: 8,
              padding: '8px 14px',
              background: '#f8f9fa',
              borderBottom: '1px solid #f1f5f9',
              fontSize: 11,
              fontWeight: 600,
              color: '#adb5bd',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              minWidth: 480,
            }}
          >
            <span />
            <span>Nombre</span>
            <span>Tipo</span>
            <span>Valor</span>
            <span>Target</span>
            <span />
          </div>

          {rows.map((row, idx) => (
            <div
              key={row.id}
              onDragOver={(e) => { e.preventDefault(); setDragOverRowId(row.id) }}
              onDrop={(e) => { e.preventDefault(); reorderRows(dragRowId, row.id); setDragRowId(null); setDragOverRowId(null) }}
              style={{
                display: 'grid',
                gridTemplateColumns: '24px 1fr 110px 90px 110px 36px',
                gap: 8,
                padding: '8px 14px',
                alignItems: 'center',
                borderBottom: idx < rows.length - 1 ? '1px solid #f8f9fa' : 'none',
                background: dragOverRowId === row.id ? '#e8f4fd' : idx % 2 === 0 ? '#fff' : '#fafbfc',
                minWidth: 480,
                transition: 'background 0.1s',
                opacity: dragRowId === row.id ? 0.4 : 1,
              }}
            >
              <div
                draggable
                onDragStart={() => setDragRowId(row.id)}
                onDragEnd={() => { setDragRowId(null); setDragOverRowId(null) }}
                style={{
                  cursor: 'grab', color: '#adb5bd', fontSize: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  userSelect: 'none', lineHeight: 1,
                }}
                title="Arrastrar para reordenar"
              >⠿</div>
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
              <select
                style={{ ...inputStyle, padding: '4px 8px', fontSize: 13, cursor: 'pointer' }}
                value={row.target ?? ''}
                onChange={(e) => updateRow(row.id, { target: e.target.value })}
              >
                <option value="">—</option>
                <option value="bnc col">bnc col</option>
                <option value="col-bnc">col-bnc</option>
                <option value="bnc arg">bnc arg</option>
                <option value="bnc loan">bnc loan</option>
                <option value="ctb">ctb market</option>
              </select>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => removeRow(row.id)}
                  style={{
                    border: 'none', background: 'none', cursor: 'pointer',
                    color: '#e03131', fontSize: 16, padding: '2px 4px', lineHeight: 1,
                  }}
                  title="Eliminar"
                >×</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '10px 14px' }}>
          <button
            onClick={addRow}
            style={{
              fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 6,
              border: '1px dashed #ced4da', background: '#f8f9fa', cursor: 'pointer', color: '#495057',
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
            padding: '10px 14px', background: '#1a1a2e', color: '#fff',
            fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
          }}
        >
          Resultado — {activeConfig.name}
        </div>

        <ResultRow label="Salario" amount={salary} color="#2f9e44" bg="#f0fff4" />
        <ResultRow label="Inversión" amount={-invert} color="#7c3aed" note={`(−${fmt(invert)})`} bg="#faf5ff" />

        <div
          style={{
            display: 'flex', justifyContent: 'space-between', padding: '8px 14px',
            background: '#f8f9fa', borderTop: '2px solid #1a1a2e', borderBottom: '2px solid #1a1a2e',
            fontWeight: 700, fontSize: 13,
          }}
        >
          <span>Resto a distribuir</span>
          <span style={{ color: base < 0 ? '#e03131' : '#1a1a2e' }}>{fmt(base)}</span>
        </div>

        {distribution.map((row, idx) => {
          const badge =
            row.type === 'percent' ? `${row.value}%` : row.type === 'value' ? fmt(row.value) : 'restante'
          return (
            <div
              key={row.id}
              style={{
                display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8,
                padding: '10px 14px', alignItems: 'center',
                background: idx % 2 === 0 ? '#fff' : '#fafbfc',
                borderBottom: idx < distribution.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>
                {row.name || <span style={{ color: '#adb5bd', fontStyle: 'italic' }}>Sin nombre</span>}
              </span>
              <span
                style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                  background: row.type === 'remainder' ? '#e9ecef' : row.type === 'value' ? '#fff3cd' : '#e8f4fd',
                  color: row.type === 'remainder' ? '#6c757d' : row.type === 'value' ? '#856404' : '#0c63e4',
                }}
              >
                {badge}
              </span>
              <span
                style={{
                  fontSize: 15, fontWeight: 700,
                  color: row.amount < 0 ? '#e03131' : '#1a1a2e',
                  minWidth: 100, textAlign: 'right',
                }}
              >
                {fmt(row.amount)}
              </span>
            </div>
          )
        })}

        {!hasRemainder && (
          <div style={{ padding: '8px 14px', background: '#fff8e1', fontSize: 12, color: '#e67700' }}>
            {'Sin fila de tipo "Restante" — el sobrante no está asignado.'}
          </div>
        )}
      </div>

      {/* Target summary */}
      <TargetSummary distribution={distribution} invert={invert} invertTarget={activeConfig.invertTarget} />

      <p style={{ marginTop: 12, fontSize: 11, color: '#adb5bd', textAlign: 'right' }}>
        Configuración guardada en IndexedDB de este navegador.
      </p>
    </div>
  )
}

function TargetSummary({ distribution, invert, invertTarget }) {
  const totals = {}

  if (invert > 0) {
    const key = invertTarget || '__none__'
    totals[key] = (totals[key] ?? 0) + invert
  }

  distribution.forEach((row) => {
    const key = row.target || '__none__'
    totals[key] = (totals[key] ?? 0) + (row.amount || 0)
  })

  const entries = Object.entries(totals).sort(([a], [b]) => {
    if (a === '__none__') return 1
    if (b === '__none__') return -1
    return a.localeCompare(b)
  })

  if (entries.length === 0) return null

  return (
    <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 8, overflow: 'hidden', marginTop: 16 }}>
      <div
        style={{
          padding: '10px 14px', background: '#1a1a2e', color: '#fff',
          fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
        }}
      >
        Total por target
      </div>
      {entries.map(([key, amount], idx) => (
        <div
          key={key}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 14px',
            background: idx % 2 === 0 ? '#fff' : '#fafbfc',
            borderBottom: idx < entries.length - 1 ? '1px solid #f1f5f9' : 'none',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: key === '__none__' ? '#adb5bd' : '#1a1a2e' }}>
            {key === '__none__' ? 'Sin target' : key}
          </span>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>{fmt(amount)}</span>
        </div>
      ))}
    </div>
  )
}

function ResultRow({ label, amount, color, note, bg }) {
  return (
    <div
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 14px', background: bg ?? '#fff', borderBottom: '1px solid #f1f5f9',
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
