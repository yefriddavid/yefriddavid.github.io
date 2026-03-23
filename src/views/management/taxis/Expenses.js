import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { Column, MasterDetail } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/StandardGrid'
import {
  CCard, CCardBody, CCardHeader, CSpinner, CBadge,
  CButton, CCollapse, CFormSelect, CRow, CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPlus, cilX } from '@coreui/icons'
import * as taxiExpenseActions from 'src/actions/taxiExpenseActions'
import { updateExpense } from 'src/services/providers/firebase/taxiExpenses'
import { getVehicles } from 'src/services/providers/firebase/taxiVehicles'
import StandardForm, { StandardField, SF } from 'src/components/StandardForm'
import DetailPanel, { DetailSection, DetailRow } from 'src/components/DetailPanel'

const CATEGORIES = ['Combustible', 'Mantenimiento', 'Repuestos', 'Lavado', 'Multa', 'Otro']

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const today = () => new Date().toISOString().split('T')[0]

const EMPTY = { description: '', category: CATEGORIES[0], amount: '', date: today(), plate: '', comment: '' }

const ExpenseForm = ({ initial, vehicles, onSave, onCancel, saving, title, subtitle }) => {
  const [form, setForm] = useState(initial)
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  return (
    <StandardForm title={title} subtitle={subtitle} onSave={() => onSave(form)} onCancel={onCancel} saving={saving}>
      <StandardField label="Descripción">
        <input className={SF.input} placeholder="Ej. Tanque de gasolina" value={form.description} onChange={set('description')} />
      </StandardField>
      <StandardField label="Categoría">
        <select className={SF.select} value={form.category} onChange={set('category')}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </StandardField>
      <StandardField label="Vehículo">
        <select className={SF.select} value={form.plate} onChange={set('plate')}>
          <option value="">— Ninguno —</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.plate}>{v.plate}{v.brand ? ` · ${v.brand}` : ''}</option>
          ))}
        </select>
      </StandardField>
      <StandardField label="Valor">
        <input className={SF.input} type="number" placeholder="0" value={form.amount} onChange={set('amount')} />
      </StandardField>
      <StandardField label="Fecha">
        <input className={SF.input} type="date" value={form.date} onChange={set('date')} />
      </StandardField>
      <StandardField label="Comentario">
        <textarea className={SF.textarea} placeholder="Observaciones..." value={form.comment} onChange={set('comment')} rows={2} />
      </StandardField>
    </StandardForm>
  )
}

const Gastos = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { data: expenses, fetching } = useSelector((s) => s.taxiExpense)
  const gridRef = useRef()

  const now = new Date()
  const [vehicles, setVehicles] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    dispatch(taxiExpenseActions.fetchRequest())
    getVehicles().then(setVehicles)
  }, [dispatch])

  useEffect(() => {
    if (editingRow) {
      gridRef.current?.instance()?.expandRow(editingRow.id)
    }
  }, [editingRow])

  const handleCreate = (form) => {
    if (!form.description || !form.amount || !form.date) return
    dispatch(taxiExpenseActions.createRequest(form))
    setShowCreate(false)
  }

  const handleEdit = (row) => {
    setEditingRow(row)
  }

  const handleEditSave = (form) => {
    updateExpense(editingRow.id, { ...editingRow, ...form, amount: Number(form.amount) }).then(() => {
      dispatch(taxiExpenseActions.fetchRequest())
    })
    gridRef.current?.instance()?.collapseRow(editingRow.id)
    setEditingRow(null)
  }

  const handleEditCancel = () => {
    gridRef.current?.instance()?.collapseRow(editingRow.id)
    setEditingRow(null)
  }

  const handleDelete = (id) => {
    if (!window.confirm('¿Eliminar este gasto?')) return
    dispatch(taxiExpenseActions.deleteRequest({ id }))
  }

  const records = expenses ?? []

  const availableYears = [...new Set(records.map((r) => r.date?.slice(0, 4)).filter(Boolean))]
    .map(Number).sort((a, b) => b - a)
  if (!availableYears.includes(period.year)) availableYears.unshift(period.year)

  const filtered = records.filter((r) => {
    if (!r.date) return false
    const [y, m] = r.date.split('-').map(Number)
    if (y !== period.year || m !== period.month) return false
    if (categoryFilter && r.category !== categoryFilter) return false
    return true
  })

  const total = filtered.reduce((acc, r) => acc + (r.amount || 0), 0)

  const byCategory = Object.values(
    filtered.reduce((acc, r) => {
      const k = r.category || 'Otro'
      if (!acc[k]) acc[k] = { category: k, count: 0, total: 0 }
      acc[k].count += 1
      acc[k].total += r.amount || 0
      return acc
    }, {}),
  ).sort((a, b) => b.total - a.total)

  return (
    <>
      {/* Summary */}
      <CRow className="mb-3">
        <CCol sm={4}>
          <CCard className="text-center">
            <CCardBody>
              <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 4 }}>Total gastos</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{fmt(total)}</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={8}>
          <CCard>
            <CCardBody style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 6 }}>Por categoría</div>
              {fetching && !expenses ? (
                <CSpinner size="sm" />
              ) : byCategory.length === 0 ? (
                <span style={{ fontSize: 13, color: 'var(--cui-secondary-color)' }}>Sin registros</span>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {byCategory.map((c) => (
                    <div key={c.category} style={{ background: 'var(--cui-warning-bg-subtle, #fff3cd)', borderRadius: 8, padding: '4px 12px', fontSize: 13 }}>
                      <strong>{c.category}</strong>
                      <span style={{ color: 'var(--cui-secondary-color)', marginLeft: 8 }}>
                        {c.count} · {fmt(c.total)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Grid */}
      <CCard>
        <CCardHeader className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <strong>Gastos de taxis</strong>
            <CBadge color="secondary">{filtered.length}</CBadge>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)', whiteSpace: 'nowrap' }}>Periodo</span>
            <CFormSelect size="sm" style={{ width: 120 }} value={period.month}
              onChange={(e) => setPeriod((p) => ({ ...p, month: Number(e.target.value) }))}>
              {MONTHS.map((name, i) => <option key={i + 1} value={i + 1}>{name}</option>)}
            </CFormSelect>
            <CFormSelect size="sm" style={{ width: 90 }} value={period.year}
              onChange={(e) => setPeriod((p) => ({ ...p, year: Number(e.target.value) }))}>
              {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
            </CFormSelect>
            <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)', whiteSpace: 'nowrap' }}>Categoría</span>
            <CFormSelect size="sm" style={{ width: 130 }} value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">Todas</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </CFormSelect>
          </div>
          <CButton size="sm" color={showCreate ? 'danger' : 'primary'} variant="outline"
            onClick={() => setShowCreate((p) => !p)}>
            <CIcon icon={showCreate ? cilX : cilPlus} size="sm" />
            {' '}{showCreate ? 'Cancelar' : 'Nuevo gasto'}
          </CButton>
        </CCardHeader>

        <CCollapse visible={showCreate}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--cui-border-color)', maxWidth: 380 }}>
            <ExpenseForm
              initial={EMPTY}
              vehicles={vehicles}
              title="Nuevo gasto"
              onSave={handleCreate}
              onCancel={() => setShowCreate(false)}
              saving={fetching}
            />
          </div>
        </CCollapse>

        <CCardBody>
          {fetching && !expenses ? (
            <div className="d-flex justify-content-center py-5"><CSpinner color="primary" /></div>
          ) : (
            <StandardGrid
              ref={gridRef}
              keyExpr="id"
              dataSource={filtered}
              noDataText="Sin gastos para este periodo."
            >
              <Column dataField="date" caption={t('taxis.expenses.columns.date')} width={110} hidingPriority={1} />
              <Column dataField="category" caption={t('taxis.expenses.columns.category')} width={130} hidingPriority={3} />
              <Column dataField="description" caption={t('taxis.expenses.columns.description')} minWidth={160} hidingPriority={5} />
              <Column
                dataField="plate" caption={t('taxis.expenses.columns.vehicle')} width={110} hidingPriority={2}
                cellRender={({ value }) =>
                  value ? <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{value}</span> : '—'
                }
              />
              <Column dataField="comment" caption={t('taxis.expenses.columns.comment')} minWidth={140} hidingPriority={6} />
              <Column
                dataField="amount" caption={t('taxis.expenses.columns.amount')} width={130} hidingPriority={4}
                cellRender={({ value }) => <span style={{ fontWeight: 600 }}>{fmt(value)}</span>}
              />
              <Column caption="" width={70} allowSorting={false} allowResizing={false} hidingPriority={7}
                cellRender={({ data }) => (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => handleEdit(data)}
                      style={{ background: 'none', border: 'none', color: 'var(--cui-primary)', cursor: 'pointer', padding: '2px 6px' }}
                      title="Editar"
                    >✎</button>
                    <button
                      onClick={() => handleDelete(data.id)}
                      style={{ background: 'none', border: 'none', color: '#e03131', cursor: 'pointer', padding: '2px 6px' }}
                      title="Eliminar"
                    >
                      <CIcon icon={cilTrash} size="sm" />
                    </button>
                  </div>
                )}
              />
              <MasterDetail
                enabled={true}
                render={({ data }) => (
                  editingRow?.id === data.id
                    ? (
                      <div style={{ padding: '16px 24px', maxWidth: 380 }}>
                        <ExpenseForm
                          initial={data}
                          vehicles={vehicles}
                          title="Editar gasto"
                          subtitle={data.description}
                          onSave={handleEditSave}
                          onCancel={handleEditCancel}
                          saving={fetching}
                        />
                      </div>
                    )
                    : (
                      <DetailPanel columns={2}>
                        <DetailSection title="Gasto">
                          <DetailRow label="Fecha" value={data.date} />
                          <DetailRow label="Descripción" value={data.description} />
                          <DetailRow label="Categoría" value={data.category} />
                          <DetailRow label="Valor" value={fmt(data.amount)} />
                        </DetailSection>
                        <DetailSection title="Detalle">
                          <DetailRow label="Vehículo" value={data.plate} mono />
                          <DetailRow label="Comentario" value={data.comment} />
                        </DetailSection>
                      </DetailPanel>
                    )
                )}
              />
            </StandardGrid>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default Gastos
