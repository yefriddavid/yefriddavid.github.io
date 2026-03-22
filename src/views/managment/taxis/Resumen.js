import React, { useEffect, useState } from 'react'
import { DataGrid, Column } from 'devextreme-react/data-grid'
import {
  CCard, CCardBody, CCardHeader, CSpinner, CBadge,
  CFormSelect, CRow, CCol,
} from '@coreui/react'
import { getSettlements } from 'src/services/providers/firebase/taxis'
import { fetchExpenses } from 'src/services/providers/firebase/taxiExpenses'
import './masters.scss'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const SummaryCard = ({ label, value, color }) => (
  <CCard className="text-center h-100">
    <CCardBody>
      <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{fmt(value)}</div>
    </CCardBody>
  </CCard>
)

const Resumen = () => {
  const now = new Date()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })

  useEffect(() => {
    Promise.all([getSettlements(), fetchExpenses()]).then(([settlements, expenses]) => {
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
    }).finally(() => setLoading(false))
  }, [])

  const availableYears = [...new Set(rows.map((r) => r.date?.slice(0, 4)).filter(Boolean))]
    .map(Number).sort((a, b) => b - a)
  if (!availableYears.includes(period.year)) availableYears.unshift(period.year)

  const filtered = rows
    .filter((r) => {
      if (!r.date) return false
      const [y, m] = r.date.split('-').map(Number)
      return y === period.year && m === period.month
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  const totalIncome = filtered.filter((r) => r._sign === 1).reduce((acc, r) => acc + (r.amount || 0), 0)
  const totalExpense = filtered.filter((r) => r._sign === -1).reduce((acc, r) => acc + (r.amount || 0), 0)
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
            <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)', whiteSpace: 'nowrap' }}>Periodo</span>
            <CFormSelect
              size="sm"
              style={{ width: 120 }}
              value={period.month}
              onChange={(e) => setPeriod((p) => ({ ...p, month: Number(e.target.value) }))}
            >
              {MONTHS.map((name, i) => (
                <option key={i + 1} value={i + 1}>{name}</option>
              ))}
            </CFormSelect>
            <CFormSelect
              size="sm"
              style={{ width: 90 }}
              value={period.year}
              onChange={(e) => setPeriod((p) => ({ ...p, year: Number(e.target.value) }))}
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </CFormSelect>
          </div>
        </CCardHeader>

        <CCardBody style={{ padding: '16px' }}>
          {loading ? (
            <div className="d-flex justify-content-center py-5"><CSpinner color="primary" /></div>
          ) : (
            <DataGrid
              className="masters-grid"
              keyExpr="id"
              dataSource={filtered}
              showBorders={true}
              columnAutoWidth={true}
              columnHidingEnabled={true}
              allowColumnResizing={true}
              rowAlternationEnabled={false}
              hoverStateEnabled={true}
              noDataText="Sin registros para este periodo."
              onRowPrepared={onRowPrepared}
            >
              <Column dataField="date" caption="Fecha" width={110} />
              <Column
                dataField="type"
                caption="Tipo"
                width={110}
                cellRender={({ value }) => (
                  <span style={{
                    fontWeight: 600,
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 10,
                    background: value === 'Liquidación' ? '#dbeafe' : '#fee2e2',
                    color: value === 'Liquidación' ? '#1e40af' : '#b91c1c',
                  }}>
                    {value}
                  </span>
                )}
              />
              <Column dataField="concept" caption="Concepto" minWidth={140} />
              <Column
                dataField="plate"
                caption="Placa"
                width={100}
                cellRender={({ value }) => (
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{value || '—'}</span>
                )}
              />
              <Column dataField="category" caption="Categoría" width={120} hidingPriority={2} />
              <Column
                dataField="amount"
                caption="Valor"
                width={130}
                cellRender={({ data }) => (
                  <span style={{ fontWeight: 700, color: data._sign === 1 ? '#1e40af' : '#b91c1c' }}>
                    {data._sign === 1 ? '+' : '-'}{fmt(data.amount)}
                  </span>
                )}
              />
              <Column dataField="comment" caption="Comentario" minWidth={120} hidingPriority={3} />
            </DataGrid>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default Resumen
