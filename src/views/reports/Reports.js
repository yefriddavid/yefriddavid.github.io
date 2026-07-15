import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CFormSelect } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPrint } from '@coreui/icons'
import * as transactionActions from 'src/actions/cashflow/transactionActions'
import useLocaleData from 'src/hooks/useLocaleData'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import Spinner from 'src/components/shared/Spinner'
import EmptyState from 'src/components/shared/EmptyState'
import { fmt } from 'src/utils/formatters'
import { yearlyTotals, categoryMonthMatrix } from '../Finance/Analysis/analysisHelpers'
import './Reports.scss'

const CURRENT_YEAR = new Date().getFullYear()

const sumMonth = (matrix, m) => matrix.reduce((s, row) => s + row[m], 0)
const sumAll = (matrix) => matrix.reduce((s, row) => s + row.reduce((a, v) => a + v, 0), 0)

const CategoryDetailRow = ({ months, transactions, type, category, categoryGroups, year }) => {
  const members = categoryGroups[category] || [category]

  return (
    <tr className="statement__detail-row">
      <td />
      {months.map((_, m) => {
        const items = transactions.filter(
          (t) =>
            t.type === type &&
            members.includes(t.category || 'Otros') &&
            t.date?.slice(0, 4) === String(year) &&
            Number(t.date.slice(5, 7)) - 1 === m,
        )
        return (
          <td key={m} className="statement__detail-cell">
            {items.length > 0 && (
              <ul className="statement__detail-list">
                {items.map((t) => (
                  <li key={t.id}>
                    <span className="statement__detail-date">{t.date.slice(8, 10)}</span>{' '}
                    <span className="statement__detail-desc">{t.description || '—'}</span>{' '}
                    <span className="statement__detail-amount">{fmt(t.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </td>
        )
      })}
      <td />
    </tr>
  )
}

const StatementSection = ({
  title,
  months,
  categories,
  matrix,
  modifier,
  categoryGroups,
  transactions,
  type,
  year,
  expanded,
  onToggle,
}) => {
  const monthTotals = months.map((_, m) => sumMonth(matrix, m))
  const rowTotals = matrix.map((row) => row.reduce((s, v) => s + v, 0))
  const sectionTotal = rowTotals.reduce((s, v) => s + v, 0)

  return (
    <>
      <tr className={`statement__section-row statement__section-row--${modifier}`}>
        <td colSpan={months.length + 2}>{title}</td>
      </tr>
      {categories.map((cat, i) => {
        const key = `${type}:${cat}`
        const isOpen = expanded.has(key)
        return (
          <React.Fragment key={cat}>
            <tr className="statement__row statement__row--clickable" onClick={() => onToggle(key)}>
              <td className="statement__row-label">
                <span className="statement__row-toggle">{isOpen ? '▾' : '▸'}</span> {cat}
              </td>
              {matrix[i].map((v, m) => (
                <td key={m}>{v ? fmt(v) : '—'}</td>
              ))}
              <td className="statement__total-cell">{fmt(rowTotals[i])}</td>
            </tr>
            {isOpen && (
              <CategoryDetailRow
                months={months}
                transactions={transactions}
                type={type}
                category={cat}
                categoryGroups={categoryGroups}
                year={year}
              />
            )}
          </React.Fragment>
        )
      })}
      <tr className="statement__subtotal-row">
        <td>Total {title}</td>
        {monthTotals.map((v, m) => (
          <td key={m}>{fmt(v)}</td>
        ))}
        <td className="statement__total-cell">{fmt(sectionTotal)}</td>
      </tr>
    </>
  )
}

const Reports = () => {
  const dispatch = useDispatch()
  const activeTenantId = useActiveTenantId()
  const { monthLabels } = useLocaleData()
  const { data, fetching } = useSelector((s) => s.transaction)
  const [year, setYear] = useState(CURRENT_YEAR)
  const [expanded, setExpanded] = useState(() => new Set())

  useEffect(() => {
    dispatch(transactionActions.fetchRequest({}))
  }, [dispatch, activeTenantId])

  const toggleExpanded = (key) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const transactions = useMemo(() => data ?? [], [data])
  const monthLabelsShort = useMemo(() => monthLabels.map((m) => m.slice(0, 3)), [monthLabels])
  const years = useMemo(() => yearlyTotals(transactions).map((t) => t.year), [transactions])

  const income = useMemo(
    () => categoryMonthMatrix(transactions, 'income', year),
    [transactions, year],
  )
  const expense = useMemo(
    () => categoryMonthMatrix(transactions, 'expense', year),
    [transactions, year],
  )

  const netMonthTotals = monthLabelsShort.map(
    (_, m) => sumMonth(income.matrix, m) - sumMonth(expense.matrix, m),
  )
  const netTotal = sumAll(income.matrix) - sumAll(expense.matrix)

  if (fetching) return <Spinner mode="section" />
  if (years.length === 0) return <EmptyState message="Sin transacciones para generar el estado." />

  return (
    <div className="statement">
      <div className="statement__toolbar">
        <CFormSelect
          size="sm"
          style={{ width: 110 }}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </CFormSelect>
        <button type="button" className="statement__print-btn" onClick={() => window.print()}>
          <CIcon icon={cilPrint} className="me-1" /> Imprimir
        </button>
      </div>

      <div className="statement__sheet">
        <h1 className="statement__title">Estado de Resultados</h1>
        <div className="statement__subtitle">Año {year}</div>

        <div className="statement__scroll">
          <table className="statement__table">
            <thead>
              <tr>
                <th>Categoría</th>
                {monthLabelsShort.map((m) => (
                  <th key={m}>{m}</th>
                ))}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <StatementSection
                title="Ingresos"
                months={monthLabelsShort}
                categories={income.categories}
                matrix={income.matrix}
                categoryGroups={income.categoryGroups}
                modifier="income"
                transactions={transactions}
                type="income"
                year={year}
                expanded={expanded}
                onToggle={toggleExpanded}
              />
              <StatementSection
                title="Egresos"
                months={monthLabelsShort}
                categories={expense.categories}
                matrix={expense.matrix}
                categoryGroups={expense.categoryGroups}
                modifier="expense"
                transactions={transactions}
                type="expense"
                year={year}
                expanded={expanded}
                onToggle={toggleExpanded}
              />
            </tbody>
            <tfoot>
              <tr className="statement__net-row">
                <td>Utilidad neta</td>
                {netMonthTotals.map((v, m) => (
                  <td
                    key={m}
                    className={v >= 0 ? 'statement__net-positive' : 'statement__net-negative'}
                  >
                    {fmt(v)}
                  </td>
                ))}
                <td
                  className={netTotal >= 0 ? 'statement__net-positive' : 'statement__net-negative'}
                >
                  {fmt(netTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Reports
