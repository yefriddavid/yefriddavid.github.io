import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useSearchParams } from 'react-router-dom'
import { CFormSelect } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPrint } from '@coreui/icons'
import * as transactionActions from 'src/actions/cashflow/transactionActions'
import * as accountsMasterActions from 'src/actions/cashflow/accountsMasterActions'
import useLocaleData from 'src/hooks/useLocaleData'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import Spinner from 'src/components/shared/Spinner'
import EmptyState from 'src/components/shared/EmptyState'
import CategoryMonthStatement from 'src/components/shared/CategoryMonthStatement'
import { yearlyTotals, categoryMonthMatrix } from 'src/utils/categoryMonthStats'
import './Reports.scss'

const CURRENT_YEAR = new Date().getFullYear()

const sumMonth = (matrix, m) => matrix.reduce((s, row) => s + row[m], 0)
const sumAll = (matrix) => matrix.reduce((s, row) => s + row.reduce((a, v) => a + v, 0), 0)

const Reports = () => {
  const dispatch = useDispatch()
  const activeTenantId = useActiveTenantId()
  const division = useLocation().pathname.startsWith('/inmobiliaria/') ? 'inmobiliaria' : 'personal'
  const { monthLabels } = useLocaleData()
  const { data, fetching } = useSelector((s) => s.transaction)
  const { data: masters } = useSelector((s) => s.accountsMaster)
  const [searchParams, setSearchParams] = useSearchParams()
  const year = Number(searchParams.get('year')) || CURRENT_YEAR
  const setYear = (value) =>
    setSearchParams((prev) => {
      prev.set('year', value)
      return prev
    })
  const [expanded, setExpanded] = useState(() => new Set())
  // Arranca en la división de la ruta por la que entraste; los botones permiten cambiarla.
  const mode = searchParams.get('mode') || division
  const setMode = (value) =>
    setSearchParams((prev) => {
      prev.set('mode', value)
      return prev
    })

  useEffect(() => {
    dispatch(transactionActions.fetchRequest({}))
    dispatch(accountsMasterActions.fetchRequest())
  }, [dispatch, activeTenantId])

  const mastersById = useMemo(() => {
    const map = {}
    ;(masters ?? []).forEach((m) => {
      map[m.id] = m
    })
    return map
  }, [masters])

  const toggleExpanded = (key) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const transactions = useMemo(() => {
    const scoped = (data ?? []).filter((t) => {
      if (mode === 'ambos') return true
      return (t.division ?? 'personal') === mode
    })
    // Transacciones de Inmobiliaria: agrupar por cuenta (apartamento) en vez de la categoría genérica.
    return scoped.map((t) => {
      if ((t.division ?? 'personal') !== 'inmobiliaria') return t
      const master = t.accountMasterId && mastersById[t.accountMasterId]
      return master ? { ...t, category: master.name } : t
    })
  }, [data, mode, mastersById])
  const monthLabelsShort = useMemo(() => monthLabels.map((m) => m.slice(0, 3)), [monthLabels])
  const years = useMemo(
    () => yearlyTotals(transactions, 'income', 'expense').map((t) => t.year),
    [transactions],
  )

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
        <div className="statement__mode-group">
          {[
            { key: 'personal', label: 'Personal' },
            { key: 'inmobiliaria', label: 'Inmobiliario' },
            { key: 'ambos', label: 'Ambos' },
          ].map((m) => (
            <button
              key={m.key}
              type="button"
              className={`statement__mode-btn ${mode === m.key ? 'statement__mode-btn--active' : ''}`}
              onClick={() => setMode(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <button type="button" className="statement__print-btn" onClick={() => window.print()}>
          <CIcon icon={cilPrint} className="me-1" /> Imprimir
        </button>
      </div>

      <div className="statement__sheet">
        <h1 className="statement__title">Estado de Resultados</h1>
        <div className="statement__subtitle">Año {year}</div>

        <div className="statement__scroll">
          <CategoryMonthStatement
            months={monthLabelsShort}
            sections={[
              {
                title: 'Ingresos',
                modifier: 'income',
                type: 'income',
                categories: income.categories,
                matrix: income.matrix,
                categoryGroups: income.categoryGroups,
              },
              {
                title: 'Egresos',
                modifier: 'expense',
                type: 'expense',
                categories: expense.categories,
                matrix: expense.matrix,
                categoryGroups: expense.categoryGroups,
              },
            ]}
            records={transactions}
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

export default Reports
