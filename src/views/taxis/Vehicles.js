import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { Column, MasterDetail, Paging } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CBadge,
  CButton,
  CCollapse,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormCheck,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilX, cilTrash, cilBell, cilPencil } from '@coreui/icons'
import * as taxiVehicleActions from 'src/actions/taxi/taxiVehicleActions'
import * as taxiDriverActions from 'src/actions/taxi/taxiDriverActions'
import StandardForm, { StandardField, SF } from 'src/components/shared/StandardForm'
import DetailPanel, { DetailSection, DetailRow } from 'src/components/shared/DetailPanel'
import useIsMobile from 'src/hooks/useIsMobile'
import './masters.scss'
import Spinner from 'src/components/shared/Spinner'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
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

const fieldError = (err) =>
  err ? (
    <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 2, display: 'block' }}>
      {err.message}
    </span>
  ) : null

const VehicleForm = ({ initial, onSave, onCancel, saving, title, subtitle }) => {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: initial })

  const active = watch('active') ?? true

  return (
    <StandardForm
      title={title}
      subtitle={subtitle}
      onCancel={onCancel}
      onSave={handleSubmit(onSave)}
      saving={saving}
    >
      <StandardField label={t('taxis.vehicles.fields.plate')}>
        <input
          className={SF.input}
          placeholder="ABC-123"
          {...register('plate', { required: 'La placa es obligatoria' })}
        />
        {fieldError(errors.plate)}
      </StandardField>
      <StandardField label={t('taxis.vehicles.fields.brand')}>
        <input
          className={SF.input}
          placeholder="Renault"
          {...register('brand', { required: 'La marca es obligatoria' })}
        />
        {fieldError(errors.brand)}
      </StandardField>
      <StandardField label={t('taxis.vehicles.fields.model')}>
        <input className={SF.input} placeholder="Logan" {...register('model')} />
      </StandardField>
      <StandardField label={t('taxis.vehicles.fields.year')}>
        <input className={SF.input} type="number" placeholder="2020" {...register('year')} />
      </StandardField>
      <StandardField label={t('taxis.vehicles.fields.status')}>
        <CFormCheck
          id={`active-${initial?.id || 'new'}`}
          checked={active !== false}
          onChange={(e) => setValue('active', e.target.checked)}
          label={
            active !== false
              ? t('taxis.vehicles.fields.active')
              : t('taxis.vehicles.fields.inactive')
          }
        />
      </StandardField>
    </StandardForm>
  )
}

const VehicleCardList = ({ records, driversByPlateMap, onEdit, onDelete, onToggleActive, onOpenRestrictions }) => {
  if (records.length === 0) {
    return (
      <div
        style={{
          padding: '32px 0',
          textAlign: 'center',
          color: 'var(--cui-secondary-color)',
          fontSize: 13,
        }}
      >
        Sin vehículos registrados.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 0' }}>
      {records.map((vehicle) => {
        const active = vehicle.active !== false
        const drivers = driversByPlateMap[vehicle.plate] ?? []
        const ppSummary = currentMonthSummary(vehicle.restrictions)

        return (
          <div
            key={vehicle.id}
            style={{
              border: '1px solid var(--cui-border-color)',
              borderRadius: 10,
              padding: '12px 14px',
              background: 'var(--cui-body-bg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              opacity: active ? 1 : 0.65,
            }}
          >
            {/* plate + status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>
                {vehicle.plate}
              </span>
              <CBadge color={active ? 'success' : 'danger'} style={{ fontSize: 10 }}>
                {active ? 'Activo' : 'Inactivo'}
              </CBadge>
            </div>

            {/* brand / model / year */}
            {(vehicle.brand || vehicle.model || vehicle.year) && (
              <div style={{ fontSize: 13, color: 'var(--cui-secondary-color)' }}>
                {[vehicle.brand, vehicle.model, vehicle.year].filter(Boolean).join(' · ')}
              </div>
            )}

            {/* drivers */}
            {drivers.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {drivers.map((name) => (
                  <CBadge key={name} color="info" style={{ fontWeight: 400 }}>
                    {name}
                  </CBadge>
                ))}
              </div>
            )}

            {/* pico y placa this month */}
            {ppSummary !== '—' && (
              <div style={{ fontSize: 11, color: '#e67700', fontWeight: 600 }}>
                📅 P&P este mes: {ppSummary}
              </div>
            )}

            {/* actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <button
                onClick={() => onToggleActive(vehicle)}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: 4,
                  padding: '4px 10px',
                  border: 'none',
                  cursor: 'pointer',
                  background: active ? '#d1fae5' : '#fee2e2',
                  color: active ? '#065f46' : '#991b1b',
                }}
              >
                {active ? '✓ Activo' : '✗ Inactivo'}
              </button>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={() => onOpenRestrictions(vehicle)}
                  style={{ background: 'none', border: 'none', color: '#e67700', cursor: 'pointer', padding: '4px 8px', fontSize: 15 }}
                  title="Pico y placa"
                >
                  📅
                </button>
                <button
                  onClick={() => onEdit(vehicle)}
                  style={{ background: 'none', border: 'none', color: 'var(--cui-primary)', cursor: 'pointer', padding: '4px 8px' }}
                  title="Editar"
                >
                  <CIcon icon={cilPencil} size="sm" />
                </button>
                <button
                  onClick={() => onDelete(vehicle.id)}
                  style={{ background: 'none', border: 'none', color: '#e03131', cursor: 'pointer', padding: '4px 8px' }}
                  title="Eliminar"
                >
                  <CIcon icon={cilTrash} size="sm" />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const Vehiculos = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const isMobile = useIsMobile()
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
    dispatch(taxiVehicleActions.createRequest(form))
    setShowCreate(false)
  }

  useEffect(() => {
    if (editingRow && !isMobile) {
      gridRef.current?.instance()?.expandRow(editingRow.id)
    }
  }, [editingRow, isMobile])

  const handleEdit = (row) => setEditingRow(row)

  const handleEditSave = (form) => {
    dispatch(taxiVehicleActions.updateRequest({ id: editingRow.id, ...form }))
    if (!isMobile) gridRef.current?.instance()?.collapseRow(editingRow.id)
    setEditingRow(null)
  }

  const handleEditCancel = () => {
    if (!isMobile) gridRef.current?.instance()?.collapseRow(editingRow.id)
    setEditingRow(null)
  }

  const handleToggleActive = (vehicle) => {
    dispatch(taxiVehicleActions.updateRequest({ ...vehicle, active: !(vehicle.active !== false) }))
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

  const restrictionsData = useMemo(
    () =>
      MONTHS.map((name, i) => ({
        id: i + 1,
        name,
        d1: Number(restrictForm[i + 1]?.d1) || null,
        d2: Number(restrictForm[i + 1]?.d2) || null,
      })),
    [restrictForm],
  )

  const onRestrictCellChanged = useCallback((e) => {
    const month = e.key
    const field = e.column.dataField
    setRestrictForm((prev) => ({
      ...prev,
      [month]: { ...prev[month], [field]: String(e.value ?? '') },
    }))
  }, [])

  const handleSaveRestrictions = () => {
    setRestrictSaving(true)
    const clean = Object.fromEntries(
      Object.entries(restrictForm).map(([m, v]) => [
        m,
        { d1: v.d1 ? Number(v.d1) : null, d2: v.d2 ? Number(v.d2) : null },
      ]),
    )
    dispatch(taxiVehicleActions.updateRestrictionsRequest({ id: restrictModal.id, restrictions: clean }))
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

        <CCollapse visible={!isMobile && showCreate}>
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
              <Spinner color="primary" />
            </div>
          ) : isMobile ? (
            <VehicleCardList
              records={rows}
              driversByPlateMap={driversByPlateMap}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
              onOpenRestrictions={openRestrictModal}
            />
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
                    <button
                      className="master-btn master-btn--warning"
                      onClick={() => openRestrictModal(data)}
                      title="Pico y placa"
                    >
                      📅
                    </button>
                    <button
                      className="master-btn master-btn--primary"
                      onClick={() => handleEdit(data)}
                      title="Editar"
                    >
                      ✎
                    </button>
                    <button
                      className="master-btn master-btn--danger"
                      onClick={() => handleDelete(data.id)}
                      title="Eliminar"
                    >
                      <CIcon icon={cilTrash} size="sm" />
                    </button>
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
                            <span className="master-empty">{t('taxis.settlements.noRecords')}</span>
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

      {/* Create modal — mobile */}
      {isMobile && showCreate && (
        <CModal visible onClose={() => setShowCreate(false)} size="lg" scrollable>
          <CModalHeader>
            <CModalTitle>Nuevo vehículo</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <VehicleForm
              initial={EMPTY}
              title=""
              onSave={handleCreate}
              onCancel={() => setShowCreate(false)}
              saving={fetching}
            />
          </CModalBody>
        </CModal>
      )}

      {/* Edit modal — mobile */}
      {isMobile && editingRow && (
        <CModal visible onClose={handleEditCancel} size="lg" scrollable>
          <CModalHeader>
            <CModalTitle>Editar vehículo</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <VehicleForm
              key={editingRow.id}
              initial={editingRow}
              title=""
              subtitle={editingRow.plate}
              onSave={handleEditSave}
              onCancel={handleEditCancel}
              saving={fetching}
            />
          </CModalBody>
        </CModal>
      )}

      {/* Pico y placa modal */}
      <CModal visible={!!restrictModal} onClose={() => setRestrictModal(null)} size="lg">
        <CModalHeader>
          <CModalTitle>Pico y placa — {restrictModal?.plate}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <StandardGrid
            dataSource={restrictionsData}
            keyExpr="id"
            style={{ margin: 0 }}
            editing={{
              mode: 'cell',
              allowUpdating: true,
              allowAdding: false,
              allowDeleting: false,
            }}
            onCellValueChanged={onRestrictCellChanged}
          >
            <Paging enabled={false} />
            <Column dataField="name" caption="Mes" width={140} allowSorting={false} allowEditing={false} />
            <Column
              dataField="d1"
              caption="Día 1"
              dataType="number"
              editorOptions={{ min: 1, max: 31, placeholder: '—' }}
              allowSorting={false}
            />
            <Column
              dataField="d2"
              caption="Día 2"
              dataType="number"
              editorOptions={{ min: 1, max: 31, placeholder: '—' }}
              allowSorting={false}
            />
          </StandardGrid>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" size="sm" onClick={() => setRestrictModal(null)}>
            Cancelar
          </CButton>
          <CButton color="primary" size="sm" disabled={restrictSaving} onClick={handleSaveRestrictions}>
            {restrictSaving ? <Spinner size="sm" /> : 'Guardar'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Vehiculos
