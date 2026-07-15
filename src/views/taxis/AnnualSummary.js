import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CFormSelect } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPrint } from '@coreui/icons'
import * as taxiSettlementActions from 'src/actions/taxi/taxiSettlementActions'
import * as taxiExpenseActions from 'src/actions/taxi/taxiExpenseActions'
import useLocaleData from 'src/hooks/useLocaleData'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import Spinner from 'src/components/shared/Spinner'
import EmptyState from 'src/components/shared/EmptyState'
import CategoryMonthStatement from 'src/components/shared/CategoryMonthStatement'
import { yearlyTotals, categoryMonthMatrix } from 'src/utils/categoryMonthStats'
import './AnnualSummary.scss'

const CURRENT_YEAR = new Date().getFullYear()

const sumMonth = (matrix, m) => matrix.reduce((s, row) => s + row[m], 0)
const sumAll = (matrix) => matrix.reduce((s, row) => s + row.reduce((a, v) => a + v, 0), 0)

const AnnualSummary = () => {
  const dispatch = useDispatch()
  const activeTenantId = useActiveTenantId()
  const { monthLabels } = useLocaleData()
  const { data: settlementsData, fetching: settlementsFetching } = useSelector(
    (s) => s.taxiSettlement,
  )
  const { data: expensesData, fetching: expensesFetching } = useSelector((s) => s.taxiExpense)
  const fetching = settlementsFetching || expensesFetching
  const [year, setYear] = useState(CURRENT_YEAR)
  const [expanded, setExpanded] = useState(() => new Set())

  useEffect(() => {
    dispatch(taxiSettlementActions.fetchRequest({}))
    dispatch(taxiExpenseActions.fetchRequest({}))
  }, [dispatch, activeTenantId])

  const toggleExpanded = (key) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const monthLabelsShort = useMemo(() => monthLabels.map((m) => m.slice(0, 3)), [monthLabels])

  const records = useMemo(() => {
    const settlements = (settlementsData ?? []).map((s) => ({
      id: `s-${s.id}`,
      date: s.date,
      type: 'settlement',
      category: s.plate || 'Sin placa',
      amount: s.amount,
      description: s.driver ? `Cond. ${s.driver}` : s.comment || '',
    }))
    const expenses = (expensesData ?? []).map((e) => ({
      id: `e-${e.id}`,
      date: e.date,
      type: 'expense',
      category: e.category || 'Otro',
      amount: e.amount,
      description: e.description || '',
    }))
    return [...settlements, ...expenses]
  }, [settlementsData, expensesData])

  const years = useMemo(
    () => yearlyTotals(records, 'settlement', 'expense').map((t) => t.year),
    [records],
  )

  const settlement = useMemo(
    () => categoryMonthMatrix(records, 'settlement', year),
    [records, year],
  )
  const expense = useMemo(() => categoryMonthMatrix(records, 'expense', year), [records, year])

  const netMonthTotals = monthLabelsShort.map(
    (_, m) => sumMonth(settlement.matrix, m) - sumMonth(expense.matrix, m),
  )
  const netTotal = sumAll(settlement.matrix) - sumAll(expense.matrix)

  if (fetching) return <Spinner mode="section" />
  if (records.length === 0)
    return <EmptyState message="Sin liquidaciones ni gastos para generar el resumen." />

  return (
    <div className="statement">
      <div className="statement__toolbar">
        <CFormSelect
          size="sm"
          style={{ width: 110 }}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {[year, ...years.filter((y) => y !== year)]
            .sort((a, b) => b - a)
            .map((y) => (
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
        <h1 className="statement__title">Resumen Anual — Taxis</h1>
        <div className="statement__subtitle">Año {year}</div>

        <div className="statement__scroll">
          <CategoryMonthStatement
            months={monthLabelsShort}
            sections={[
              {
                title: 'Liquidaciones',
                modifier: 'income',
                type: 'settlement',
                categories: settlement.categories,
                matrix: settlement.matrix,
                categoryGroups: settlement.categoryGroups,
              },
              {
                title: 'Gastos',
                modifier: 'expense',
                type: 'expense',
                categories: expense.categories,
                matrix: expense.matrix,
                categoryGroups: expense.categoryGroups,
              },
            ]}
            records={records}
            year={year}
            expanded={expanded}
            onToggle={toggleExpanded}
            netLabel="Utilidad neta"
            netMonthTotals={netMonthTotals}
            netTotal={netTotal}
          />
        </div>
      </div>
    </div>
  )
}

export default AnnualSummary
