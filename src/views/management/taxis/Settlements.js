import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { Column, MasterDetail } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/StandardGrid'
import {
  CCard, CCardBody, CCardHeader, CSpinner, CBadge,
  CButton, CForm, CFormInput, CFormLabel, CFormSelect, CRow, CCol, CCollapse,
  CDropdown, CDropdownToggle, CDropdownMenu,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPlus, cilX, cilReload, cilPencil } from '@coreui/icons'
import StandardForm, { StandardField, SF } from 'src/components/StandardForm'
import DetailPanel, { DetailSection, DetailRow } from 'src/components/DetailPanel'
import * as taxiSettlementActions from 'src/actions/taxiSettlementActions'
import * as taxiDriverActions from 'src/actions/taxiDriverActions'
import * as taxiVehicleActions from 'src/actions/taxiVehicleActions'
import * as taxiExpenseActions from 'src/actions/taxiExpenseActions'
import '../../../views/movements/payments/Payments.scss'
import '../../../views/movements/payments/ItemDetail.scss'
import './Taxis.scss'


const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const fmtDate = (dateStr) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const weekday = date.toLocaleDateString('es-CO', { weekday: 'short' })
  const day = String(d).padStart(2, '0')
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${day}`
}

const today = () => new Date().toISOString().split('T')[0]

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const EMPTY = { driver: '', plate: '', amount: '', date: today(), comment: '' }

// Self-contained master detail: handles view ↔ edit toggle internally
const SettlementMasterDetail = ({ data, drivers, vehicles, onSave, saving, editingRowIdRef }) => {
  const [editing, setEditing] = useState(() => editingRowIdRef?.current === data.id)
  const [form, setForm] = useState({
    date: data.date || '',
    driver: data.driver || '',
    plate: data.plate || '',
    amount: data.amount || '',
    comment: data.comment || '',
  })
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const driver = drivers.find((d) => d.name === data.driver)
  const vehicle = vehicles.find((v) => v.plate === data.plate)

  if (editing) {
    return (
      <div style={{ width: '50%', padding: 16 }}>
        <StandardForm
          title="Editar liquidación"
          subtitle={data.date}
          onCancel={() => setEditing(false)}
          onSave={() => { onSave({ ...data, ...form, amount: Number(form.amount) }); setEditing(false) }}
          saving={saving}
        >
          <StandardField label="Fecha">
            <input className={SF.input} type="date" value={form.date} onChange={set('date')} />
          </StandardField>
          <StandardField label="Conductor">
            <select className={SF.select} value={form.driver} onChange={set('driver')}>
              <option value="">— Seleccionar —</option>
              {drivers.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </StandardField>
          <StandardField label="Placa">
            <select className={SF.select} value={form.plate} onChange={set('plate')}>
              <option value="">— Seleccionar —</option>
              {vehicles.map((v) => <option key={v.id} value={v.plate}>{v.plate}{v.brand ? ` · ${v.brand}` : ''}</option>)}
            </select>
          </StandardField>
          <StandardField label="Valor">
            <input className={SF.input} type="number" value={form.amount} onChange={set('amount')} placeholder="0" />
          </StandardField>
          <StandardField label="Comentario">
            <textarea className={SF.textarea} value={form.comment || ''} onChange={set('comment')} rows={3} />
          </StandardField>
        </StandardForm>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px 0' }}>
        <CButton size="sm" color="primary" variant="outline" onClick={() => setEditing(true)}>
          <CIcon icon={cilPencil} size="sm" /> Editar
        </CButton>
      </div>
      <DetailPanel columns={3}>
        <DetailSection title="Liquidación">
          <DetailRow label="Fecha" value={data.date} />
          <DetailRow label="Valor" value={fmt(data.amount)} />
          <DetailRow label="Conductor" value={data.driver} />
          <DetailRow label="Placa" value={data.plate} mono />
          <DetailRow label="Comentario" value={data.comment} />
        </DetailSection>
        <DetailSection title="Conductor">
          {driver ? (
            <>
              <DetailRow label="Cédula" value={driver.idNumber} mono />
              <DetailRow label="Teléfono" value={driver.phone} />
              <DetailRow label="Liq. normal" value={driver.defaultAmount ? fmt(driver.defaultAmount) : null} />
              <DetailRow label="Liq. domingo" value={driver.defaultAmountSunday ? fmt(driver.defaultAmountSunday) : null} />
            </>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)' }}>Sin datos</span>
          )}
        </DetailSection>
        <DetailSection title="Vehículo">
          {vehicle ? (
            <>
              <DetailRow label="Placa" value={vehicle.plate} mono />
              <DetailRow label="Marca" value={vehicle.brand} />
              <DetailRow label="Modelo" value={vehicle.model} />
              <DetailRow label="Año" value={vehicle.year} />
            </>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)' }}>Sin datos</span>
          )}
        </DetailSection>
      </DetailPanel>
    </div>
  )
}

const Taxis = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { data: settlementsData, fetching: loadingSettlements, isError: settlementError } = useSelector((s) => s.taxiSettlement)
  const { data: driversData } = useSelector((s) => s.taxiDriver)
  const { data: vehiclesData } = useSelector((s) => s.taxiVehicle)
  const { data: expensesData } = useSelector((s) => s.taxiExpense)

  const now = new Date()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })
  const [driverFilter, setDriverFilter] = useState(new Set())
  const [plateFilter, setPlateFilter] = useState('')
  const [driverDropOpen, setDriverDropOpen] = useState(false)
  const [viewMode, setViewMode] = useState('detail')
  const [editingRow, setEditingRow] = useState(null)
  const [toast, setToast] = useState(null) // { type: 'success'|'error', msg: string }
  const savingRef = useRef(false)
  const dataGridRef = useRef(null)
  const editingRowIdRef = useRef(null)

  const toggleDriverFilter = (name) => setDriverFilter((prev) => {
    const next = new Set(prev)
    if (next.has(name)) next.delete(name)
    else next.add(name)
    return next
  })

  const records = settlementsData ?? []
  const drivers = driversData ?? []
  const vehicles = vehiclesData ?? []
  const loading = loadingSettlements && !settlementsData

  useEffect(() => {
    dispatch(taxiSettlementActions.fetchRequest())
    dispatch(taxiDriverActions.fetchRequest())
    dispatch(taxiVehicleActions.fetchRequest())
    dispatch(taxiExpenseActions.fetchRequest())
  }, [dispatch])

  useEffect(() => {
    if (!savingRef.current) return
    if (loadingSettlements) return
    const wasCreate = savingRef.current === 'create'
    savingRef.current = false
    if (settlementError) {
      setToast({ type: 'error', msg: 'Error al guardar los cambios' })
    } else {
      if (wasCreate) {
        setForm(EMPTY)
        setShowForm(false)
      } else {
        dataGridRef.current?.instance?.collapseRow(editingRowIdRef.current)
        editingRowIdRef.current = null
        setEditingRow(null)
      }
      dispatch(taxiSettlementActions.fetchRequest())
      setToast({ type: 'success', msg: 'Cambios guardados correctamente' })
    }
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [loadingSettlements, settlementError])

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleDriverChange = (e) => {
    const name = e.target.value
    const driver = drivers.find((d) => d.name === name)
    setForm((p) => ({
      ...p,
      driver: name,
      amount: driver?.defaultAmount ? String(driver.defaultAmount) : p.amount,
      plate: driver?.defaultVehicle || p.plate,
    }))
  }

  const picoPlacaWarning = (() => {
    if (!form.plate || !form.date) return null
    const [, monthStr, dayStr] = form.date.split('-')
    const month = parseInt(monthStr, 10)
    const day = parseInt(dayStr, 10)
    const vehicle = vehicles.find((v) => v.plate === form.plate)
    const restr = vehicle?.restrictions?.[month] ?? vehicle?.restrictions?.[String(month)]
    if (restr && [restr.d1, restr.d2].filter(Boolean).map(Number).includes(day)) {
      return `${form.plate} tiene pico y placa el día ${day}`
    }
    return null
  })()

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.driver || !form.plate || !form.amount || !form.date) {
      setError('Todos los campos son requeridos')
      return
    }
    if (picoPlacaWarning) return
    setError(null)
    savingRef.current = 'create'
    dispatch(taxiSettlementActions.createRequest(form))
  }

  const handleRowUpdating = (e) => {
    const merged = { ...e.oldData, ...e.newData }
    savingRef.current = 'update'
    e.cancel = true
    dispatch(taxiSettlementActions.updateRequest({ id: e.key, ...merged }))
  }

  const handleEditSave = (updated) => {
    savingRef.current = 'update'
    dispatch(taxiSettlementActions.updateRequest({ id: updated.id, ...updated }))
  }

  const handleDelete = (id) => {
    if (!window.confirm('¿Eliminar esta liquidación?')) return
    dispatch(taxiSettlementActions.deleteRequest({ id }))
  }

  const availableYears = [...new Set(records.map((r) => r.date?.slice(0, 4)).filter(Boolean))]
    .map(Number).sort((a, b) => b - a)
  if (!availableYears.includes(period.year)) availableYears.unshift(period.year)

  const filtered = records.filter((r) => {
    if (!r.date) return false
    const [y, m] = r.date.split('-').map(Number)
    if (y !== period.year || m !== period.month) return false
    if (driverFilter.size > 0 && !driverFilter.has(r.driver)) return false
    if (plateFilter && r.plate !== plateFilter) return false
    return true
  })

  const total = filtered.reduce((acc, r) => acc + (r.amount || 0), 0)

  const totalExpenses = (expensesData ?? [])
    .filter((r) => {
      if (!r.date) return false
      const [y, m] = r.date.split('-').map(Number)
      return y === period.year && m === period.month
    })
    .reduce((acc, r) => acc + (r.amount || 0), 0)

  const isCurrentPeriod = period.year === now.getFullYear() && period.month === (now.getMonth() + 1)
  const daysElapsed = isCurrentPeriod ? now.getDate() : null
  const daysInMonth = new Date(period.year, period.month, 0).getDate()
  const projection = daysElapsed && daysElapsed > 0 ? Math.round((total / daysElapsed) * daysInMonth) : null

  const calcRemaining = (driverName) => {
    if (!isCurrentPeriod) return null
    const driver = drivers.find((d) => d.name === driverName)
    if (!driver) return null
    const vehicle = vehicles.find((v) => v.plate === driver.defaultVehicle)
    const restr = vehicle?.restrictions?.[period.month] ?? vehicle?.restrictions?.[String(period.month)] ?? {}
    const restrictedDays = [restr.d1, restr.d2].filter(Boolean).map(Number)
    let remaining = 0
    for (let day = now.getDate() + 1; day <= daysInMonth; day++) {
      if (restrictedDays.includes(day)) continue
      const isSunday = new Date(period.year, period.month - 1, day).getDay() === 0
      remaining += isSunday ? (driver.defaultAmountSunday || 0) : (driver.defaultAmount || 0)
    }
    return remaining
  }

  const byDriver = Object.values(
    filtered.reduce((acc, r) => {
      const k = r.driver
      if (!acc[k]) acc[k] = { id: k, driver: k, count: 0, total: 0, rows: [] }
      acc[k].count += 1
      acc[k].total += r.amount || 0
      acc[k].rows.push(r)
      return acc
    }, {}),
  ).sort((a, b) => b.total - a.total).map((item) => ({
    ...item,
    remaining: calcRemaining(item.driver) ?? 0,
  }))

  const byVehicle = Object.values(
    filtered.reduce((acc, r) => {
      const k = r.plate || '—'
      if (!acc[k]) acc[k] = { id: k, plate: k, count: 0, total: 0, rows: [] }
      acc[k].count += 1
      acc[k].total += r.amount || 0
      acc[k].rows.push(r)
      return acc
    }, {}),
  ).sort((a, b) => b.total - a.total).map((item) => {
    const driver = drivers.find((d) => d.defaultVehicle === item.plate)
    return { ...item, remaining: driver ? (calcRemaining(driver.name) ?? 0) : 0 }
  })

  return (
    <>
      {/* Full-screen saving overlay */}
      {loadingSettlements && savingRef.current && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CSpinner color="light" style={{ width: 48, height: 48 }} />
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          zIndex: 10000, padding: '12px 28px', borderRadius: 8, fontSize: 14, fontWeight: 500,
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          background: toast.type === 'success' ? '#2f9e44' : '#e03131',
          color: '#fff',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Summary */}
      <CRow className="mb-3 d-none d-sm-flex">
        <CCol sm={2}>
          <CCard className="text-center">
            <CCardBody>
              <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 4 }}>Total liquidado</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#2f9e44' }}>{fmt(total)}</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={2}>
          <CCard className="text-center">
            <CCardBody>
              <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 4 }}>
                Proyección del mes
                {isCurrentPeriod && daysElapsed && (
                  <span style={{ marginLeft: 6, fontStyle: 'italic' }}>
                    (día {daysElapsed}/{daysInMonth})
                  </span>
                )}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: projection ? 'var(--cui-primary)' : 'var(--cui-secondary-color)' }}>
                {projection !== null ? fmt(projection) : '—'}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={2}>
          <CCard className="text-center">
            <CCardBody>
              <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 4 }}>Falta / Sobra</div>
              {projection !== null ? (() => {
                const diff = projection - total
                return (
                  <div style={{ fontSize: 22, fontWeight: 700, color: diff > 0 ? '#e03131' : '#2f9e44' }}>
                    {fmt(Math.abs(diff))}
                  </div>
                )
              })() : (
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--cui-secondary-color)' }}>—</div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={2}>
          <CCard className="text-center">
            <CCardBody>
              <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 4 }}>Total gastos</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#e67700' }}>{fmt(totalExpenses)}</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={4}>
          <CCard>
            <CCardBody style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 6 }}>Por conductor</div>
              {loading ? (
                <CSpinner size="sm" />
              ) : byDriver.length === 0 ? (
                <span style={{ fontSize: 13, color: 'var(--cui-secondary-color)' }}>Sin registros</span>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {byDriver.map((d) => (
                    <div key={d.driver} style={{ background: 'var(--cui-primary-bg-subtle, #e7f1ff)', borderRadius: 8, padding: '4px 12px', fontSize: 13 }}>
                      <strong>{d.driver}</strong>
                      <span style={{ color: 'var(--cui-secondary-color)', marginLeft: 8 }}>
                        {d.count} liq · {fmt(d.total)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Table */}
      <CCard>
        <CCardHeader className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <strong>Liquidaciones de taxis</strong>
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
            {(viewMode === 'detail' || viewMode === 'byDriver') && (
              <>
                <CDropdown
                  visible={driverDropOpen}
                  onHide={() => setDriverDropOpen(false)}
                >
                  <CDropdownToggle
                    size="sm"
                    color="secondary"
                    variant="outline"
                    style={{ fontSize: 12, minWidth: 130 }}
                    onClick={() => setDriverDropOpen((v) => !v)}
                  >
                    Conductor{driverFilter.size > 0 ? ` (${driverFilter.size})` : ''}
                  </CDropdownToggle>
                  <CDropdownMenu style={{ padding: '8px 12px', minWidth: 180 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', paddingBottom: 6, borderBottom: '1px solid var(--cui-border-color)', marginBottom: 6 }}>
                      <input
                        type="checkbox"
                        checked={driverFilter.size === 0}
                        onChange={() => setDriverFilter(new Set())}
                      />
                      Todos
                    </label>
                    {drivers.map((d) => (
                      <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', padding: '3px 0' }}>
                        <input
                          type="checkbox"
                          checked={driverFilter.has(d.name)}
                          onChange={() => toggleDriverFilter(d.name)}
                        />
                        {d.name}
                      </label>
                    ))}
                    <div style={{ paddingTop: 8, marginTop: 6, borderTop: '1px solid var(--cui-border-color)', textAlign: 'right' }}>
                      <button
                        onClick={() => setDriverDropOpen(false)}
                        style={{ fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 4, border: '1px solid #1e3a5f', background: '#1e3a5f', color: '#fff', cursor: 'pointer' }}
                      >
                        Aceptar
                      </button>
                    </div>
                  </CDropdownMenu>
                </CDropdown>
                <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)', whiteSpace: 'nowrap' }}>Vehículo</span>
                <CFormSelect
                  size="sm"
                  style={{ width: 110 }}
                  value={plateFilter}
                  onChange={(e) => setPlateFilter(e.target.value)}
                >
                  <option value="">Todos</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.plate}>{v.plate}</option>
                  ))}
                </CFormSelect>
              </>
            )}
          </div>
          <div className="d-flex align-items-center gap-1">
            <CButton
              size="sm"
              color="secondary"
              variant={viewMode === 'detail' ? undefined : 'outline'}
              onClick={() => setViewMode('detail')}
              style={{ fontSize: 12 }}
            >
              Detallado
            </CButton>
            <CButton
              size="sm"
              color="secondary"
              variant={viewMode === 'byDriver' ? undefined : 'outline'}
              onClick={() => setViewMode('byDriver')}
              style={{ fontSize: 12 }}
            >
              Por conductor
            </CButton>
            <CButton
              size="sm"
              color="secondary"
              variant={viewMode === 'byVehicle' ? undefined : 'outline'}
              onClick={() => setViewMode('byVehicle')}
              style={{ fontSize: 12 }}
            >
              Por vehículo
            </CButton>
          </div>
          <CButton
            size="sm"
            color="secondary"
            variant="outline"
            onClick={() => dispatch(taxiSettlementActions.fetchRequest())}
            title="Refrescar"
          >
            <CIcon icon={cilReload} size="sm" />
          </CButton>
          <CButton
            size="sm"
            color={showForm ? 'danger' : 'primary'}
            variant="outline"
            onClick={() => { setShowForm((p) => !p); setError(null) }}
          >
            <CIcon icon={showForm ? cilX : cilPlus} size="sm" />
            {' '}{showForm ? 'Cancelar' : 'Nueva liquidación'}
          </CButton>
        </CCardHeader>

        <CCollapse visible={showForm}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--cui-border-color)' }}>
            <CForm onSubmit={handleAdd}>
              <CRow className="g-2 align-items-end">
                <CCol sm={3}>
                  <CFormLabel style={{ fontSize: 12 }}>Conductor</CFormLabel>
                  <CFormSelect size="sm" value={form.driver} onChange={handleDriverChange}>
                    <option value="">— Seleccionar —</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol sm={2}>
                  <CFormLabel style={{ fontSize: 12 }}>Placa</CFormLabel>
                  <CFormSelect size="sm" value={form.plate} onChange={set('plate')}>
                    <option value="">— Seleccionar —</option>
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
                  <CFormInput
                    size="sm"
                    type="date"
                    value={form.date}
                    onChange={set('date')}
                    invalid={!!picoPlacaWarning}
                  />
                  {picoPlacaWarning && (
                    <div style={{ fontSize: 11, color: '#e03131', marginTop: 3 }}>
                      ⚠ {picoPlacaWarning}
                    </div>
                  )}
                </CCol>
                <CCol sm={2}>
                  <CFormLabel style={{ fontSize: 12 }}>Comentario</CFormLabel>
                  <CFormInput size="sm" placeholder="Observaciones..." value={form.comment} onChange={set('comment')} />
                </CCol>
                <CCol sm={2}>
                  <CButton type="submit" size="sm" color="primary" disabled={loadingSettlements || !!picoPlacaWarning} style={{ width: '100%' }}>
                    {loadingSettlements ? <CSpinner size="sm" /> : 'Guardar'}
                  </CButton>
                </CCol>
              </CRow>
              {error && <div style={{ marginTop: 8, fontSize: 12, color: '#e03131' }}>{error}</div>}
            </CForm>
          </div>
        </CCollapse>

        <CCardBody style={{ padding: 0 }}>
          {loading ? (
            <div className="d-flex justify-content-center py-5"><CSpinner color="primary" /></div>
          ) : viewMode === 'detail' ? (
            <StandardGrid
              ref={dataGridRef}
              id="paymentsGrid"
              keyExpr="id"
              dataSource={filtered}
              noDataText="Sin liquidaciones para este periodo."
              summary={{
                totalItems: [{ column: 'amount', summaryType: 'sum', customizeText: (e) => fmt(e.value) }],
              }}
              onRowUpdating={handleRowUpdating}
              onRowPrepared={(e) => {
                if (e.rowType !== 'data') return
                const [y, m, d] = (e.data.date ?? '').split('-').map(Number)
                if (!y) return
                if (new Date(y, m - 1, d).getDay() === 0) {
                  e.rowElement.classList.add('dx-row-sunday')
                }
              }}
            >
              <Column
                dataField="date"
                caption={t('taxis.settlements.fields.date')}
                width={110}
                hidingPriority={5}
                sortOrder="asc"
                defaultSortIndex={0}
                cellRender={({ value }) => (
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtDate(value)}</span>
                )}
              />
              <Column dataField="driver" caption={t('taxis.settlements.fields.driver')} minWidth={150} hidingPriority={3} />
              <Column
                dataField="plate"
                caption={t('taxis.settlements.fields.plate')}
                width={110}
                hidingPriority={2}
                cellRender={({ value }) => (
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{value}</span>
                )}
              />
              <Column
                dataField="amount"
                caption={t('taxis.settlements.fields.value')}
                hidingPriority={4}
                cellRender={({ value }) => (
                  <span style={{ fontWeight: 600 }}>{fmt(value)}</span>
                )}
              />
              <Column dataField="comment" caption={t('taxis.settlements.fields.comment')} minWidth={120} hidingPriority={1} />
              <Column
                caption=""
                width={80}
                allowSorting={false}
                allowResizing={false}
                hidingPriority={6}
                cellRender={({ data }) => (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        editingRowIdRef.current = data.id
                        dataGridRef.current?.instance?.collapseRow(data.id)
                        setTimeout(() => dataGridRef.current?.instance?.expandRow(data.id), 0)
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--cui-primary)', cursor: 'pointer', padding: '2px 6px' }}
                      title="Editar"
                    >
                      <CIcon icon={cilPencil} size="sm" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(data.id) }}
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
                  <SettlementMasterDetail
                    data={data}
                    drivers={drivers}
                    vehicles={vehicles}
                    saving={loadingSettlements}
                    onSave={handleEditSave}
                    editingRowIdRef={editingRowIdRef}
                  />
                )}
              />
            </StandardGrid>
          ) : viewMode === 'byDriver' ? (
            <StandardGrid
              keyExpr="id"
              dataSource={byDriver}
              noDataText="Sin liquidaciones para este periodo."
              summary={{
                totalItems: [
                  { column: 'total', summaryType: 'sum', customizeText: (e) => fmt(e.value) },
                  ...(isCurrentPeriod ? [{ column: 'remaining', summaryType: 'sum', customizeText: (e) => fmt(e.value) }] : []),
                ],
              }}
            >
              <Column dataField="driver" caption={t('taxis.settlements.fields.driver')} minWidth={180} />
              <Column
                dataField="count"
                caption={t('taxis.settlements.columns.countSettlements')}
                width={140}
                cellRender={({ value }) => (
                  <span style={{ fontWeight: 600 }}>{value}</span>
                )}
              />
              <Column
                dataField="total"
                caption={t('taxis.settlements.columns.totalDeposited')}
                width={170}
                cellRender={({ value }) => (
                  <span style={{ fontWeight: 700, color: '#1e40af' }}>{fmt(value)}</span>
                )}
              />
              <Column
                dataField="remaining"
                caption={t('taxis.settlements.columns.remaining')}
                width={170}
                visible={isCurrentPeriod}
                cellRender={({ data }) => (
                  <span style={{ fontWeight: 700, color: data.remaining > 0 ? '#e67700' : '#2f9e44' }}>{fmt(data.remaining)}</span>
                )}
              />
              <MasterDetail
                enabled={true}
                render={({ data }) => (
                  <div style={{ margin: '8px 8px 12px 32px' }}>
                    <StandardGrid
                      dataSource={data.rows}
                      keyExpr="id"
                      style={{ margin: 0 }}
                      noDataText="Sin registros."
                    >
                      <Column dataField="date" caption={t('taxis.settlements.fields.date')} width={110} sortOrder="asc" defaultSortIndex={0} />
                      <Column
                        dataField="plate"
                        caption={t('taxis.settlements.fields.plate')}
                        width={100}
                        cellRender={({ value }) => (
                          <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{value}</span>
                        )}
                      />
                      <Column
                        dataField="amount"
                        caption={t('taxis.settlements.fields.value')}
                        width={130}
                        cellRender={({ value }) => (
                          <span style={{ fontWeight: 600 }}>{fmt(value)}</span>
                        )}
                      />
                      <Column dataField="comment" caption={t('taxis.settlements.fields.comment')} minWidth={120} />
                    </StandardGrid>
                  </div>
                )}
              />
            </StandardGrid>
          ) : (
            <StandardGrid
              keyExpr="id"
              dataSource={byVehicle}
              noDataText="Sin liquidaciones para este periodo."
              summary={{
                totalItems: [
                  { column: 'total', summaryType: 'sum', customizeText: (e) => fmt(e.value) },
                  ...(isCurrentPeriod ? [{ column: 'remaining', summaryType: 'sum', customizeText: (e) => fmt(e.value) }] : []),
                ],
              }}
            >
              <Column
                dataField="plate"
                caption={t('taxis.settlements.fields.plate')}
                minWidth={130}
                cellRender={({ value }) => (
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{value}</span>
                )}
              />
              <Column
                dataField="count"
                caption={t('taxis.settlements.columns.countSettlements')}
                width={140}
                cellRender={({ value }) => (
                  <span style={{ fontWeight: 600 }}>{value}</span>
                )}
              />
              <Column
                dataField="total"
                caption={t('taxis.settlements.columns.totalDeposited')}
                width={170}
                cellRender={({ value }) => (
                  <span style={{ fontWeight: 700, color: '#1e40af' }}>{fmt(value)}</span>
                )}
              />
              <Column
                dataField="remaining"
                caption={t('taxis.settlements.columns.remaining')}
                width={170}
                visible={isCurrentPeriod}
                cellRender={({ data }) => (
                  <span style={{ fontWeight: 700, color: data.remaining > 0 ? '#e67700' : '#2f9e44' }}>
                    {fmt(data.remaining)}
                  </span>
                )}
              />
              <MasterDetail
                enabled={true}
                render={({ data }) => (
                  <div style={{ margin: '8px 8px 12px 32px' }}>
                    <StandardGrid
                      dataSource={data.rows}
                      keyExpr="id"
                      style={{ margin: 0 }}
                      noDataText="Sin registros."
                    >
                      <Column dataField="date" caption={t('taxis.settlements.fields.date')} width={110} sortOrder="asc" defaultSortIndex={0} />
                      <Column dataField="driver" caption={t('taxis.settlements.fields.driver')} minWidth={150} />
                      <Column
                        dataField="amount"
                        caption={t('taxis.settlements.fields.value')}
                        width={130}
                        cellRender={({ value }) => (
                          <span style={{ fontWeight: 600 }}>{fmt(value)}</span>
                        )}
                      />
                      <Column dataField="comment" caption={t('taxis.settlements.fields.comment')} minWidth={120} />
                    </StandardGrid>
                  </div>
                )}
              />
            </StandardGrid>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default Taxis
