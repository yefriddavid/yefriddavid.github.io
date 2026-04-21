import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Column } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CBadge,
  CFormSelect,
  CRow,
  CCol,
} from '@coreui/react'
import { getSettlements } from 'src/services/firebase/taxi/taxiSettlements'
import { fetchExpenses } from 'src/services/firebase/taxi/taxiExpenses'
import './masters.scss'

const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n)

const SummaryCard = ({ label, value, color }) => (
  <CCard className="text-center h-100">
    <CCardBody>
      <div className="summary-card__label">{label}</div>
      <div className="summary-card__value" style={{ color }}>{fmt(value)}</div>
    </CCardBody>
  </CCard>
)

const Resumen = () => {
  const { t } = useTranslation()
  const now = new Date()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })

  useEffect(() => {
    Promise.all([getSettlements(), fetchExpenses()])
      .then(([settlements, expenses]) => {
        const merged = [
          ...settlements.map((s) => ({
            id: `s-${s.id}`,
            date: s.date,
            type: 'Liquidación',
            concept: s.driver,
            plate: s.plate,
            category: '—',
            amount: s.amount,
            comment: s.comment ?? '',
            _sign: 1,
          })),
          ...expenses.map((e) => ({
            id: `e-${e.id}`,
            date: e.date,
            type: 'Gasto',
            concept: e.description,
            plate: e.plate ?? '—',
            category: e.category,
            amount: e.amount,
            comment: e.comment ?? '',
            _sign: -1,
          })),
        ]
        setRows(merged)
      })
      .finally(() => setLoading(false))
  }, [])

  const availableYears = useMemo(() => {
    const years = [...new Set(rows.map((r) => r.date?.slice(0, 4)).filter(Boolean))]
      .map(Number)
      .sort((a, b) => b - a)
    if (!years.includes(period.year)) years.unshift(period.year)
    return years
  }, [rows, period.year])

  const filtered = rows
    .filter((r) => {
      if (!r.date) return false
      const [y, m] = r.date.split('-').map(Number)
      return y === period.year && m === period.month
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  const totalIncome = filtered
    .filter((r) => r._sign === 1)
    .reduce((acc, r) => acc + (r.amount || 0), 0)
  const totalExpense = filtered
    .filter((r) => r._sign === -1)
    .reduce((acc, r) => acc + (r.amount || 0), 0)
  const net = totalIncome - totalExpense

  const onRowPrepared = (e) => {
    if (e.rowType !== 'data') return
    if (e.data.type === 'Gasto') {
      e.rowElement.style.background = '#fff8f0'
    }
  }

  return (
    <>
      {/* Summary cards */}
      <CRow className="mb-3 g-3">
        <CCol sm={4}>
          <SummaryCard label="Total liquidado" value={totalIncome} />
        </CCol>
        <CCol sm={4}>
          <SummaryCard label="Total gastos" value={totalExpense} color="#e03131" />
        </CCol>
        <CCol sm={4}>
          <SummaryCard label="Neto" value={net} color={net >= 0 ? '#2f9e44' : '#e03131'} />
        </CCol>
      </CRow>

      {/* Grid */}
      <CCard>
        <CCardHeader className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <strong>Resumen del periodo</strong>
            <CBadge color="secondary">{filtered.length}</CBadge>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="period-label">Periodo</span>
            <CFormSelect
              size="sm"
              className="period-select-month"
              value={period.month}
              onChange={(e) => setPeriod((p) => ({ ...p, month: Number(e.target.value) }))}
            >
              {MONTHS.map((name, i) => (
                <option key={i + 1} value={i + 1}>
                  {name}
                </option>
              ))}
            </CFormSelect>
            <CFormSelect
              size="sm"
              className="period-select-year"
              value={period.year}
              onChange={(e) => setPeriod((p) => ({ ...p, year: Number(e.target.value) }))}
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </CFormSelect>
          </div>
        </CCardHeader>

        <CCardBody className="p-3">
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <CSpinner color="primary" />
            </div>
          ) : (
            <StandardGrid
              keyExpr="id"
              dataSource={filtered}
              rowAlternationEnabled={false}
              noDataText="Sin registros para este periodo."
              onRowPrepared={onRowPrepared}
            >
              <Column dataField="date" caption={t('taxis.resumen.columns.date')} width={110} />
              <Column
                dataField="type"
                caption={t('taxis.resumen.columns.type')}
                width={110}
                cellRender={({ value }) => (
                  <span className={`row-type-badge${value === 'Liquidación' ? ' row-type-badge--income' : ' row-type-badge--expense'}`}>
                    {value}
                  </span>
                )}
              />
              <Column
                dataField="concept"
                caption={t('taxis.resumen.columns.concept')}
                minWidth={140}
              />
              <Column
                dataField="plate"
                caption={t('taxis.resumen.columns.plate')}
                width={100}
                cellRender={({ value }) => (
                  <span className="master-mono master-amount">{value || '—'}</span>
                )}
              />
              <Column
                dataField="category"
                caption={t('taxis.resumen.columns.category')}
                width={120}
                hidingPriority={2}
              />
              <Column
                dataField="amount"
                caption={t('taxis.resumen.columns.amount')}
                width={130}
                cellRender={({ data }) => (
                  <span className={`cell-amount${data._sign === 1 ? ' cell-amount--income' : ' cell-amount--expense'}`}>
                    {data._sign === 1 ? '+' : '-'}{fmt(data.amount)}
                  </span>
                )}
              />
              <Column
                dataField="comment"
                caption={t('taxis.resumen.columns.comment')}
                minWidth={120}
                hidingPriority={3}
              />
            </StandardGrid>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default Resumen
