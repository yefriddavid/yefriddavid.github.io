import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CCard, CCardBody, CCardHeader, CRow, CCol } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilChartLine, cilChartPie, cilGrid } from '@coreui/icons'
import * as transactionActions from 'src/actions/cashflow/transactionActions'
import useLocaleData from 'src/hooks/useLocaleData'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import Spinner from 'src/components/shared/Spinner'
import EmptyState from 'src/components/shared/EmptyState'
import YearComparisonChart from './YearComparisonChart'
import CategoryTrendChart from './CategoryTrendChart'
import PivotTable from './PivotTable'
import { yearlyTotals, categoryMonthMatrix } from 'src/utils/categoryMonthStats'
import './Analysis.scss'

const cardHeader = (title, icon) => (
  <CCardHeader className="home-card-header">
    <CIcon icon={icon} className="home-card-header__icon" />
    {title}
  </CCardHeader>
)

const Analysis = () => {
  const dispatch = useDispatch()
  const activeTenantId = useActiveTenantId()
  const { monthLabels } = useLocaleData()
  const { data, fetching } = useSelector((s) => s.transaction)
  const [type, setType] = useState('expense')
  const [year, setYear] = useState(null)

  useEffect(() => {
    dispatch(transactionActions.fetchRequest({}))
  }, [dispatch, activeTenantId])

  const transactions = useMemo(() => data ?? [], [data])
  const monthLabelsShort = useMemo(() => monthLabels.map((m) => m.slice(0, 3)), [monthLabels])

  const totals = useMemo(() => yearlyTotals(transactions, 'income', 'expense'), [transactions])
  const years = totals.map((t) => t.year)
  const selectedYear = year ?? years[years.length - 1] ?? new Date().getFullYear()

  const { categories, matrix } = useMemo(
    () => categoryMonthMatrix(transactions, type, selectedYear),
    [transactions, type, selectedYear],
  )

  const lastYearTotals = totals[totals.length - 1] ?? null
  const prevYearTotals = totals[totals.length - 2] ?? null
  const growthPct =
    lastYearTotals && prevYearTotals && prevYearTotals.net !== 0
      ? ((lastYearTotals.net - prevYearTotals.net) / Math.abs(prevYearTotals.net)) * 100
      : null

  return (
    <div className="analysis">
      {fetching ? (
        <div className="d-flex justify-content-center align-items-center analysis__loader">
          <Spinner color="primary" />
        </div>
      ) : totals.length === 0 ? (
        <EmptyState message="Sin transacciones para analizar." />
      ) : (
        <>
          <CRow className="g-3 mb-4">
            <CCol xs={12}>
              <CCard className="analysis__card">
                {cardHeader('Comparación anual', cilChartLine)}
                <CCardBody>
                  <YearComparisonChart
                    years={years}
                    income={totals.map((t) => t.income)}
                    expense={totals.map((t) => t.expense)}
                  />
                  {growthPct !== null && (
                    <div className="analysis__growth">
                      Neto {lastYearTotals.year} vs {prevYearTotals.year}:{' '}
                      <strong
                        className={`analysis__growth-value${growthPct >= 0 ? ' analysis__growth-value--up' : ' analysis__growth-value--down'}`}
                      >
                        {growthPct >= 0 ? '▲' : '▼'} {Math.abs(growthPct).toFixed(1)}%
                      </strong>
                    </div>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>

          <div className="analysis__filter-bar">
            <div className="analysis__header-tabs">
              <button
                type="button"
                className={`analysis__header-tab${type === 'expense' ? ' analysis__header-tab--active' : ''}`}
                onClick={() => setType('expense')}
              >
                Egresos
              </button>
              <button
                type="button"
                className={`analysis__header-tab${type === 'income' ? ' analysis__header-tab--active' : ''}`}
                onClick={() => setType('income')}
              >
                Ingresos
              </button>
            </div>
            <select
              className="analysis__year-select"
              value={selectedYear}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <CRow className="g-3">
            <CCol lg={7}>
              <CCard className="analysis__card">
                {cardHeader(`Evolución de categorías — ${selectedYear}`, cilChartPie)}
                <CCardBody>
                  <CategoryTrendChart
                    months={monthLabelsShort}
                    categories={categories}
                    matrix={matrix}
                    emptyMessage="Sin movimientos en este período"
                  />
                </CCardBody>
              </CCard>
            </CCol>
            <CCol lg={5}>
              <CCard className="analysis__card">
                {cardHeader('Tabla dinámica', cilGrid)}
                <CCardBody>
                  <PivotTable
                    months={monthLabelsShort}
                    categories={categories}
                    matrix={matrix}
                    year={selectedYear}
                    type={type}
                    emptyMessage="Sin movimientos en este período"
                  />
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </>
      )}
    </div>
  )
}

export default Analysis
