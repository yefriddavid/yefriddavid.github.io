import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { CButtonGroup, CFormCheck, CSpinner } from '@coreui/react'
import DetailPanel, { DetailSection, DetailRow } from 'src/components/App/DetailPanel'
import MultiSelectDropdown from 'src/components/App/MultiSelectDropdown'
import * as taxiSettlementActions from 'src/actions/Taxi/taxiSettlementActions'
import { fmt } from './utils'
import AuditAddForm from './AuditAddForm'
import { DAY_NAMES } from 'src/constants/cashFlow'


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
  const dispatch = useDispatch()
  const { fetching: settlementFetching } = useSelector((s) => s.taxiSettlement)

  const [creatingDays, setCreatingDays] = useState(new Set())
  const [auditPlateFilter, setAuditPlateFilter] = useState('')
  const [auditDriverFilter, setAuditDriverFilter] = useState(new Set())
  const [auditStatusFilter, setAuditStatusFilter] = useState(new Set())
  const [selectedAuditDay, setSelectedAuditDay] = useState(null)
  const [hoveredAuditDay, setHoveredAuditDay] = useState(null)
  const [addingSettlementDay, setAddingSettlementDay] = useState(null)
  const [editingNote, setEditingNote] = useState(null)
  const [selected, setSelected] = useState('edicion')

  useEffect(() => {
    if (!settlementFetching) setCreatingDays(new Set())
  }, [settlementFetching])

  const dispatchCreate = (payload) => {
    setCreatingDays((prev) => new Set(prev).add(payload.date))
    dispatch(taxiSettlementActions.createRequest(payload))
  }

  const simulateDay = (day) => {
    const eligible = periodDrivers.filter((d) => {
      if (!d.defaultVehicle) return false
      if (d.startDate && d.startDate > day.dateStr) return false
      if (d.endDate && d.endDate < day.dateStr) return false
      if (day.picoPlacaVehicles?.includes(d.defaultVehicle)) return false
      // apply driver filter if active
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

  const auditAccent = { none: '#e03131', partial: '#e67700', full: '#2f9e44', future: '#cbd5e1' }

  const hasFilters = auditPlateFilter || auditDriverFilter.size > 0 || auditStatusFilter.size > 0

  return (
    <div style={{ padding: 16 }}>
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
            'taxis.settlements.audit.activeDrivers' +
              (auditDrivers.length !== 1 ? '_plural' : ''),
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
          label={(size) =>
            size > 0 ? `Conductor (${size})` : 'Conductor: Todos'
          }
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

        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          Mode:
          <CButtonGroup role="group" aria-label="Basic checkbox toggle button group">
            <CFormCheck
              type="radio"
              button={{ color: 'success', variant: 'outline' }}
              name="options"
              id="btn-edicion"
              value="edicion"
              label="Edición"
              autoComplete="off"
              checked={selected === 'edicion'}
              onChange={(e) => setSelected(e.target.value)}
            />
            <CFormCheck
              type="radio"
              button={{ color: 'danger', variant: 'outline' }}
              name="options"
              id="btn-simulacro"
              value="simulacro"
              label="Simulacro"
              autoComplete="off"
              checked={selected === 'simulacro'}
              onChange={(e) => setSelected(e.target.value)}
              style={{ borderRadius: '10px' }}
            />
          </CButtonGroup>
        </div>

        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
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
        </div>
      </div>

      {/* Audit table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#1e3a5f' }}>
              {[
                t('taxis.settlements.audit.colDay'),
                t('taxis.settlements.audit.colWeekday'),
                t('taxis.settlements.audit.colStatus'),
                t('taxis.settlements.audit.colCount'),
                t('taxis.settlements.audit.colTotal'),
                t('taxis.settlements.audit.colSettled'),
                t('taxis.settlements.audit.colMissing'),
              ].map((h) => (
                <th
                  key={h}
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
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {auditFilteredDays.map((day) => {
              const filteredRecords =
                auditDriverFilter.size > 0
                  ? day.dayRecords.filter((r) => auditDriverFilter.has(r.driver))
                  : day.dayRecords
              const filteredTotal = filteredRecords.reduce((s, r) => s + (r.amount || 0), 0)
              const sim = selected === 'simulacro' ? simulateDay(day) : null

              return (
                <React.Fragment key={day.d}>
                  <tr
                    onClick={() =>
                      setSelectedAuditDay((prev) => (prev === day.d ? null : day.d))
                    }
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
                      {creatingDays.has(day.dateStr) && (
                        <CSpinner
                          size="sm"
                          color="primary"
                          style={{ width: 11, height: 11, marginLeft: 6, verticalAlign: 'middle' }}
                        />
                      )}
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

                    {/* Weekday cell */}
                    <td
                      style={{
                        padding: '8px 12px',
                        color:
                          day.isSunday || day.isHoliday
                            ? '#7c5e00'
                            : day.isFuture
                              ? '#adb5bd'
                              : '#64748b',
                        fontWeight: day.isSunday || day.isHoliday ? 700 : 400,
                      }}
                    >
                      {DAY_NAMES[day.dow]}
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

                    {/* Status cell */}
                    <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
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

                    {/* Count cell */}
                    <td
                      style={{
                        padding: '8px 12px',
                        fontWeight: 600,
                        color: sim ? '#7c3aed' : day.isFuture ? '#adb5bd' : '#334155',
                        fontStyle: sim ? 'italic' : 'normal',
                      }}
                    >
                      {sim ? sim.count : day.isFuture ? '—' : filteredRecords.length}
                    </td>

                    {/* Total cell */}
                    <td
                      style={{
                        padding: '8px 12px',
                        fontWeight: 700,
                        color: sim ? '#7c3aed' : day.isFuture ? '#adb5bd' : '#1e3a5f',
                        whiteSpace: 'nowrap',
                        fontStyle: sim ? 'italic' : 'normal',
                      }}
                    >
                      {sim ? (
                        sim.total > 0 ? fmt(sim.total) : <span style={{ color: '#adb5bd' }}>—</span>
                      ) : day.isFuture ? (
                        '—'
                      ) : filteredTotal > 0 ? (
                        fmt(filteredTotal)
                      ) : (
                        <span style={{ color: '#adb5bd' }}>—</span>
                      )}
                    </td>

                    {/* Settled drivers cell */}
                    <td style={{ padding: '8px 6px' }}>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 4,
                          alignItems: 'center',
                        }}
                      >
                        {(auditDriverFilter.size > 0
                          ? day.settled.filter((dr) => auditDriverFilter.has(dr))
                          : day.settled
                        ).map((dr) => {
                          const plate = drivers.find((d) => d.name === dr)?.defaultVehicle
                          const underpaid = plate ? day.underpaidVehicles.includes(plate) : false
                          const driverRecords = day.dayRecords.filter((r) => r.driver === dr)
                          return driverRecords.map((rec) => (
                            <span
                              key={rec.id}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                                fontSize: 11,
                                background: underpaid ? '#fff3cd' : '#dbeafe',
                                color: underpaid ? '#7c5e00' : '#1e40af',
                                borderRadius: 4,
                                padding: '2px 7px',
                                fontWeight: 500,
                              }}
                            >
                              {underpaid ? '◐ ' : ''}
                              {dr.split(' ')[0]}
                              {driverRecords.length > 1 ? ` · ${fmt(rec.amount)}` : ''}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (
                                    window.confirm(
                                      `¿Eliminar liquidación de ${dr} (${fmt(rec.amount)}) del ${day.dateStr}?`,
                                    )
                                  ) {
                                    setCreatingDays((prev) => new Set(prev).add(day.dateStr))
                                    dispatch(taxiSettlementActions.deleteRequest({ id: rec.id }))
                                  }
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#e03131',
                                  fontSize: 12,
                                  lineHeight: 1,
                                  padding: 0,
                                  marginLeft: 1,
                                }}
                                title="Eliminar liquidación"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        })}
                        {!day.isFuture && addingSettlementDay !== day.dateStr && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setAddingSettlementDay(day.dateStr)
                            }}
                            style={{
                              background: 'none',
                              border: '1px dashed #93c5fd',
                              color: '#3b82f6',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: 14,
                              lineHeight: 1,
                              padding: '1px 7px',
                            }}
                            title="Agregar liquidación"
                          >
                            +
                          </button>
                        )}
                      </div>
                      {!day.isFuture && addingSettlementDay === day.dateStr && (
                        <AuditAddForm
                          day={day}
                          activeDrivers={drivers.filter((d) => d.active !== false)}
                          periodDrivers={periodDrivers}
                          onSave={(payload) => {
                            dispatchCreate(payload)
                            setAddingSettlementDay(null)
                          }}
                          onCancel={() => setAddingSettlementDay(null)}
                        />
                      )}
                    </td>

                    {/* Issues cell */}
                    <td style={{ padding: '8px 6px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {/* Underpaid vehicles */}
                        {!day.isFuture &&
                          day.underpaidVehicles.map((pl) => {
                            const driver = periodDrivers.find((d) => {
                              if (d.defaultVehicle !== pl) return false
                              if (d.startDate && d.startDate > day.dateStr) return false
                              if (d.endDate && d.endDate < day.dateStr) return false
                              return true
                            })
                            if (!driver) return null
                            if (auditDriverFilter.size > 0 && !auditDriverFilter.has(driver.name))
                              return null
                            const expected = day.isSunday
                              ? driver.defaultAmountSunday || driver.defaultAmount || 0
                              : driver.defaultAmount || 0
                            const paid = day.dayRecords
                              .filter((r) => r.plate === pl)
                              .reduce((s, r) => s + (r.amount || 0), 0)
                            const note = getNote(day.dateStr, driver.name)
                            const resolved = getResolved(day.dateStr, driver.name)
                            const isEditing =
                              editingNote?.date === day.dateStr &&
                              editingNote?.driver === driver.name
                            return (
                              <IssueEntry
                                key={pl}
                                label={`◐ ${driver.name.split(' ')[0]} · ${fmt(paid)}/${fmt(expected)}`}
                                note={note}
                                resolved={resolved}
                                isEditing={isEditing}
                                onResolveToggle={(e) => {
                                  e.stopPropagation()
                                  handleResolvedToggle(day.dateStr, driver.name)
                                }}
                                onEditToggle={(e) => {
                                  e.stopPropagation()
                                  setEditingNote(
                                    isEditing
                                      ? null
                                      : { date: day.dateStr, driver: driver.name },
                                  )
                                }}
                                onNoteSave={(val) =>
                                  handleNoteSave(day.dateStr, driver.name, val)
                                }
                                onNoteDelete={(e) => {
                                  e.stopPropagation()
                                  handleNoteSave(day.dateStr, driver.name, '')
                                }}
                                t={t}
                              />
                            )
                          })}

                        {/* Missing drivers */}
                        {!day.isFuture &&
                          (auditDriverFilter.size > 0
                            ? day.missing.filter((dr) => auditDriverFilter.has(dr))
                            : day.missing
                          ).map((dr) => {
                            const note = getNote(day.dateStr, dr)
                            const resolved = getResolved(day.dateStr, dr)
                            const isEditing =
                              editingNote?.date === day.dateStr && editingNote?.driver === dr
                            const driverObj = periodDrivers.find((d) => d.name === dr)
                            return (
                              <IssueEntry
                                key={dr}
                                label={dr.split(' ')[0]}
                                note={note}
                                resolved={resolved}
                                isEditing={isEditing}
                                onQuickSettle={(e) => {
                                  e.stopPropagation()
                                  if (!driverObj) return
                                  const amount =
                                    day.isSunday || day.isHoliday
                                      ? driverObj.defaultAmountSunday || driverObj.defaultAmount || 0
                                      : driverObj.defaultAmount || 0
                                  dispatchCreate({
                                    driver: dr,
                                    plate: driverObj.defaultVehicle || '',
                                    amount,
                                    date: day.dateStr,
                                  })
                                }}
                                onResolveToggle={(e) => {
                                  e.stopPropagation()
                                  handleResolvedToggle(day.dateStr, dr)
                                }}
                                onEditToggle={(e) => {
                                  e.stopPropagation()
                                  setEditingNote(
                                    isEditing ? null : { date: day.dateStr, driver: dr },
                                  )
                                }}
                                onNoteSave={(val) => handleNoteSave(day.dateStr, dr, val)}
                                onNoteDelete={(e) => {
                                  e.stopPropagation()
                                  handleNoteSave(day.dateStr, dr, '')
                                }}
                                t={t}
                              />
                            )
                          })}

                        {/* Pico y placa drivers */}
                        {!day.isFuture &&
                          (auditDriverFilter.size > 0
                            ? day.picoPlacaDrivers.filter((dr) => auditDriverFilter.has(dr))
                            : day.picoPlacaDrivers
                          ).map((dr) => (
                            <div
                              key={dr}
                              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <span
                                style={{
                                  fontSize: 11,
                                  background: '#f3e8ff',
                                  color: '#6b21a8',
                                  border: '1px solid #d8b4fe',
                                  borderRadius: 4,
                                  padding: '2px 7px',
                                  fontWeight: 600,
                                }}
                              >
                                🚫 {dr.split(' ')[0]}
                              </span>
                            </div>
                          ))}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded detail row */}
                  {selectedAuditDay === day.d && (
                    <tr>
                      <td
                        colSpan={7}
                        style={{ padding: 0, background: 'var(--cui-card-bg, #fff)' }}
                      >
                        <DetailPanel columns={2}>
                          <DetailSection title={t('taxis.settlements.audit.colDay')}>
                            <DetailRow
                              label={t('taxis.settlements.fields.date')}
                              value={day.dateStr}
                            />
                            <DetailRow
                              label={t('taxis.settlements.audit.colStatus')}
                              value={
                                day.status === 'none'
                                  ? t('taxis.settlements.audit.statusNone')
                                  : day.status === 'partial'
                                    ? t('taxis.settlements.audit.statusPartial')
                                    : day.status === 'full'
                                      ? t('taxis.settlements.audit.statusFull')
                                      : t('taxis.settlements.audit.statusFuture')
                              }
                            />
                            <DetailRow
                              label={t('taxis.settlements.audit.colCount')}
                              value={day.dayRecords.length}
                            />
                            <DetailRow
                              label={t('taxis.settlements.audit.colTotal')}
                              value={day.total > 0 ? fmt(day.total) : null}
                            />
                          </DetailSection>
                          <DetailSection
                            title={
                              day.dayRecords.length > 0
                                ? t('taxis.settlements.audit.colSettled')
                                : t('taxis.settlements.audit.colMissing')
                            }
                          >
                            {day.dayRecords.length > 0
                              ? day.dayRecords.map((r) => (
                                  <DetailRow
                                    key={r.id}
                                    label={[r.driver, r.plate].filter(Boolean).join(' · ')}
                                    value={`${fmt(r.amount)}${r.comment ? ` — ${r.comment}` : ''}`}
                                  />
                                ))
                              : day.missing.map((dr) => (
                                  <DetailRow
                                    key={dr}
                                    label={dr}
                                    value={getNote(day.dateStr, dr) || '—'}
                                  />
                                ))}
                            {day.hasPicoPlaca &&
                              day.picoPlacaDrivers.map((dr) => {
                                const driverObj = periodDrivers.find((pd) => pd.name === dr)
                                return (
                                  <div
                                    key={dr}
                                    style={{
                                      display: 'flex',
                                      gap: 8,
                                      padding: '5px 0',
                                      borderBottom: '1px solid #e8e8e8',
                                    }}
                                  >
                                    <span
                                      style={{
                                        minWidth: 150,
                                        fontSize: 12,
                                        color: '#6b21a8',
                                        fontWeight: 500,
                                      }}
                                    >
                                      🚫 {dr}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: 12,
                                        fontFamily: 'monospace',
                                        color: '#6b21a8',
                                      }}
                                    >
                                      {driverObj?.defaultVehicle || ''} · Pico y placa
                                    </span>
                                  </div>
                                )
                              })}
                          </DetailSection>
                        </DetailPanel>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: selected === 'simulacro' ? '#4c1d95' : '#1e3a5f', borderTop: '2px solid #1e3a5f' }}>
              <td
                colSpan={3}
                style={{
                  padding: '9px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.75)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {selected === 'simulacro' ? '~ Simulacro total' : t('taxis.settlements.audit.total')}
              </td>
              <td
                style={{ padding: '9px 12px', fontWeight: 700, color: '#fff', fontSize: 13, fontStyle: selected === 'simulacro' ? 'italic' : 'normal' }}
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
              <td
                style={{
                  padding: '9px 12px',
                  fontWeight: 700,
                  color: '#fff',
                  fontSize: 13,
                  whiteSpace: 'nowrap',
                  fontStyle: selected === 'simulacro' ? 'italic' : 'normal',
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
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// Internal sub-component for missing/underpaid driver entries with note editing
const IssueEntry = ({
  label,
  note,
  resolved,
  isEditing,
  onResolveToggle,
  onEditToggle,
  onNoteSave,
  onNoteDelete,
  onQuickSettle,
  t,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span
        style={{
          fontSize: 11,
          background: resolved ? '#dcfce7' : '#fee2e2',
          color: resolved ? '#166534' : '#b91c1c',
          borderRadius: 4,
          padding: '2px 7px',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {onQuickSettle && (
          <button
            onClick={onQuickSettle}
            title="Crear liquidación"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: '#2f9e44',
              fontSize: 13,
              lineHeight: 1,
              fontWeight: 700,
            }}
          >
            ✓
          </button>
        )}
        {label}
      </span>
      <button
        onClick={onResolveToggle}
        title={resolved ? 'Desmarcar resuelto' : 'Marcar como resuelto'}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '1px 3px',
          color: resolved ? '#2f9e44' : '#adb5bd',
          fontSize: 14,
          lineHeight: 1,
          fontWeight: 700,
        }}
      >
        ✓
      </button>
      <button
        onClick={onEditToggle}
        title={note ? t('taxis.settlements.audit.editNote') : t('taxis.settlements.audit.addNote')}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '1px 3px',
          color: note ? '#e67700' : '#adb5bd',
          fontSize: 12,
          lineHeight: 1,
        }}
      >
        ✎
      </button>
      {note && (
        <button
          onClick={onNoteDelete}
          title={t('common.remove')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '1px 3px',
            color: '#e03131',
            fontSize: 11,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </div>
    {isEditing && (
      <input
        autoFocus
        defaultValue={note}
        placeholder={t('taxis.settlements.audit.notePlaceholder')}
        onBlur={(e) => onNoteSave(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onNoteSave(e.target.value)
          if (e.key === 'Escape') onNoteSave(note)
        }}
        style={{
          fontSize: 11,
          padding: '2px 6px',
          borderRadius: 4,
          border: '1px solid #fed7aa',
          outline: 'none',
          width: 140,
        }}
      />
    )}
    {!isEditing && note && (
      <span
        style={{
          fontSize: 10,
          color: '#92400e',
          background: '#fffbeb',
          border: '1px solid #fcd34d',
          borderRadius: 3,
          padding: '1px 5px',
          maxWidth: 160,
          wordBreak: 'break-word',
        }}
      >
        {note}
      </span>
    )}
  </div>
)

export default AuditView
