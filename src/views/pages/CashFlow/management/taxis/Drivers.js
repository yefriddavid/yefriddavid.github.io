import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { Column, Lookup, MasterDetail } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/StandardGrid'
import {
  CCard, CCardHeader, CCardBody, CSpinner, CBadge, CAlert,
  CButton, CCollapse,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilX, cilTrash } from '@coreui/icons'
import * as taxiDriverActions from 'src/actions/taxiDriverActions'
import * as taxiVehicleActions from 'src/actions/taxiVehicleActions'
import StandardForm, { StandardField, SF } from 'src/components/StandardForm'
import DetailPanel, { DetailSection, DetailRow } from 'src/components/DetailPanel'
import './masters.scss'

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const EMPTY = { name: '', idNumber: '', phone: '', defaultAmount: '', defaultAmountSunday: '', defaultVehicle: '', active: true, startDate: '', endDate: '' }

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
        <DetailRow label="Liq. normal" value={data.defaultAmount ? fmt(data.defaultAmount) : null} />
        <DetailRow label="Liq. domingo" value={data.defaultAmountSunday ? fmt(data.defaultAmountSunday) : null} />
        <DetailRow label="Taxi por defecto" value={vehicleLabel} mono />
      </DetailSection>
    </DetailPanel>
  )
}

const DriverForm = ({ initial, vehicles, onSave, onCancel, saving, title, subtitle }) => {
  const [form, setForm] = useState(initial)
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))
  const toggle = (field) => () => setForm((p) => ({ ...p, [field]: !p[field] }))

  return (
    <StandardForm
      title={title}
      subtitle={subtitle}
      onCancel={onCancel}
      onSave={() => onSave(form)}
      saving={saving}
    >
      <StandardField label="Nombre">
        <input className={SF.input} placeholder="Nombre completo" value={form.name} onChange={set('name')} />
      </StandardField>
      <StandardField label="Cédula">
        <input className={SF.input} placeholder="123456789" value={form.idNumber} onChange={set('idNumber')} />
      </StandardField>
      <StandardField label="Teléfono">
        <input className={SF.input} placeholder="300 000 0000" value={form.phone} onChange={set('phone')} />
      </StandardField>
      <StandardField label="Liq. normal">
        <input className={SF.input} type="number" placeholder="85000" value={form.defaultAmount} onChange={set('defaultAmount')} />
      </StandardField>
      <StandardField label="Liq. domingo">
        <input className={SF.input} type="number" placeholder="0" value={form.defaultAmountSunday} onChange={set('defaultAmountSunday')} />
      </StandardField>
      <StandardField label="Taxi por defecto">
        <select className={SF.select} value={form.defaultVehicle} onChange={set('defaultVehicle')}>
          <option value="">— Ninguno —</option>
          {(vehicles ?? []).map((v) => (
            <option key={v.id} value={v.plate}>{v.plate}{v.brand ? ` · ${v.brand}` : ''}</option>
          ))}
        </select>
      </StandardField>
      <StandardField label="Fecha inicio">
        <input className={SF.input} type="date" value={form.startDate || ''} onChange={set('startDate')} />
      </StandardField>
      <StandardField label="Fecha fin">
        <input className={SF.input} type="date" value={form.endDate || ''} onChange={set('endDate')} />
      </StandardField>
      <StandardField label="Estado">
        <button
          type="button"
          onClick={toggle('active')}
          style={{
            padding: '4px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
            background: form.active !== false ? '#d1fae5' : '#fee2e2',
            color: form.active !== false ? '#065f46' : '#991b1b',
          }}
        >
          {form.active !== false ? '✓ Activo' : '✗ Inactivo'}
        </button>
      </StandardField>
    </StandardForm>
  )
}

const Conductores = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { data: records, fetching } = useSelector((s) => s.taxiDriver)
  const { data: vehicles } = useSelector((s) => s.taxiVehicle)
  const gridRef = useRef()

  const [showCreate, setShowCreate] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [savedMsg, setSavedMsg] = useState(null)

  useEffect(() => {
    dispatch(taxiDriverActions.fetchRequest())
    dispatch(taxiVehicleActions.fetchRequest())
  }, [dispatch])

  const vehicleOptions = [
    { plate: '', label: '— Ninguno —' },
    ...(vehicles ?? []).map((v) => ({ plate: v.plate, label: v.plate + (v.brand ? ` · ${v.brand}` : '') })),
  ]

  const handleCreate = (form) => {
    if (!form.name || !form.idNumber) return
    dispatch(taxiDriverActions.createRequest(form))
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
    dispatch(taxiDriverActions.updateRequest({ id: editingRow.id, ...form }))
    setSavedMsg(`Conductor "${form.name}" actualizado`)
    setTimeout(() => setSavedMsg(null), 3500)
    gridRef.current?.instance()?.collapseRow(editingRow.id)
    setEditingRow(null)
  }

  const handleEditCancel = () => {
    gridRef.current?.instance()?.collapseRow(editingRow.id)
    setEditingRow(null)
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
          <CIcon icon={showCreate ? cilX : cilPlus} size="sm" />
          {' '}{showCreate ? 'Cancelar' : 'Nuevo conductor'}
        </CButton>
      </CCardHeader>

      <CCollapse visible={showCreate}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--cui-border-color)', maxWidth: 380 }}>
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
        {savedMsg && (
          <CAlert color="success" style={{ fontSize: 13, marginBottom: 12 }}>✓ {savedMsg}</CAlert>
        )}
        {fetching && !records ? (
          <div className="d-flex justify-content-center py-5"><CSpinner color="primary" /></div>
        ) : (
          <StandardGrid
            ref={gridRef}
            keyExpr="id"
            dataSource={rows}
            noDataText="Sin conductores aún."
          >
            <Column dataField="name" caption={t('taxis.drivers.fields.name')} minWidth={150} />
            <Column dataField="idNumber" caption={t('taxis.drivers.fields.idNumber')} width={130}
              cellRender={({ value }) => <span style={{ fontFamily: 'monospace' }}>{value}</span>}
            />
            <Column dataField="phone" caption={t('taxis.drivers.fields.phone')} width={130} hidingPriority={1} />
            <Column
              dataField="defaultAmount"
              caption={t('taxis.drivers.fields.defaultAmount')}
              dataType="number"
              width={130}
              hidingPriority={2}
              cellRender={({ value }) => <span style={{ fontWeight: 600 }}>{value ? fmt(value) : '—'}</span>}
            />
            <Column
              dataField="defaultAmountSunday"
              caption={t('taxis.drivers.fields.defaultAmountSunday')}
              dataType="number"
              width={130}
              hidingPriority={3}
              cellRender={({ value }) => <span style={{ fontWeight: 600 }}>{value ? fmt(value) : '—'}</span>}
            />
            <Column
              dataField="defaultVehicle"
              caption={t('taxis.drivers.fields.defaultVehicle')}
              width={150}
              hidingPriority={4}
              cellRender={({ value }) => <span style={{ fontFamily: 'monospace' }}>{value || '—'}</span>}
            >
              <Lookup dataSource={vehicleOptions} valueExpr="plate" displayExpr="label" />
            </Column>
            <Column
              dataField="active"
              caption="Estado"
              width={100}
              allowSorting={true}
              cellRender={({ data }) => (
                <span style={{
                  fontSize: 11, fontWeight: 600, borderRadius: 4, padding: '2px 8px',
                  background: data.active !== false ? '#d1fae5' : '#fee2e2',
                  color: data.active !== false ? '#065f46' : '#991b1b',
                }}>
                  {data.active !== false ? '✓ Activo' : '✗ Inactivo'}
                </span>
              )}
            />
            <Column
              caption=""
              width={70}
              allowSorting={false}
              allowResizing={false}
              cellRender={({ data }) => (
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => handleEdit(data)}
                    style={{ background: 'none', border: 'none', color: 'var(--cui-primary)', cursor: 'pointer', padding: '2px 6px' }}
                    title="Editar"
                  >✎</button>
                  <button
                    onClick={() => handleDelete(data.id)}
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
                editingRow?.id === data.id
                  ? (
                    <div style={{ padding: '16px 24px', maxWidth: 380 }}>
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
                  )
                  : <DriverDetail data={data} vehicles={vehicles} />
              )}
            />
          </StandardGrid>
        )}
      </CCardBody>
    </CCard>
  )
}

export default Conductores
