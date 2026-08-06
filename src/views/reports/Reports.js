import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useSearchParams } from 'react-router-dom'
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
    () => categoryMonthMatrix(transactions, 'income', selectedYears),
    [transactions, selectedYears],
  )
  const expense = useMemo(
    () => categoryMonthMatrix(transactions, 'expense', selectedYears),
    [transactions, selectedYears],
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
        <div className="statement__mode-group statement__mode-group--years">
          {years.map((y) => (
            <button
              key={y}
              type="button"
              className={`statement__mode-btn ${selectedYears.includes(y) ? 'statement__mode-btn--active' : ''}`}
              onClick={() => toggleYear(y)}
            >
              {y}
            </button>
          ))}
        </div>
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
        <div className="statement__subtitle">
          {selectedYears.length > 1 ? 'Años' : 'Año'} {selectedYears.join(', ')}
        </div>

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
            year={selectedYears}
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
