import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { Column, MasterDetail } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CSpinner,
  CBadge,
  CButton,
  CCollapse,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CFormCheck,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilX, cilTrash, cilBell } from '@coreui/icons'
import * as taxiVehicleActions from 'src/actions/taxi/taxiVehicleActions'
import * as taxiDriverActions from 'src/actions/taxi/taxiDriverActions'
import StandardForm, { StandardField, SF } from 'src/components/shared/StandardForm'
import DetailPanel, { DetailSection, DetailRow } from 'src/components/shared/DetailPanel'
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

const EMPTY = { plate: '', brand: '', model: '', year: '', active: true }

const emptyRestrictions = () =>
  Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i + 1, { d1: '', d2: '' }]))

const currentMonthSummary = (restrictions) => {
  if (!restrictions) return '—'
  const month = new Date().getMonth() + 1
  const entry = restrictions[month]
  if (!entry || (!entry.d1 && !entry.d2)) return '—'
  return [entry.d1, entry.d2]
    .filter(Boolean)
    .map((d) => `día ${d}`)
    .join(', ')
}

const VehicleForm = ({ initial, onSave, onCancel, saving, title, subtitle }) => {
  const { t } = useTranslation()
  const [form, setForm] = useState(initial)
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))
  const setCheck = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.checked }))

  return (
    <StandardForm
      title={title}
      subtitle={subtitle}
      onCancel={onCancel}
      onSave={() => onSave(form)}
      saving={saving}
    >
      <StandardField label={t('taxis.vehicles.fields.plate')}>
        <input
          className={SF.input}
          placeholder="ABC-123"
          value={form.plate}
          onChange={set('plate')}
        />
      </StandardField>
      <StandardField label={t('taxis.vehicles.fields.brand')}>
        <input
          className={SF.input}
          placeholder="Renault"
          value={form.brand}
          onChange={set('brand')}
        />
      </StandardField>
      <StandardField label={t('taxis.vehicles.fields.model')}>
        <input
          className={SF.input}
          placeholder="Logan"
          value={form.model}
          onChange={set('model')}
        />
      </StandardField>
      <StandardField label={t('taxis.vehicles.fields.year')}>
        <input
          className={SF.input}
          type="number"
          placeholder="2020"
          value={form.year}
          onChange={set('year')}
        />
      </StandardField>
      <StandardField label={t('taxis.vehicles.fields.status')}>
        <CFormCheck
          id={`active-${form.id || 'new'}`}
          checked={form.active !== false}
          onChange={setCheck('active')}
          label={
            form.active !== false
              ? t('taxis.vehicles.fields.active')
              : t('taxis.vehicles.fields.inactive')
          }
        />
      </StandardField>
    </StandardForm>
  )
}

const Vehiculos = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { data: records, fetching } = useSelector((s) => s.taxiVehicle)
  const { data: drivers } = useSelector((s) => s.taxiDriver)
  const gridRef = useRef()

  const [showCreate, setShowCreate] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [restrictModal, setRestrictModal] = useState(null)
  const [testingNotif, setTestingNotif] = useState(false)
  const [restrictForm, setRestrictForm] = useState(emptyRestrictions())
  const [restrictSaving, setRestrictSaving] = useState(false)

  useEffect(() => {
    dispatch(taxiVehicleActions.fetchRequest())
    dispatch(taxiDriverActions.fetchRequest())
  }, [dispatch])

  const handleCreate = (form) => {
    if (!form.plate || !form.brand) return
    dispatch(taxiVehicleActions.createRequest(form))
    setShowCreate(false)
  }

  useEffect(() => {
    if (editingRow) {
      gridRef.current?.instance()?.expandRow(editingRow.id)
    }
  }, [editingRow])

  const handleEdit = (row) => {
    setEditingRow(row)
  }

  const handleEditSave = (form) => {
    dispatch(taxiVehicleActions.updateRequest({ id: editingRow.id, ...form }))
    gridRef.current?.instance()?.collapseRow(editingRow.id)
    setEditingRow(null)
  }

  const handleEditCancel = () => {
    gridRef.current?.instance()?.collapseRow(editingRow.id)
    setEditingRow(null)
  }

  const handleDelete = (id) => {
    if (!window.confirm('¿Eliminar este vehículo?')) return
    dispatch(taxiVehicleActions.deleteRequest({ id }))
  }

  const openRestrictModal = (data) => {
    const base = emptyRestrictions()
    if (data.restrictions) {
      Object.entries(data.restrictions).forEach(([m, v]) => {
        base[m] = { d1: v?.d1 ?? '', d2: v?.d2 ?? '' }
      })
    }
    setRestrictForm(base)
    setRestrictModal({ id: data.id, plate: data.plate })
  }

  const setRestrictDay = (month, field) => (e) =>
    setRestrictForm((prev) => ({ ...prev, [month]: { ...prev[month], [field]: e.target.value } }))

  const handleSaveRestrictions = () => {
    setRestrictSaving(true)
    const clean = Object.fromEntries(
      Object.entries(restrictForm).map(([m, v]) => [
        m,
        { d1: v.d1 ? Number(v.d1) : null, d2: v.d2 ? Number(v.d2) : null },
      ]),
    )
    dispatch(
      taxiVehicleActions.updateRestrictionsRequest({ id: restrictModal.id, restrictions: clean }),
    )
    setRestrictSaving(false)
    setRestrictModal(null)
  }

  const testPicoYPlacaNotification = useCallback(async () => {
    setTestingNotif(true)
    try {
      const now = new Date()
      const month = now.getMonth() + 1
      const day = now.getDate()
      const vehicles = records ?? []
      const restricted = vehicles.filter((v) => {
        const monthData = v.restrictions?.[String(month)]
        if (!monthData) return false
        const d1 = Number(monthData.d1) || 0
        const d2 = Number(monthData.d2) || 0
        return (d1 !== 0 && d1 === day) || (d2 !== 0 && d2 === day)
      })
      const title = restricted.length ? 'Pico y Placa hoy' : 'Sin pico y placa hoy'
      const body = restricted.length
        ? `Placas restringidas: ${restricted.map((v) => v.plate).join(', ')}`
        : 'Ningún vehículo tiene restricción hoy.'

      if ('serviceWorker' in navigator) {
        const swReg = await navigator.serviceWorker.ready
        await swReg.showNotification(title, { body, icon: '/icons/icon.svg' })
      } else {
        new Notification(title, { body, icon: '/icons/icon.svg' })
      }
    } finally {
      setTestingNotif(false)
    }
  }, [records])

  const rows = records ?? []
  const driversByPlateMap = useMemo(() => {
    const map = {}
    ;(drivers ?? []).forEach((d) => {
      if (!d.defaultVehicle) return
      if (!map[d.defaultVehicle]) map[d.defaultVehicle] = []
      map[d.defaultVehicle].push(d.name)
    })
    return map
  }, [drivers])
  const driversByPlate = (plate) => driversByPlateMap[plate] ?? []

  return (
    <>
      <CCard>
        <CCardHeader className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <strong>Vehículos</strong>
            <CBadge color="secondary">{rows.length}</CBadge>
          </div>
          <div className="d-flex gap-2">
            <CButton
              size="sm"
              color="warning"
              variant="outline"
              onClick={testPicoYPlacaNotification}
              disabled={testingNotif}
              title="Simular notificación de pico y placa"
            >
              <CIcon icon={cilBell} size="sm" />{' '}
              {testingNotif ? 'Enviando...' : 'Probar pico y placa'}
            </CButton>
            <CButton
              size="sm"
              color={showCreate ? 'danger' : 'primary'}
              variant="outline"
              onClick={() => setShowCreate((p) => !p)}
            >
              <CIcon icon={showCreate ? cilX : cilPlus} size="sm" />{' '}
              {showCreate ? 'Cancelar' : 'Nuevo vehículo'}
            </CButton>
          </div>
        </CCardHeader>

        <CCollapse visible={showCreate}>
          <div className="master-form-panel">
            <VehicleForm
              initial={EMPTY}
              title="Nuevo vehículo"
              onSave={handleCreate}
              onCancel={() => setShowCreate(false)}
              saving={fetching}
            />
          </div>
        </CCollapse>

        <CCardBody>
          {fetching && !records ? (
            <div className="d-flex justify-content-center py-5">
              <CSpinner color="primary" />
            </div>
          ) : (
            <StandardGrid ref={gridRef} keyExpr="id" dataSource={rows}>
              <Column dataField="plate" caption={t('taxis.vehicles.fields.plate')} />
              <Column
                dataField="active"
                caption={t('taxis.vehicles.fields.active')}
                dataType="boolean"
                width={80}
                cellRender={({ data }) => (
                  <CBadge color={data.active !== false ? 'success' : 'danger'}>
                    {data.active !== false ? 'Sí' : 'No'}
                  </CBadge>
                )}
              />
              <Column dataField="brand" caption={t('taxis.vehicles.fields.brand')} />
              <Column dataField="model" caption={t('taxis.vehicles.fields.model')} />
              <Column
                dataField="year"
                caption={t('taxis.vehicles.fields.year')}
                dataType="number"
                width={80}
              />
              <Column
                caption={t('taxis.vehicles.fields.drivers')}
                allowEditing={false}
                hidingPriority={2}
                cellRender={({ data }) => {
                  const names = driversByPlate(data.plate)
                  if (names.length === 0) return <span className="text-body-tertiary">—</span>
                  return names.map((n, i) => (
                    <CBadge key={i} color="info" className="driver-badge">
                      {n}
                    </CBadge>
                  ))
                }}
              />
              <Column
                caption={t('taxis.vehicles.fields.ppThisMonth')}
                allowEditing={false}
                hidingPriority={1}
                cellRender={({ data }) => currentMonthSummary(data.restrictions)}
              />
              <Column
                caption=""
                width={90}
                allowSorting={false}
                allowResizing={false}
                cellRender={({ data }) => (
                  <div className="master-actions">
                    <button className="master-btn master-btn--warning" onClick={() => openRestrictModal(data)} title="Pico y placa">📅</button>
                    <button className="master-btn master-btn--primary" onClick={() => handleEdit(data)} title="Editar">✎</button>
                    <button className="master-btn master-btn--danger" onClick={() => handleDelete(data.id)} title="Eliminar"><CIcon icon={cilTrash} size="sm" /></button>
                  </div>
                )}
              />
              <MasterDetail
                enabled={true}
                render={({ data }) =>
                  editingRow?.id === data.id ? (
                    <div className="master-edit-panel">
                      <VehicleForm
                        initial={data}
                        title="Editar vehículo"
                        subtitle={data.plate}
                        onSave={handleEditSave}
                        onCancel={handleEditCancel}
                        saving={fetching}
                      />
                    </div>
                  ) : (
                    <DetailPanel columns={2}>
                      <DetailSection title={t('taxis.drivers.fields.personalData')}>
                        <DetailRow label={t('taxis.vehicles.fields.plate')} value={data.plate} mono />
                        <DetailRow
                          label={t('taxis.vehicles.fields.status')}
                          value={
                            data.active !== false
                              ? t('taxis.vehicles.fields.active')
                              : t('taxis.vehicles.fields.inactive')
                          }
                        />
                        <DetailRow label={t('taxis.vehicles.fields.brand')} value={data.brand} />
                        <DetailRow label={t('taxis.vehicles.fields.model')} value={data.model} />
                        <DetailRow label={t('taxis.vehicles.fields.year')} value={data.year} />
                      </DetailSection>
                      <DetailSection title={t('taxis.vehicles.fields.drivers')}>
                        {(() => {
                          const names = driversByPlate(data.plate)
                          return names.length > 0 ? (
                            names.map((name) => (
                              <DetailRow
                                key={name}
                                label={t('taxis.settlements.fields.driver')}
                                value={name}
                              />
                            ))
                          ) : (
                            <span className="master-empty">
                              {t('taxis.settlements.noRecords')}
                            </span>
                          )
                        })()}
                      </DetailSection>
                    </DetailPanel>
                  )
                }
              />
            </StandardGrid>
          )}
        </CCardBody>
      </CCard>

      <CModal visible={!!restrictModal} onClose={() => setRestrictModal(null)} size="lg">
        <CModalHeader>
          <CModalTitle>Pico y placa — {restrictModal?.plate}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CTable small bordered style={{ marginBottom: 0 }}>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell style={{ width: 140 }}>Mes</CTableHeaderCell>
                <CTableHeaderCell>Día 1</CTableHeaderCell>
                <CTableHeaderCell>Día 2</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {MONTHS.map((name, i) => {
                const m = i + 1
                return (
                  <CTableRow key={m}>
                    <CTableDataCell className="fw-medium">{name}</CTableDataCell>
                    <CTableDataCell>
                      <CFormInput
                        size="sm"
                        type="number"
                        min={1}
                        max={31}
                        placeholder="—"
                        value={restrictForm[m]?.d1 ?? ''}
                        onChange={setRestrictDay(m, 'd1')}
                        style={{ width: 80 }}
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <CFormInput
                        size="sm"
                        type="number"
                        min={1}
                        max={31}
                        placeholder="—"
                        value={restrictForm[m]?.d2 ?? ''}
                        onChange={setRestrictDay(m, 'd2')}
                        style={{ width: 80 }}
                      />
                    </CTableDataCell>
                  </CTableRow>
                )
              })}
            </CTableBody>
          </CTable>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="outline"
            size="sm"
            onClick={() => setRestrictModal(null)}
          >
            Cancelar
          </CButton>
          <CButton
            color="primary"
            size="sm"
            disabled={restrictSaving}
            onClick={handleSaveRestrictions}
          >
            {restrictSaving ? <CSpinner size="sm" /> : 'Guardar'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Vehiculos
