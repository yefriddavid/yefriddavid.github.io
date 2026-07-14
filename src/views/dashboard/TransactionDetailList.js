import React from 'react'
import PropTypes from 'prop-types'
import { fmt, fmtDate } from 'src/utils/formatters'
import EmptyState from 'src/components/shared/EmptyState'

const TransactionDetailList = ({ transactions, emptyMessage }) => {
  if (transactions.length === 0) return <EmptyState message={emptyMessage} size="sm" />

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date))
  const total = transactions.reduce((s, t) => s + (t.amount || 0), 0)

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
          {sorted.map((t) => (
            <tr key={t.id}>
              <td>{fmtDate(t.date)}</td>
              <td>{t.description || '—'}</td>
              <td>{t.category || 'Sin categoría'}</td>
              <td className="dashboard__detail-table-amount">{fmt(t.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="dashboard__detail-table-total">
            <td colSpan={3}>Total</td>
            <td className="dashboard__detail-table-amount">{fmt(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

TransactionDetailList.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      date: PropTypes.string,
      description: PropTypes.string,
      category: PropTypes.string,
      amount: PropTypes.number,
    }),
  ).isRequired,
  emptyMessage: PropTypes.string.isRequired,
}

export default TransactionDetailList
