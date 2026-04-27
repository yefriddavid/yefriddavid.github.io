import React, { useEffect, useState } from 'react'
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
  CSpinner,
  CBadge,
} from '@coreui/react'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import * as deviceActions from 'src/actions/domotica/domoticaDeviceActions'
import './Devices.scss'

const EMPTY_FORM = { name: '', type: '', location: '', status: 'active', ipAddress: '', notes: '' }

const DEVICE_TYPES = ['esp8266', 'esp32', 'relay', 'sensor', 'gateway', 'otro']
const STATUS_OPTIONS = ['active', 'inactive', 'error']

const STATUS_COLOR = { active: 'success', inactive: 'secondary', error: 'danger' }
const STATUS_LABEL = { active: 'Activo', inactive: 'Inactivo', error: 'Error' }

const DeviceForm = ({ initial, title, onSave, onCancel, saving }) => {
  const [form, setForm] = useState(initial)
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div className="payment-form">
      <div className="payment-form__header">
        <span className="payment-form__title">{title}</span>
        {initial.id && <span className="payment-form__id">{initial.id}</span>}
      </div>
      <div className="payment-form__body">
        <div className="payment-form__field">
          <label className="payment-form__label">Nombre *</label>
          <input
            className="payment-form__input"
            type="text"
            value={form.name}
            onChange={set('name')}
            placeholder="esp8266-battery"
          />
        </div>
        <div className="payment-form__field">
          <label className="payment-form__label">Tipo</label>
          <select
            className="payment-form__input payment-form__input--select"
            value={form.type}
            onChange={set('type')}
          >
            <option value="">— Seleccionar —</option>
            {DEVICE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="payment-form__field">
          <label className="payment-form__label">Ubicación</label>
          <input
            className="payment-form__input"
            type="text"
            value={form.location}
            onChange={set('location')}
            placeholder="Terraza, sala…"
          />
        </div>
        <div className="payment-form__field">
          <label className="payment-form__label">Estado</label>
          <select
            className="payment-form__input payment-form__input--select"
            value={form.status}
            onChange={set('status')}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
        </div>
        <div className="payment-form__field">
          <label className="payment-form__label">IP</label>
          <input
            className="payment-form__input"
            type="text"
            value={form.ipAddress}
            onChange={set('ipAddress')}
            placeholder="192.168.1.100"
          />
        </div>
        <div className="payment-form__field">
          <label className="payment-form__label">Notas</label>
          <textarea
            className="payment-form__input payment-form__input--textarea"
            value={form.notes}
            onChange={set('notes')}
            rows={2}
            placeholder="Observaciones opcionales"
          />
        </div>
      </div>
      <div className="payment-form__actions">
        <button className="payment-form__btn payment-form__btn--cancel" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
        <button
          className="payment-form__btn payment-form__btn--save"
          onClick={() => onSave(form)}
          disabled={saving || !form.name.trim()}
        >
          {saving ? <CSpinner size="sm" /> : 'Guardar'}
        </button>
      </div>
    </div>
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
              {fetching ? <CSpinner size="sm" /> : 'Refrescar'}
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
            <Column
              dataField="status"
              caption="Estado"
              width={100}
              cellRender={statusCell}
            />
            <Column dataField="ipAddress" caption="IP" width={140} />
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
      <CModal visible={!!modal} onClose={closeModal} size="sm">
        <CModalHeader>
          <CModalTitle>{modal?.mode === 'create' ? 'Nuevo dispositivo' : 'Editar dispositivo'}</CModalTitle>
        </CModalHeader>
        <CModalBody style={{ padding: 0 }}>
          {modal && (
            <DeviceForm
              key={modal.record.id ?? 'new'}
              initial={modal.record}
              title={modal.mode === 'create' ? 'Nuevo dispositivo' : 'Editar'}
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
