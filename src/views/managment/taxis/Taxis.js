import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { DataGrid, Column, Editing, MasterDetail, Lookup } from 'devextreme-react/data-grid'
import {
  CCard, CCardBody, CCardHeader, CSpinner, CBadge,
  CButton, CForm, CFormInput, CFormLabel, CFormSelect, CRow, CCol, CCollapse,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPlus, cilX } from '@coreui/icons'
import * as taxiSettlementActions from 'src/actions/taxiSettlementActions'
import * as taxiDriverActions from 'src/actions/taxiDriverActions'
import * as taxiVehicleActions from 'src/actions/taxiVehicleActions'
import '../../../views/movements/payments/Payments.scss'
import './Taxis.scss'

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const today = () => new Date().toISOString().split('T')[0]

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const EMPTY = { driver: '', plate: '', amount: '', date: today(), comment: '' }

const DetailField = ({ label, value, mono }) =>
  value != null && value !== '' ? (
    <div style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: '1px solid var(--cui-border-color, #e8e8e8)' }}>
      <span style={{ minWidth: 140, fontSize: 12, color: 'var(--cui-secondary-color)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12, fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</span>
    </div>
  ) : null

const SettlementDetail = ({ data, drivers, vehicles }) => {
  const driver = drivers.find((d) => d.name === data.driver)
  const vehicle = vehicles.find((v) => v.plate === data.plate)

  return (
    <div style={{
      margin: '0 8px 12px 32px',
      background: 'var(--cui-card-bg, #fff)',
      border: '1px solid var(--cui-border-color, #dee2e6)',
      borderRadius: 10,
      padding: '16px 20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 32px' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--cui-secondary-color)', margin: '0 0 6px' }}>Liquidación</p>
          <DetailField label="Fecha" value={data.date} />
          <DetailField label="Valor" value={fmt(data.amount)} />
          <DetailField label="Conductor" value={data.driver} />
          <DetailField label="Placa" value={data.plate} mono />
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--cui-secondary-color)', margin: '0 0 6px' }}>Conductor</p>
          {driver ? (
            <>
              <DetailField label="Cédula" value={driver.idNumber} mono />
              <DetailField label="Teléfono" value={driver.phone} />
              <DetailField label="Liq. normal" value={driver.defaultAmount ? fmt(driver.defaultAmount) : null} />
              <DetailField label="Liq. domingo" value={driver.defaultAmountSunday ? fmt(driver.defaultAmountSunday) : null} />
            </>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)' }}>Sin datos</span>
          )}
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--cui-secondary-color)', margin: '0 0 6px' }}>Vehículo</p>
          {vehicle ? (
            <>
              <DetailField label="Placa" value={vehicle.plate} mono />
              <DetailField label="Marca" value={vehicle.brand} />
              <DetailField label="Modelo" value={vehicle.model} />
              <DetailField label="Año" value={vehicle.year} />
            </>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)' }}>Sin datos</span>
          )}
        </div>
      </div>
    </div>
  )
}

const Taxis = () => {
  const dispatch = useDispatch()
  const { data: settlementsData, fetching: loadingSettlements } = useSelector((s) => s.taxiSettlement)
  const { data: driversData } = useSelector((s) => s.taxiDriver)
  const { data: vehiclesData } = useSelector((s) => s.taxiVehicle)

  const now = new Date()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })
  const [driverFilter, setDriverFilter] = useState('')

  const records = settlementsData ?? []
  const drivers = driversData ?? []
  const vehicles = vehiclesData ?? []
  const loading = loadingSettlements && !settlementsData

  useEffect(() => {
    dispatch(taxiSettlementActions.fetchRequest())
    dispatch(taxiDriverActions.fetchRequest())
    dispatch(taxiVehicleActions.fetchRequest())
  }, [dispatch])

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
    dispatch(taxiSettlementActions.createRequest(form))
    setForm(EMPTY)
    setShowForm(false)
  }

  const handleRowUpdating = (e) => {
    const merged = { ...e.oldData, ...e.newData }
    e.cancel = new Promise((resolve) => {
      dispatch(taxiSettlementActions.updateRequest({ id: e.key, ...merged }))
      resolve(false)
    })
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
    if (driverFilter && r.driver !== driverFilter) return false
    return true
  })

  const total = filtered.reduce((acc, r) => acc + (r.amount || 0), 0)

  const isCurrentPeriod = period.year === now.getFullYear() && period.month === (now.getMonth() + 1)
  const daysElapsed = isCurrentPeriod ? now.getDate() : null
  const daysInMonth = new Date(period.year, period.month, 0).getDate()
  const projection = daysElapsed && daysElapsed > 0 ? Math.round((total / daysElapsed) * daysInMonth) : null

  const byDriver = Object.values(
    filtered.reduce((acc, r) => {
      const k = r.driver
      if (!acc[k]) acc[k] = { driver: k, count: 0, total: 0 }
      acc[k].count += 1
      acc[k].total += r.amount || 0
      return acc
    }, {}),
  ).sort((a, b) => b.total - a.total)

  return (
    <>
      {/* Summary */}
      <CRow className="mb-3">
        <CCol sm={2}>
          <CCard className="text-center">
            <CCardBody>
              <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 4 }}>Total liquidado</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{fmt(total)}</div>
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
                    {diff > 0 ? '-' : '+'}{fmt(Math.abs(diff))}
                  </div>
                )
              })() : (
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--cui-secondary-color)' }}>—</div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6}>
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
            <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)', whiteSpace: 'nowrap' }}>Conductor</span>
            <CFormSelect
              size="sm"
              style={{ width: 150 }}
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
            >
              <option value="">Todos</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </CFormSelect>
          </div>
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
          ) : (
            <DataGrid
              id="paymentsGrid"
              style={{ margin: 16 }}
              keyExpr="id"
              dataSource={filtered}
              showBorders={true}
              columnAutoWidth={true}
              columnHidingEnabled={true}
              allowColumnResizing={true}
              rowAlternationEnabled={true}
              hoverStateEnabled={true}
              noDataText="Sin liquidaciones para este periodo."
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
              <Editing allowUpdating={true} mode="row" />
              <Column dataField="date" caption="Fecha" width={110} hidingPriority={1} sortOrder="asc" defaultSortIndex={0} />
              <Column dataField="driver" caption="Conductor" minWidth={150} hidingPriority={4} />
              <Column
                dataField="plate"
                caption="Placa"
                width={110}
                hidingPriority={2}
                cellRender={({ value }) => (
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{value}</span>
                )}
              />
              <Column
                dataField="amount"
                caption="Valor"
                hidingPriority={3}
                cellRender={({ value }) => (
                  <span style={{ fontWeight: 600 }}>{fmt(value)}</span>
                )}
              />
              <Column dataField="comment" caption="Comentario" minWidth={120} hidingPriority={5} />
              <Column
                caption=""
                width={50}
                allowSorting={false}
                allowResizing={false}
                hidingPriority={6}
                cellRender={({ data }) => (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(data.id) }}
                    style={{ background: 'none', border: 'none', color: '#e03131', cursor: 'pointer', padding: '2px 6px' }}
                    title="Eliminar"
                  >
                    <CIcon icon={cilTrash} size="sm" />
                  </button>
                )}
              />
              <MasterDetail
                enabled={true}
                render={({ data }) => (
                  <SettlementDetail data={data} drivers={drivers} vehicles={vehicles} />
                )}
              />
            </DataGrid>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default Taxis
