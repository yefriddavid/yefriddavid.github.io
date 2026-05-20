import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Column } from 'devextreme-react/data-grid'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CBadge,
} from '@coreui/react'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import StandardForm, { StandardField, SF } from 'src/components/shared/StandardForm'
import * as deviceActions from 'src/actions/domotica/domoticaDeviceActions'
import {
  DOMOTICA_DEVICE_TYPES as DEVICE_TYPES,
  DOMOTICA_DEVICE_STATUS_OPTIONS as STATUS_OPTIONS,
  DOMOTICA_DEVICE_STATUS_COLOR as STATUS_COLOR,
  DOMOTICA_DEVICE_STATUS_LABEL as STATUS_LABEL,
} from 'src/constants/domotica'
import './Devices.scss'
import Spinner from 'src/components/shared/Spinner'

const EMPTY_FORM = {
  name: '',
  type: '',
  location: '',
  status: 'active',
  ipAddress: '',
  notes: '',
  internalId: '',
}

const generateInternalId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const fieldError = (err) =>
  err ? (
    <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 2, display: 'block' }}>
      {err.message}
    </span>
  ) : null

const DeviceForm = ({ initial, onSave, onCancel, saving }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: initial })

  return (
    <StandardForm
      title={initial.id ? 'Editar dispositivo' : 'Nuevo dispositivo'}
      subtitle={initial.id ? `ID: ${initial.id}` : undefined}
      onCancel={onCancel}
      onSave={handleSubmit(onSave)}
      saving={saving}
    >
      <StandardField label="Nombre *">
        <input
          className={SF.input}
          type="text"
          placeholder="esp8266-battery"
          autoFocus
          {...register('name', { required: 'El nombre es obligatorio' })}
        />
        {fieldError(errors.name)}
      </StandardField>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        <StandardField label="Tipo">
          <select className={SF.select} {...register('type')}>
            <option value="">— Seleccionar —</option>
            {DEVICE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </StandardField>
        <StandardField label="Estado">
          <select className={SF.select} {...register('status')}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </StandardField>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        <StandardField label="IP">
          <input
            className={SF.input}
            type="text"
            placeholder="192.168.1.100"
            {...register('ipAddress')}
          />
        </StandardField>
        <StandardField label="Ubicación">
          <input
            className={SF.input}
            type="text"
            placeholder="Terraza, sala…"
            {...register('location')}
          />
        </StandardField>
      </div>

      <StandardField label="ID Interno">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            className={SF.input}
            type="text"
            placeholder="ej. aB3xZ9k"
            maxLength={7}
            style={{ fontFamily: 'monospace', letterSpacing: '0.08em' }}
            {...register('internalId')}
          />
          <button
            type="button"
            style={{
              flexShrink: 0,
              padding: '7px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: '1px solid var(--cui-border-color)',
              borderRadius: 6,
              background: 'var(--cui-tertiary-bg)',
              color: 'var(--cui-body-color)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
            onClick={() => setValue('internalId', generateInternalId())}
          >
            Generar
          </button>
        </div>
      </StandardField>

      <StandardField label="Notas">
        <textarea
          className={SF.textarea}
          rows={2}
          placeholder="Observaciones opcionales"
          {...register('notes')}
        />
      </StandardField>
    </StandardForm>
  )
}

const Devices = () => {
  const dispatch = useDispatch()
  const { data, fetching } = useSelector((s) => s.domoticaDevice)

  const [modal, setModal] = useState(null) // null | { mode: 'create' | 'edit', record }
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    dispatch(deviceActions.fetchRequest())
  }, [dispatch])

  const openCreate = () => setModal({ mode: 'create', record: EMPTY_FORM })
  const openEdit = (record) => setModal({ mode: 'edit', record })
  const closeModal = () => setModal(null)

  const handleSave = (form) => {
    setSaving(true)
    if (modal.mode === 'create') {
      dispatch(deviceActions.createRequest(form))
    } else {
      dispatch(deviceActions.updateRequest({ ...form, id: modal.record.id }))
    }
    setSaving(false)
    closeModal()
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    dispatch(deviceActions.deleteRequest({ id: deleteTarget.id }))
    setDeleteTarget(null)
  }

  const statusCell = ({ value }) => (
    <CBadge color={STATUS_COLOR[value] ?? 'secondary'}>
      {STATUS_LABEL[value] ?? value ?? '—'}
    </CBadge>
  )

  const actionsCell = ({ data: row }) => (
    <div className="devices-grid__actions">
      <CButton size="sm" color="primary" variant="outline" onClick={() => openEdit(row)}>
        Editar
      </CButton>
      <CButton size="sm" color="danger" variant="outline" onClick={() => setDeleteTarget(row)}>
        Eliminar
      </CButton>
    </div>
  )

  return (
    <>
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Dispositivos IoT</strong>
          <div className="d-flex gap-2">
            <CButton
              color="primary"
              variant="outline"
              size="sm"
              disabled={fetching}
              onClick={() => dispatch(deviceActions.fetchRequest())}
            >
              {fetching ? <Spinner size="sm" /> : 'Refrescar'}
            </CButton>
            <CButton color="primary" size="sm" onClick={openCreate}>
              + Nuevo
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody style={{ padding: 0 }}>
          <StandardGrid dataSource={data ?? []} keyExpr="id">
            <Column dataField="name" caption="Nombre" minWidth={140} />
            <Column dataField="type" caption="Tipo" width={110} />
            <Column dataField="location" caption="Ubicación" width={130} />
            <Column dataField="status" caption="Estado" width={100} cellRender={statusCell} />
            <Column dataField="ipAddress" caption="IP" width={140} />
            <Column
              dataField="internalId"
              caption="ID Interno"
              width={110}
              cellRender={({ value }) =>
                value ? (
                  <span
                    style={{ fontFamily: 'monospace', letterSpacing: '0.06em', fontWeight: 600 }}
                  >
                    {value}
                  </span>
                ) : (
                  <span style={{ color: 'var(--cui-secondary-color)' }}>—</span>
                )
              }
            />
            <Column dataField="notes" caption="Notas" minWidth={160} />
            <Column
              caption="Acciones"
              width={160}
              cellRender={actionsCell}
              allowSorting={false}
              allowFiltering={false}
            />
          </StandardGrid>
        </CCardBody>
      </CCard>

      {/* Create / Edit modal */}
      <CModal visible={!!modal} onClose={closeModal} size="lg">
        <CModalBody style={{ padding: 0 }}>
          {modal && (
            <DeviceForm
              key={modal.record.id ?? 'new'}
              initial={modal.record}
              onSave={handleSave}
              onCancel={closeModal}
              saving={saving}
            />
          )}
        </CModalBody>
      </CModal>

      {/* Delete confirm modal */}
      <CModal visible={!!deleteTarget} onClose={() => setDeleteTarget(null)} size="sm">
        <CModalHeader>
          <CModalTitle>Confirmar eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>
            ¿Eliminar el dispositivo <strong>{deleteTarget?.name}</strong>? Esta acción no se puede
            deshacer.
          </p>
          <div className="d-flex gap-2 justify-content-end mt-3">
            <CButton color="secondary" variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </CButton>
            <CButton color="danger" onClick={handleDelete}>
              Eliminar
            </CButton>
          </div>
        </CModalBody>
      </CModal>
    </>
  )
}

export default Devices
