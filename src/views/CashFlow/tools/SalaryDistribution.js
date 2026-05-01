import React, { useEffect, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as actions from 'src/actions/cashflow/salaryDistributionActions'
import { computeDistribution, useIsMobile, bumpId } from './salaryUtils'
import DistributionTabs from './DistributionTabs'
import DistributionEditor from './DistributionEditor'
import SummaryTable from './SummaryTable'
import EggPriceChart from './EggPriceChart'

export default function SalaryDistribution() {
  const dispatch = useDispatch()
  const {
    data: distributions,
    fetching,
    saving,
    syncing,
    importing,
  } = useSelector((s) => s.salaryDistribution)
  const [activeId, setActiveId] = useState(null)
  const [editingTabId, setEditingTabId] = useState(null)
  const [editingTabName, setEditingTabName] = useState('')
  const [dragRowId, setDragRowId] = useState(null)
  const [dragOverRowId, setDragOverRowId] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    dispatch(actions.fetchRequest())
  }, [dispatch])

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
      rows: [
        ...activeConfig.rows,
        { id: bumpId(), name: '', type: hasRemainder ? 'value' : 'remainder', value: 0 },
      ],
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
      id: crypto.randomUUID(),
      name: 'Nueva',
      salary: 0,
      invert: 0,
      invertTarget: '',
      rows: [{ id: bumpId(), name: '', type: 'remainder', value: 0 }],
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
      // Auto-save order to IndexedDB without requiring "Guardar local"
      dispatch(actions.saveRequest(newDists))
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

  const distribution = computeDistribution(
    activeConfig.salary,
    activeConfig.invert,
    activeConfig.rows,
  )

  return (
    <div
      style={{
        padding: isMobile ? 12 : 16,
        maxWidth: showSummary ? 1100 : 720,
        margin: '0 auto',
        transition: 'max-width 0.2s',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 16,
        }}
      >
        <h5 style={{ fontWeight: 700, margin: 0, color: '#1a1a2e', fontSize: isMobile ? 16 : 18 }}>
          Salary Distribution
        </h5>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowSummary((v) => !v)}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: showSummary ? 'none' : '1px solid #dee2e6',
              background: showSummary ? '#1e3a5f' : '#fff',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              color: showSummary ? '#fff' : '#1e3a5f',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              minHeight: 40,
            }}
          >
            📊 Summary
          </button>
          <button
            onClick={saveLocal}
            disabled={!dirty || saving}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: 'none',
              background: dirty ? '#2f9e44' : '#e9ecef',
              cursor: dirty && !saving ? 'pointer' : 'not-allowed',
              fontSize: 13,
              fontWeight: 600,
              color: dirty ? '#fff' : '#adb5bd',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background 0.2s',
              minHeight: 40,
            }}
          >
            {saving ? '…' : '💾'} {saving ? 'Guardando' : 'Guardar local'}
          </button>
          <button
            onClick={() => dispatch(actions.importRequest())}
            disabled={importing || syncing}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #dee2e6',
              background: '#fff',
              cursor: importing ? 'not-allowed' : 'pointer',
              fontSize: 13,
              fontWeight: 600,
              color: importing ? '#adb5bd' : '#1e3a5f',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              minHeight: 40,
            }}
          >
            {importing ? '…' : '☁️'} Importar
          </button>
          <button
            onClick={() => distributions && dispatch(actions.syncRequest(distributions))}
            disabled={syncing || saving || !distributions}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: 'none',
              background: syncing ? '#e9ecef' : '#1e3a5f',
              cursor: syncing ? 'not-allowed' : 'pointer',
              fontSize: 13,
              fontWeight: 600,
              color: syncing ? '#adb5bd' : '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              minHeight: 40,
            }}
          >
            {syncing ? '…' : '☁️'} Sync
          </button>
          <button
            onClick={() => {
              if (
                window.confirm(
                  '¿Eliminar todas las distribuciones locales? Se restaurarán los valores por defecto.',
                )
              ) {
                dispatch(actions.clearLocalRequest())
                setDirty(false)
                setActiveId(null)
              }
            }}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: 'none',
              background: '#e03131',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              minHeight: 40,
            }}
          >
            🗑 Clear local
          </button>
        </div>
      </div>

      {/* ── Summary view ── */}
      {showSummary && <SummaryTable distributions={distributions} />}

      {/* ── Egg price chart ── */}
      <EggPriceChart distributions={distributions} />

      {/* ── Editor view ── */}
      {!showSummary && (
        <>
          <DistributionTabs
            distributions={distributions}
            activeConfig={activeConfig}
            editingTabId={editingTabId}
            editingTabName={editingTabName}
            isMobile={isMobile}
            onSelect={setActiveId}
            onStartRename={(id, name) => {
              setEditingTabId(id)
              setEditingTabName(name)
            }}
            onRenameChange={setEditingTabName}
            onRenameCommit={commitTabRename}
            onRenameCancel={() => setEditingTabId(null)}
            onMove={moveDistribution}
            onDelete={removeDistribution}
            onAdd={addDistribution}
          />

          <DistributionEditor
            activeConfig={activeConfig}
            distribution={distribution}
            isMobile={isMobile}
            dragRowId={dragRowId}
            dragOverRowId={dragOverRowId}
            onUpdate={(patch) => patchActive(patch)}
            onUpdateRow={updateRow}
            onAddRow={addRow}
            onRemoveRow={removeRow}
            onDragStart={setDragRowId}
            onDragOver={setDragOverRowId}
            onDrop={(toId) => {
              reorderRows(dragRowId, toId)
              setDragRowId(null)
              setDragOverRowId(null)
            }}
            onDragEnd={() => {
              setDragRowId(null)
              setDragOverRowId(null)
            }}
          />
        </>
      )}
    </div>
  )
}
