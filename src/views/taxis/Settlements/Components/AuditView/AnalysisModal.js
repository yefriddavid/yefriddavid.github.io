import React from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody, CSpinner } from '@coreui/react'
import { fmt } from '../utils'

const LEVEL_STYLE = {
  danger: { bg: '#fff5f5', border: '#fca5a5', color: '#b91c1c', icon: '🔴' },
  warning: { bg: '#fffbeb', border: '#fcd34d', color: '#92400e', icon: '🟡' },
  info: { bg: '#eff6ff', border: '#93c5fd', color: '#1e40af', icon: '🔵' },
  success: { bg: '#f0fdf4', border: '#86efac', color: '#166534', icon: '✅' },
}

export default function AnalysisModal({ visible, onClose, loading, result }) {
  const { summary, findings = [], driverRanking = [], driverPayments = [] } = result ?? {}

  return (
    <CModal visible={visible} onClose={onClose} size="lg">
      <CModalHeader style={{ background: '#faf5ff', borderBottom: '1px solid #e9d5ff' }}>
        <CModalTitle style={{ color: '#7c3aed', fontWeight: 700, fontSize: 16 }}>
          ✦ Análisis IA — Auditoría del período
        </CModalTitle>
      </CModalHeader>
      <CModalBody style={{ padding: 20 }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <CSpinner style={{ color: '#7c3aed' }} />
            <div style={{ marginTop: 12, color: '#7c3aed', fontSize: 13 }}>Analizando datos…</div>
          </div>
        )}

        {!loading && !result && (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>
            Sin datos para analizar.
          </div>
        )}

        {!loading && summary && (
          <>
            {/* Summary cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
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
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: '10px 14px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>{value}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Coverage bar */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>
                Distribución del período
              </div>
              <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 20 }}>
                {summary.fullPercent > 0 && (
                  <div
                    style={{
                      width: `${summary.fullPercent}%`,
                      background: '#2f9e44',
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
                      background: '#f59e0b',
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
                      background: '#e03131',
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
              <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                {[
                  { color: '#2f9e44', label: `Completo (${summary.fullCount})` },
                  { color: '#f59e0b', label: `Parcial (${summary.partialCount})` },
                  { color: '#e03131', label: `Sin liquidar (${summary.noneCount})` },
                ].map(({ color, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                    <span style={{ fontSize: 11, color: '#64748b' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Best / worst day */}
            {(summary.bestDay || summary.worstDay) && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                {summary.bestDay && (
                  <div
                    style={{
                      flex: 1,
                      background: '#f0fdf4',
                      border: '1px solid #86efac',
                      borderRadius: 8,
                      padding: '10px 14px',
                    }}
                  >
                    <div
                      style={{ fontSize: 11, color: '#166534', fontWeight: 600, marginBottom: 4 }}
                    >
                      Mejor día
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#166534' }}>
                      {fmt(summary.bestDay.total)}
                    </div>
                    <div style={{ fontSize: 11, color: '#166534', opacity: 0.8 }}>
                      {summary.bestDay.dateStr}
                    </div>
                  </div>
                )}
                {summary.worstDay && (
                  <div
                    style={{
                      flex: 1,
                      background: '#fff5f5',
                      border: '1px solid #fca5a5',
                      borderRadius: 8,
                      padding: '10px 14px',
                    }}
                  >
                    <div
                      style={{ fontSize: 11, color: '#b91c1c', fontWeight: 600, marginBottom: 4 }}
                    >
                      Día más bajo (con liquidaciones)
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#b91c1c' }}>
                      {fmt(summary.worstDay.total)}
                    </div>
                    <div style={{ fontSize: 11, color: '#b91c1c', opacity: 0.8 }}>
                      {summary.worstDay.dateStr}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Findings */}
            {findings.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 10 }}>
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
              <div>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 10 }}>
                  Conductores — días sin liquidar
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {driverRanking.map((dr) => {
                    const pct = summary.pastDays > 0 ? dr.missing / summary.pastDays : 0
                    const barColor = pct > 0.5 ? '#e03131' : pct > 0.25 ? '#f59e0b' : '#94a3b8'
                    return (
                      <div key={dr.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span
                          style={{ fontSize: 12, color: '#374151', minWidth: 140, fontWeight: 500 }}
                        >
                          {dr.name}
                        </span>
                        <div
                          style={{
                            flex: 1,
                            background: '#f1f5f9',
                            borderRadius: 4,
                            height: 8,
                            overflow: 'hidden',
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
                            fontWeight: 600,
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
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 10 }}>
                  Pagos por conductor
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      {['Conductor', 'Esperado', 'Pagado', 'Saldo'].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: '6px 10px',
                            textAlign: h === 'Conductor' ? 'left' : 'right',
                            fontWeight: 700,
                            color: '#475569',
                            borderBottom: '1px solid #e2e8f0',
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
                          dp.debt > 0 ? '#b91c1c' : dp.debt < 0 ? '#166534' : '#64748b'
                        return (
                          <tr
                            key={dp.name}
                            style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}
                          >
                            <td
                              style={{
                                padding: '7px 10px',
                                fontWeight: 500,
                                color: '#1e3a5f',
                                borderBottom: '1px solid #f1f5f9',
                              }}
                            >
                              {dp.name}
                            </td>
                            <td
                              style={{
                                padding: '7px 10px',
                                textAlign: 'right',
                                color: '#374151',
                                borderBottom: '1px solid #f1f5f9',
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {fmt(dp.expected)}
                            </td>
                            <td
                              style={{
                                padding: '7px 10px',
                                textAlign: 'right',
                                color: '#374151',
                                borderBottom: '1px solid #f1f5f9',
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {fmt(dp.paid)}
                            </td>
                            <td
                              style={{
                                padding: '7px 10px',
                                textAlign: 'right',
                                fontWeight: 700,
                                color: debtColor,
                                borderBottom: '1px solid #f1f5f9',
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
                          padding: '7px 10px',
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
                          padding: '7px 10px',
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
                          padding: '7px 10px',
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
                          padding: '7px 10px',
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
            )}
          </>
        )}
      </CModalBody>
    </CModal>
  )
}
