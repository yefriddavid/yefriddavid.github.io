import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { DataGrid, Column, Lookup, MasterDetail } from 'devextreme-react/data-grid'
import {
  CCard, CCardHeader, CCardBody, CSpinner, CBadge, CAlert,
  CButton, CCollapse,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilX, cilTrash } from '@coreui/icons'
import * as taxiDriverActions from 'src/actions/Taxi/taxiDriverActions'
import * as taxiVehicleActions from 'src/actions/Taxi/taxiVehicleActions'
import StandardForm, { StandardField, SF } from 'src/components/App/StandardForm'
import DetailPanel, { DetailSection, DetailRow } from 'src/components/App/DetailPanel'
import './masters.scss'

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const EMPTY = { name: '', idNumber: '', phone: '', defaultAmount: '', defaultAmountSunday: '', defaultVehicle: '' }

const DriverDetail = ({ data, vehicles }) => {
  const { t } = useTranslation()
  const vehicle = (vehicles ?? []).find((v) => v.plate === data.defaultVehicle)
  const vehicleLabel = vehicle
    ? `${vehicle.plate}${vehicle.brand ? ` · ${vehicle.brand}` : ''}`
    : data.defaultVehicle || null

  return (
    <DetailPanel columns={2}>
      <DetailSection title={t('taxis.drivers.fields.personalData')}>
        <DetailRow label={t('taxis.drivers.fields.name')} value={data.name} />
        <DetailRow label={t('taxis.drivers.fields.idNumber')} value={data.idNumber} mono />
        <DetailRow label={t('taxis.drivers.fields.phone')} value={data.phone} />
      </DetailSection>
      <DetailSection title={t('taxis.drivers.fields.defaultSettlement')}>
        <DetailRow label={t('taxis.drivers.fields.defaultAmount')} value={data.defaultAmount ? fmt(data.defaultAmount) : null} />
        <DetailRow label={t('taxis.drivers.fields.defaultAmountSunday')} value={data.defaultAmountSunday ? fmt(data.defaultAmountSunday) : null} />
        <DetailRow label={t('taxis.drivers.fields.defaultVehicle')} value={vehicleLabel} mono />
      </DetailSection>
    </DetailPanel>
  )
}

const DriverForm = ({ initial, vehicles, onSave, onCancel, saving, title, subtitle }) => {
  const { t } = useTranslation()
  const [form, setForm] = useState(initial)
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  return (
    <StandardForm
      title={title}
      subtitle={subtitle}
      onCancel={onCancel}
      onSave={() => onSave(form)}
      saving={saving}
    >
      <StandardField label={t('taxis.drivers.fields.name')}>
        <input className={SF.input} placeholder={t('taxis.drivers.placeholders.name')} value={form.name} onChange={set('name')} />
      </StandardField>
      <StandardField label={t('taxis.drivers.fields.idNumber')}>
        <input className={SF.input} placeholder="123456789" value={form.idNumber} onChange={set('idNumber')} />
      </StandardField>
      <StandardField label={t('taxis.drivers.fields.phone')}>
        <input className={SF.input} placeholder={t('taxis.drivers.placeholders.phone')} value={form.phone} onChange={set('phone')} />
      </StandardField>
      <StandardField label={t('taxis.drivers.fields.defaultAmount')}>
        <input className={SF.input} type="number" placeholder={t('taxis.drivers.placeholders.defaultAmount')} value={form.defaultAmount} onChange={set('defaultAmount')} />
      </StandardField>
      <StandardField label={t('taxis.drivers.fields.defaultAmountSunday')}>
        <input className={SF.input} type="number" placeholder={t('taxis.drivers.placeholders.defaultAmountSunday')} value={form.defaultAmountSunday} onChange={set('defaultAmountSunday')} />
      </StandardField>
      <StandardField label={t('taxis.drivers.fields.defaultVehicle')}>
        <select className={SF.select} value={form.defaultVehicle} onChange={set('defaultVehicle')}>
          <option value="">{t('taxis.drivers.none')}</option>
          {(vehicles ?? []).map((v) => (
            <option key={v.id} value={v.plate}>{v.plate}{v.brand ? ` · ${v.brand}` : ''}</option>
          ))}
        </select>
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
    { plate: '', label: t('taxis.drivers.none') },
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
    setSavedMsg(t('taxis.drivers.updated', { name: form.name }))
    setTimeout(() => setSavedMsg(null), 3500)
    gridRef.current?.instance()?.collapseRow(editingRow.id)
    setEditingRow(null)
  }

  const handleEditCancel = () => {
    gridRef.current?.instance()?.collapseRow(editingRow.id)
    setEditingRow(null)
  }

  const handleDelete = (id) => {
    if (!window.confirm(t('taxis.drivers.confirmDelete'))) return
    dispatch(taxiDriverActions.deleteRequest({ id }))
  }

  const rows = records ?? []

  return (
    <CCard>
      <CCardHeader className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <strong>{t('taxis.drivers.title')}</strong>
          <CBadge color="secondary">{rows.length}</CBadge>
        </div>
        <CButton
          size="sm"
          color={showCreate ? 'danger' : 'primary'}
          variant="outline"
          onClick={() => setShowCreate((p) => !p)}
        >
          <CIcon icon={showCreate ? cilX : cilPlus} size="sm" />
          {' '}{showCreate ? t('common.cancel') : t('taxis.drivers.newDriver')}
        </CButton>
      </CCardHeader>

      <CCollapse visible={showCreate}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--cui-border-color)', maxWidth: 380 }}>
          <DriverForm
            initial={EMPTY}
            vehicles={vehicles}
            title={t('taxis.drivers.newDriver')}
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
          <DataGrid
            ref={gridRef}
            className="masters-grid"
            keyExpr="id"
            dataSource={rows}
            showBorders={true}
            columnAutoWidth={true}
            columnHidingEnabled={true}
            allowColumnResizing={true}
            rowAlternationEnabled={true}
            hoverStateEnabled={true}
            noDataText={t('taxis.drivers.noData')}
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
              caption=""
              width={70}
              allowSorting={false}
              allowResizing={false}
              cellRender={({ data }) => (
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => handleEdit(data)}
                    style={{ background: 'none', border: 'none', color: 'var(--cui-primary)', cursor: 'pointer', padding: '2px 6px' }}
                    title={t('common.edit')}
                  >✎</button>
                  <button
                    onClick={() => handleDelete(data.id)}
                    style={{ background: 'none', border: 'none', color: '#e03131', cursor: 'pointer', padding: '2px 6px' }}
                    title={t('common.remove')}
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
                        title={t('taxis.drivers.editDriver')}
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
          </DataGrid>
        )}
      </CCardBody>
    </CCard>
  )
}

export default Conductores
