import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { Column, Lookup, MasterDetail } from 'devextreme-react/data-grid'
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilX, cilTrash, cilPencil, cilDescription } from '@coreui/icons'
import StandardList, { SL } from 'src/components/shared/StandardList/Index'
import { useForm } from 'react-hook-form'
import * as taxiDriverActions from 'src/actions/taxi/taxiDriverActions'
import * as taxiVehicleActions from 'src/actions/taxi/taxiVehicleActions'
import StandardForm, { StandardField, SF } from 'src/components/shared/StandardForm'
import DetailPanel, { DetailSection, DetailRow } from 'src/components/shared/DetailPanel'
import { fmt } from 'src/utils/formatters'
import { uploadImage, createPreview } from 'src/services/facade/imageFacade'
import StatusBadge from 'src/components/shared/StatusBadge'
import useIsMobile from 'src/hooks/useIsMobile'
import DriverGenDocsPanel from './DriverGenDocsPanel'
import './masters.scss'
import Spinner from 'src/components/shared/Spinner'

const EMPTY = {
  name: '',
  idNumber: '',
  phone: '',
  defaultAmount: '',
  defaultAmountSunday: '',
  defaultVehicle: '',
  active: true,
  startDate: '',
  endDate: '',
  comment: '',
  photo: null,
}

const DriverDataDetail = ({ data, vehicles }) => {
  const vehicle = (vehicles ?? []).find((v) => v.plate === data.defaultVehicle)
  const vehicleLabel = vehicle
    ? `${vehicle.plate}${vehicle.brand ? ` · ${vehicle.brand}` : ''}`
    : data.defaultVehicle || null

  return (
    <DetailPanel columns={2}>
      <DetailSection title="Datos personales">
        {data.photo && (
          <div className="master-photo-detail">
            <img src={data.photo} alt={data.name} />
          </div>
        )}
        <DetailRow label="Nombre" value={data.name} />
        <DetailRow label="Cédula" value={data.idNumber} mono />
        <DetailRow label="Teléfono" value={data.phone} />
        <DetailRow label="Estado" value={data.active !== false ? 'Activo' : 'Inactivo'} />
        <DetailRow label="Fecha inicio" value={data.startDate || null} />
        <DetailRow label="Fecha fin" value={data.endDate || null} />
        <DetailRow label="Comentario" value={data.comment || null} />
      </DetailSection>
      <DetailSection title="Liquidación por defecto">
        <DetailRow
          label="Liq. normal"
          value={data.defaultAmount ? fmt(data.defaultAmount) : null}
        />
        <DetailRow
          label="Liq. domingo"
          value={data.defaultAmountSunday ? fmt(data.defaultAmountSunday) : null}
        />
        <DetailRow label="Taxi por defecto" value={vehicleLabel} mono />
      </DetailSection>
    </DetailPanel>
  )
}

const DriverDetailTabs = ({ data, vehicles }) => {
  const [tab, setTab] = useState('datos')
  return (
    <div>
      <div className="master-detail-tabs">
        <button
          className={`master-detail-tab${tab === 'datos' ? ' master-detail-tab--active' : ''}`}
          onClick={() => setTab('datos')}
        >
          Datos
        </button>
        <button
          className={`master-detail-tab${tab === 'documentos' ? ' master-detail-tab--active' : ''}`}
          onClick={() => setTab('documentos')}
        >
          <CIcon icon={cilDescription} size="sm" /> Documentos
        </button>
      </div>
      {tab === 'datos' ? (
        <DriverDataDetail data={data} vehicles={vehicles} />
      ) : (
        <DriverGenDocsPanel driver={data} isMobile={false} />
      )}
    </div>
  )
}

const fieldError = (err) =>
  err ? (
    <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 2, display: 'block' }}>
      {err.message}
    </span>
  ) : null

const DriverForm = ({ initial, vehicles, onSave, onCancel, saving, title, subtitle }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: initial })

  const active = watch('active') ?? true
  const [photo, setPhoto] = useState(initial?.photo ?? null)
  const photoInputRef = useRef()

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const handle = await uploadImage(file)
    setPhoto(handle)
  }

  return (
    <StandardForm
      title={title}
      subtitle={subtitle}
      onCancel={onCancel}
      onSave={handleSubmit((data) => onSave({ ...data, photo }))}
      saving={saving}
    >
      <div className="master-section-label">Datos personales</div>
      <StandardField label="Nombre">
        <input
          className={SF.input}
          placeholder="Nombre completo"
          {...register('name', { required: 'El nombre es obligatorio' })}
        />
        {fieldError(errors.name)}
      </StandardField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        <StandardField label="Cédula">
          <input
            className={SF.input}
            placeholder="123456789"
            {...register('idNumber', { required: 'La cédula es obligatoria' })}
          />
          {fieldError(errors.idNumber)}
        </StandardField>
        <StandardField label="Teléfono">
          <input className={SF.input} placeholder="300 000 0000" {...register('phone')} />
        </StandardField>
      </div>

      <div className="master-section-label">Liquidación por defecto</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>
        <StandardField label="Liq. normal">
          <input
            className={SF.input}
            type="number"
            placeholder="85000"
            {...register('defaultAmount')}
          />
        </StandardField>
        <StandardField label="Liq. domingo">
          <input
            className={SF.input}
            type="number"
            placeholder="0"
            {...register('defaultAmountSunday')}
          />
        </StandardField>
        <StandardField label="Taxi por defecto">
          <select className={SF.select} {...register('defaultVehicle')}>
            <option value="">— Ninguno —</option>
            {(vehicles ?? []).map((v) => (
              <option key={v.id} value={v.plate}>
                {v.plate}
                {v.brand ? ` · ${v.brand}` : ''}
                {v.active === false ? ' (Inactivo)' : ''}
              </option>
            ))}
          </select>
        </StandardField>
      </div>

      <div className="master-section-label">Vigencia y estado</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>
        <StandardField label="Fecha inicio">
          <input className={SF.input} type="date" {...register('startDate')} />
        </StandardField>
        <StandardField label="Fecha fin">
          <input className={SF.input} type="date" {...register('endDate')} />
        </StandardField>
        <StandardField label="Estado">
          <button
            type="button"
            onClick={() => setValue('active', !active)}
            className={`master-toggle-btn${active !== false ? ' master-toggle-btn--active' : ' master-toggle-btn--inactive'}`}
          >
            {active !== false ? '✓ Activo' : '✗ Inactivo'}
          </button>
        </StandardField>
      </div>

      <div className="master-section-label">Observaciones y foto</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 0, alignItems: 'start' }}>
        <StandardField label="Comentario">
          <input className={SF.input} placeholder="Observaciones opcionales" {...register('comment')} />
        </StandardField>
        <StandardField label="Foto">
          <div className="master-photo-picker">
            {photo && (
              <div className="master-photo-picker__preview">
                <img src={photo} alt="Foto conductor" />
              </div>
            )}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />
            <div className="master-photo-picker__actions">
              <button
                type="button"
                className="master-photo-picker__btn"
                onClick={() => photoInputRef.current?.click()}
              >
                {photo ? 'Cambiar' : '+ Foto'}
              </button>
              {photo && (
                <button
                  type="button"
                  className="master-photo-picker__btn master-photo-picker__btn--remove"
                  onClick={() => setPhoto(null)}
                >
                  Quitar
                </button>
              )}
            </div>
          </div>
        </StandardField>
      </div>
    </StandardForm>
  )
}

const Conductores = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const isMobile = useIsMobile()
  const { data: records, fetching } = useSelector((s) => s.taxiDriver)
  const { data: vehicles } = useSelector((s) => s.taxiVehicle)
  const gridRef = useRef()

  const [showCreate, setShowCreate] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [docsDriver, setDocsDriver] = useState(null)

  useEffect(() => {
    dispatch(taxiDriverActions.fetchRequest())
    dispatch(taxiVehicleActions.fetchRequest())
  }, [dispatch])

  const vehicleOptions = [
    { plate: '', label: '— Ninguno —' },
    ...(vehicles ?? []).map((v) => ({
      plate: v.plate,
      label: `${v.plate}${v.brand ? ` · ${v.brand}` : ''}${v.active === false ? ' (Inactivo)' : ''}`,
    })),
  ]

  const handleCreate = (form) => {
    dispatch(taxiDriverActions.createRequest(form))
    setShowCreate(false)
  }

  useEffect(() => {
    if (editingRow && !isMobile) {
      gridRef.current?.instance()?.expandRow(editingRow.id)
    }
  }, [editingRow, isMobile])

  const handleEdit = (row) => setEditingRow(row)

  const handleEditSave = (form) => {
    dispatch(taxiDriverActions.updateRequest({ id: editingRow.id, ...form }))
    if (!isMobile) gridRef.current?.instance()?.collapseRow(editingRow.id)
    setEditingRow(null)
  }

  const handleEditCancel = () => {
    if (!isMobile) gridRef.current?.instance()?.collapseRow(editingRow.id)
    setEditingRow(null)
  }

  const handleToggleActive = (driver) => {
    dispatch(taxiDriverActions.updateRequest({ ...driver, active: !(driver.active !== false) }))
  }

  const handleDelete = (id) => {
    if (!window.confirm('¿Eliminar este conductor?')) return
    dispatch(taxiDriverActions.deleteRequest({ id }))
  }

  const rows = records ?? []

  return (
    <CCard>
      <CCardHeader className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <strong>Conductores</strong>
          <CBadge color="secondary">{rows.length}</CBadge>
        </div>
        <CButton
          size="sm"
          color={showCreate ? 'danger' : 'primary'}
          variant="outline"
          onClick={() => setShowCreate((p) => !p)}
        >
          <CIcon icon={showCreate ? cilX : cilPlus} size="sm" />{' '}
          {showCreate ? 'Cancelar' : 'Nuevo conductor'}
        </CButton>
      </CCardHeader>

      <CCollapse visible={!isMobile && showCreate}>
        <div className="master-form-panel">
          <DriverForm
            initial={EMPTY}
            vehicles={vehicles}
            title="Nuevo conductor"
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
          <StandardList
            data={rows}
            keyExpr="id"
            emptyText="Sin conductores aún."
            inactive={(d) => d.active === false}
            renderTitle={(d) => d.name}
            renderBadge={(d) => ({
              label: d.active !== false ? 'Activo' : 'Inactivo',
              variant: d.active !== false ? 'active' : 'inactive',
              onClick: () => handleToggleActive(d),
            })}
            renderRows={(d) => {
              const v = (vehicles ?? []).find((veh) => veh.plate === d.defaultVehicle)
              return [
                [
                  d.idNumber && `CC ${d.idNumber}`,
                  d.phone && <><span className={SL.label}>Cel </span>{d.phone}</>,
                ],
                [
                  (v?.plate ?? d.defaultVehicle) && (
                    <span className={SL.mono}>{v?.plate ?? d.defaultVehicle}</span>
                  ),
                  v?.brand && <span className={SL.muted}>{v.brand}</span>,
                ],
                [
                  d.defaultAmount > 0 && <><span className={SL.label}>Liq </span>{fmt(d.defaultAmount)}</>,
                  d.defaultAmountSunday > 0 && <><span className={SL.label}>Dom </span>{fmt(d.defaultAmountSunday)}</>,
                ],
              ]
            }}
            renderActions={(d) => [
              { icon: cilPencil, color: 'primary', title: 'Editar', onClick: () => handleEdit(d) },
              { icon: cilDescription, color: 'info', title: 'Documentos', onClick: () => setDocsDriver(d) },
              { icon: cilTrash, color: 'danger', title: 'Eliminar', onClick: () => handleDelete(d.id) },
            ]}
          />
        ) : (
          <StandardGrid
            ref={gridRef}
            keyExpr="id"
            dataSource={rows}
            noDataText="Sin conductores aún."
          >
            <Column
              dataField="photo"
              caption=""
              width={48}
              allowSorting={false}
              allowResizing={false}
              cellRender={({ value }) =>
                value ? (
                  <img src={value} alt="" className="master-photo-thumb" />
                ) : (
                  <span className="master-photo-thumb master-photo-thumb--empty">–</span>
                )
              }
            />
            <Column dataField="name" caption={t('taxis.drivers.fields.name')} minWidth={150} />
            <Column
              dataField="idNumber"
              caption={t('taxis.drivers.fields.idNumber')}
              width={130}
              cellRender={({ value }) => <span className="master-mono">{value}</span>}
            />
            <Column
              dataField="phone"
              caption={t('taxis.drivers.fields.phone')}
              width={130}
              hidingPriority={1}
            />
            <Column
              dataField="defaultAmount"
              caption={t('taxis.drivers.fields.defaultAmount')}
              dataType="number"
              width={130}
              hidingPriority={2}
              cellRender={({ value }) => (
                <span className="master-amount">{value ? fmt(value) : '—'}</span>
              )}
            />
            <Column
              dataField="defaultAmountSunday"
              caption={t('taxis.drivers.fields.defaultAmountSunday')}
              dataType="number"
              width={130}
              hidingPriority={3}
              cellRender={({ value }) => (
                <span className="master-amount">{value ? fmt(value) : '—'}</span>
              )}
            />
            <Column
              dataField="defaultVehicle"
              caption={t('taxis.drivers.fields.defaultVehicle')}
              width={150}
              hidingPriority={4}
              cellRender={({ value }) => <span className="master-mono">{value || '—'}</span>}
            >
              <Lookup dataSource={vehicleOptions} valueExpr="plate" displayExpr="label" />
            </Column>
            <Column
              dataField="comment"
              caption="Comentario"
              minWidth={160}
              hidingPriority={5}
            />
            <Column
              dataField="active"
              caption="Estado"
              width={100}
              allowSorting={true}
              cellRender={({ data }) => <StatusBadge active={data.active !== false} />}
            />
            <Column
              caption=""
              width={70}
              allowSorting={false}
              allowResizing={false}
              cellRender={({ data }) => (
                <div className="master-actions">
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
                    <DriverForm
                      initial={data}
                      vehicles={vehicles}
                      title="Editar conductor"
                      subtitle={data.name}
                      onSave={handleEditSave}
                      onCancel={handleEditCancel}
                      saving={fetching}
                    />
                  </div>
                ) : (
                  <DriverDetailTabs data={data} vehicles={vehicles} />
                )
              }
            />
          </StandardGrid>
        )}
      </CCardBody>

      {/* Create modal — mobile */}
      {isMobile && showCreate && (
        <CModal visible onClose={() => setShowCreate(false)} size="lg" scrollable>
          <CModalHeader>
            <CModalTitle>Nuevo conductor</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <DriverForm
              initial={EMPTY}
              vehicles={vehicles}
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
            <CModalTitle>Editar conductor</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <DriverForm
              key={editingRow.id}
              initial={editingRow}
              vehicles={vehicles}
              title=""
              subtitle={editingRow.name}
              onSave={handleEditSave}
              onCancel={handleEditCancel}
              saving={fetching}
            />
          </CModalBody>
        </CModal>
      )}

      {/* Documents modal — mobile */}
      {isMobile && docsDriver && (
        <CModal visible onClose={() => setDocsDriver(null)} size="lg" scrollable>
          <CModalHeader>
            <CModalTitle>Documentos — {docsDriver.name}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <DriverGenDocsPanel driver={docsDriver} isMobile={true} />
          </CModalBody>
        </CModal>
      )}
    </CCard>
  )
}

export default Conductores
