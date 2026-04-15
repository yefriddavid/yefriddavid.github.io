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

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

let nextId = Date.now()

const TYPE_LABELS = { percent: 'Porcentaje', value: 'Valor fijo', remainder: 'Restante' }
const TARGET_OPTIONS = ['bnc col', 'col-bnc', 'bnc arg', 'bnc loan', 'ctb']

export default function SalaryDistribution() {
  const dispatch = useDispatch()
  const { data: distributions, fetching, saving, syncing, importing } = useSelector((s) => s.salaryDistribution)
  const [activeId, setActiveId] = useState(null)
  const [editingTabId, setEditingTabId] = useState(null)
  const [editingTabName, setEditingTabName] = useState('')
  const [dragRowId, setDragRowId] = useState(null)
  const [dragOverRowId, setDragOverRowId] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => { dispatch(actions.fetchRequest()) }, [dispatch])

  useEffect(() => {
    if (distributions?.length && !activeId) setActiveId(distributions[0].id)
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

  const moveDistribution = useCallback(
    (id, direction) => {
      if (!distributions) return
      const idx = distributions.findIndex((d) => d.id === id)
      const newIdx = idx + direction
      if (newIdx < 0 || newIdx >= distributions.length) return
      const newDists = [...distributions]
      ;[newDists[idx], newDists[newIdx]] = [newDists[newIdx], newDists[idx]]
      dispatch(actions.successRequestSave(newDists))
      setDirty(true)
    },
    [distributions, dispatch],
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

  const inp = {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #ced4da',
    fontSize: 15,
    width: '100%',
    background: '#fff',
    boxSizing: 'border-box',
    WebkitAppearance: 'none',
  }

  const lbl = {
    fontSize: 11,
    fontWeight: 600,
    color: '#6c757d',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 4,
    display: 'block',
  }

  return (
    <div style={{ padding: isMobile ? 12 : 16, maxWidth: showSummary ? 1100 : 720, margin: '0 auto', transition: 'max-width 0.2s' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <h5 style={{ fontWeight: 700, margin: 0, color: '#1a1a2e', fontSize: isMobile ? 16 : 18 }}>Salary Distribution</h5>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowSummary((v) => !v)}
            style={{ padding: '8px 14px', borderRadius: 8, border: showSummary ? 'none' : '1px solid #dee2e6', background: showSummary ? '#1e3a5f' : '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: showSummary ? '#fff' : '#1e3a5f', display: 'flex', alignItems: 'center', gap: 6, minHeight: 40 }}
          >
            📊 Summary
          </button>
          <button
            onClick={saveLocal}
            disabled={!dirty || saving}
            style={{
              padding: '8px 14px', borderRadius: 8, border: 'none',
              background: dirty ? '#2f9e44' : '#e9ecef',
              cursor: dirty && !saving ? 'pointer' : 'not-allowed',
              fontSize: 13, fontWeight: 600, color: dirty ? '#fff' : '#adb5bd',
              display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.2s',
              minHeight: 40,
            }}
          >
            {saving ? '…' : '💾'} {saving ? 'Guardando' : 'Guardar local'}
          </button>
          <button
            onClick={() => dispatch(actions.importRequest())}
            disabled={importing || syncing}
            style={{
              padding: '8px 14px', borderRadius: 8, border: '1px solid #dee2e6',
              background: '#fff', cursor: importing ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 600, color: importing ? '#adb5bd' : '#1e3a5f',
              display: 'flex', alignItems: 'center', gap: 6, minHeight: 40,
            }}
          >
            {importing ? '…' : '☁️'} Importar
          </button>
          <button
            onClick={() => distributions && dispatch(actions.syncRequest(distributions))}
            disabled={syncing || saving || !distributions}
            style={{
              padding: '8px 14px', borderRadius: 8, border: 'none',
              background: syncing ? '#e9ecef' : '#1e3a5f',
              cursor: syncing ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 600, color: syncing ? '#adb5bd' : '#fff',
              display: 'flex', alignItems: 'center', gap: 6, minHeight: 40,
            }}
          >
            {syncing ? '…' : '☁️'} Sync
          </button>
        </div>
      </div>

      {/* ── Summary view ── */}
      {showSummary && <SummaryTable distributions={distributions} />}

      {/* ── Editor view ── */}
      {!showSummary && <>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, overflowX: 'auto', overflowY: 'hidden', borderBottom: '2px solid #e9ecef' }}>
        {distributions.map((d) => (
          <div
            key={d.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: isMobile ? '10px 12px' : '8px 14px',
              borderBottom: d.id === activeConfig.id ? '2px solid #1e3a5f' : '2px solid transparent',
              marginBottom: -2, cursor: 'pointer',
              background: d.id === activeConfig.id ? '#f8f9fa' : 'transparent',
              borderRadius: '6px 6px 0 0', flexShrink: 0,
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
                style={{ border: 'none', borderBottom: '2px solid #1e3a5f', outline: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: '#1a1a2e', width: 100, padding: '0 0 1px' }}
              />
            ) : (
              <span
                style={{ fontSize: 13, fontWeight: d.id === activeConfig.id ? 700 : 500, color: d.id === activeConfig.id ? '#1e3a5f' : '#6c757d', userSelect: 'none' }}
                onDoubleClick={(e) => { e.stopPropagation(); setEditingTabId(d.id); setEditingTabName(d.name) }}
                title="Doble clic para renombrar"
              >
                {d.name}
              </span>
            )}
            {distributions.length > 1 && d.id === activeConfig.id && (() => {
              const idx = distributions.findIndex((x) => x.id === d.id)
              return (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveDistribution(d.id, -1) }}
                    disabled={idx === 0}
                    style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', color: idx === 0 ? '#dee2e6' : '#6c757d', fontSize: 13, lineHeight: 1, padding: '0 2px', minWidth: 20, minHeight: 24 }}
                    title="Mover izquierda"
                  >‹</button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveDistribution(d.id, 1) }}
                    disabled={idx === distributions.length - 1}
                    style={{ background: 'none', border: 'none', cursor: idx === distributions.length - 1 ? 'default' : 'pointer', color: idx === distributions.length - 1 ? '#dee2e6' : '#6c757d', fontSize: 13, lineHeight: 1, padding: '0 2px', minWidth: 20, minHeight: 24 }}
                    title="Mover derecha"
                  >›</button>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (window.confirm(`¿Eliminar "${d.name}"?`)) removeDistribution(d.id) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e03131', fontSize: 16, lineHeight: 1, padding: '0 0 0 2px', minWidth: 24, minHeight: 24 }}
                  >×</button>
                </>
              )
            })()}
          </div>
        ))}
        <button
          onClick={addDistribution}
          style={{ padding: isMobile ? '10px 14px' : '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#6c757d', fontSize: 20, lineHeight: 1, flexShrink: 0, marginBottom: -2, minWidth: 44 }}
          title="Agregar distribución"
        >+</button>
      </div>

      {/* ── Salary / Invert ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 8, padding: 14 }}>
          <label style={lbl}>Salario</label>
          <input style={inp} type="number" value={salary} onChange={(e) => update({ salary: Number(e.target.value) })} />
          <div style={{ marginTop: 6, fontSize: 20, fontWeight: 700, color: '#2f9e44', textAlign: 'right' }}>{fmt(salary)}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 8, padding: 14 }}>
          <label style={lbl}>Inversión</label>
          <input style={inp} type="number" value={invert} onChange={(e) => update({ invert: Number(e.target.value) })} />
          <select style={{ ...inp, marginTop: 8, cursor: 'pointer' }} value={activeConfig.invertTarget ?? ''} onChange={(e) => update({ invertTarget: e.target.value })}>
            <option value="">— Target —</option>
            {TARGET_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <div style={{ marginTop: 6, fontSize: 20, fontWeight: 700, color: '#7c3aed', textAlign: 'right' }}>{fmt(invert)}</div>
        </div>
      </div>

      {/* ── Row editor ── */}
      <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 8, marginBottom: 20 }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#495057' }}>
            Distribución del resto
          </span>
          <span style={{ fontSize: 12, color: overflowWarning ? '#e03131' : '#6c757d' }}>
            {overflowWarning ? `⚠ ${totalPercent}% (supera 100%)` : `${totalPercent}% asignado`}
          </span>
        </div>

        {isMobile ? (
          /* ── Mobile: card per row ── */
          <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rows.map((row) => (
              <div key={row.id} style={{ border: '1px solid #e9ecef', borderRadius: 8, padding: 12, background: '#fafbfc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#adb5bd', textTransform: 'uppercase' }}>Fila</span>
                  <button
                    onClick={() => removeRow(row.id)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#e03131', fontSize: 20, lineHeight: 1, padding: '4px 8px', minWidth: 36, minHeight: 36 }}
                  >×</button>
                </div>
                <label style={lbl}>Nombre</label>
                <input style={{ ...inp, marginBottom: 8 }} type="text" value={row.name} placeholder="Nombre" onChange={(e) => updateRow(row.id, { name: e.target.value })} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <div>
                    <label style={lbl}>Tipo</label>
                    <select style={{ ...inp, cursor: 'pointer' }} value={row.type} onChange={(e) => updateRow(row.id, { type: e.target.value })}>
                      {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Valor</label>
                    {row.type === 'percent' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <input style={inp} type="number" min={0} max={100} value={row.value} onChange={(e) => updateRow(row.id, { value: Number(e.target.value) })} />
                        <span style={{ fontSize: 14, color: '#6c757d', flexShrink: 0 }}>%</span>
                      </div>
                    ) : row.type === 'value' ? (
                      <input style={inp} type="number" min={0} value={row.value} onChange={(e) => updateRow(row.id, { value: Number(e.target.value) })} />
                    ) : (
                      <div style={{ ...inp, color: '#adb5bd', fontSize: 13 }}>auto</div>
                    )}
                  </div>
                </div>

                <label style={lbl}>Target</label>
                <select style={{ ...inp, cursor: 'pointer' }} value={row.target ?? ''} onChange={(e) => updateRow(row.id, { target: e.target.value })}>
                  <option value="">—</option>
                  {TARGET_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            ))}
          </div>
        ) : (
          /* ── Desktop: table grid ── */
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 110px 90px 110px 36px', gap: 8, padding: '8px 14px', background: '#f8f9fa', borderBottom: '1px solid #f1f5f9', fontSize: 11, fontWeight: 600, color: '#adb5bd', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: 480 }}>
              <span /><span>Nombre</span><span>Tipo</span><span>Valor</span><span>Target</span><span />
            </div>
            {rows.map((row, idx) => (
              <div
                key={row.id}
                onDragOver={(e) => { e.preventDefault(); setDragOverRowId(row.id) }}
                onDrop={(e) => { e.preventDefault(); reorderRows(dragRowId, row.id); setDragRowId(null); setDragOverRowId(null) }}
                style={{
                  display: 'grid', gridTemplateColumns: '24px 1fr 110px 90px 110px 36px', gap: 8,
                  padding: '8px 14px', alignItems: 'center',
                  borderBottom: idx < rows.length - 1 ? '1px solid #f8f9fa' : 'none',
                  background: dragOverRowId === row.id ? '#e8f4fd' : idx % 2 === 0 ? '#fff' : '#fafbfc',
                  minWidth: 480, transition: 'background 0.1s', opacity: dragRowId === row.id ? 0.4 : 1,
                }}
              >
                <div
                  draggable
                  onDragStart={() => setDragRowId(row.id)}
                  onDragEnd={() => { setDragRowId(null); setDragOverRowId(null) }}
                  style={{ cursor: 'grab', color: '#adb5bd', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none', lineHeight: 1 }}
                  title="Arrastrar para reordenar"
                >⠿</div>
                <input style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ced4da', fontSize: 13, width: '100%', background: '#fff' }} type="text" value={row.name} placeholder="Nombre" onChange={(e) => updateRow(row.id, { name: e.target.value })} />
                <select style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ced4da', fontSize: 13, width: '100%', background: '#fff', cursor: 'pointer' }} value={row.type} onChange={(e) => updateRow(row.id, { type: e.target.value })}>
                  {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                {row.type === 'percent' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ced4da', fontSize: 13, width: '100%', background: '#fff' }} type="number" min={0} max={100} value={row.value} onChange={(e) => updateRow(row.id, { value: Number(e.target.value) })} />
                    <span style={{ fontSize: 13, color: '#6c757d' }}>%</span>
                  </div>
                ) : row.type === 'value' ? (
                  <input style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ced4da', fontSize: 13, width: '100%', background: '#fff' }} type="number" min={0} value={row.value} onChange={(e) => updateRow(row.id, { value: Number(e.target.value) })} />
                ) : (
                  <span style={{ fontSize: 12, color: '#adb5bd', paddingLeft: 8 }}>auto</span>
                )}
                <select style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ced4da', fontSize: 13, width: '100%', background: '#fff', cursor: 'pointer' }} value={row.target ?? ''} onChange={(e) => updateRow(row.id, { target: e.target.value })}>
                  <option value="">—</option>
                  {TARGET_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => removeRow(row.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#e03131', fontSize: 16, padding: '2px 4px', lineHeight: 1 }} title="Eliminar">×</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: '10px 14px' }}>
          <button
            onClick={addRow}
            style={{ fontSize: 13, fontWeight: 600, padding: '10px 16px', borderRadius: 8, border: '1px dashed #ced4da', background: '#f8f9fa', cursor: 'pointer', color: '#495057', width: isMobile ? '100%' : 'auto', minHeight: 44 }}
          >
            + Agregar fila
          </button>
        </div>
      </div>

      {/* ── Result ── */}
      <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', background: '#1a1a2e', color: '#fff', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Resultado — {activeConfig.name}
        </div>

        <ResultRow label="Salario" amount={salary} color="#2f9e44" bg="#f0fff4" />
        <ResultRow label="Inversión" amount={-invert} color="#7c3aed" note={`(−${fmt(invert)})`} bg="#faf5ff" />

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8f9fa', borderTop: '2px solid #1a1a2e', borderBottom: '2px solid #1a1a2e', fontWeight: 700, fontSize: 13 }}>
          <span>Resto a distribuir</span>
          <span style={{ color: base < 0 ? '#e03131' : '#1a1a2e' }}>{fmt(base)}</span>
        </div>

        {distribution.map((row, idx) => {
          const badge = row.type === 'percent' ? `${row.value}%` : row.type === 'value' ? fmt(row.value) : 'restante'
          return (
            <div
              key={row.id}
              style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, padding: '10px 14px', alignItems: 'center', background: idx % 2 === 0 ? '#fff' : '#fafbfc', borderBottom: idx < distribution.length - 1 ? '1px solid #f1f5f9' : 'none' }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', wordBreak: 'break-word' }}>
                {row.name || <span style={{ color: '#adb5bd', fontStyle: 'italic' }}>Sin nombre</span>}
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap', background: row.type === 'remainder' ? '#e9ecef' : row.type === 'value' ? '#fff3cd' : '#e8f4fd', color: row.type === 'remainder' ? '#6c757d' : row.type === 'value' ? '#856404' : '#0c63e4' }}>
                {badge}
              </span>
              <span style={{ fontSize: isMobile ? 14 : 15, fontWeight: 700, color: row.amount < 0 ? '#e03131' : '#1a1a2e', minWidth: isMobile ? 80 : 100, textAlign: 'right', whiteSpace: 'nowrap' }}>
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

      <TargetSummary distribution={distribution} invert={invert} invertTarget={activeConfig.invertTarget} isMobile={isMobile} />

      <p style={{ marginTop: 12, fontSize: 11, color: '#adb5bd', textAlign: 'right' }}>
        Configuración guardada en IndexedDB de este navegador.
      </p>

      </> /* end editor view */}
    </div>
  )
}

function TargetSummary({ distribution, invert, invertTarget, isMobile }) {
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
      <div style={{ padding: '10px 14px', background: '#1a1a2e', color: '#fff', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Total por target
      </div>
      {entries.map(([key, amount], idx) => (
        <div
          key={key}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: idx % 2 === 0 ? '#fff' : '#fafbfc', borderBottom: idx < entries.length - 1 ? '1px solid #f1f5f9' : 'none' }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: key === '__none__' ? '#adb5bd' : '#1a1a2e' }}>
            {key === '__none__' ? 'Sin target' : key}
          </span>
          <span style={{ fontSize: isMobile ? 14 : 15, fontWeight: 700, color: '#1a1a2e', whiteSpace: 'nowrap' }}>{fmt(amount)}</span>
        </div>
      ))}
    </div>
  )
}

function SummaryTable({ distributions }) {
  const computed = distributions.map((d) => ({
    ...d,
    base: d.salary - d.invert,
    distribution: computeDistribution(d.salary, d.invert, d.rows),
  }))

  const allRows = []
  const seen = new Set()
  for (const d of computed) {
    for (const r of d.distribution) {
      const key = `${r.name || '(sin nombre)'}||${r.target || ''}`
      if (!seen.has(key)) { seen.add(key); allRows.push({ name: r.name || '(sin nombre)', target: r.target || '' }) }
    }
  }

  const allTargets = new Set()
  for (const d of computed) {
    if (d.invert > 0) allTargets.add(d.invertTarget || '__none__')
    for (const r of d.distribution) allTargets.add(r.target || '__none__')
  }
  const targetList = [...allTargets].sort((a, b) => {
    if (a === '__none__') return 1
    if (b === '__none__') return -1
    return a.localeCompare(b)
  })

  const targetTotals = (d) => {
    const totals = {}
    if (d.invert > 0) {
      const k = d.invertTarget || '__none__'
      totals[k] = (totals[k] ?? 0) + d.invert
    }
    for (const r of d.distribution) {
      const k = r.target || '__none__'
      totals[k] = (totals[k] ?? 0) + (r.amount || 0)
    }
    return totals
  }

  const cell = { padding: '8px 12px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap', fontSize: 13 }
  const colW = 150

  return (
    <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 8, overflow: 'hidden', marginBottom: 24 }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: distributions.length * colW + 180 }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ ...cell, textAlign: 'left', fontWeight: 700, color: '#495057', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', width: 170, position: 'sticky', left: 0, background: '#f8f9fa', zIndex: 1 }}>Concepto</th>
              {computed.map((d) => (
                <th key={d.id} style={{ ...cell, textAlign: 'right', fontWeight: 700, color: '#1e3a5f', fontSize: 14, width: colW }}>
                  {d.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: '#f0fff4' }}>
              <td style={{ ...cell, fontWeight: 600, color: '#495057', position: 'sticky', left: 0, background: '#f0fff4', zIndex: 1 }}>Salario</td>
              {computed.map((d) => (
                <td key={d.id} style={{ ...cell, textAlign: 'right', fontWeight: 700, color: '#2f9e44' }}>{fmt(d.salary)}</td>
              ))}
            </tr>
            <tr style={{ background: '#faf5ff' }}>
              <td style={{ ...cell, fontWeight: 600, color: '#495057', position: 'sticky', left: 0, background: '#faf5ff', zIndex: 1 }}>Inversión</td>
              {computed.map((d) => (
                <td key={d.id} style={{ ...cell, textAlign: 'right', fontWeight: 700, color: '#7c3aed' }}>
                  {d.invert > 0 ? `−${fmt(d.invert)}` : <span style={{ color: '#adb5bd' }}>—</span>}
                  {d.invert > 0 && d.invertTarget && <span style={{ fontSize: 10, color: '#adb5bd', marginLeft: 4 }}>{d.invertTarget}</span>}
                </td>
              ))}
            </tr>
            <tr style={{ background: '#f8f9fa', borderTop: '2px solid #1a1a2e', borderBottom: '2px solid #1a1a2e' }}>
              <td style={{ ...cell, fontWeight: 700, position: 'sticky', left: 0, background: '#f8f9fa', zIndex: 1 }}>Base a distribuir</td>
              {computed.map((d) => (
                <td key={d.id} style={{ ...cell, textAlign: 'right', fontWeight: 700, color: d.base < 0 ? '#e03131' : '#1a1a2e' }}>{fmt(d.base)}</td>
              ))}
            </tr>

            {allRows.map(({ name, target }, i) => (
              <tr key={`${name}||${target}`} style={{ background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                <td style={{ ...cell, position: 'sticky', left: 0, background: i % 2 === 0 ? '#fff' : '#fafbfc', zIndex: 1 }}>
                  {target
                    ? <span style={{ fontWeight: 500, color: '#1a1a2e' }}>{target}</span>
                    : <span style={{ color: '#adb5bd', fontStyle: 'italic' }}>Sin target</span>
                  }
                </td>
                {computed.map((d) => {
                  const row = d.distribution.find((r) => (r.name || '(sin nombre)') === name && (r.target || '') === target)
                  if (!row) return <td key={d.id} style={{ ...cell, textAlign: 'right', color: '#adb5bd' }}>—</td>
                  const badge = row.type === 'percent' ? `${row.value}%` : row.type === 'value' ? fmt(row.value) : 'restante'
                  return (
                    <td key={d.id} style={{ ...cell, textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, color: row.amount < 0 ? '#e03131' : '#1a1a2e' }}>{fmt(row.amount)}</span>
                      <span style={{ fontSize: 10, color: '#adb5bd', marginLeft: 5 }}>{badge}</span>
                    </td>
                  )
                })}
              </tr>
            ))}

            {targetList.length > 0 && (
              <tr>
                <td colSpan={computed.length + 1} style={{ padding: '6px 12px', background: '#1a1a2e', color: '#adb5bd', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Total por target
                </td>
              </tr>
            )}
            {targetList.map((target, i) => {
              const totals = computed.map((d) => targetTotals(d)[target] ?? null)
              return (
                <tr key={target} style={{ background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                  <td style={{ ...cell, color: target === '__none__' ? '#adb5bd' : '#1a1a2e', fontStyle: target === '__none__' ? 'italic' : 'normal', paddingLeft: 20, position: 'sticky', left: 0, background: i % 2 === 0 ? '#fff' : '#fafbfc', zIndex: 1 }}>
                    {target === '__none__' ? 'Sin target' : target}
                  </td>
                  {totals.map((amount, idx) => (
                    <td key={idx} style={{ ...cell, textAlign: 'right', fontWeight: 700, color: amount === null ? '#adb5bd' : '#1a1a2e' }}>
                      {amount === null ? '—' : fmt(amount)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ResultRow({ label, amount, color, note, bg }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: bg ?? '#fff', borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ fontSize: 13, color: '#495057' }}>
        {label}
        {note && <span style={{ marginLeft: 6, fontSize: 11, color: '#adb5bd' }}>{note}</span>}
      </span>
      <span style={{ fontSize: 15, fontWeight: 700, color: color ?? '#1a1a2e', whiteSpace: 'nowrap' }}>
        {amount < 0 ? `−${fmt(Math.abs(amount))}` : fmt(amount)}
      </span>
    </div>
  )
}
