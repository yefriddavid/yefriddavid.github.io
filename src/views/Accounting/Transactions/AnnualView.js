import React, { useMemo } from 'react'
import { fmt, isApplicableToMonth, MONTHS_SHORT } from './helpers'
import './AnnualView.scss'

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

  const renderRows = (accounts) =>
    accounts.map((account) => {
      const accountTotal = Array.from(
        { length: 12 },
        (_, i) => paymentMap[account.id]?.[i + 1] || 0,
      ).reduce((s, v) => s + v, 0)

      return (
        <tr key={account.id}>
          <td className="account-name-cell">
            {account.important && <span className="important-star">★</span>}
            {account.name}
          </td>
          {Array.from({ length: 12 }, (_, i) => {
            const month = i + 1
            const applies = isApplicableToMonth(account, month)
            const paid = paymentMap[account.id]?.[month] || 0
            const isPast = year < todayYear || (year === todayYear && month <= todayMonth)

            if (!applies)
              return <td key={month} className="status-cell--not-applicable" />
            
            if (paid > 0)
              return (
                <td key={month} className="status-cell--paid">
                  {fmt(paid)}
                </td>
              )
            
            if (isPast)
              return (
                <td key={month} className="status-cell--past">
                  —
                </td>
              )
            
            return (
              <td key={month} className="status-cell--pending">
                {account.defaultValue ? fmt(account.defaultValue) : '—'}
              </td>
            )
          })}
          <td className={`total-cell ${accountTotal > 0 ? 'total-cell--has-value' : 'total-cell--empty'}`}>
            {accountTotal > 0 ? fmt(accountTotal) : '—'}
          </td>
        </tr>
      )
    })

  const renderTotalsRow = (totals, label, bg) => (
    <tr className="totals-row" style={{ background: bg }}>
      <td className="label-cell">{label}</td>
      {totals.map((total, i) => (
        <td
          key={i}
          className={total > 0 ? '' : 'value-cell--empty'}
        >
          {total > 0 ? fmt(total) : '—'}
        </td>
      ))}
      <td className="grand-total">
        {fmt(totals.reduce((s, t) => s + t, 0))}
      </td>
    </tr>
  )

  const renderSectionHeader = (label, color) => (
    <tr className="section-header-row">
      <td
        colSpan={14}
        style={{
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

  return (
    <>
      <div className="annual-view">
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', minWidth: 160, padding: '8px 12px' }}>Cuenta</th>
              {MONTHS_SHORT.map((m) => (
                <th key={m} style={{ minWidth: 72 }}>
                  {m}
                </th>
              ))}
              <th style={{ minWidth: 90 }}>Total</th>
            </tr>
          </thead>
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
                  <tr className="balance-neto">
                    <td>Balance neto</td>
                    {netTotals.map((val, i) => (
                      <td
                        key={i}
                        className={val > 0 ? 'positive' : val < 0 ? 'negative' : 'zero'}
                      >
                        {val !== 0 ? fmt(Math.abs(val)) : '—'}
                      </td>
                    ))}
                    <td className={`grand-total ${netTotal > 0 ? 'positive' : netTotal < 0 ? 'negative' : ''}`}>
                      {netTotal !== 0 ? fmt(Math.abs(netTotal)) : '—'}
                    </td>
                  </tr>
                )
              })()}
          </tfoot>
        </table>
      </div>

      {Object.keys(freeExpensesByMonth).length > 0 && (
        <div className="annual-view-others">
          <div className="section-title">
            Otros egresos
          </div>
          <div className="section-content">
            {Object.keys(freeExpensesByMonth)
              .map(Number)
              .sort((a, b) => a - b)
              .map((m) => {
                const monthRows = freeExpensesByMonth[m]
                const monthTotal = monthRows.reduce((s, t) => s + (t.amount || 0), 0)
                return (
                  <div key={m} className="month-group">
                    <div className="month-header">
                      <span>{MONTHS_SHORT[m - 1]}</span>
                      <span className="month-total">{fmt(monthTotal)}</span>
                    </div>
                    <table>
                      <tbody>
                        {monthRows.map((t, idx) => (
                          <tr key={t.id ?? idx}>
                            <td className="date-cell">
                              {t.date?.slice(5)}
                            </td>
                            <td className="desc-cell">
                              {t.description || '—'}
                            </td>
                            <td className="cat-cell">
                              {t.category || '—'}
                            </td>
                            <td className="amount-cell">
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
        <div className="annual-view-debts">
          <div className="section-title">
            Deudas activas
          </div>
          <div className="section-content">
            {debtMasters.map((account) => {
              const cumPaid = cumulativeDebtMap[account.id] ?? 0
              const remaining = Math.max(0, account.targetAmount - cumPaid)
              const pct = Math.min(100, Math.round((cumPaid / account.targetAmount) * 100))
              const isDone = remaining <= 0
              return (
                <div key={account.id} className="debt-card">
                  <div className="debt-header">
                    <div>
                      <span className="debt-name">
                        {account.important && <span className="important-star">★</span>}
                        {account.name}
                      </span>
                      {account.category && (
                        <span className="debt-category">
                          {account.category}
                        </span>
                      )}
                    </div>
                    <div className="debt-status" style={{ color: isDone ? '#2f9e44' : '#7c3aed' }}>
                      {isDone ? 'Saldada' : `Saldo: ${fmt(remaining)}`}
                    </div>
                  </div>
                  <div className="debt-stats">
                    <span>
                      Meta: <strong>{fmt(account.targetAmount)}</strong>
                    </span>
                    <span>
                      Pagado: <strong className="paid-value">{fmt(cumPaid)}</strong>
                    </span>
                    <span>
                      Restante:{' '}
                      <strong style={{ color: isDone ? '#2f9e44' : '#e03131' }}>
                        {fmt(remaining)}
                      </strong>
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{
                        background: isDone ? '#2f9e44' : '#7c3aed',
                        width: `${pct}%`,
                      }}
                    />
                  </div>
                  <div className="pct-label">
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
