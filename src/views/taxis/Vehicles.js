import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import {
  FeatherGrid,
  FeatherSortHead,
  FeatherColumnToggle,
  useFeatherSort,
  useFeatherColumns,
  sortFeatherRows,
} from 'src/components/shared/FeatherGrid'
import StandardCard, { SC } from 'src/components/shared/StandardCard/Index'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CBadge,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash, cilBell, cilPencil } from '@coreui/icons'
import * as taxiVehicleActions from 'src/actions/taxi/taxiVehicleActions'
import * as taxiDriverActions from 'src/actions/taxi/taxiDriverActions'
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

const Vehiculos = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const activeTenantId = useActiveTenantId()
  const { data: records, fetching } = useSelector((s) => s.taxiVehicle)
  const { data: drivers } = useSelector((s) => s.taxiDriver)

  const [restrictModal, setRestrictModal] = useState(null)
  const [restrictYear, setRestrictYear] = useState(new Date().getFullYear())
  const [testingNotif, setTestingNotif] = useState(false)
  const [restrictForm, setRestrictForm] = useState(emptyRestrictions())
  const [restrictSaving, setRestrictSaving] = useState(false)
  const [expandedIds, setExpandedIds] = useState(new Set())
  const [sort, toggleSort] = useFeatherSort([{ key: 'plate', dir: 'asc' }])

  useEffect(() => {
    dispatch(taxiVehicleActions.fetchRequest())
    dispatch(taxiDriverActions.fetchRequest())
  }, [dispatch, activeTenantId])

  const handleEdit = (row) => navigate(`/taxis/vehicles/${row.id}`)

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

  const handleRestrictYearChange = (newYear) => {
    const merged = {
      ...restrictModal.allRestrictions,
      [restrictYear]: cleanMonthForm(restrictForm),
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

  const handleRestrictFieldChange = (month, field, value) => {
    setRestrictForm((prev) => ({ ...prev, [month]: { ...prev[month], [field]: value } }))
  }

  const handleSaveRestrictions = () => {
    setRestrictSaving(true)
    const merged = {
      ...restrictModal.allRestrictions,
      [restrictYear]: cleanMonthForm(restrictForm),
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

  const toggleExpanded = (id) =>
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const VEHICLE_COLUMNS = useMemo(
    () => [
      { key: 'plate', label: t('taxis.vehicles.fields.plate') },
      { key: 'active', label: t('taxis.vehicles.fields.active') },
      { key: 'brand', label: t('taxis.vehicles.fields.brand') },
      { key: 'model', label: t('taxis.vehicles.fields.model') },
      { key: 'year', label: t('taxis.vehicles.fields.year'), align: 'num' },
      { key: 'comment', label: 'Comentario' },
    ],
    [t],
  )

  const {
    isVisible: isVehicleColVisible,
    selected: vehicleColSelected,
    toggle: toggleVehicleCol,
    clear: clearVehicleCols,
  } = useFeatherColumns(VEHICLE_COLUMNS)

  const sortedRows = useMemo(
    () =>
      sortFeatherRows(rows, sort, (row, key) =>
        key === 'active' ? row.active !== false : row[key],
      ),
    [rows, sort],
  )

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
            {!isMobile && (
              <FeatherColumnToggle
                columns={VEHICLE_COLUMNS}
                selected={vehicleColSelected}
                onToggle={toggleVehicleCol}
                onClearAll={clearVehicleCols}
              />
            )}
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
              color="primary"
              variant="outline"
              onClick={() => navigate('/taxis/vehicles/new')}
            >
              <CIcon icon={cilPlus} size="sm" /> Nuevo vehículo
            </CButton>
          </div>
        </CCardHeader>

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
            <FeatherGrid className="master-grid-scroll">
              <colgroup>
                <col />
                <col />
                <col />
                {VEHICLE_COLUMNS.map((col) => (
                  <col
                    key={col.key}
                    style={{ visibility: isVehicleColVisible(col.key) ? undefined : 'collapse' }}
                  />
                ))}
                <col />
                <col />
              </colgroup>
              <FeatherSortHead
                columns={VEHICLE_COLUMNS}
                sort={sort}
                onSort={toggleSort}
                leading={
                  <>
                    <th className="master-expand-col" />
                    <th>Acciones</th>
                    <th>📷</th>
                  </>
                }
                trailing={
                  <>
                    <th>{t('taxis.vehicles.fields.drivers')}</th>
                    <th>{t('taxis.vehicles.fields.ppThisMonth')}</th>
                  </>
                }
              />
              <tbody>
                {sortedRows.map((v) => {
                  const expanded = expandedIds.has(v.id)
                  const rowDrivers = driversByPlate(v.plate)
                  return (
                    <React.Fragment key={v.id}>
                      <tr>
                        <td className="master-expand-col">
                          <span
                            className={`master-chevron${expanded ? ' master-chevron--open' : ''}`}
                            onClick={() => toggleExpanded(v.id)}
                          >
                            ▸
                          </span>
                        </td>
                        <td>
                          <div className="master-actions">
                            <button
                              className="master-btn master-btn--warning"
                              onClick={() => openRestrictModal(v)}
                              title="Pico y placa"
                            >
                              📅
                            </button>
                            <button
                              className="master-btn master-btn--primary"
                              onClick={() => handleEdit(v)}
                              title="Editar"
                            >
                              ✎
                            </button>
                            <button
                              className="master-btn master-btn--danger"
                              onClick={() => handleDelete(v.id)}
                              title="Eliminar"
                            >
                              <CIcon icon={cilTrash} size="sm" />
                            </button>
                          </div>
                        </td>
                        <td>
                          {v.photos?.length > 0 ? (
                            <img
                              src={v.photos[0]}
                              alt=""
                              className="master-photo-thumb master-photo-thumb--addable"
                              onClick={() => handlePhotoThumbClick(v)}
                              title="Ver foto"
                            />
                          ) : (
                            <span
                              className="master-photo-thumb master-photo-thumb--empty master-photo-thumb--addable"
                              onClick={() => handlePhotoThumbClick(v)}
                              title="Agregar foto"
                            >
                              +
                            </span>
                          )}
                        </td>
                        <td className="master-mono">{v.plate}</td>
                        <td>
                          <StatusBadge
                            active={v.active !== false}
                            labels={{ true: 'Sí', false: 'No' }}
                            onClick={() => handleToggleActive(v)}
                          />
                        </td>
                        <td>{v.brand}</td>
                        <td>{v.model}</td>
                        <td className="num">{v.year}</td>
                        <td>{v.comment}</td>
                        <td>
                          {rowDrivers.length === 0 ? (
                            <span className="text-body-tertiary">—</span>
                          ) : (
                            rowDrivers.map((driver) => (
                              <CBadge
                                key={driver.name}
                                color={driver.active !== false ? 'info' : 'secondary'}
                                className="driver-badge"
                              >
                                {driver.name}
                                {driver.active === false ? ' (inactivo)' : ''}
                              </CBadge>
                            ))
                          )}
                        </td>
                        <td>{currentMonthSummary(v.restrictions)}</td>
                      </tr>
                      {expanded && (
                        <tr className="master-detail-row">
                          <td />
                          <td colSpan={10}>
                            <DetailPanel columns={2} className="detail-panel--flat">
                              <DetailSection title={t('taxis.drivers.fields.personalData')}>
                                <DetailRow
                                  label={t('taxis.vehicles.fields.plate')}
                                  value={v.plate}
                                  mono
                                />
                                <DetailRow
                                  label={t('taxis.vehicles.fields.status')}
                                  value={
                                    v.active !== false
                                      ? t('taxis.vehicles.fields.active')
                                      : t('taxis.vehicles.fields.inactive')
                                  }
                                />
                                <DetailRow
                                  label={t('taxis.vehicles.fields.brand')}
                                  value={v.brand}
                                />
                                <DetailRow
                                  label={t('taxis.vehicles.fields.model')}
                                  value={v.model}
                                />
                                <DetailRow label={t('taxis.vehicles.fields.year')} value={v.year} />
                                <DetailRow label="Comentario" value={v.comment || null} />
                              </DetailSection>
                              {v.photos?.length > 0 && (
                                <DetailSection title="Fotos">
                                  <div className="master-photos-gallery">
                                    {v.photos.map((p, i) => (
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
                                {rowDrivers.length > 0 ? (
                                  rowDrivers.map((driver) => (
                                    <DetailRow
                                      key={driver.name}
                                      label={t('taxis.settlements.fields.driver')}
                                      value={
                                        <span
                                          style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 8,
                                          }}
                                        >
                                          {driver.name}
                                          <StatusBadge active={driver.active !== false} />
                                        </span>
                                      }
                                    />
                                  ))
                                ) : (
                                  <span className="master-empty">
                                    {t('taxis.settlements.noRecords')}
                                  </span>
                                )}
                              </DetailSection>
                            </DetailPanel>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </FeatherGrid>
          )}
        </CCardBody>
      </CCard>

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
          <FeatherGrid className="master-grid-scroll">
            <thead>
              <tr>
                <th>Mes</th>
                <th className="num">Día 1</th>
                <th className="num">Día 2</th>
                <th className="num">Día 3</th>
              </tr>
            </thead>
            <tbody>
              {restrictionsData.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  {['d1', 'd2', 'd3'].map((field) => (
                    <td className="num" key={field}>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        placeholder="—"
                        className="master-restrict-input"
                        value={restrictForm[row.id]?.[field] ?? ''}
                        onChange={(e) => handleRestrictFieldChange(row.id, field, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </FeatherGrid>
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
