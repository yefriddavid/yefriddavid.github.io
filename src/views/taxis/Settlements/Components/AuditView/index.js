import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import MultiSelectDropdown from 'src/components/shared/MultiSelectDropdown'
import * as taxiSettlementActions from 'src/actions/taxi/taxiSettlementActions'
import { fmt } from '../utils'
import AuditMissingCell from '../AuditMissingCell'
import AuditSettledCell from '../AuditSettledCell'
import AuditDayDetail from '../AuditDayDetail'
import useLocaleData from 'src/hooks/useLocaleData'
import { runAuditAnalysis } from '../auditAnalysisRules'
import AnalysisModal from './AnalysisModal'

const AUDIT_COL_DEFS = [
  { key: 'weekday', label: 'Día semana' },
  { key: 'status', label: 'Estado' },
  { key: 'count', label: 'Cantidad' },
  { key: 'total', label: 'Total' },
  { key: 'cumul', label: 'Acum.' },
  { key: 'cumul_ideal', label: 'Acum. ideal' },
  { key: 'settled', label: 'Liquidados' },
  { key: 'missing', label: 'Pendientes' },
]
const AUDIT_COLS_LS_KEY = 'auditColVisibility'
const AUDIT_COLS_ORDER_LS_KEY = 'auditColOrder'
const AUDIT_COLS_DEFAULT = Object.fromEntries(AUDIT_COL_DEFS.map((c) => [c.key, true]))

const AuditView = ({
  auditDays,
  dayFilter,
  drivers,
  periodDrivers,
  auditDrivers,
  auditVehicles,
  getNote,
  getResolved,
  handleResolvedToggle,
  handleNoteSave,
  isAllResolved,
  auditRowBg,
  auditLeftBorder,
  exportAuditToExcel,
  exportAuditToPdf,
}) => {
  const { t } = useTranslation()
  const { dayNames } = useLocaleData()
  const dispatch = useDispatch()
  const { fetching: settlementFetching } = useSelector((s) => s.taxiSettlement)

  const [loadingDay, setLoadingDay] = useState(null)
  const prevFetchingRef = useRef(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [auditPlateFilter, setAuditPlateFilter] = useState('')
  const [auditDriverFilter, setAuditDriverFilter] = useState(new Set())
  const [auditStatusFilter, setAuditStatusFilter] = useState(new Set())
  const [selectedAuditDay, setSelectedAuditDay] = useState(null)
  const [hoveredAuditDay, setHoveredAuditDay] = useState(null)
  const [addingSettlementDay, setAddingSettlementDay] = useState(null)
  const [editingNote, setEditingNote] = useState(null)
  const [selected, setSelected] = useState('edicion')
  const [visibleCols, setVisibleCols] = useState(() => {
    try {
      const saved = localStorage.getItem(AUDIT_COLS_LS_KEY)
      return saved ? { ...AUDIT_COLS_DEFAULT, ...JSON.parse(saved) } : AUDIT_COLS_DEFAULT
    } catch {
      return AUDIT_COLS_DEFAULT
    }
  })
  const [colOrder, setColOrder] = useState(() => {
    try {
      const saved = localStorage.getItem(AUDIT_COLS_ORDER_LS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        const valid = parsed.filter((k) => AUDIT_COL_DEFS.some((c) => c.key === k))
        const missing = AUDIT_COL_DEFS.filter((c) => !valid.includes(c.key)).map((c) => c.key)
        return [...valid, ...missing]
      }
    } catch {}
    return AUDIT_COL_DEFS.map((c) => c.key)
  })
  const draggedColRef = useRef(null)

  const reorderCol = (fromKey, toKey) => {
    if (fromKey === toKey) return
    setColOrder((prev) => {
      const next = [...prev]
      const fromIdx = next.indexOf(fromKey)
      const toIdx = next.indexOf(toKey)
      next.splice(fromIdx, 1)
      next.splice(toIdx, 0, fromKey)
      localStorage.setItem(AUDIT_COLS_ORDER_LS_KEY, JSON.stringify(next))
      return next
    })
  }

  const [showColMgr, setShowColMgr] = useState(false)
  const [colMgrPos, setColMgrPos] = useState({ top: 0, left: 0 })
  const colMgrRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  useEffect(() => {
    if (!showColMgr) return
    const handler = (e) => {
      if (colMgrRef.current && !colMgrRef.current.contains(e.target)) setShowColMgr(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showColMgr])

  const toggleCol = (key) => {
    setVisibleCols((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem(AUDIT_COLS_LS_KEY, JSON.stringify(next))
      return next
    })
  }

  const col = (key) => (visibleCols[key] ? {} : { display: 'none' })

  const colLabels = {
    weekday: t('taxis.settlements.audit.colWeekday'),
    status: t('taxis.settlements.audit.colStatus'),
    count: t('taxis.settlements.audit.colCount'),
    total: t('taxis.settlements.audit.colTotal'),
    cumul: 'Acum.',
    cumul_ideal: 'Acum. ideal',
    settled: t('taxis.settlements.audit.colSettled'),
    missing: t('taxis.settlements.audit.colMissing'),
  }

  useEffect(() => {
    if (prevFetchingRef.current && !settlementFetching) setLoadingDay(null)
    prevFetchingRef.current = settlementFetching
  }, [settlementFetching])

  const dispatchCreate = (payload) => {
    setLoadingDay(payload.date)
    dispatch(taxiSettlementActions.createRequest(payload))
  }

  const _dispatchDelete = (dateStr, id) => {
    setLoadingDay(dateStr)
    dispatch(taxiSettlementActions.deleteRequest({ id }))
  }

  const openAnalysis = async () => {
    setShowAnalysis(true)
    setAnalysisLoading(true)
    const result = await runAuditAnalysis(auditDays, periodDrivers)
    setAnalysisResult(result)
    setAnalysisLoading(false)
  }

  const simulateDay = (day) => {
    const eligible = periodDrivers.filter((d) => {
      if (!d.defaultVehicle) return false
      if (d.startDate && d.startDate > day.dateStr) return false
      if (d.endDate && d.endDate < day.dateStr) return false
      if (day.picoPlacaVehicles?.includes(d.defaultVehicle)) return false
      if (auditDriverFilter.size > 0 && !auditDriverFilter.has(d.name)) return false
      return true
    })
    const total = eligible.reduce((s, d) => {
      const amount =
        day.isSunday || day.isHoliday
          ? d.defaultAmountSunday || d.defaultAmount || 0
          : d.defaultAmount || 0
      return s + amount
    }, 0)
    return { count: eligible.length, total }
  }

  const auditFilteredDays = auditDays.filter((day) => {
    if (dayFilter.size > 0 && !dayFilter.has(day.d)) return false
    if (auditStatusFilter.size > 0 && !auditStatusFilter.has(day.status)) return false
    if (
      auditPlateFilter &&
      !day.settledVehicles.includes(auditPlateFilter) &&
      !day.missingVehicles.includes(auditPlateFilter) &&
      !day.picoPlacaVehicles.includes(auditPlateFilter)
    )
      return false
    if (
      auditDriverFilter.size > 0 &&
      !day.settled.some((dr) => auditDriverFilter.has(dr)) &&
      !day.missing.some((dr) => auditDriverFilter.has(dr)) &&
      !day.picoPlacaDrivers.some((dr) => auditDriverFilter.has(dr))
    )
      return false
    return true
  })

  const hasFilters = auditPlateFilter || auditDriverFilter.size > 0 || auditStatusFilter.size > 0

  return (
    <div
      ref={containerRef}
      style={{
        padding: 16,
        background: isFullscreen ? '#fff' : undefined,
        ...(isFullscreen && { overflowY: 'auto', height: '100vh' }),
      }}
    >
      <AnalysisModal
        visible={showAnalysis}
        onClose={() => setShowAnalysis(false)}
        loading={analysisLoading}
        result={analysisResult}
      />
      {/* Status summary strip */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        {[
          {
            key: 'none',
            label: t('taxis.settlements.audit.statusNone'),
            count: auditDays.filter((d) => d.status === 'none').length,
            color: '#e03131',
            bg: '#fff5f5',
          },
          {
            key: 'partial',
            label: t('taxis.settlements.audit.statusPartial'),
            count: auditDays.filter((d) => d.status === 'partial').length,
            color: '#e67700',
            bg: '#fffbeb',
          },
          {
            key: 'full',
            label: t('taxis.settlements.audit.statusFull'),
            count: auditDays.filter((d) => d.status === 'full').length,
            color: '#2f9e44',
            bg: '#f0fdf4',
          },
          {
            key: 'future',
            label: t('taxis.settlements.audit.statusFuture'),
            count: auditDays.filter((d) => d.status === 'future').length,
            color: '#868e96',
            bg: '#f8fafc',
          },
        ].map(({ key, label, count, color, bg }) => {
          const active = auditStatusFilter.has(key)
          return (
            <div
              key={key}
              onClick={() =>
                setAuditStatusFilter((prev) => {
                  const next = new Set(prev)
                  next.has(key) ? next.delete(key) : next.add(key)
                  return next
                })
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: active ? color : bg,
                border: `1px solid ${active ? color : color + '33'}`,
                borderRadius: 8,
                padding: '6px 14px',
                cursor: 'pointer',
                boxShadow: active ? `0 0 0 2px ${color}55` : 'none',
                transition: 'all 0.15s',
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: active ? '#fff' : color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 700, color: active ? '#fff' : color }}>
                {count}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: active ? 'rgba(255,255,255,0.85)' : 'var(--cui-secondary-color)',
                }}
              >
                {label}
              </span>
            </div>
          )
        })}
        <div
          style={{
            marginLeft: 'auto',
            fontSize: 12,
            color: 'var(--cui-secondary-color)',
            alignSelf: 'center',
          }}
        >
          {t(
            'taxis.settlements.audit.activeDrivers' + (auditDrivers.length !== 1 ? '_plural' : ''),
            { count: auditDrivers.length },
          )}
        </div>
      </div>

      {/* Audit filters */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 12,
          alignItems: 'center',
        }}
      >
        <select
          value={auditPlateFilter}
          onChange={(e) => setAuditPlateFilter(e.target.value)}
          style={{
            fontSize: 12,
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid var(--cui-secondary)',
            background: auditPlateFilter ? '#e8f0fb' : '#fff',
            color: auditPlateFilter ? '#1e3a5f' : 'var(--cui-secondary)',
            fontWeight: auditPlateFilter ? 600 : 400,
            cursor: 'pointer',
          }}
        >
          <option value="">Vehículo: Todos</option>
          {auditVehicles.map((pl) => (
            <option key={pl} value={pl}>
              {pl}
            </option>
          ))}
        </select>

        <MultiSelectDropdown
          label={(size) => (size > 0 ? `Conductor (${size})` : 'Conductor: Todos')}
          options={auditDrivers.map((dr) => ({ value: dr, label: dr }))}
          selected={auditDriverFilter}
          onToggle={(dr) =>
            setAuditDriverFilter((prev) => {
              const next = new Set(prev)
              next.has(dr) ? next.delete(dr) : next.add(dr)
              return next
            })
          }
          onClearAll={() => setAuditDriverFilter(new Set())}
          acceptLabel="Aceptar"
        />

        {hasFilters && (
          <button
            onClick={() => {
              setAuditPlateFilter('')
              setAuditDriverFilter(new Set())
              setAuditStatusFilter(new Set())
            }}
            style={{
              fontSize: 11,
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid #e03131',
              background: 'none',
              color: '#e03131',
              cursor: 'pointer',
            }}
          >
            ✕ Limpiar
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)' }}>Mode:</span>
          {[
            { value: 'edicion', label: 'Edición', active: '#2f9e44', activeBg: '#f0fdf4' },
            { value: 'simulacro', label: 'Simulacro', active: '#e03131', activeBg: '#fff5f5' },
          ].map(({ value, label, active, activeBg }) => (
            <button
              key={value}
              onClick={() => setSelected(value)}
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '3px 12px',
                borderRadius: 5,
                border: `1.5px solid ${selected === value ? active : '#cbd5e1'}`,
                background: selected === value ? activeBg : 'transparent',
                color: selected === value ? active : 'var(--cui-secondary-color)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', alignItems: 'center' }}>
          <div ref={colMgrRef} style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowColMgr((v) => {
                  if (!v && colMgrRef.current) {
                    const rect = colMgrRef.current.getBoundingClientRect()
                    const dropdownWidth = 180
                    const left =
                      rect.right - dropdownWidth < 8
                        ? Math.max(8, rect.left)
                        : rect.right - dropdownWidth
                    setColMgrPos({ top: rect.bottom + 4, left })
                  }
                  return !v
                })
              }}
              style={{
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 6,
                border: `1px solid ${showColMgr ? '#1e3a5f' : '#94a3b8'}`,
                background: showColMgr ? '#eef4ff' : 'none',
                color: showColMgr ? '#1e3a5f' : '#64748b',
                cursor: 'pointer',
              }}
              title="Mostrar/ocultar columnas"
            >
              ⊞ Columnas
            </button>
            {showColMgr && (
              <div
                style={{
                  position: 'fixed',
                  top: colMgrPos.top,
                  left: colMgrPos.left,
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  padding: '8px 4px',
                  zIndex: 1050,
                  minWidth: 160,
                  maxHeight: '70vh',
                  overflowY: 'auto',
                }}
              >
                {colOrder.map((key) => {
                  const def = AUDIT_COL_DEFS.find((c) => c.key === key)
                  return (
                    <div
                      key={key}
                      draggable
                      onDragStart={() => {
                        draggedColRef.current = key
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => reorderCol(draggedColRef.current, key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 10px 4px 6px',
                        borderRadius: 5,
                        background: visibleCols[key] ? 'transparent' : '#f8fafc',
                        cursor: 'grab',
                      }}
                    >
                      <span style={{ color: '#cbd5e1', fontSize: 14, flexShrink: 0 }}>⠿</span>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 7,
                          cursor: 'pointer',
                          flex: 1,
                          color: visibleCols[key] ? '#1e3a5f' : '#94a3b8',
                          fontSize: 12,
                          fontWeight: visibleCols[key] ? 500 : 400,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={!!visibleCols[key]}
                          onChange={() => toggleCol(key)}
                          style={{ accentColor: '#1e3a5f', cursor: 'pointer' }}
                        />
                        {def.label}
                      </label>
                    </div>
                  )
                })}
                <div style={{ borderTop: '1px solid #f1f5f9', margin: '6px 12px 2px' }} />
                <button
                  onClick={() => {
                    const all = Object.fromEntries(AUDIT_COL_DEFS.map((c) => [c.key, true]))
                    setVisibleCols(all)
                    localStorage.setItem(AUDIT_COLS_LS_KEY, JSON.stringify(all))
                    const order = AUDIT_COL_DEFS.map((c) => c.key)
                    setColOrder(order)
                    localStorage.setItem(AUDIT_COLS_ORDER_LS_KEY, JSON.stringify(order))
                  }}
                  style={{
                    fontSize: 11,
                    padding: '3px 12px',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  Restablecer todo
                </button>
              </div>
            )}
          </div>
          <button
            onClick={openAnalysis}
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: 6,
              border: '1.5px solid #7c3aed',
              background: '#faf5ff',
              color: '#7c3aed',
              cursor: 'pointer',
            }}
            title="Análisis automático del período"
          >
            ✦ Análisis IA
          </button>
          <button
            onClick={exportAuditToExcel}
            style={{
              fontSize: 11,
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid #2f9e44',
              background: 'none',
              color: '#2f9e44',
              cursor: 'pointer',
            }}
            title="Exportar auditoría a Excel"
          >
            ↓ Excel
          </button>
          <button
            onClick={exportAuditToPdf}
            style={{
              fontSize: 11,
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid #e03131',
              background: 'none',
              color: '#e03131',
              cursor: 'pointer',
            }}
            title="Exportar auditoría a PDF"
          >
            ↓ PDF
          </button>
          <button
            onClick={toggleFullscreen}
            style={{
              fontSize: 11,
              padding: '4px 10px',
              borderRadius: 6,
              border: `1px solid ${isFullscreen ? '#1e3a5f' : '#94a3b8'}`,
              background: isFullscreen ? '#eef4ff' : 'none',
              color: isFullscreen ? '#1e3a5f' : '#64748b',
              cursor: 'pointer',
            }}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Vista pantalla completa'}
          >
            {isFullscreen ? '⊡ Salir' : '⛶ Pantalla completa'}
          </button>
        </div>
      </div>

      {/* Audit table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#1e3a5f' }}>
              <th
                style={{
                  padding: '9px 12px',
                  textAlign: 'left',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'rgba(255,255,255,0.9)',
                  whiteSpace: 'nowrap',
                  borderRight: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {t('taxis.settlements.audit.colDay')}
              </th>
              {colOrder.map((key) => (
                <th
                  key={key}
                  style={{
                    padding: '9px 12px',
                    textAlign: 'left',
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'rgba(255,255,255,0.9)',
                    whiteSpace: 'nowrap',
                    borderRight: '1px solid rgba(255,255,255,0.1)',
                    ...col(key),
                  }}
                >
                  {colLabels[key]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(() => {
              let _running = 0
              let _runningIdeal = 0
              const cumulativeTotals = auditFilteredDays.map((day) => {
                const recs =
                  auditDriverFilter.size > 0
                    ? day.dayRecords.filter((r) => auditDriverFilter.has(r.driver))
                    : day.dayRecords
                const amt =
                  selected === 'simulacro'
                    ? simulateDay(day).total
                    : day.isFuture
                      ? 0
                      : recs.reduce((s, r) => s + (r.amount || 0), 0)
                _running += amt
                _runningIdeal += simulateDay(day).total
                return { actual: _running, ideal: _runningIdeal }
              })
              return auditFilteredDays.map((day, dayIdx) => {
                const filteredRecords =
                  auditDriverFilter.size > 0
                    ? day.dayRecords.filter((r) => auditDriverFilter.has(r.driver))
                    : day.dayRecords
                const filteredTotal = filteredRecords.reduce((s, r) => s + (r.amount || 0), 0)
                const sim = selected === 'simulacro' ? simulateDay(day) : null

                return (
                  <React.Fragment key={day.d}>
                    <tr
                      onClick={() => setSelectedAuditDay((prev) => (prev === day.d ? null : day.d))}
                      onMouseEnter={() => setHoveredAuditDay(day.d)}
                      onMouseLeave={() => setHoveredAuditDay(null)}
                      style={{
                        background: selectedAuditDay === day.d ? '#eef4ff' : auditRowBg(day),
                        borderBottom: '1px solid #f1f5f9',
                        borderLeft: `4px solid ${auditLeftBorder(day)}`,
                        cursor: 'pointer',
                        boxShadow:
                          hoveredAuditDay === day.d
                            ? 'inset 0 0 0 9999px rgba(0,0,0,0.04)'
                            : 'none',
                        transition: 'box-shadow 0.1s',
                      }}
                    >
                      {/* Day number cell */}
                      <td
                        style={{
                          padding: '8px 12px',
                          fontWeight: 700,
                          fontVariantNumeric: 'tabular-nums',
                          color: day.isFuture ? '#adb5bd' : '#1e3a5f',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {String(day.d).padStart(2, '0')}
                        {day.isToday && (
                          <span
                            style={{
                              fontSize: 10,
                              background: '#1e3a5f',
                              color: '#fff',
                              borderRadius: 4,
                              padding: '1px 5px',
                              marginLeft: 6,
                            }}
                          >
                            {t('taxis.settlements.audit.today')}
                          </span>
                        )}
                        {day.hasPicoPlaca && (
                          <span
                            style={{
                              fontSize: 10,
                              background: '#f3e8ff',
                              color: '#6b21a8',
                              border: '1px solid #d8b4fe',
                              borderRadius: 4,
                              padding: '1px 5px',
                              marginLeft: 6,
                            }}
                          >
                            P&P
                          </span>
                        )}
                      </td>

                      {colOrder.map((key) => {
                        switch (key) {
                          case 'weekday':
                            return (
                              <td
                                key={key}
                                style={{
                                  padding: '8px 12px',
                                  color:
                                    day.isSunday || day.isHoliday
                                      ? '#7c5e00'
                                      : day.isFuture
                                        ? '#adb5bd'
                                        : '#64748b',
                                  fontWeight: day.isSunday || day.isHoliday ? 700 : 400,
                                  ...col('weekday'),
                                }}
                              >
                                {dayNames[day.dow]}
                                {day.isHoliday && (
                                  <span
                                    style={{
                                      fontSize: 10,
                                      background: '#fff3cd',
                                      color: '#7c5e00',
                                      border: '1px solid #fcd34d',
                                      borderRadius: 4,
                                      padding: '1px 5px',
                                      marginLeft: 5,
                                    }}
                                  >
                                    Festivo
                                  </span>
                                )}
                              </td>
                            )
                          case 'status':
                            return (
                              <td
                                key={key}
                                style={{
                                  padding: '8px 12px',
                                  whiteSpace: 'nowrap',
                                  ...col('status'),
                                }}
                              >
                                {day.status === 'none' && !isAllResolved(day) && (
                                  <span
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      color: '#e03131',
                                      background: '#fff5f5',
                                      border: '1px solid #fca5a5',
                                      borderRadius: 4,
                                      padding: '2px 8px',
                                    }}
                                  >
                                    ✗ {t('taxis.settlements.audit.statusNone')}
                                  </span>
                                )}
                                {day.status === 'partial' && !isAllResolved(day) && (
                                  <span
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      color: '#e67700',
                                      background: '#fffbeb',
                                      border: '1px solid #fed7aa',
                                      borderRadius: 4,
                                      padding: '2px 8px',
                                    }}
                                  >
                                    ◐ {t('taxis.settlements.audit.statusPartial')}
                                  </span>
                                )}
                                {(day.status === 'full' || isAllResolved(day)) && (
                                  <span
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      color: '#2f9e44',
                                      background: '#f0fdf4',
                                      border: '1px solid #86efac',
                                      borderRadius: 4,
                                      padding: '2px 8px',
                                    }}
                                  >
                                    ✓ {t('taxis.settlements.audit.statusFull')}
                                  </span>
                                )}
                                {day.status === 'future' && (
                                  <span
                                    style={{
                                      fontSize: 11,
                                      color: '#adb5bd',
                                      background: '#f8fafc',
                                      border: '1px solid #e2e8f0',
                                      borderRadius: 4,
                                      padding: '2px 8px',
                                    }}
                                  >
                                    — {t('taxis.settlements.audit.statusFuture')}
                                  </span>
                                )}
                              </td>
                            )
                          case 'count':
                            return (
                              <td
                                key={key}
                                style={{
                                  padding: '8px 12px',
                                  fontWeight: 600,
                                  color: sim ? '#7c3aed' : day.isFuture ? '#adb5bd' : '#334155',
                                  fontStyle: sim ? 'italic' : 'normal',
                                  ...col('count'),
                                }}
                              >
                                {sim ? sim.count : day.isFuture ? '—' : filteredRecords.length}
                              </td>
                            )
                          case 'total':
                            return (
                              <td
                                key={key}
                                style={{
                                  padding: '8px 12px',
                                  fontWeight: 700,
                                  color: sim ? '#7c3aed' : day.isFuture ? '#adb5bd' : '#1e3a5f',
                                  whiteSpace: 'nowrap',
                                  fontStyle: sim ? 'italic' : 'normal',
                                  ...col('total'),
                                }}
                              >
                                {sim ? (
                                  sim.total > 0 ? (
                                    fmt(sim.total)
                                  ) : (
                                    <span style={{ color: '#adb5bd' }}>—</span>
                                  )
                                ) : day.isFuture ? (
                                  '—'
                                ) : filteredTotal > 0 ? (
                                  fmt(filteredTotal)
                                ) : (
                                  <span style={{ color: '#adb5bd' }}>—</span>
                                )}
                              </td>
                            )
                          case 'cumul':
                            return (
                              <td
                                key={key}
                                style={{
                                  padding: '8px 12px',
                                  fontWeight: 500,
                                  color: day.isFuture ? '#cbd5e1' : '#64748b',
                                  whiteSpace: 'nowrap',
                                  fontVariantNumeric: 'tabular-nums',
                                  borderLeft: '1px dashed #e2e8f0',
                                  ...col('cumul'),
                                }}
                              >
                                {day.isFuture && cumulativeTotals[dayIdx].actual === 0 ? (
                                  <span style={{ color: '#cbd5e1' }}>—</span>
                                ) : (
                                  fmt(cumulativeTotals[dayIdx].actual)
                                )}
                              </td>
                            )
                          case 'cumul_ideal':
                            return (
                              <td
                                key={key}
                                style={{
                                  padding: '8px 12px',
                                  fontWeight: 500,
                                  color: '#7c3aed',
                                  whiteSpace: 'nowrap',
                                  fontVariantNumeric: 'tabular-nums',
                                  fontStyle: 'italic',
                                  opacity: day.isFuture ? 0.4 : 1,
                                  ...col('cumul_ideal'),
                                }}
                              >
                                {fmt(cumulativeTotals[dayIdx].ideal)}
                              </td>
                            )
                          case 'settled':
                            return visibleCols.settled ? (
                              <AuditSettledCell
                                key={key}
                                day={day}
                                auditDriverFilter={auditDriverFilter}
                                drivers={drivers}
                                periodDrivers={periodDrivers}
                                addingSettlementDay={addingSettlementDay}
                                setAddingSettlementDay={setAddingSettlementDay}
                                setLoadingDay={setLoadingDay}
                                dispatch={dispatch}
                                taxiSettlementActions={taxiSettlementActions}
                                dispatchCreate={dispatchCreate}
                              />
                            ) : null
                          case 'missing':
                            return visibleCols.missing ? (
                              <AuditMissingCell
                                key={key}
                                day={day}
                                auditDriverFilter={auditDriverFilter}
                                periodDrivers={periodDrivers}
                                getNote={getNote}
                                getResolved={getResolved}
                                editingNote={editingNote}
                                setEditingNote={setEditingNote}
                                handleResolvedToggle={handleResolvedToggle}
                                handleNoteSave={(date, driver, note) => {
                                  handleNoteSave(date, driver, note)
                                  setEditingNote(null)
                                }}
                                loadingDay={loadingDay}
                                dispatchCreate={dispatchCreate}
                                t={t}
                              />
                            ) : null
                          default:
                            return null
                        }
                      })}
                    </tr>

                    {/* Expanded detail row */}
                    {selectedAuditDay === day.d && (
                      <AuditDayDetail
                        day={day}
                        periodDrivers={periodDrivers}
                        getNote={getNote}
                        t={t}
                      />
                    )}
                  </React.Fragment>
                )
              })
            })()}
          </tbody>
          <tfoot>
            <tr
              style={{
                background: selected === 'simulacro' ? '#4c1d95' : '#1e3a5f',
                borderTop: '2px solid #1e3a5f',
              }}
            >
              <td
                style={{
                  padding: '9px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.75)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {selected === 'simulacro'
                  ? '~ Simulacro total'
                  : t('taxis.settlements.audit.total')}
              </td>
              {colOrder.map((key) => {
                switch (key) {
                  case 'weekday':
                  case 'status':
                    return <td key={key} style={col(key)} />
                  case 'count':
                    return (
                      <td
                        key={key}
                        style={{
                          padding: '9px 12px',
                          fontWeight: 700,
                          color: '#fff',
                          fontSize: 13,
                          fontStyle: selected === 'simulacro' ? 'italic' : 'normal',
                          ...col('count'),
                        }}
                      >
                        {selected === 'simulacro'
                          ? auditFilteredDays.reduce((s, d) => s + simulateDay(d).count, 0)
                          : auditFilteredDays
                              .filter((d) => !d.isFuture)
                              .reduce((s, d) => {
                                const recs =
                                  auditDriverFilter.size > 0
                                    ? d.dayRecords.filter((r) => auditDriverFilter.has(r.driver))
                                    : d.dayRecords
                                return s + recs.length
                              }, 0)}
                      </td>
                    )
                  case 'total':
                    return (
                      <td
                        key={key}
                        style={{
                          padding: '9px 12px',
                          fontWeight: 700,
                          color: '#fff',
                          fontSize: 13,
                          whiteSpace: 'nowrap',
                          fontStyle: selected === 'simulacro' ? 'italic' : 'normal',
                          ...col('total'),
                        }}
                      >
                        {selected === 'simulacro'
                          ? fmt(auditFilteredDays.reduce((s, d) => s + simulateDay(d).total, 0))
                          : fmt(
                              auditFilteredDays
                                .filter((d) => !d.isFuture)
                                .reduce((s, d) => {
                                  const recs =
                                    auditDriverFilter.size > 0
                                      ? d.dayRecords.filter((r) => auditDriverFilter.has(r.driver))
                                      : d.dayRecords
                                  return s + recs.reduce((a, r) => a + (r.amount || 0), 0)
                                }, 0),
                            )}
                      </td>
                    )
                  case 'cumul':
                    return (
                      <td
                        key={key}
                        style={{
                          padding: '9px 12px',
                          fontWeight: 700,
                          color: 'rgba(255,255,255,0.5)',
                          fontSize: 11,
                          whiteSpace: 'nowrap',
                          fontVariantNumeric: 'tabular-nums',
                          borderLeft: '1px dashed rgba(255,255,255,0.2)',
                          fontStyle: 'italic',
                          ...col('cumul'),
                        }}
                      >
                        = total
                      </td>
                    )
                  case 'cumul_ideal':
                    return (
                      <td
                        key={key}
                        style={{
                          padding: '9px 12px',
                          fontWeight: 700,
                          color: '#d8b4fe',
                          fontSize: 13,
                          whiteSpace: 'nowrap',
                          fontVariantNumeric: 'tabular-nums',
                          fontStyle: 'italic',
                          ...col('cumul_ideal'),
                        }}
                      >
                        {fmt(auditFilteredDays.reduce((s, d) => s + simulateDay(d).total, 0))}
                      </td>
                    )
                  case 'settled':
                    return visibleCols.settled ? <td key={key} /> : null
                  case 'missing':
                    return visibleCols.missing ? <td key={key} /> : null
                  default:
                    return null
                }
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

export default AuditView
