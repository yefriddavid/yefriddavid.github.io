import React from 'react'
import * as taxiSettlementActions from 'src/actions/taxi/taxiSettlementActions'
import { fmt } from '../utils'
import AuditMissingCell from '../AuditMissingCell'
import AuditNotesCell from '../AuditNotesCell'
import AuditSettledCell from '../AuditSettledCell'
import AuditDayDetail from '../AuditDayDetail'

const AuditTable = ({
  t,
  dispatch,
  activeDayNames,
  auditFilteredDays,
  selected,
  colOrder,
  col,
  colLabels,
  visibleCols,
  selectedAuditDay,
  setSelectedAuditDay,
  hoveredAuditDay,
  setHoveredAuditDay,
  scrollDivRef,
  handleTableScroll,
  theadRef,
  stickyData,
  stickyScrollDivRef,
  auditDriverFilter,
  simulateDay,
  loadingDay,
  setLoadingDay,
  dispatchCreate,
  addingSettlementDay,
  setAddingSettlementDay,
  editingNote,
  setEditingNote,
  // passed from parent component
  drivers,
  periodDrivers,
  isAllResolved,
  auditRowBg,
  auditLeftBorder,
  getNote,
  getResolved,
  getNotesForDay,
  handleResolvedToggle,
  handleNoteSave,
  handleBookNoteSave,
  handleBookResolvedToggle,
}) => {
  return (
    <>
      {/* Sticky header — fixed position so escapes any overflow/scroll container */}
      {stickyData.show && stickyData.colWidths.length > 0 && (
        <div
          data-testid="audit-sticky-header"
          style={{
            position: 'fixed',
            top: stickyData.top,
            left: stickyData.left,
            right: 0,
            zIndex: 1000,
            background: '#1e3a5f',
            overflow: 'hidden',
          }}
        >
          <div
            ref={stickyScrollDivRef}
            style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <table
              style={{
                borderCollapse: 'collapse',
                fontSize: 13,
                tableLayout: 'fixed',
                width: stickyData.colWidths.reduce((a, b) => a + b, 0),
              }}
            >
              <thead>
                <tr style={{ background: '#1e3a5f' }}>
                  <th
                    style={{
                      width: stickyData.colWidths[0],
                      padding: '9px 12px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'rgba(255,255,255,0.9)',
                      whiteSpace: 'nowrap',
                      borderRight: '1px solid rgba(255,255,255,0.1)',
                      position: 'sticky',
                      left: 0,
                      background: '#1e3a5f',
                      zIndex: 3,
                    }}
                  >
                    {t('taxis.settlements.audit.colDay')}
                  </th>
                  {colOrder.map((key, i) => (
                    <th
                      key={key}
                      style={{
                        width: stickyData.colWidths[i + 1],
                        padding: '9px 12px',
                        textAlign: 'left',
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'rgba(255,255,255,0.9)',
                        whiteSpace: 'nowrap',
                        borderRight: '1px solid rgba(255,255,255,0.1)',
                        ...(key === 'weekday' && {
                          position: 'sticky',
                          left: stickyData.colWidths[0],
                          background: '#1e3a5f',
                          zIndex: 3,
                          boxShadow: '2px 0 4px rgba(0,0,0,0.15)',
                        }),
                        ...col(key),
                      }}
                    >
                      {colLabels[key]}
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>
        </div>
      )}

      {/* Main scrollable table */}
      <div ref={scrollDivRef} style={{ overflowX: 'auto' }} onScroll={handleTableScroll}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead ref={theadRef}>
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
                  position: 'sticky',
                  left: 0,
                  zIndex: 3,
                  background: '#1e3a5f',
                  width: 60,
                  minWidth: 60,
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
                    ...(key === 'weekday' && {
                      position: 'sticky',
                      left: 60,
                      zIndex: 3,
                      background: '#1e3a5f',
                      boxShadow: '2px 0 4px rgba(0,0,0,0.15)',
                    }),
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
                          position: 'sticky',
                          left: 0,
                          zIndex: 1,
                          background: 'inherit',
                          width: 60,
                          minWidth: 60,
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
                                  position: 'sticky',
                                  left: 60,
                                  zIndex: 1,
                                  background: 'inherit',
                                  boxShadow: '2px 0 4px rgba(0,0,0,0.08)',
                                  ...col('weekday'),
                                }}
                              >
                                {activeDayNames[day.dow]}
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
                          case 'notes':
                            return visibleCols.notes ? (
                              <AuditNotesCell
                                key={key}
                                day={day}
                                auditDriverFilter={auditDriverFilter}
                                periodDrivers={periodDrivers}
                                getNotesForDay={getNotesForDay}
                                editingNote={editingNote}
                                setEditingNote={setEditingNote}
                                handleResolvedToggle={handleBookResolvedToggle}
                                handleNoteSave={(date, driver, note) => {
                                  handleBookNoteSave(date, driver, note)
                                  setEditingNote(null)
                                }}
                                t={t}
                              />
                            ) : null
                          default:
                            return null
                        }
                      })}
                    </tr>

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
                  case 'notes':
                    return visibleCols.notes ? <td key={key} /> : null
                  default:
                    return null
                }
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  )
}

export default AuditTable
