import React, { useMemo } from 'react'
import { fmt, isApplicableToMonth, MONTHS_SHORT } from './helpers'

export default function AnnualView({ masters, transactions, year }) {
  const todayYear = new Date().getFullYear()
  const todayMonth = new Date().getMonth() + 1

  const paymentMap = useMemo(() => {
    const map = {}
    if (!transactions) return map
    transactions.forEach((t) => {
      if (!t.accountMasterId) return
      const match = t.date?.match(/^(\d{4})-(\d{2})/)
      if (!match) return
      if (parseInt(match[1]) !== year) return
      const m = parseInt(match[2])
      if (!map[t.accountMasterId]) map[t.accountMasterId] = {}
      map[t.accountMasterId][m] = (map[t.accountMasterId][m] || 0) + (t.amount || 0)
    })
    return map
  }, [transactions, year])

  const activeMasters = useMemo(() => (masters ?? []).filter((a) => a.active), [masters])
  const debtMasters = useMemo(
    () => activeMasters.filter((a) => a.targetAmount > 0),
    [activeMasters],
  )
  const outcomingMasters = useMemo(
    () => activeMasters.filter((a) => a.type === 'Outcoming' && !(a.targetAmount > 0)),
    [activeMasters],
  )
  const incomingMasters = useMemo(
    () => activeMasters.filter((a) => a.type === 'Incoming' && !(a.targetAmount > 0)),
    [activeMasters],
  )

  const freeExpensesByMonth = useMemo(() => {
    const result = {}
    if (!transactions) return result
    transactions.forEach((t) => {
      if (t.accountMasterId) return
      if (t.type !== 'expense') return
      const match = t.date?.match(/^(\d{4})-(\d{2})/)
      if (!match) return
      if (parseInt(match[1]) !== year) return
      const m = parseInt(match[2])
      if (!result[m]) result[m] = []
      result[m].push(t)
    })
    return result
  }, [transactions, year])

  const cumulativeDebtMap = useMemo(() => {
    const map = {}
    if (!transactions) return map
    transactions.forEach((t) => {
      if (!t.accountMasterId) return
      map[t.accountMasterId] = (map[t.accountMasterId] ?? 0) + (t.amount || 0)
    })
    return map
  }, [transactions])

  const calcMonthTotals = (accounts) => {
    const totals = Array(12).fill(0)
    accounts.forEach((account) => {
      for (let m = 1; m <= 12; m++) {
        totals[m - 1] += paymentMap[account.id]?.[m] || 0
      }
    })
    return totals
  }

  const outcomingTotals = useMemo(
    () => calcMonthTotals(outcomingMasters),
    [outcomingMasters, paymentMap],
  )
  const incomingTotals = useMemo(
    () => calcMonthTotals(incomingMasters),
    [incomingMasters, paymentMap],
  )

  const thStyle = {
    padding: '8px 6px',
    color: '#fff',
    fontWeight: 600,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    fontSize: 11,
  }
  const tdBase = {
    padding: '6px 6px',
    textAlign: 'right',
    fontSize: 11,
    whiteSpace: 'nowrap',
  }

  const renderRows = (accounts) =>
    accounts.map((account, idx) => {
      const accountTotal = Array.from(
        { length: 12 },
        (_, i) => paymentMap[account.id]?.[i + 1] || 0,
      ).reduce((s, v) => s + v, 0)

      return (
        <tr
          key={account.id}
          style={{
            borderBottom: '1px solid #f1f5f9',
            background: idx % 2 === 0 ? '#fff' : '#fafbfc',
          }}
        >
          <td
            style={{
              padding: '7px 12px',
              fontSize: 12,
              fontWeight: 600,
              color: '#1a1a2e',
              whiteSpace: 'nowrap',
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {account.important && <span style={{ color: '#e03131', marginRight: 4 }}>★</span>}
            {account.name}
          </td>
          {Array.from({ length: 12 }, (_, i) => {
            const month = i + 1
            const applies = isApplicableToMonth(account, month)
            const paid = paymentMap[account.id]?.[month] || 0
            const isPast = year < todayYear || (year === todayYear && month <= todayMonth)

            if (!applies)
              return (
                <td key={month} style={{ ...tdBase, background: '#f1f5f9', color: '#dee2e6' }} />
              )
            if (paid > 0)
              return (
                <td
                  key={month}
                  style={{ ...tdBase, background: '#f0fdf4', color: '#2f9e44', fontWeight: 700 }}
                >
                  {fmt(paid)}
                </td>
              )
            if (isPast)
              return (
                <td key={month} style={{ ...tdBase, background: '#fff5f5', color: '#e03131' }}>
                  —
                </td>
              )
            return (
              <td key={month} style={{ ...tdBase, color: '#adb5bd' }}>
                {account.defaultValue ? fmt(account.defaultValue) : '—'}
              </td>
            )
          })}
          <td
            style={{
              ...tdBase,
              fontWeight: 700,
              color: accountTotal > 0 ? '#1e3a5f' : '#adb5bd',
              background: accountTotal > 0 ? '#eef4ff' : undefined,
            }}
          >
            {accountTotal > 0 ? fmt(accountTotal) : '—'}
          </td>
        </tr>
      )
    })

  const renderTotalsRow = (totals, label, bg) => (
    <tr style={{ background: bg, fontWeight: 700 }}>
      <td style={{ padding: '8px 12px', color: '#fff', fontSize: 12 }}>{label}</td>
      {totals.map((total, i) => (
        <td
          key={i}
          style={{
            ...tdBase,
            color: total > 0 ? '#fff' : 'rgba(255,255,255,0.35)',
            fontWeight: 700,
          }}
        >
          {total > 0 ? fmt(total) : '—'}
        </td>
      ))}
      <td style={{ ...tdBase, color: '#fff', fontWeight: 800, fontSize: 13 }}>
        {fmt(totals.reduce((s, t) => s + t, 0))}
      </td>
    </tr>
  )

  const renderSectionHeader = (label, color) => (
    <tr>
      <td
        colSpan={14}
        style={{
          padding: '6px 12px',
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color,
          background: `${color}18`,
          borderTop: `2px solid ${color}`,
          borderBottom: `1px solid ${color}40`,
        }}
      >
        {label}
      </td>
    </tr>
  )

  const colHeader = (
    <tr style={{ background: '#1e3a5f' }}>
      <th style={{ ...thStyle, textAlign: 'left', minWidth: 160, padding: '8px 12px' }}>Cuenta</th>
      {MONTHS_SHORT.map((m) => (
        <th key={m} style={{ ...thStyle, minWidth: 72 }}>
          {m}
        </th>
      ))}
      <th style={{ ...thStyle, minWidth: 90 }}>Total</th>
    </tr>
  )

  return (
    <>
      <div style={{ overflowX: 'auto', border: '1px solid #e9ecef', borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>{colHeader}</thead>
          <tbody>
            {outcomingMasters.length > 0 && (
              <>
                {renderSectionHeader('Egresos', '#e03131')}
                {renderRows(outcomingMasters)}
              </>
            )}
            {incomingMasters.length > 0 && (
              <>
                {renderSectionHeader('Ingresos', '#2f9e44')}
                {renderRows(incomingMasters)}
              </>
            )}
          </tbody>
          <tfoot>
            {outcomingMasters.length > 0 &&
              renderTotalsRow(outcomingTotals, 'Total Egresos', '#c0392b')}
            {incomingMasters.length > 0 &&
              renderTotalsRow(incomingTotals, 'Total Ingresos', '#2f9e44')}
            {incomingMasters.length > 0 &&
              outcomingMasters.length > 0 &&
              (() => {
                const netTotals = incomingTotals.map((inc, i) => inc - outcomingTotals[i])
                const netTotal = netTotals.reduce((s, v) => s + v, 0)
                return (
                  <tr
                    style={{ background: '#1e3a5f', fontWeight: 700, borderTop: '2px solid #fff' }}
                  >
                    <td style={{ padding: '8px 12px', color: '#fff', fontSize: 12 }}>
                      Balance neto
                    </td>
                    {netTotals.map((val, i) => (
                      <td
                        key={i}
                        style={{
                          ...tdBase,
                          fontWeight: 700,
                          color:
                            val > 0 ? '#69db7c' : val < 0 ? '#ff8787' : 'rgba(255,255,255,0.35)',
                        }}
                      >
                        {val !== 0 ? fmt(Math.abs(val)) : '—'}
                      </td>
                    ))}
                    <td
                      style={{
                        ...tdBase,
                        fontWeight: 800,
                        fontSize: 13,
                        color: netTotal > 0 ? '#69db7c' : netTotal < 0 ? '#ff8787' : '#fff',
                      }}
                    >
                      {netTotal !== 0 ? fmt(Math.abs(netTotal)) : '—'}
                    </td>
                  </tr>
                )
              })()}
          </tfoot>
        </table>
      </div>

      {Object.keys(freeExpensesByMonth).length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#e03131',
              background: '#e0313118',
              borderTop: '2px solid #e03131',
              borderBottom: '1px solid #e0313140',
              padding: '6px 12px',
              borderRadius: '8px 8px 0 0',
            }}
          >
            Otros egresos
          </div>
          <div
            style={{
              border: '1px solid #e9ecef',
              borderTop: 'none',
              borderRadius: '0 0 8px 8px',
              overflow: 'hidden',
            }}
          >
            {Object.keys(freeExpensesByMonth)
              .map(Number)
              .sort((a, b) => a - b)
              .map((m) => {
                const monthRows = freeExpensesByMonth[m]
                const monthTotal = monthRows.reduce((s, t) => s + (t.amount || 0), 0)
                return (
                  <div key={m}>
                    <div
                      style={{
                        padding: '5px 12px',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#1e3a5f',
                        background: '#eef4ff',
                        borderBottom: '1px solid #e9ecef',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{MONTHS_SHORT[m - 1]}</span>
                      <span style={{ color: '#e03131' }}>{fmt(monthTotal)}</span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <tbody>
                        {monthRows.map((t, idx) => (
                          <tr
                            key={t.id ?? idx}
                            style={{
                              borderBottom: '1px solid #f1f5f9',
                              background: idx % 2 === 0 ? '#fff' : '#fafbfc',
                            }}
                          >
                            <td style={{ padding: '5px 12px', color: '#6c757d', width: 90 }}>
                              {t.date?.slice(5)}
                            </td>
                            <td style={{ padding: '5px 12px', fontWeight: 600 }}>
                              {t.description || '—'}
                            </td>
                            <td style={{ padding: '5px 12px', color: '#6c757d' }}>
                              {t.category || '—'}
                            </td>
                            <td
                              style={{
                                padding: '5px 12px',
                                textAlign: 'right',
                                fontWeight: 700,
                                color: '#e03131',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {fmt(t.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {debtMasters.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#7c3aed',
              background: '#7c3aed18',
              borderTop: '2px solid #7c3aed',
              borderBottom: '1px solid #7c3aed40',
              padding: '6px 12px',
              borderRadius: '8px 8px 0 0',
            }}
          >
            Deudas activas
          </div>
          <div
            style={{
              border: '1px solid #e9ecef',
              borderTop: 'none',
              borderRadius: '0 0 8px 8px',
              overflow: 'hidden',
            }}
          >
            {debtMasters.map((account, idx) => {
              const cumPaid = cumulativeDebtMap[account.id] ?? 0
              const remaining = Math.max(0, account.targetAmount - cumPaid)
              const pct = Math.min(100, Math.round((cumPaid / account.targetAmount) * 100))
              const isDone = remaining <= 0
              return (
                <div
                  key={account.id}
                  style={{
                    padding: '14px 16px',
                    background: idx % 2 === 0 ? '#fff' : '#fafbfc',
                    borderBottom: idx < debtMasters.length - 1 ? '1px solid #f1f5f9' : 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>
                        {account.important && (
                          <span style={{ color: '#e03131', marginRight: 4 }}>★</span>
                        )}
                        {account.name}
                      </span>
                      {account.category && (
                        <span style={{ marginLeft: 8, fontSize: 11, color: '#6c757d' }}>
                          {account.category}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: isDone ? '#2f9e44' : '#7c3aed',
                      }}
                    >
                      {isDone ? 'Saldada' : `Saldo: ${fmt(remaining)}`}
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      display: 'flex',
                      gap: 20,
                      flexWrap: 'wrap',
                      fontSize: 12,
                      color: '#6c757d',
                    }}
                  >
                    <span>
                      Meta:{' '}
                      <strong style={{ color: '#1a1a2e' }}>{fmt(account.targetAmount)}</strong>
                    </span>
                    <span>
                      Pagado: <strong style={{ color: '#2f9e44' }}>{fmt(cumPaid)}</strong>
                    </span>
                    <span>
                      Restante:{' '}
                      <strong style={{ color: isDone ? '#2f9e44' : '#e03131' }}>
                        {fmt(remaining)}
                      </strong>
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      height: 8,
                      background: '#e9ecef',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 4,
                        background: isDone ? '#2f9e44' : '#7c3aed',
                        width: `${pct}%`,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                  <div style={{ marginTop: 4, fontSize: 11, color: '#adb5bd', textAlign: 'right' }}>
                    {pct}% completado
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
