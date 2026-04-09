import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { Column, MasterDetail, Summary, TotalItem } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/App/StandardGrid/Index'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CBadge,
  CButton,
  CCollapse,
  CFormSelect,
  CRow,
  CCol,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPlus, cilX, cilCopy } from '@coreui/icons'
import * as taxiExpenseActions from 'src/actions/Taxi/taxiExpenseActions'
import * as taxiDriverActions from 'src/actions/Taxi/taxiDriverActions'
import { updateExpense } from 'src/services/providers/firebase/Taxi/taxiExpenses'
import { getVehicles } from 'src/services/providers/firebase/Taxi/taxiVehicles'
import StandardForm, { StandardField, SF } from 'src/components/App/StandardForm'
import DetailPanel, { DetailSection, DetailRow } from 'src/components/App/DetailPanel'
import useLocaleData from 'src/hooks/useLocaleData'
import {
  TAXI_EXPENSE_CATEGORIES as CATEGORIES,
  TAXI_MAINTENANCE_CATEGORIES as MAINTENANCE_CATS,
} from 'src/constants/taxi'

//const MONTHS = [
//  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
//  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
//]

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n)

const today = () => new Date().toISOString().split('T')[0]

const EMPTY = {
  description: '',
  category: CATEGORIES[0],
  amount: '',
  date: today(),
  plate: '',
  comment: '',
  nextDate: '',
}

const MultiCheckDropdown = ({ options, selected, onChange, placeholder }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = useCallback(
    (val) => {
      onChange(selected.includes(val) ? selected.filter((s) => s !== val) : [...selected, val])
    },
    [selected, onChange],
  )

  const label =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? selected[0]
        : `${selected.length} categorías`

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          height: 30,
          fontSize: 13,
          padding: '0 8px',
          borderRadius: 4,
          border: '1px solid var(--cui-border-color)',
          background: 'var(--cui-body-bg)',
          color: selected.length ? 'var(--cui-body-color)' : 'var(--cui-secondary-color)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          minWidth: 130,
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 6,
        }}
      >
        <span>{label}</span>
        <span style={{ fontSize: 10, opacity: 0.6 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 1050,
            marginTop: 2,
            background: 'var(--cui-body-bg)',
            border: '1px solid var(--cui-border-color)',
            borderRadius: 6,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            minWidth: 160,
            padding: '4px 0',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 12px',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              borderBottom: '1px solid var(--cui-border-color)',
              marginBottom: 2,
            }}
          >
            <input
              type="checkbox"
              checked={selected.length === 0}
              onChange={() => onChange(selected.length === 0 ? options : [])}
              style={{ cursor: 'pointer', accentColor: 'var(--cui-primary)' }}
            />
            Todos
          </label>
          {options.map((opt) => (
            <label
              key={opt}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 12px',
                cursor: 'pointer',
                fontSize: 13,
                background: selected.includes(opt)
                  ? 'var(--cui-primary-bg-subtle, #e7f1ff)'
                  : 'transparent',
              }}
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                style={{ cursor: 'pointer', accentColor: 'var(--cui-primary)' }}
              />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

const ExpenseForm = ({ initial, vehicles, onSave, onCancel, saving, title, subtitle }) => {
  const [form, setForm] = useState(initial)
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  return (
    <StandardForm
      title={title}
      subtitle={subtitle}
      onSave={() => onSave(form)}
      onCancel={onCancel}
      saving={saving}
    >
      <StandardField label="Descripción">
        <input
          className={SF.input}
          placeholder="Ej. Tanque de gasolina"
          value={form.description}
          onChange={set('description')}
        />
      </StandardField>
      <StandardField label="Categoría">
        <select className={SF.select} value={form.category} onChange={set('category')}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </StandardField>
      <StandardField label="Vehículo">
        <select className={SF.select} value={form.plate} onChange={set('plate')}>
          <option value="">— Ninguno —</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.plate}>
              {v.plate}
              {v.brand ? ` · ${v.brand}` : ''}
            </option>
          ))}
        </select>
      </StandardField>
      <StandardField label="Valor">
        <input
          className={SF.input}
          type="number"
          placeholder="0"
          value={form.amount}
          onChange={set('amount')}
        />
      </StandardField>
      <StandardField label="Fecha">
        <input className={SF.input} type="date" value={form.date} onChange={set('date')} />
      </StandardField>
      {MAINTENANCE_CATS.includes(form.category) && (
        <StandardField label="Próximo servicio">
          <input
            className={SF.input}
            type="date"
            value={form.nextDate || ''}
            onChange={set('nextDate')}
          />
        </StandardField>
      )}
      <StandardField label="Comentario">
        <textarea
          className={SF.textarea}
          placeholder="Observaciones..."
          value={form.comment}
          onChange={set('comment')}
          rows={2}
        />
      </StandardField>
    </StandardForm>
  )
}

const Gastos = () => {
  const { t } = useTranslation()
  const { monthLabels: MONTHS } = useLocaleData()
  const dispatch = useDispatch()
  const { data: expenses, fetching } = useSelector((s) => s.taxiExpense)
  const { data: drivers } = useSelector((s) => s.taxiDriver)
  const gridRef = useRef()

  const now = new Date()
  const [vehicles, setVehicles] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })
  const [categoryFilter, setCategoryFilter] = useState([])
  const [plateFilter, setPlateFilter] = useState('')
  const [paidFilter, setPaidFilter] = useState('')
  const [cloneSource, setCloneSource] = useState(null)
  const [cloneForm, setCloneForm] = useState({ date: today(), plate: '' })

  useEffect(() => {
    dispatch(taxiExpenseActions.fetchRequest())
    dispatch(taxiDriverActions.fetchRequest())
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
    updateExpense(editingRow.id, { ...editingRow, ...form, amount: Number(form.amount) }).then(
      () => {
        dispatch(taxiExpenseActions.fetchRequest())
      },
    )
    gridRef.current?.instance()?.collapseRow(editingRow.id)
    setEditingRow(null)
  }

  const handleEditCancel = () => {
    gridRef.current?.instance()?.collapseRow(editingRow.id)
    setEditingRow(null)
  }

  const openClone = (row) => {
    setCloneForm({ date: today(), plate: row.plate || '', category: row.category || CATEGORIES[0] })
    setCloneSource(row)
  }

  const handleCloneConfirm = () => {
    if (!cloneForm.date) return
    const { id, ...rest } = cloneSource
    dispatch(
      taxiExpenseActions.createRequest({
        ...rest,
        date: cloneForm.date,
        plate: cloneForm.plate,
        category: cloneForm.category,
      }),
    )
    setCloneSource(null)
  }

  const handleDelete = (id) => {
    if (!window.confirm('¿Eliminar este gasto?')) return
    dispatch(taxiExpenseActions.deleteRequest({ id }))
  }

  const records = expenses ?? []

  const availableYears = useMemo(() => {
    const years = [...new Set(records.map((r) => r.date?.slice(0, 4)).filter(Boolean))]
      .map(Number)
      .sort((a, b) => b - a)
    if (!years.includes(period.year)) years.unshift(period.year)
    return years
  }, [records, period.year])

  const filtered = records.filter((r) => {
    if (!r.date) return false
    const [y, m] = r.date.split('-').map(Number)
    if (y !== period.year) return false
    if (period.month !== 0 && m !== period.month) return false
    if (categoryFilter.length > 0 && !categoryFilter.includes(r.category)) return false
    if (plateFilter && r.plate !== plateFilter) return false
    if (paidFilter === 'paid' && !r.paid) return false
    if (paidFilter === 'unpaid' && r.paid) return false
    return true
  })

  const total = filtered.reduce((acc, r) => acc + (r.amount || 0), 0)
  const totalPending = filtered.filter((r) => !r.paid).reduce((acc, r) => acc + (r.amount || 0), 0)

  const plateToDriver = useMemo(() => {
    if (!drivers) return {}
    return drivers
      .filter((d) => d.active && d.defaultVehicle)
      .reduce((acc, d) => {
        acc[d.defaultVehicle] = d.name
        return acc
      }, {})
  }, [drivers])

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
      <CRow className="mb-3 g-2">
        <CCol xs={12} sm={4}>
          <CCard className="text-center h-100">
            <CCardBody>
              <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 4 }}>
                Total gastos
              </div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{fmt(total)}</div>
              {totalPending > 0 && (
                <div style={{ fontSize: 12, color: '#e67700', marginTop: 4, fontWeight: 600 }}>
                  ⏳ {fmt(totalPending)} pendiente
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} sm={8}>
          <CCard className="h-100">
            <CCardBody style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 6 }}>
                Por categoría
              </div>
              {fetching && !expenses ? (
                <CSpinner size="sm" />
              ) : byCategory.length === 0 ? (
                <span style={{ fontSize: 13, color: 'var(--cui-secondary-color)' }}>
                  Sin registros
                </span>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {byCategory.map((c) => (
                    <div
                      key={c.category}
                      style={{
                        background: 'var(--cui-warning-bg-subtle, #fff3cd)',
                        borderRadius: 8,
                        padding: '4px 12px',
                        fontSize: 13,
                      }}
                    >
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
        <CCardHeader style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Title row */}
          <div className="d-flex align-items-center justify-content-between gap-2">
            <div className="d-flex align-items-center gap-2">
              <strong>Gastos de taxis</strong>
              <CBadge color="secondary">{filtered.length}</CBadge>
            </div>
            <CButton
              size="sm"
              color={showCreate ? 'danger' : 'primary'}
              variant="outline"
              onClick={() => setShowCreate((p) => !p)}
            >
              <CIcon icon={showCreate ? cilX : cilPlus} size="sm" />{' '}
              {showCreate ? 'Cancelar' : 'Nuevo gasto'}
            </CButton>
          </div>
          {/* Filters row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span
                style={{ fontSize: 12, color: 'var(--cui-secondary-color)', whiteSpace: 'nowrap' }}
              >
                Periodo
              </span>
              <CFormSelect
                size="sm"
                style={{ width: 110 }}
                value={period.month}
                onChange={(e) => setPeriod((p) => ({ ...p, month: Number(e.target.value) }))}
              >
                <option value={0}>Todos</option>
                {MONTHS.map((name, i) => (
                  <option key={i + 1} value={i + 1}>
                    {name}
                  </option>
                ))}
              </CFormSelect>
              <CFormSelect
                size="sm"
                style={{ width: 80 }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span
                style={{ fontSize: 12, color: 'var(--cui-secondary-color)', whiteSpace: 'nowrap' }}
              >
                Categoría
              </span>
              <MultiCheckDropdown
                options={CATEGORIES}
                selected={categoryFilter}
                onChange={setCategoryFilter}
                placeholder="Todas"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span
                style={{ fontSize: 12, color: 'var(--cui-secondary-color)', whiteSpace: 'nowrap' }}
              >
                Vehículo
              </span>
              <CFormSelect
                size="sm"
                style={{ width: 100 }}
                value={plateFilter}
                onChange={(e) => setPlateFilter(e.target.value)}
              >
                <option value="">Todos</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.plate}>
                    {v.plate}
                  </option>
                ))}
              </CFormSelect>
            </div>
            <CFormSelect
              size="sm"
              style={{ width: 130 }}
              value={paidFilter}
              onChange={(e) => setPaidFilter(e.target.value)}
            >
              <option value="">Estado: Todos</option>
              <option value="paid">Pagados</option>
              <option value="unpaid">Pendientes</option>
            </CFormSelect>
          </div>
        </CCardHeader>

        <CCollapse visible={showCreate}>
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--cui-border-color)',
              maxWidth: 380,
            }}
          >
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
            <div className="d-flex justify-content-center py-5">
              <CSpinner color="primary" />
            </div>
          ) : (
            <StandardGrid
              style={{ margin: 0 }}
              ref={gridRef}
              keyExpr="id"
              dataSource={filtered}
              noDataText="Sin gastos para este periodo."
            >
              <Column
                dataField="category"
                caption={t('taxis.expenses.columns.category')}
                width={130}
              />
              <Column
                dataField="description"
                caption={t('taxis.expenses.columns.description')}
                minWidth={160}
              />
              <Column
                dataField="plate"
                caption={t('taxis.expenses.columns.vehicle')}
                width={110}
                cellRender={({ value }) =>
                  value ? (
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{value}</span>
                  ) : (
                    '—'
                  )
                }
              />
              <Column
                caption="Conductor"
                width={140}
                cellRender={({ data }) => {
                  const driverName = plateToDriver[data.plate]
                  return driverName ? (
                    <span style={{ fontSize: 11, color: 'var(--cui-secondary-color)' }}>
                      {driverName}
                    </span>
                  ) : (
                    '—'
                  )
                }}
              />
              <Column
                dataField="date"
                caption={t('taxis.expenses.columns.date')}
                width={110}
                hidingPriority={6}
              />
              <Column
                dataField="comment"
                caption={t('taxis.expenses.columns.comment')}
                minWidth={140}
                hidingPriority={6}
              />
              <Column
                dataField="amount"
                caption={t('taxis.expenses.columns.amount')}
                width={130}
                cellRender={({ value }) => <span style={{ fontWeight: 600 }}>{fmt(value)}</span>}
              />
              <Column
                dataField="paid"
                caption="Estado"
                width={110}
                allowSorting={true}
                cellRender={({ data }) => (
                  <button
                    onClick={() =>
                      dispatch(
                        taxiExpenseActions.togglePaidRequest({ id: data.id, paid: !data.paid }),
                      )
                    }
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: 4,
                      padding: '2px 8px',
                      border: 'none',
                      cursor: 'pointer',
                      background: data.paid ? '#d1fae5' : '#fff3cd',
                      color: data.paid ? '#065f46' : '#7c5e00',
                    }}
                  >
                    {data.paid ? '✓ Pagado' : '⏳ Pendiente'}
                  </button>
                )}
              />
              <Column
                caption=""
                width={90}
                allowSorting={false}
                allowResizing={false}
                cellRender={({ data }) => (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => handleEdit(data)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--cui-primary)',
                        cursor: 'pointer',
                        padding: '2px 6px',
                      }}
                      title="Editar"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => openClone(data)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#1971c2',
                        cursor: 'pointer',
                        padding: '2px 6px',
                      }}
                      title="Clonar"
                    >
                      <CIcon icon={cilCopy} size="sm" />
                    </button>
                    <button
                      onClick={() => handleDelete(data.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#e03131',
                        cursor: 'pointer',
                        padding: '2px 6px',
                      }}
                      title="Eliminar"
                    >
                      <CIcon icon={cilTrash} size="sm" />
                    </button>
                  </div>
                )}
              />
              <Summary>
                <TotalItem
                  column="amount"
                  summaryType="sum"
                  customizeText={({ value }) => fmt(value)}
                  cssClass="summary-total-white"
                />
              </Summary>
              <MasterDetail
                enabled={true}
                render={({ data }) =>
                  editingRow?.id === data.id ? (
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
                  ) : (
                    <DetailPanel columns={2}>
                      <DetailSection title="Gasto">
                        <DetailRow label="Fecha" value={data.date} />
                        <DetailRow label="Descripción" value={data.description} />
                        <DetailRow label="Categoría" value={data.category} />
                        <DetailRow label="Valor" value={fmt(data.amount)} />
                      </DetailSection>
                      <DetailSection title="Detalle">
                        <DetailRow label="Vehículo" value={data.plate} mono />
                        {data.nextDate && (
                          <DetailRow label="Próximo servicio" value={data.nextDate} />
                        )}
                        <DetailRow label="Comentario" value={data.comment} />
                      </DetailSection>
                    </DetailPanel>
                  )
                }
              />
            </StandardGrid>
          )}
        </CCardBody>
      </CCard>
      {/* Clone modal */}
      <CModal visible={!!cloneSource} onClose={() => setCloneSource(null)} alignment="center">
        <CModalHeader>
          <CModalTitle>Clonar gasto</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {cloneSource && (
            <div
              style={{
                marginBottom: 12,
                padding: '10px 14px',
                background: 'var(--cui-secondary-bg)',
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              <strong>{cloneSource.description}</strong>
              <span style={{ marginLeft: 8, color: 'var(--cui-secondary-color)' }}>
                {cloneSource.category} · {fmt(cloneSource.amount)}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Fecha
              </label>
              <input
                className={SF.input}
                type="date"
                value={cloneForm.date}
                onChange={(e) => setCloneForm((p) => ({ ...p, date: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Categoría
              </label>
              <select
                className={SF.select}
                value={cloneForm.category}
                onChange={(e) => setCloneForm((p) => ({ ...p, category: e.target.value }))}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Placa
              </label>
              <select
                className={SF.select}
                value={cloneForm.plate}
                onChange={(e) => setCloneForm((p) => ({ ...p, plate: e.target.value }))}
              >
                <option value="">— Ninguno —</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.plate}>
                    {v.plate}
                    {v.brand ? ` · ${v.brand}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setCloneSource(null)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleCloneConfirm} disabled={!cloneForm.date}>
            <CIcon icon={cilCopy} size="sm" className="me-1" />
            Clonar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Gastos
