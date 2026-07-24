import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { Column, MasterDetail, Paging } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import StandardCard, { SC } from 'src/components/shared/StandardCard/Index'
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
  CFormInput,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilX, cilTrash, cilBell, cilPencil } from '@coreui/icons'
import * as taxiVehicleActions from 'src/actions/taxi/taxiVehicleActions'
import * as taxiDriverActions from 'src/actions/taxi/taxiDriverActions'
import StandardForm, { StandardField, SF } from 'src/components/shared/StandardForm'
import DetailPanel, { DetailSection, DetailRow } from 'src/components/shared/DetailPanel'
import useIsMobile from 'src/hooks/useIsMobile'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import { uploadImages } from 'src/services/facade/imageFacade'
import StatusBadge from 'src/components/shared/StatusBadge'
import {
  getMonthRestriction,
  restrictedDaysFor,
  emptyRestrictions,
  toYearKeyedRestrictions,
  monthFormFor,
  cleanMonthForm,
} from './picoPlacaHelpers'
import './masters.scss'
import Spinner from 'src/components/shared/Spinner'

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

const EMPTY = { plate: '', brand: '', model: '', year: '', active: true, comment: '', photos: [] }

const currentMonthSummary = (restrictions) => {
  if (!restrictions) return '—'
  const now = new Date()
  const entry = getMonthRestriction(restrictions, now.getFullYear(), now.getMonth() + 1)
  if (!entry || (!entry.d1 && !entry.d2 && !entry.d3)) return '—'
  return [entry.d1, entry.d2, entry.d3]
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
  const [photos, setPhotos] = useState(initial?.photos ?? [])
  const photosInputRef = useRef()

  const handlePhotosChange = async (e) => {
    const handles = await uploadImages(e.target.files)
    setPhotos((prev) => [...prev, ...handles])
    e.target.value = ''
  }

  const removePhoto = (idx) => setPhotos((prev) => prev.filter((_, i) => i !== idx))

  return (
    <StandardForm
      title={title}
      subtitle={subtitle}
      onCancel={onCancel}
      onSave={handleSubmit((data) => onSave({ ...data, photos }))}
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
      <StandardField label="Comentario">
        <input
          className={SF.input}
          placeholder="Observaciones opcionales"
          {...register('comment')}
        />
      </StandardField>
      <StandardField label="Fotos">
        <div className="master-photos-picker">
          {photos.length > 0 && (
            <div className="master-photos-picker__grid">
              {photos.map((p, i) => (
                <div key={i} className="master-photos-picker__thumb">
                  <img src={p} alt={`Foto ${i + 1}`} />
                  <button
                    type="button"
                    className="master-photos-picker__remove"
                    onClick={() => removePhoto(i)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            ref={photosInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handlePhotosChange}
          />
          <button
            type="button"
            className="master-photo-picker__btn"
            onClick={() => photosInputRef.current?.click()}
          >
            + Agregar fotos
          </button>
        </div>
      </StandardField>
    </StandardForm>
  )
}

const Vehiculos = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const isMobile = useIsMobile()
  const activeTenantId = useActiveTenantId()
  const { data: records, fetching } = useSelector((s) => s.taxiVehicle)
  const { data: drivers } = useSelector((s) => s.taxiDriver)
  const gridRef = useRef()

  const [showCreate, setShowCreate] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [restrictModal, setRestrictModal] = useState(null)
  const [restrictYear, setRestrictYear] = useState(new Date().getFullYear())
  const [testingNotif, setTestingNotif] = useState(false)
  const [restrictForm, setRestrictForm] = useState(emptyRestrictions())
  const [restrictSaving, setRestrictSaving] = useState(false)
  const restrictGridRef = useRef()
  // DevExtreme's cell editor only commits a typed value into restrictForm on
  // blur/Enter/Tab — clicking "Guardar" (outside the grid) can race that
  // commit and silently drop the last edited cell. saveEditData() forces the
  // commit; this ref lets the save/year-change handlers read the value it
  // just wrote instead of a stale closure over restrictForm.
  const restrictFormRef = useRef(restrictForm)
  restrictFormRef.current = restrictForm

  useEffect(() => {
    dispatch(taxiVehicleActions.fetchRequest())
    dispatch(taxiDriverActions.fetchRequest())
  }, [dispatch, activeTenantId])

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

  // Clicking the thumbnail opens a preview modal when the vehicle already has
  // photos, or the file picker directly when it doesn't — no need to open the
  // edit form first. photoUploadTarget tracks which row the (single, shared)
  // hidden file input is for.
  const [photoUploadTarget, setPhotoUploadTarget] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const photoUploadInputRef = useRef()

  const handlePhotoThumbClick = (vehicle) => {
    if (vehicle.photos?.length > 0) {
      setPhotoPreview(vehicle)
      return
    }
    setPhotoUploadTarget(vehicle)
    photoUploadInputRef.current?.click()
  }

  const handlePhotoUploadChange = async (e) => {
    const target = photoUploadTarget
    const files = e.target.files
    if (!target || !files?.length) {
      e.target.value = ''
      return
    }
    const handles = await uploadImages(files)
    e.target.value = ''
    dispatch(
      taxiVehicleActions.updateRequest({
        ...target,
        photos: [...(target.photos ?? []), ...handles],
      }),
    )
    setPhotoUploadTarget(null)
  }

  const handleDelete = (id) => {
    if (!window.confirm('¿Eliminar este vehículo?')) return
    dispatch(taxiVehicleActions.deleteRequest({ id }))
  }

  const openRestrictModal = (data) => {
    const year = new Date().getFullYear()
    const allRestrictions = toYearKeyedRestrictions(data.restrictions, year)
    setRestrictYear(year)
    setRestrictForm(monthFormFor(allRestrictions[year]))
    setRestrictModal({ id: data.id, plate: data.plate, allRestrictions })
  }

  const handleRestrictYearChange = async (newYear) => {
    await restrictGridRef.current?.instance()?.saveEditData()
    const merged = {
      ...restrictModal.allRestrictions,
      [restrictYear]: cleanMonthForm(restrictFormRef.current),
    }
    setRestrictModal((prev) => ({ ...prev, allRestrictions: merged }))
    setRestrictYear(newYear)
    setRestrictForm(monthFormFor(merged[newYear]))
  }

  const restrictionsData = useMemo(
    () =>
      MONTHS.map((name, i) => ({
        id: i + 1,
        name,
        d1: Number(restrictForm[i + 1]?.d1) || null,
        d2: Number(restrictForm[i + 1]?.d2) || null,
        d3: Number(restrictForm[i + 1]?.d3) || null,
      })),
    [restrictForm],
  )

  // DevExtreme DataGrid has no "onCellValueChanged" event — that name never
  // existed in its API, so it silently never fired. onRowUpdating is the
  // correct event for "cell" editing mode: it fires per committed cell edit,
  // with e.key = the row key (month number) and e.newData = only the
  // field(s) that changed.
  const onRestrictRowUpdating = useCallback((e) => {
    const month = e.key
    const patch = Object.fromEntries(
      Object.entries(e.newData).map(([field, value]) => [field, String(value ?? '')]),
    )
    setRestrictForm((prev) => {
      const next = { ...prev, [month]: { ...prev[month], ...patch } }
      // Written synchronously here (not left to the render-body sync below)
      // so it's already correct the instant saveEditData()'s promise
      // resolves, regardless of whether React has re-rendered yet.
      restrictFormRef.current = next
      return next
    })
  }, [])

  const handleSaveRestrictions = async () => {
    setRestrictSaving(true)
    await restrictGridRef.current?.instance()?.saveEditData()
    const merged = {
      ...restrictModal.allRestrictions,
      [restrictYear]: cleanMonthForm(restrictFormRef.current),
    }
    dispatch(
      taxiVehicleActions.updateRestrictionsRequest({ id: restrictModal.id, restrictions: merged }),
    )
    setRestrictSaving(false)
    setRestrictModal(null)
  }

  const testPicoYPlacaNotification = useCallback(async () => {
    setTestingNotif(true)
    try {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const day = now.getDate()
      const vehicles = records ?? []
      const restricted = vehicles.filter((v) =>
        restrictedDaysFor(v.restrictions, year, month).includes(day),
      )
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
      map[d.defaultVehicle].push(d)
    })
    return map
  }, [drivers])
  const driversByPlate = (plate) => driversByPlateMap[plate] ?? []

  return (
    <>
      <input
        ref={photoUploadInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handlePhotoUploadChange}
      />
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
            <StandardCard
              data={rows}
              keyExpr="id"
              emptyText="Sin vehículos registrados."
              inactive={(v) => v.active === false}
              renderTitle={(v) => <span className={SC.mono}>{v.plate}</span>}
              renderBadge={(v) => ({
                label: v.active !== false ? 'Activo' : 'Inactivo',
                variant: v.active !== false ? 'active' : 'inactive',
                onClick: () => handleToggleActive(v),
              })}
              renderRows={(v) => {
                const drivers = driversByPlateMap[v.plate] ?? []
                const ppSummary = currentMonthSummary(v.restrictions)
                return [
                  [[v.brand, v.model, v.year].filter(Boolean).join(' · ') || false],
                  drivers.length > 0 &&
                    drivers.map((driver) => (
                      <CBadge
                        key={driver.name}
                        color={driver.active !== false ? 'info' : 'secondary'}
                        style={{ fontWeight: 400, marginRight: 4 }}
                      >
                        {driver.name}
                        {driver.active === false ? ' (inactivo)' : ''}
                      </CBadge>
                    )),
                  [
                    ppSummary !== '—' && (
                      <span style={{ color: '#e67700', fontWeight: 600 }}>📅 P&P: {ppSummary}</span>
                    ),
                  ],
                ]
              }}
              renderActions={(v) => [
                {
                  label: '📷',
                  color: 'secondary',
                  title: v.photos?.length > 0 ? 'Ver foto' : 'Agregar foto',
                  onClick: () => handlePhotoThumbClick(v),
                },
                {
                  label: '📅',
                  color: 'warning',
                  title: 'Pico y placa',
                  onClick: () => openRestrictModal(v),
                },
                {
                  icon: cilPencil,
                  color: 'primary',
                  title: 'Editar',
                  onClick: () => handleEdit(v),
                },
                {
                  icon: cilTrash,
                  color: 'danger',
                  title: 'Eliminar',
                  onClick: () => handleDelete(v.id),
                },
              ]}
            />
          ) : (
            <StandardGrid ref={gridRef} keyExpr="id" dataSource={rows}>
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
              <Column
                caption="📷"
                width={48}
                allowSorting={false}
                allowResizing={false}
                cellRender={({ data: d }) =>
                  d.photos?.length > 0 ? (
                    <img
                      src={d.photos[0]}
                      alt=""
                      className="master-photo-thumb master-photo-thumb--addable"
                      onClick={() => handlePhotoThumbClick(d)}
                      title="Ver foto"
                    />
                  ) : (
                    <span
                      className="master-photo-thumb master-photo-thumb--empty master-photo-thumb--addable"
                      onClick={() => handlePhotoThumbClick(d)}
                      title="Agregar foto"
                    >
                      +
                    </span>
                  )
                }
              />
              <Column dataField="plate" caption={t('taxis.vehicles.fields.plate')} />
              <Column
                dataField="active"
                caption={t('taxis.vehicles.fields.active')}
                dataType="boolean"
                width={80}
                cellRender={({ data }) => (
                  <StatusBadge
                    active={data.active !== false}
                    labels={{ true: 'Sí', false: 'No' }}
                    onClick={() => handleToggleActive(data)}
                  />
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
              <Column dataField="comment" caption="Comentario" minWidth={160} hidingPriority={3} />
              <Column
                caption={t('taxis.vehicles.fields.drivers')}
                allowEditing={false}
                hidingPriority={2}
                cellRender={({ data }) => {
                  const rowDrivers = driversByPlate(data.plate)
                  if (rowDrivers.length === 0) return <span className="text-body-tertiary">—</span>
                  return rowDrivers.map((driver) => (
                    <CBadge
                      key={driver.name}
                      color={driver.active !== false ? 'info' : 'secondary'}
                      className="driver-badge"
                    >
                      {driver.name}
                      {driver.active === false ? ' (inactivo)' : ''}
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
                    <DetailPanel columns={2} className="detail-panel--flat">
                      <DetailSection title={t('taxis.drivers.fields.personalData')}>
                        <DetailRow
                          label={t('taxis.vehicles.fields.plate')}
                          value={data.plate}
                          mono
                        />
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
                        <DetailRow label="Comentario" value={data.comment || null} />
                      </DetailSection>
                      {data.photos?.length > 0 && (
                        <DetailSection title="Fotos">
                          <div className="master-photos-gallery">
                            {data.photos.map((p, i) => (
                              <img
                                key={i}
                                src={p}
                                alt={`Foto ${i + 1}`}
                                className="master-photos-gallery__img"
                              />
                            ))}
                          </div>
                        </DetailSection>
                      )}
                      <DetailSection title={t('taxis.vehicles.fields.drivers')}>
                        {(() => {
                          const rowDrivers = driversByPlate(data.plate)
                          return rowDrivers.length > 0 ? (
                            rowDrivers.map((driver) => (
                              <DetailRow
                                key={driver.name}
                                label={t('taxis.settlements.fields.driver')}
                                value={
                                  <span
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                                  >
                                    {driver.name}
                                    <StatusBadge active={driver.active !== false} />
                                  </span>
                                }
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
          <div className="master-restrict-year">
            <label className="master-restrict-year__label">Año</label>
            <CFormInput
              type="number"
              size="sm"
              className="master-restrict-year__input"
              value={restrictYear}
              onChange={(e) => handleRestrictYearChange(Number(e.target.value) || restrictYear)}
            />
            <span className="master-restrict-year__hint">
              Cada año guarda sus propias fechas — cambiar el decreto de un año no afecta a los
              demás.
            </span>
          </div>
          <StandardGrid
            ref={restrictGridRef}
            dataSource={restrictionsData}
            keyExpr="id"
            style={{ margin: 0 }}
            editing={{
              mode: 'cell',
              allowUpdating: true,
              allowAdding: false,
              allowDeleting: false,
            }}
            onRowUpdating={onRestrictRowUpdating}
          >
            <Paging enabled={false} />
            <Column
              dataField="name"
              caption="Mes"
              width={140}
              allowSorting={false}
              allowEditing={false}
            />
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
            <Column
              dataField="d3"
              caption="Día 3"
              dataType="number"
              editorOptions={{ min: 1, max: 31, placeholder: '—' }}
              allowSorting={false}
            />
          </StandardGrid>
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
            {restrictSaving ? <Spinner size="sm" /> : 'Guardar'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Photo preview modal */}
      <CModal visible={!!photoPreview} onClose={() => setPhotoPreview(null)} size="lg">
        <CModalHeader>
          <CModalTitle>Fotos — {photoPreview?.plate}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="master-photos-gallery">
            {photoPreview?.photos?.map((p, i) => (
              <img key={i} src={p} alt={`Foto ${i + 1}`} className="master-photos-gallery__img" />
            ))}
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="outline"
            size="sm"
            onClick={() => {
              const vehicle = photoPreview
              setPhotoPreview(null)
              setPhotoUploadTarget(vehicle)
              photoUploadInputRef.current?.click()
            }}
          >
            + Agregar otra
          </CButton>
          <CButton color="primary" size="sm" onClick={() => setPhotoPreview(null)}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Vehiculos
