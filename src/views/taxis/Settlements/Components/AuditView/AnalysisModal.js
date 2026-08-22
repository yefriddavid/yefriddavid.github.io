import React from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody } from '@coreui/react'
import { fmt } from '../utils'
import Spinner from 'src/components/shared/Spinner'

const LEVEL_STYLE = {
  danger: {
    bg: 'rgba(var(--cui-danger-rgb), 0.12)',
    border: 'rgba(var(--cui-danger-rgb), 0.35)',
    color: 'var(--cui-danger)',
    icon: '🔴',
  },
  warning: {
    bg: 'rgba(var(--cui-warning-rgb), 0.12)',
    border: 'rgba(var(--cui-warning-rgb), 0.35)',
    color: 'var(--cui-warning)',
    icon: '🟡',
  },
  info: {
    bg: 'rgba(var(--cui-info-rgb), 0.12)',
    border: 'rgba(var(--cui-info-rgb), 0.35)',
    color: 'var(--cui-info)',
    icon: '🔵',
  },
  success: {
    bg: 'rgba(var(--cui-success-rgb), 0.12)',
    border: 'rgba(var(--cui-success-rgb), 0.35)',
    color: 'var(--cui-success)',
    icon: '✅',
  },
}

export default function AnalysisModal({ visible, onClose, loading, result }) {
  const { summary, findings = [], driverRanking = [], driverPayments = [] } = result ?? {}

  return (
    <CModal visible={visible} onClose={onClose} size="lg" fullscreen="sm">
      <CModalHeader
        style={{
          background: 'rgba(124, 58, 237, 0.08)',
          borderBottom: '1px solid rgba(124, 58, 237, 0.25)',
        }}
      >
        <CModalTitle style={{ color: '#7c3aed', fontWeight: 700, fontSize: 16 }}>
          ✦ Análisis IA — Auditoría del período
        </CModalTitle>
      </CModalHeader>
      <CModalBody style={{ padding: '15px 12px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spinner style={{ color: '#7c3aed' }} />
            <div style={{ marginTop: 12, color: '#7c3aed', fontSize: 13 }}>Analizando datos…</div>
          </div>
        )}

        {!loading && !result && (
          <div style={{ textAlign: 'center', color: 'var(--cui-secondary-color)', padding: 40 }}>
            Sin datos para analizar.
          </div>
        )}

        {!loading && summary && (
          <>
            {/* Summary cards */}
            <div
              className="analysis-summary-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 10,
                marginBottom: 20,
              }}
            >
              {[
                { label: 'Días analizados', value: summary.pastDays },
                { label: 'Total recaudado', value: fmt(summary.totalCollected) },
                { label: 'Promedio diario', value: fmt(summary.avgDaily) },
                { label: 'Cobertura completa', value: `${summary.fullPercent}%` },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    background: 'var(--cui-tertiary-bg)',
                    border: '1px solid var(--cui-border-color)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--cui-primary)' }}>
                    {value}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--cui-secondary-color)', marginTop: 2 }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* Coverage bar */}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--cui-secondary-color)',
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                Distribución del período
              </div>
              <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 20 }}>
                {summary.fullPercent > 0 && (
                  <div
                    style={{
                      width: `${summary.fullPercent}%`,
                      background: 'var(--cui-success)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      color: '#fff',
                      fontWeight: 700,
                    }}
                  >
                    {summary.fullPercent > 8 ? `${summary.fullPercent}%` : ''}
                  </div>
                )}
                {summary.partialPercent > 0 && (
                  <div
                    style={{
                      width: `${summary.partialPercent}%`,
                      background: 'var(--cui-warning)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      color: '#fff',
                      fontWeight: 700,
                    }}
                  >
                    {summary.partialPercent > 8 ? `${summary.partialPercent}%` : ''}
                  </div>
                )}
                {summary.nonePercent > 0 && (
                  <div
                    style={{
                      width: `${summary.nonePercent}%`,
                      background: 'var(--cui-danger)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      color: '#fff',
                      fontWeight: 700,
                    }}
                  >
                    {summary.nonePercent > 8 ? `${summary.nonePercent}%` : ''}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                {[
                  { color: 'var(--cui-success)', label: `Completo (${summary.fullCount})` },
                  { color: 'var(--cui-warning)', label: `Parcial (${summary.partialCount})` },
                  { color: 'var(--cui-danger)', label: `Sin liquidar (${summary.noneCount})` },
                ].map(({ color, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                    <span style={{ fontSize: 11, color: 'var(--cui-secondary-color)' }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Best / worst day */}
            {(summary.bestDay || summary.worstDay) && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                {summary.bestDay && (
                  <div
                    style={{
                      flex: '1 1 140px',
                      background: 'rgba(var(--cui-success-rgb), 0.12)',
                      border: '1px solid rgba(var(--cui-success-rgb), 0.35)',
                      borderRadius: 8,
                      padding: '10px 14px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--cui-success)',
                        fontWeight: 600,
                        marginBottom: 4,
                      }}
                    >
                      Mejor día
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--cui-success)' }}>
                      {fmt(summary.bestDay.total)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--cui-success)', opacity: 0.8 }}>
                      {summary.bestDay.dateStr}
                    </div>
                  </div>
                )}
                {summary.worstDay && (
                  <div
                    style={{
                      flex: '1 1 140px',
                      background: 'rgba(var(--cui-danger-rgb), 0.12)',
                      border: '1px solid rgba(var(--cui-danger-rgb), 0.35)',
                      borderRadius: 8,
                      padding: '10px 14px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--cui-danger)',
                        fontWeight: 600,
                        marginBottom: 4,
                      }}
                    >
                      Día más bajo
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--cui-danger)' }}>
                      {fmt(summary.worstDay.total)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--cui-danger)', opacity: 0.8 }}>
                      {summary.worstDay.dateStr}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Findings */}
            {findings.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--cui-secondary-color)',
                    fontWeight: 600,
                    marginBottom: 10,
                  }}
                >
                  Hallazgos ({findings.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {findings.map((f, i) => {
                    const s = LEVEL_STYLE[f.level] ?? LEVEL_STYLE.info
                    return (
                      <div
                        key={i}
                        style={{
                          background: s.bg,
                          border: `1px solid ${s.border}`,
                          borderRadius: 8,
                          padding: '10px 14px',
                          display: 'flex',
                          gap: 10,
                          alignItems: 'flex-start',
                        }}
                      >
                        <span style={{ fontSize: 14, flexShrink: 0 }}>{s.icon}</span>
                        <span style={{ fontSize: 13, color: s.color, lineHeight: 1.5 }}>
                          {f.message}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Driver ranking */}
            {driverRanking.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--cui-secondary-color)',
                    fontWeight: 600,
                    marginBottom: 10,
                  }}
                >
                  Conductores — días sin liquidar
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {driverRanking.map((dr) => {
                    const pct = summary.pastDays > 0 ? dr.missing / summary.pastDays : 0
                    const barColor =
                      pct > 0.5
                        ? 'var(--cui-danger)'
                        : pct > 0.25
                          ? 'var(--cui-warning)'
                          : 'var(--cui-secondary-color)'
                    return (
                      <div
                        key={dr.name}
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: '4px 10px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: 'var(--cui-body-color)',
                            minWidth: 100,
                            fontWeight: 600,
                            flex: '1 0 100px',
                          }}
                        >
                          {dr.name}
                        </span>
                        <div
                          style={{
                            flex: '1 0 150px',
                            background: 'var(--cui-tertiary-bg)',
                            borderRadius: 4,
                            height: 8,
                            overflow: 'hidden',
                            order: 3,
                            width: '100%',
                            marginTop: 2
                          }}
                        >
                          <div
                            style={{
                              width: `${pct * 100}%`,
                              background: barColor,
                              height: '100%',
                              borderRadius: 4,
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            color: barColor,
                            fontWeight: 700,
                            minWidth: 50,
                            textAlign: 'right',
                          }}
                        >
                          {dr.missing} día{dr.missing !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Driver payment summary */}
            {driverPayments.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--cui-secondary-color)',
                    fontWeight: 600,
                    marginBottom: 10,
                  }}
                >
                  Pagos por conductor
                </div>
                <div
                  style={{
                    overflowX: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    border: '1px solid var(--cui-border-color)',
                    borderRadius: 8,
                  }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 450 }}>
                    <thead>
                      <tr style={{ background: 'var(--cui-tertiary-bg)' }}>
                        {['Conductor', 'Esperado', 'Pagado', 'Saldo'].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: '8px 10px',
                              textAlign: h === 'Conductor' ? 'left' : 'right',
                              fontWeight: 700,
                              color: 'var(--cui-secondary-color)',
                              borderBottom: '1px solid var(--cui-border-color)',
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {driverPayments
                        .slice()
                        .sort((a, b) => b.debt - a.debt)
                        .map((dp, i) => {
                          const debtColor =
                            dp.debt > 0
                              ? 'var(--cui-danger)'
                              : dp.debt < 0
                                ? 'var(--cui-success)'
                                : 'var(--cui-secondary-color)'
                          return (
                            <tr
                              key={dp.name}
                              style={{
                                background:
                                  i % 2 === 0 ? 'var(--cui-card-bg)' : 'var(--cui-tertiary-bg)',
                              }}
                            >
                              <td
                                style={{
                                  padding: '8px 10px',
                                  fontWeight: 500,
                                  color: 'var(--cui-primary)',
                                  borderBottom: '1px solid var(--cui-border-color)',
                                }}
                              >
                                {dp.name}
                              </td>
                              <td
                                style={{
                                  padding: '8px 10px',
                                  textAlign: 'right',
                                  color: 'var(--cui-body-color)',
                                  borderBottom: '1px solid var(--cui-border-color)',
                                  fontVariantNumeric: 'tabular-nums',
                                }}
                              >
                                {fmt(dp.expected)}
                              </td>
                              <td
                                style={{
                                  padding: '8px 10px',
                                  textAlign: 'right',
                                  color: 'var(--cui-body-color)',
                                  borderBottom: '1px solid var(--cui-border-color)',
                                  fontVariantNumeric: 'tabular-nums',
                                }}
                              >
                                {fmt(dp.paid)}
                              </td>
                              <td
                                style={{
                                  padding: '8px 10px',
                                  textAlign: 'right',
                                  fontWeight: 700,
                                  color: debtColor,
                                  borderBottom: '1px solid var(--cui-border-color)',
                                  fontVariantNumeric: 'tabular-nums',
                                }}
                              >
                                {dp.debt > 0
                                  ? `−${fmt(dp.debt)}`
                                  : dp.debt < 0
                                    ? `+${fmt(Math.abs(dp.debt))}`
                                    : '—'}
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: '#1e3a5f' }}>
                        <td
                          style={{
                            padding: '8px 10px',
                            fontWeight: 700,
                            color: '#fff',
                            fontSize: 11,
                            textTransform: 'uppercase',
                          }}
                        >
                          Total
                        </td>
                        <td
                          style={{
                            padding: '8px 10px',
                            textAlign: 'right',
                            fontWeight: 700,
                            color: '#fff',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {fmt(driverPayments.reduce((s, d) => s + d.expected, 0))}
                        </td>
                        <td
                          style={{
                            padding: '8px 10px',
                            textAlign: 'right',
                            fontWeight: 700,
                            color: '#fff',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {fmt(driverPayments.reduce((s, d) => s + d.paid, 0))}
                        </td>
                        <td
                          style={{
                            padding: '8px 10px',
                            textAlign: 'right',
                            fontWeight: 700,
                            color: '#fca5a5',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {(() => {
                            const totalDebt = driverPayments.reduce((s, d) => s + d.debt, 0)
                            return totalDebt > 0
                              ? `−${fmt(totalDebt)}`
                              : totalDebt < 0
                                ? `+${fmt(Math.abs(totalDebt))}`
                                : '—'
                          })()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </CModalBody>
    </CModal>
  )
}
