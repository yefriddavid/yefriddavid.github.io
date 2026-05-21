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
import { cilPlus, cilX, cilTrash, cilPencil } from '@coreui/icons'
import { useForm } from 'react-hook-form'
import * as taxiDriverActions from 'src/actions/taxi/taxiDriverActions'
import * as taxiVehicleActions from 'src/actions/taxi/taxiVehicleActions'
import StandardForm, { StandardField, SF } from 'src/components/shared/StandardForm'
import DetailPanel, { DetailSection, DetailRow } from 'src/components/shared/DetailPanel'
import { fmt } from 'src/utils/formatters'
import StatusBadge from 'src/components/shared/StatusBadge'
import useIsMobile from 'src/hooks/useIsMobile'
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
}

const DriverDetail = ({ data, vehicles }) => {
  const vehicle = (vehicles ?? []).find((v) => v.plate === data.defaultVehicle)
  const vehicleLabel = vehicle
    ? `${vehicle.plate}${vehicle.brand ? ` · ${vehicle.brand}` : ''}`
    : data.defaultVehicle || null

  return (
    <DetailPanel columns={2}>
      <DetailSection title="Datos personales">
        <DetailRow label="Nombre" value={data.name} />
        <DetailRow label="Cédula" value={data.idNumber} mono />
        <DetailRow label="Teléfono" value={data.phone} />
        <DetailRow label="Estado" value={data.active !== false ? 'Activo' : 'Inactivo'} />
        <DetailRow label="Fecha inicio" value={data.startDate || null} />
        <DetailRow label="Fecha fin" value={data.endDate || null} />
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

  return (
    <StandardForm
      title={title}
      subtitle={subtitle}
      onCancel={onCancel}
      onSave={handleSubmit(onSave)}
      saving={saving}
    >
      <StandardField label="Nombre">
        <input
          className={SF.input}
          placeholder="Nombre completo"
          {...register('name', { required: 'El nombre es obligatorio' })}
        />
        {fieldError(errors.name)}
      </StandardField>
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
    </StandardForm>
  )
}

const DriverCardList = ({ records, vehicles, onEdit, onDelete, onToggleActive }) => {
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
        Sin conductores aún.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 0' }}>
      {records.map((driver) => {
        const active = driver.active !== false
        const vehicle = (vehicles ?? []).find((v) => v.plate === driver.defaultVehicle)
        const vehicleLabel = vehicle
          ? `${vehicle.plate}${vehicle.brand ? ` · ${vehicle.brand}` : ''}`
          : driver.defaultVehicle || null

        return (
          <div
            key={driver.id}
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
            {/* name + status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--cui-body-color)' }}>
                {driver.name}
              </span>
              <CBadge color={active ? 'success' : 'danger'} style={{ fontSize: 10 }}>
                {active ? 'Activo' : 'Inactivo'}
              </CBadge>
            </div>

            {/* meta */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', fontSize: 12, color: 'var(--cui-secondary-color)' }}>
              {driver.idNumber && <span>CC {driver.idNumber}</span>}
              {driver.phone && <span>📞 {driver.phone}</span>}
              {vehicleLabel && (
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--cui-body-color)' }}>
                  {vehicleLabel}
                </span>
              )}
            </div>

            {/* amounts */}
            {(driver.defaultAmount || driver.defaultAmountSunday) && (
              <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                {driver.defaultAmount > 0 && (
                  <span>
                    <span style={{ color: 'var(--cui-secondary-color)' }}>Liq: </span>
                    <strong>{fmt(driver.defaultAmount)}</strong>
                  </span>
                )}
                {driver.defaultAmountSunday > 0 && (
                  <span>
                    <span style={{ color: 'var(--cui-secondary-color)' }}>Dom: </span>
                    <strong>{fmt(driver.defaultAmountSunday)}</strong>
                  </span>
                )}
              </div>
            )}

            {/* actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <button
                onClick={() => onToggleActive(driver)}
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
                  onClick={() => onEdit(driver)}
                  style={{ background: 'none', border: 'none', color: 'var(--cui-primary)', cursor: 'pointer', padding: '4px 8px', fontSize: 16 }}
                  title="Editar"
                >
                  <CIcon icon={cilPencil} size="sm" />
                </button>
                <button
                  onClick={() => onDelete(driver.id)}
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

const Conductores = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const isMobile = useIsMobile()
  const { data: records, fetching } = useSelector((s) => s.taxiDriver)
  const { data: vehicles } = useSelector((s) => s.taxiVehicle)
  const gridRef = useRef()

  const [showCreate, setShowCreate] = useState(false)
  const [editingRow, setEditingRow] = useState(null)

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
          <DriverCardList
            records={rows}
            vehicles={vehicles}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />
        ) : (
          <StandardGrid
            ref={gridRef}
            keyExpr="id"
            dataSource={rows}
            noDataText="Sin conductores aún."
          >
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
                  <DriverDetail data={data} vehicles={vehicles} />
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
    </CCard>
  )
}

export default Conductores
