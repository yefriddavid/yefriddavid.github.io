import React from 'react'
import PropTypes from 'prop-types'
import { fmt, fmtDate } from 'src/utils/formatters'
import EmptyState from 'src/components/shared/EmptyState'

const Row = ({ t }) => (
  <tr>
    <td>{fmtDate(t.date)}</td>
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

const TransactionDetailList = ({ transactions, emptyMessage }) => {
  if (transactions.length === 0) return <EmptyState message={emptyMessage} size="sm" />

  const incomeRows = transactions.filter((t) => t.type === 'income').sort(byDateDesc)
  const expenseRows = transactions.filter((t) => t.type === 'expense').sort(byDateDesc)
  const isMixed = incomeRows.length > 0 && expenseRows.length > 0

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
          {isMixed ? (
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
}

export default TransactionDetailList
