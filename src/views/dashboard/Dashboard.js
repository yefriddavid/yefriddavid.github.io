import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CCard, CCardBody, CCardHeader, CRow, CCol, CFormSelect } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCash,
  cilBurn,
  cilChartLine,
  cilCalendar,
  cilStar,
  cilChartPie,
  cilBarChart,
} from '@coreui/icons'
import * as transactionActions from 'src/actions/cashflow/transactionActions'
import { fmtCompact } from 'src/utils/formatters'
import useLocaleData from 'src/hooks/useLocaleData'
import KPICard from 'src/components/shared/KPICard'
import Spinner from 'src/components/shared/Spinner'
import MonthlyFlowChart from './MonthlyFlowChart'
import CategoryDoughnut from './CategoryDoughnut'
import TopRankingChart from './TopRankingChart'
import TransactionDetailList from './TransactionDetailList'
import {
  CURRENT_YEAR,
  CURRENT_MONTH,
  aggregateMonthly,
  aggregateByField,
  topByField,
} from './dashboardHelpers'
import './Dashboard.scss'

const AVAILABLE_YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i)

const cardHeader = (title, icon) => (
  <CCardHeader className="home-card-header">
    {icon && <CIcon icon={icon} className="home-card-header__icon" />}
    {title}
  </CCardHeader>
)

const Dashboard = () => {
  const dispatch = useDispatch()
  const { monthLabels } = useLocaleData()
  const { data, fetching } = useSelector((s) => s.transaction)
  const [year, setYear] = useState(CURRENT_YEAR)
  const [projectRest, setProjectRest] = useState(false)
  const [incomeView, setIncomeView] = useState('chart')
  const [expenseView, setExpenseView] = useState('chart')
  const [selectedExpense, setSelectedExpense] = useState(null)

  useEffect(() => {
    dispatch(transactionActions.fetchRequest({ year }))
    setSelectedExpense(null)
  }, [dispatch, year])

  const transactions = useMemo(() => data ?? [], [data])

  const monthLabelsShort = useMemo(() => monthLabels.map((m) => m.slice(0, 3)), [monthLabels])

  const { income, expense } = useMemo(() => aggregateMonthly(transactions), [transactions])

  const totalIncome = income.reduce((s, v) => s + v, 0)
  const totalExpense = expense.reduce((s, v) => s + v, 0)
  const totalNet = totalIncome - totalExpense

  const monthsElapsed = year === CURRENT_YEAR ? CURRENT_MONTH : 12
  const avgMonthlyNet = monthsElapsed > 0 ? totalNet / monthsElapsed : 0

  const bestMonthIdx = totalIncome > 0 ? income.indexOf(Math.max(...income)) : -1
  const bestMonthLabel = bestMonthIdx >= 0 ? monthLabels[bestMonthIdx] : '—'

  const canProject = year === CURRENT_YEAR && monthsElapsed < 12
  const avgIncomeElapsed =
    monthsElapsed > 0
      ? income.slice(0, monthsElapsed).reduce((s, v) => s + v, 0) / monthsElapsed
      : 0
  const avgExpenseElapsed =
    monthsElapsed > 0
      ? expense.slice(0, monthsElapsed).reduce((s, v) => s + v, 0) / monthsElapsed
      : 0
  const displayIncome =
    canProject && projectRest
      ? income.map((v, i) => (i < monthsElapsed ? v : avgIncomeElapsed))
      : income
  const displayExpense =
    canProject && projectRest
      ? expense.map((v, i) => (i < monthsElapsed ? v : avgExpenseElapsed))
      : expense
  const displayTotalIncome = displayIncome.reduce((s, v) => s + v, 0)
  const displayTotalExpense = displayExpense.reduce((s, v) => s + v, 0)
  const displayTotalNet = displayTotalIncome - displayTotalExpense

  const expenseByCategory = useMemo(
    () => aggregateByField(transactions, 'expense', 'category', 5),
    [transactions],
  )
  const incomeByCategory = useMemo(
    () => aggregateByField(transactions, 'income', 'category', 5),
    [transactions],
  )
  const incomeTransactions = useMemo(
    () => transactions.filter((t) => t.type === 'income'),
    [transactions],
  )
  const expenseTransactions = useMemo(
    () => transactions.filter((t) => t.type === 'expense'),
    [transactions],
  )
  const topExpenses = useMemo(
    () => topByField(transactions, 'expense', 'description', 6),
    [transactions],
  )
  const selectedExpenseTransactions = useMemo(
    () => expenseTransactions.filter((t) => t.description === selectedExpense),
    [expenseTransactions, selectedExpense],
  )

  return (
    <div className="dashboard">
      <div className="d-flex align-items-center gap-2 mb-4 dashboard__period-bar">
        <span className="dashboard__period-label">Año</span>
        <CFormSelect
          size="sm"
          style={{ width: 100 }}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {AVAILABLE_YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </CFormSelect>
      </div>

      {fetching ? (
        <div className="d-flex justify-content-center align-items-center dashboard__loader">
          <Spinner color="primary" />
        </div>
      ) : (
        <>
          <CRow className="g-3 mb-4">
            <CCol sm={6} lg={4} xl={2}>
              <KPICard
                label="Ingresos"
                value={fmtCompact(totalIncome)}
                sub={`${year}`}
                accent="#2f9e44"
                icon={cilCash}
              />
            </CCol>
            <CCol sm={6} lg={4} xl={2}>
              <KPICard
                label="Egresos"
                value={fmtCompact(totalExpense)}
                sub={`${year}`}
                accent="#e03131"
                icon={cilBurn}
              />
            </CCol>
            <CCol sm={6} lg={4} xl={2}>
              <KPICard
                label="Balance neto"
                value={fmtCompact(totalNet)}
                sub={totalNet >= 0 ? 'Positivo ✓' : 'Negativo ✗'}
                accent={totalNet >= 0 ? '#2f9e44' : '#e03131'}
                icon={cilChartLine}
              />
            </CCol>
            <CCol sm={6} lg={4} xl={2}>
              <KPICard
                label="Promedio mensual"
                value={fmtCompact(avgMonthlyNet)}
                sub="neto por mes"
                accent="#1971c2"
                icon={cilCalendar}
              />
            </CCol>
            <CCol sm={6} lg={4} xl={2}>
              <KPICard
                label="Mejor mes"
                value={
                  bestMonthIdx >= 0
                    ? bestMonthLabel.charAt(0).toUpperCase() + bestMonthLabel.slice(1)
                    : '—'
                }
                sub={bestMonthIdx >= 0 ? fmtCompact(income[bestMonthIdx]) : 'Sin ingresos'}
                accent="#ae3ec9"
                icon={cilStar}
              />
            </CCol>
          </CRow>

          <CRow className="g-3 mb-4">
            <CCol lg={8}>
              <CCard className="dashboard__card">
                <CCardHeader className="home-card-header d-flex align-items-center justify-content-between">
                  <span className="d-flex align-items-center gap-2">
                    <CIcon icon={cilBarChart} className="home-card-header__icon" />
                    {`Ingresos vs egresos — ${year}`}
                  </span>
                  {canProject && (
                    <label className="dashboard__projection-toggle">
                      <input
                        type="checkbox"
                        checked={projectRest}
                        onChange={(e) => setProjectRest(e.target.checked)}
                      />
                      Proyectar resto del año
                    </label>
                  )}
                </CCardHeader>
                <CCardBody>
                  <MonthlyFlowChart
                    labels={monthLabelsShort}
                    income={displayIncome}
                    expense={displayExpense}
                  />
                  <div className="dashboard__flow-totals">
                    <div className="dashboard__flow-total dashboard__flow-total--income">
                      <span>Ingresos</span>
                      <strong>{fmtCompact(displayTotalIncome)}</strong>
                    </div>
                    <div className="dashboard__flow-total dashboard__flow-total--expense">
                      <span>Egresos</span>
                      <strong>{fmtCompact(displayTotalExpense)}</strong>
                    </div>
                    <div className="dashboard__flow-total dashboard__flow-total--net">
                      <span>Neto</span>
                      <strong>{fmtCompact(displayTotalNet)}</strong>
                    </div>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol lg={4}>
              <CCard className="dashboard__card">
                <CCardHeader className="home-card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <span className="d-flex align-items-center gap-2">
                    <CIcon icon={cilChartPie} className="home-card-header__icon" />
                    Egresos por categoría
                  </span>
                  <div className="dashboard__header-tabs">
                    <button
                      type="button"
                      className={`dashboard__header-tab${expenseView === 'chart' ? ' dashboard__header-tab--active' : ''}`}
                      onClick={() => setExpenseView('chart')}
                    >
                      Gráfico
                    </button>
                    <button
                      type="button"
                      className={`dashboard__header-tab${expenseView === 'detail' ? ' dashboard__header-tab--active' : ''}`}
                      onClick={() => setExpenseView('detail')}
                    >
                      Detalle
                    </button>
                  </div>
                </CCardHeader>
                <CCardBody
                  className={
                    expenseView === 'chart'
                      ? 'd-flex flex-column align-items-center justify-content-center'
                      : undefined
                  }
                >
                  {expenseView === 'chart' ? (
                    <CategoryDoughnut
                      data={expenseByCategory}
                      emptyMessage="Sin egresos este año"
                    />
                  ) : (
                    <TransactionDetailList
                      transactions={expenseTransactions}
                      emptyMessage="Sin egresos este año"
                    />
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>

          <CRow className="g-3">
            <CCol lg={6}>
              <CCard className="dashboard__card">
                {cardHeader('Mayores gastos', cilStar)}
                <CCardBody>
                  <TopRankingChart
                    entries={topExpenses}
                    color="#e03131"
                    emptyMessage="Sin egresos este año"
                    onBarClick={setSelectedExpense}
                  />
                  {selectedExpense && (
                    <div className="dashboard__inline-detail">
                      <div className="dashboard__inline-detail-header">
                        <span>Detalle — {selectedExpense}</span>
                        <button
                          type="button"
                          className="dashboard__inline-detail-close"
                          onClick={() => setSelectedExpense(null)}
                        >
                          ✕
                        </button>
                      </div>
                      <TransactionDetailList
                        transactions={selectedExpenseTransactions}
                        emptyMessage="Sin movimientos"
                      />
                    </div>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
            <CCol lg={6}>
              <CCard className="dashboard__card">
                <CCardHeader className="home-card-header d-flex align-items-center justify-content-between">
                  <span className="d-flex align-items-center gap-2">
                    <CIcon icon={cilChartPie} className="home-card-header__icon" />
                    Ingresos por categoría
                  </span>
                  <div className="dashboard__header-tabs">
                    <button
                      type="button"
                      className={`dashboard__header-tab${incomeView === 'chart' ? ' dashboard__header-tab--active' : ''}`}
                      onClick={() => setIncomeView('chart')}
                    >
                      Gráfico
                    </button>
                    <button
                      type="button"
                      className={`dashboard__header-tab${incomeView === 'detail' ? ' dashboard__header-tab--active' : ''}`}
                      onClick={() => setIncomeView('detail')}
                    >
                      Detalle
                    </button>
                  </div>
                </CCardHeader>
                <CCardBody
                  className={
                    incomeView === 'chart'
                      ? 'd-flex flex-column align-items-center justify-content-center'
                      : undefined
                  }
                >
                  {incomeView === 'chart' ? (
                    <CategoryDoughnut
                      data={incomeByCategory}
                      emptyMessage="Sin ingresos este año"
                    />
                  ) : (
                    <TransactionDetailList
                      transactions={incomeTransactions}
                      emptyMessage="Sin ingresos este año"
                    />
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </>
      )}
    </div>
  )
}

export default Dashboard
