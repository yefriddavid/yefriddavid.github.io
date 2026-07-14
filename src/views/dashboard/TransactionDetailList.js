import React from 'react'
import PropTypes from 'prop-types'
import { fmt, fmtDate, fmtDayMonth } from 'src/utils/formatters'
import EmptyState from 'src/components/shared/EmptyState'

const Row = ({ t, compactDate }) => (
  <tr>
    <td>{compactDate ? fmtDayMonth(t.date) : fmtDate(t.date)}</td>
    <td>{t.description || '—'}</td>
    <td>{t.category || 'Sin categoría'}</td>
    <td
      className={`dashboard__detail-table-amount${
        t.type === 'income'
          ? ' dashboard__detail-table-amount--income'
          : t.type === 'expense'
            ? ' dashboard__detail-table-amount--expense'
            : ''
      }`}
    >
      {fmt(t.amount)}
    </td>
  </tr>
)

const sumAmount = (rows) => rows.reduce((s, t) => s + (t.amount || 0), 0)
const byDateDesc = (a, b) => b.date.localeCompare(a.date)

const groupByField = (rows, field) => {
  const map = {}
  rows.forEach((t) => {
    const key = t[field] || 'Sin datos'
    if (!map[key]) map[key] = []
    map[key].push(t)
  })
  return Object.entries(map)
    .map(([label, items]) => {
      const sorted = items.sort(byDateDesc)
      return { label, items: sorted, total: sumAmount(items), latestDate: sorted[0].date }
    })
    .sort((a, b) => b.latestDate.localeCompare(a.latestDate))
}

const TransactionDetailList = ({ transactions, emptyMessage, groupBy }) => {
  if (transactions.length === 0) return <EmptyState message={emptyMessage} size="sm" />

  const incomeRows = transactions.filter((t) => t.type === 'income').sort(byDateDesc)
  const expenseRows = transactions.filter((t) => t.type === 'expense').sort(byDateDesc)
  const isMixed = groupBy !== 'description' && incomeRows.length > 0 && expenseRows.length > 0

  const incomeTotal = sumAmount(incomeRows)
  const expenseTotal = sumAmount(expenseRows)
  const total = isMixed ? incomeTotal - expenseTotal : incomeTotal + expenseTotal

  return (
    <div className="dashboard__detail-list">
      <table className="dashboard__detail-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Descripción</th>
            <th>Categoría</th>
            <th className="dashboard__detail-table-amount">Monto</th>
          </tr>
        </thead>
        <tbody>
          {groupBy === 'description' ? (
            groupByField(transactions, 'description').map((g) => (
              <React.Fragment key={g.label}>
                <tr className="dashboard__detail-group-header">
                  <td colSpan={4}>{g.label}</td>
                </tr>
                {g.items.map((t) => (
                  <Row key={t.id} t={t} compactDate />
                ))}
                <tr className="dashboard__detail-subtotal">
                  <td colSpan={3}>Subtotal</td>
                  <td className="dashboard__detail-table-amount">{fmt(g.total)}</td>
                </tr>
              </React.Fragment>
            ))
          ) : isMixed ? (
            <>
              <tr className="dashboard__detail-group-header dashboard__detail-group-header--income">
                <td colSpan={4}>Ingresos</td>
              </tr>
              {incomeRows.map((t) => (
                <Row key={t.id} t={t} />
              ))}
              <tr className="dashboard__detail-subtotal">
                <td colSpan={3}>Subtotal ingresos</td>
                <td className="dashboard__detail-table-amount dashboard__detail-table-amount--income">
                  {fmt(incomeTotal)}
                </td>
              </tr>
              <tr className="dashboard__detail-group-header dashboard__detail-group-header--expense">
                <td colSpan={4}>Egresos</td>
              </tr>
              {expenseRows.map((t) => (
                <Row key={t.id} t={t} />
              ))}
              <tr className="dashboard__detail-subtotal">
                <td colSpan={3}>Subtotal egresos</td>
                <td className="dashboard__detail-table-amount dashboard__detail-table-amount--expense">
                  {fmt(expenseTotal)}
                </td>
              </tr>
            </>
          ) : (
            [...incomeRows, ...expenseRows].map((t) => <Row key={t.id} t={t} />)
          )}
        </tbody>
        <tfoot>
          <tr className="dashboard__detail-table-total">
            <td colSpan={3}>{isMixed ? 'Neto' : 'Total'}</td>
            <td className="dashboard__detail-table-amount">{fmt(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

Row.propTypes = {
  t: PropTypes.shape({
    id: PropTypes.string.isRequired,
    date: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
    amount: PropTypes.number,
    type: PropTypes.oneOf(['income', 'expense']),
  }).isRequired,
  compactDate: PropTypes.bool,
}

TransactionDetailList.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      date: PropTypes.string,
      description: PropTypes.string,
      category: PropTypes.string,
      amount: PropTypes.number,
      type: PropTypes.oneOf(['income', 'expense']),
    }),
  ).isRequired,
  emptyMessage: PropTypes.string.isRequired,
  groupBy: PropTypes.oneOf(['description']),
}

export default TransactionDetailList
