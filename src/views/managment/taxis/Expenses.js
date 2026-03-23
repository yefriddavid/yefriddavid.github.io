import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { DataGrid, Column, Editing, Selection, Form } from 'devextreme-react/data-grid'
import { GroupItem, SimpleItem } from 'devextreme-react/form'
import {
  CCard, CCardBody, CCardHeader, CSpinner, CBadge,
  CButton, CForm, CFormInput, CFormLabel, CFormSelect, CRow, CCol, CCollapse,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPlus, cilX } from '@coreui/icons'
import * as taxiExpenseActions from 'src/actions/taxiExpenseActions'
import { updateExpense } from 'src/services/providers/firebase/taxiExpenses'
import { getVehicles } from 'src/services/providers/firebase/taxiVehicles'
import '../../../views/movements/payments/Payments.scss'

const CATEGORIES = ['Combustible', 'Mantenimiento', 'Repuestos', 'Lavado', 'Multa', 'Otro']

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const today = () => new Date().toISOString().split('T')[0]

const EMPTY = { description: '', category: CATEGORIES[0], amount: '', date: today(), plate: '', comment: '' }

const Gastos = () => {
  const dispatch = useDispatch()
  const { data: expenses, fetching, isError } = useSelector((s) => s.taxiExpense)

  const now = new Date()
  const [vehicles, setVehicles] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [formError, setFormError] = useState(null)
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    dispatch(taxiExpenseActions.fetchRequest())
    getVehicles().then(setVehicles)
  }, [dispatch])

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.description || !form.amount || !form.date) {
      setFormError('Descripción, valor y fecha son requeridos')
      return
    }
    setFormError(null)
    dispatch(taxiExpenseActions.createRequest(form))
    setForm(EMPTY)
    setShowForm(false)
  }

  const handleRowUpdating = (e) => {
    const merged = { ...e.oldData, ...e.newData }
    e.cancel = updateExpense(e.key, merged).then(() => {
      dispatch(taxiExpenseActions.fetchRequest())
      return false
    })
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
            <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)', whiteSpace: 'nowrap' }}>Categoría</span>
            <CFormSelect
              size="sm"
              style={{ width: 130 }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Todas</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </CFormSelect>
          </div>
          <CButton
            size="sm"
            color={showForm ? 'danger' : 'primary'}
            variant="outline"
            onClick={() => { setShowForm((p) => !p); setFormError(null) }}
          >
            <CIcon icon={showForm ? cilX : cilPlus} size="sm" />
            {' '}{showForm ? 'Cancelar' : 'Nuevo gasto'}
          </CButton>
        </CCardHeader>

        <CCollapse visible={showForm}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--cui-border-color)' }}>
            <CForm onSubmit={handleAdd}>
              <CRow className="g-2 align-items-end">
                <CCol sm={3}>
                  <CFormLabel style={{ fontSize: 12 }}>Descripción</CFormLabel>
                  <CFormInput size="sm" placeholder="Ej. Tanque de gasolina" value={form.description} onChange={set('description')} />
                </CCol>
                <CCol sm={2}>
                  <CFormLabel style={{ fontSize: 12 }}>Categoría</CFormLabel>
                  <CFormSelect size="sm" value={form.category} onChange={set('category')}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol sm={2}>
                  <CFormLabel style={{ fontSize: 12 }}>Vehículo</CFormLabel>
                  <CFormSelect size="sm" value={form.plate} onChange={set('plate')}>
                    <option value="">— Ninguno —</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.plate}>{v.plate}{v.brand ? ` · ${v.brand}` : ''}</option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol sm={2}>
                  <CFormLabel style={{ fontSize: 12 }}>Valor</CFormLabel>
                  <CFormInput size="sm" type="number" placeholder="0" value={form.amount} onChange={set('amount')} />
                </CCol>
                <CCol sm={2}>
                  <CFormLabel style={{ fontSize: 12 }}>Fecha</CFormLabel>
                  <CFormInput size="sm" type="date" value={form.date} onChange={set('date')} />
                </CCol>
                <CCol sm={2}>
                  <CFormLabel style={{ fontSize: 12 }}>Comentario</CFormLabel>
                  <CFormInput size="sm" placeholder="Observaciones..." value={form.comment} onChange={set('comment')} />
                </CCol>
                <CCol sm={1}>
                  <CButton type="submit" size="sm" color="primary" disabled={fetching} style={{ width: '100%' }}>
                    {fetching ? <CSpinner size="sm" /> : 'Guardar'}
                  </CButton>
                </CCol>
              </CRow>
              {formError && <div style={{ marginTop: 8, fontSize: 12, color: '#e03131' }}>{formError}</div>}
              {isError && <div style={{ marginTop: 8, fontSize: 12, color: '#e03131' }}>Error al guardar. Intente de nuevo.</div>}
            </CForm>
          </div>
        </CCollapse>

        {fetching && !expenses ? (
          <div className="d-flex justify-content-center py-5"><CSpinner color="primary" /></div>
        ) : (
          <DataGrid
              id="paymentsGrid"
              style={{ margin: 16 }}
              keyExpr="id"
              dataSource={filtered}
              onRowUpdating={handleRowUpdating}
              showBorders={true}
              columnAutoWidth={true}
              columnHidingEnabled={true}
              allowColumnResizing={true}
              rowAlternationEnabled={true}
              hoverStateEnabled={true}
              noDataText="Sin gastos para este periodo."
            >
              <Editing allowUpdating={true} mode="form">
                <Form colCount={3}>
                  <GroupItem caption="Gasto" colCount={3} colSpan={3}>
                    <SimpleItem dataField="date" label={{ text: 'Fecha' }} editorType="dxDateBox" editorOptions={{ displayFormat: 'dd/MM/yyyy', dateSerializationFormat: 'yyyy-MM-dd' }} />
                    <SimpleItem dataField="category" label={{ text: 'Categoría' }} editorType="dxSelectBox" editorOptions={{ dataSource: CATEGORIES }} />
                    <SimpleItem dataField="plate" label={{ text: 'Vehículo' }} editorType="dxSelectBox" editorOptions={{ dataSource: [{ plate: '', label: '— Ninguno —' }, ...vehicles.map((v) => ({ plate: v.plate, label: `${v.plate}${v.brand ? ` · ${v.brand}` : ''}` }))], valueExpr: 'plate', displayExpr: 'label' }} />
                    <SimpleItem dataField="description" label={{ text: 'Descripción' }} colSpan={2} />
                    <SimpleItem dataField="amount" label={{ text: 'Valor' }} editorType="dxNumberBox" />
                    <SimpleItem dataField="comment" label={{ text: 'Comentario' }} colSpan={3} />
                  </GroupItem>
                </Form>
              </Editing>
              <Column dataField="date" caption="Fecha" width={110} hidingPriority={1} />
              <Column dataField="category" caption="Categoría" width={130} hidingPriority={3} />
              <Column dataField="description" caption="Descripción" minWidth={160} hidingPriority={5} />
              <Column
                dataField="plate"
                caption="Vehículo"
                width={110}
                hidingPriority={2}
                cellRender={({ value }) =>
                  value ? <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{value}</span> : '—'
                }
              />
              <Column dataField="comment" caption="Comentario" minWidth={140} hidingPriority={6} />
              <Column
                dataField="amount"
                caption="Valor"
                width={130}
                hidingPriority={4}
                cellRender={({ value }) => (
                  <span style={{ fontWeight: 600 }}>{fmt(value)}</span>
                )}
              />
              <Column
                caption=""
                width={50}
                allowSorting={false}
                allowResizing={false}
                hidingPriority={7}
                cellRender={({ data }) => (
                  <button
                    onClick={() => handleDelete(data.id)}
                    style={{ background: 'none', border: 'none', color: '#e03131', cursor: 'pointer', padding: '2px 6px' }}
                    title="Eliminar"
                  >
                    <CIcon icon={cilTrash} size="sm" />
                  </button>
                )}
              />
          </DataGrid>
        )}
      </CCard>
    </>
  )
}

export default Gastos
