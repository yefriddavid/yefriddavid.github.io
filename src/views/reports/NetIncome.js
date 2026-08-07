import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilPrint } from '@coreui/icons'
import * as transactionActions from 'src/actions/cashflow/transactionActions'
import * as accountsMasterActions from 'src/actions/cashflow/accountsMasterActions'
import { PERIOD_MONTH_DIVISOR } from 'src/constants/accounting'
import useLocaleData from 'src/hooks/useLocaleData'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import Spinner from 'src/components/shared/Spinner'
import EmptyState from 'src/components/shared/EmptyState'
import { fmt } from 'src/utils/formatters'
import { yearlyTotals } from 'src/utils/categoryMonthStats'
import 'src/components/shared/CategoryMonthStatement/CategoryMonthStatement.scss'
import './Reports.scss'

const CURRENT_YEAR = new Date().getFullYear()
const DIVISION = 'inmobiliaria'

const emptyMonths = () => Array(12).fill(0)

// The period a transaction belongs to is accountMonth (the account-status month it
// was recorded against), falling back to its date — same rule as
// AccountStatus/index.js's masterPaymentsMap. Quick-pay stamps `date` as today but
// `accountMonth` as whichever month card was open, so date alone misattributes it.
const periodOf = (t) => t.accountMonth ?? t.date?.slice(0, 7)

// Sums a linked expense's real transactions into a 12-slot monthly matrix.
// Mensuales (incl. debts, which are paid off in monthly installments) matches
// each transaction to its own month; other periods take the real amount paid
// each year and spread it evenly across all 12 months.
const expenseMonthMatrix = (expense, transactions, years) => {
  const matrix = emptyMonths()
  const own = transactions.filter((t) => t.type === 'expense' && t.accountMasterId === expense.id)

  if (expense.period === 'Mensuales' || expense.targetAmount > 0) {
    own
      .filter((t) => years.includes(periodOf(t)?.slice(0, 4)))
      .forEach((t) => {
        const m = Number(periodOf(t).slice(5, 7)) - 1
        if (m >= 0 && m <= 11) matrix[m] += t.amount || 0
      })
    return matrix
  }

  const divisor = PERIOD_MONTH_DIVISOR[expense.period]
  if (!divisor) return matrix // N/A or unknown period — not recurring, excluded

  years.forEach((year) => {
    const yearTotal = own
      .filter((t) => periodOf(t)?.slice(0, 4) === year)
      .reduce((s, t) => s + (t.amount || 0), 0)
    const monthlyEquivalent = yearTotal / divisor
    for (let m = 0; m < 12; m++) matrix[m] += monthlyEquivalent
  })
  return matrix
}

// One-off expenses with no accountsMaster record, linked directly on the
// transaction via fundingAccountId (see AdHocExpenseModal's "Financiado por").
const adHocExpenseMatrix = (incomeId, transactions, years) => {
  const matrix = emptyMonths()
  transactions
    .filter(
      (t) =>
        !t.accountMasterId &&
        t.type === 'expense' &&
        t.fundingAccountId === incomeId &&
        years.includes(periodOf(t)?.slice(0, 4)),
    )
    .forEach((t) => {
      const m = Number(periodOf(t).slice(5, 7)) - 1
      if (m >= 0 && m <= 11) matrix[m] += t.amount || 0
    })
  return matrix
}

const incomeMonthMatrix = (income, transactions, years) => {
  const matrix = emptyMonths()
  transactions
    .filter(
      (t) =>
        t.type === 'income' &&
        t.accountMasterId === income.id &&
        years.includes(periodOf(t)?.slice(0, 4)),
    )
    .forEach((t) => {
      const m = Number(periodOf(t).slice(5, 7)) - 1
      if (m >= 0 && m <= 11) matrix[m] += t.amount || 0
    })
  return matrix
}

const rowTotal = (matrix) => matrix.reduce((s, v) => s + v, 0)

const NetIncome = () => {
  const dispatch = useDispatch()
  const activeTenantId = useActiveTenantId()
  const { monthLabels } = useLocaleData()
  const { data: transactionsData, fetching } = useSelector((s) => s.transaction)
  const { data: masters } = useSelector((s) => s.accountsMaster)
  const [searchParams, setSearchParams] = useSearchParams()
  const yearParam = searchParams.get('year')
  const selectedYears = useMemo(
    () =>
      yearParam
        ? yearParam
            .split(',')
            .map(Number)
            .filter((n) => !Number.isNaN(n))
        : [CURRENT_YEAR],
    [yearParam],
  )
  const toggleYear = (y) =>
    setSearchParams((prev) => {
      const current = (prev.get('year') || String(CURRENT_YEAR))
        .split(',')
        .map(Number)
        .filter((n) => !Number.isNaN(n))
      const next = current.includes(y)
        ? current.length > 1
          ? current.filter((v) => v !== y)
          : current
        : [...current, y]
      next.sort((a, b) => a - b)
      prev.set('year', next.join(','))
      return prev
    })
  const selectOnlyYear = (y) =>
    setSearchParams((prev) => {
      prev.set('year', String(y))
      return prev
    })

  useEffect(() => {
    dispatch(transactionActions.fetchRequest({}))
    dispatch(accountsMasterActions.fetchRequest())
  }, [dispatch, activeTenantId])

  const monthLabelsShort = useMemo(() => monthLabels.map((m) => m.slice(0, 3)), [monthLabels])

  const transactions = useMemo(
    () => (transactionsData ?? []).filter((t) => (t.division ?? 'personal') === DIVISION),
    [transactionsData],
  )

  const years = useMemo(
    () => yearlyTotals(transactions, 'income', 'expense').map((t) => t.year),
    [transactions],
  )
  const selectedYearStrs = useMemo(() => selectedYears.map(String), [selectedYears])

  const groups = useMemo(() => {
    if (!masters) return []
    const scoped = masters.filter((a) => (a.division ?? 'personal') === DIVISION)
    const incomes = scoped.filter((a) => a.type === 'Incoming')
    const expensesByFunder = {}
    scoped
      .filter((a) => a.type === 'Outcoming' && a.fundingAccountId)
      .forEach((e) => {
        if (!expensesByFunder[e.fundingAccountId]) expensesByFunder[e.fundingAccountId] = []
        expensesByFunder[e.fundingAccountId].push(e)
      })

    return incomes
      .map((income) => {
        const incomeMatrix = incomeMonthMatrix(income, transactions, selectedYearStrs)
        const expenseRows = (expensesByFunder[income.id] ?? []).map((expense) => ({
          account: expense,
          matrix: expenseMonthMatrix(expense, transactions, selectedYearStrs),
        }))
        const adHocMatrix = adHocExpenseMatrix(income.id, transactions, selectedYearStrs)
        if (rowTotal(adHocMatrix) > 0) {
          expenseRows.push({
            account: { id: `adhoc-${income.id}`, name: 'Otras cuentas' },
            matrix: adHocMatrix,
          })
        }
        const netMatrix = monthLabelsShort.map(
          (_, m) => incomeMatrix[m] - expenseRows.reduce((s, r) => s + r.matrix[m], 0),
        )
        return { income, incomeMatrix, expenseRows, netMatrix }
      })
      .filter((g) => rowTotal(g.incomeMatrix) > 0 || g.expenseRows.length > 0)
  }, [masters, transactions, selectedYearStrs, monthLabelsShort])

  const grandNetMatrix = monthLabelsShort.map((_, m) =>
    groups.reduce((s, g) => s + g.netMatrix[m], 0),
  )
  const grandNetTotal = rowTotal(grandNetMatrix)

  if (fetching) return <Spinner mode="section" />
  if (groups.length === 0)
    return <EmptyState message="Sin ingresos con gastos asociados para mostrar." />

  return (
    <div className="statement">
      <div className="statement__toolbar">
        <div className="statement__mode-group statement__mode-group--years">
          {years.map((y) => (
            <button
              key={y}
              type="button"
              className={`statement__mode-btn ${selectedYears.includes(y) ? 'statement__mode-btn--active' : ''}`}
              onClick={() => toggleYear(y)}
              onDoubleClick={() => selectOnlyYear(y)}
            >
              {y}
            </button>
          ))}
        </div>
        <button type="button" className="statement__print-btn" onClick={() => window.print()}>
          <CIcon icon={cilPrint} className="me-1" /> Imprimir
        </button>
      </div>

      <div className="statement__sheet">
        <h1 className="statement__title">Ingresos netos</h1>
        <div className="statement__subtitle">
          {selectedYears.length > 1 ? 'Años' : 'Año'} {selectedYears.join(', ')}
        </div>

        <div className="statement__scroll">
          <table className="cms__table">
            <thead>
              <tr>
                <th>Cuenta</th>
                {monthLabelsShort.map((m) => (
                  <th key={m}>{m}</th>
                ))}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(({ income, incomeMatrix, expenseRows, netMatrix }) => (
                <React.Fragment key={income.id}>
                  <tr className="cms__section-row cms__section-row--income">
                    <td colSpan={monthLabelsShort.length + 2}>{income.name}</td>
                  </tr>
                  <tr className="cms__row">
                    <td className="cms__row-label">Ingreso</td>
                    {incomeMatrix.map((v, m) => (
                      <td key={m}>{v ? fmt(v) : '—'}</td>
                    ))}
                    <td className="cms__total-cell">{fmt(rowTotal(incomeMatrix))}</td>
                  </tr>
                  {expenseRows.map(({ account, matrix }) => (
                    <tr className="cms__row" key={account.id}>
                      <td className="cms__row-label">
                        {account.name}
                        {account.period && (
                          <span style={{ color: 'var(--cui-secondary-color, #adb5bd)' }}>
                            {' '}
                            ({account.period})
                          </span>
                        )}
                      </td>
                      {matrix.map((v, m) => (
                        <td key={m} className={v ? 'cms__net-negative' : undefined}>
                          {v ? `-${fmt(v)}` : '—'}
                        </td>
                      ))}
                      <td className="cms__total-cell">{fmt(rowTotal(matrix))}</td>
                    </tr>
                  ))}
                  <tr className="cms__subtotal-row">
                    <td>Neto mensual</td>
                    {netMatrix.map((v, m) => (
                      <td key={m} className={v >= 0 ? 'cms__net-positive' : 'cms__net-negative'}>
                        {fmt(v)}
                      </td>
                    ))}
                    <td
                      className={
                        rowTotal(netMatrix) >= 0 ? 'cms__net-positive' : 'cms__net-negative'
                      }
                    >
                      {fmt(rowTotal(netMatrix))}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
            <tfoot>
              <tr className="cms__net-row">
                <td>Neto total</td>
                {grandNetMatrix.map((v, m) => (
                  <td key={m} className={v >= 0 ? 'cms__net-positive' : 'cms__net-negative'}>
                    {fmt(v)}
                  </td>
                ))}
                <td className={grandNetTotal >= 0 ? 'cms__net-positive' : 'cms__net-negative'}>
                  {fmt(grandNetTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

export default NetIncome
