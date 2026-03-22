import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { DataGrid, Editing, Column, Lookup, Form } from 'devextreme-react/data-grid'
import { GroupItem, SimpleItem, EmptyItem } from 'devextreme-react/form'
import {
  CCard, CCardHeader, CSpinner, CBadge, CAlert,
  CButton, CForm, CFormInput, CFormLabel, CFormSelect, CRow, CCol, CCollapse,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilX } from '@coreui/icons'
import * as taxiDriverActions from 'src/actions/taxiDriverActions'
import * as taxiVehicleActions from 'src/actions/taxiVehicleActions'
import './masters.scss'

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const EMPTY = { name: '', idNumber: '', phone: '', defaultAmount: '', defaultAmountSunday: '', defaultVehicle: '' }

const Conductores = () => {
  const dispatch = useDispatch()
  const { data: records, fetching } = useSelector((s) => s.taxiDriver)
  const { data: vehicles } = useSelector((s) => s.taxiVehicle)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState(null)
  const [savedMsg, setSavedMsg] = useState(null)

  useEffect(() => {
    dispatch(taxiDriverActions.fetchRequest())
    dispatch(taxiVehicleActions.fetchRequest())
  }, [dispatch])

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.name || !form.idNumber) {
      setError('Nombre y cédula son requeridos')
      return
    }
    setError(null)
    dispatch(taxiDriverActions.createRequest(form))
    setForm(EMPTY)
    setShowForm(false)
  }

  const handleRowUpdating = (e) => {
    const merged = { ...e.oldData, ...e.newData }
    dispatch(taxiDriverActions.updateRequest({ id: e.key, ...merged }))
    setSavedMsg(`Conductor "${merged.name}" actualizado`)
    setTimeout(() => setSavedMsg(null), 3500)
  }

  const handleRowRemoving = (e) => {
    dispatch(taxiDriverActions.deleteRequest({ id: e.key }))
  }

  const vehicleOptions = [
    { plate: '', label: '— Ninguno —' },
    ...(vehicles ?? []).map((v) => ({ plate: v.plate, label: v.plate + (v.brand ? ` · ${v.brand}` : '') })),
  ]

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
          color={showForm ? 'danger' : 'primary'}
          variant="outline"
          onClick={() => { setShowForm((p) => !p); setError(null) }}
        >
          <CIcon icon={showForm ? cilX : cilPlus} size="sm" />
          {' '}{showForm ? 'Cancelar' : 'Nuevo conductor'}
        </CButton>
      </CCardHeader>

      <CCollapse visible={showForm}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--cui-border-color)' }}>
          <CForm onSubmit={handleAdd}>
            <CRow className="g-2 align-items-end">
              <CCol sm={3}>
                <CFormLabel style={{ fontSize: 12 }}>Nombre</CFormLabel>
                <CFormInput size="sm" placeholder="Nombre completo" value={form.name} onChange={set('name')} />
              </CCol>
              <CCol sm={2}>
                <CFormLabel style={{ fontSize: 12 }}>Cédula</CFormLabel>
                <CFormInput size="sm" placeholder="123456789" value={form.idNumber} onChange={set('idNumber')} />
              </CCol>
              <CCol sm={2}>
                <CFormLabel style={{ fontSize: 12 }}>Teléfono</CFormLabel>
                <CFormInput size="sm" placeholder="300 000 0000" value={form.phone} onChange={set('phone')} />
              </CCol>
              <CCol sm={2}>
                <CFormLabel style={{ fontSize: 12 }}>Liq. normal</CFormLabel>
                <CFormInput size="sm" type="number" placeholder="85000" value={form.defaultAmount} onChange={set('defaultAmount')} />
              </CCol>
              <CCol sm={2}>
                <CFormLabel style={{ fontSize: 12 }}>Liq. domingo</CFormLabel>
                <CFormInput size="sm" type="number" placeholder="0" value={form.defaultAmountSunday} onChange={set('defaultAmountSunday')} />
              </CCol>
              <CCol sm={2}>
                <CFormLabel style={{ fontSize: 12 }}>Taxi por defecto</CFormLabel>
                <CFormSelect size="sm" value={form.defaultVehicle} onChange={set('defaultVehicle')}>
                  <option value="">— Ninguno —</option>
                  {(vehicles ?? []).map((v) => (
                    <option key={v.id} value={v.plate}>{v.plate}{v.brand ? ` · ${v.brand}` : ''}</option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol sm={2}>
                <CButton type="submit" size="sm" color="primary" disabled={fetching} style={{ width: '100%' }}>
                  {fetching ? <CSpinner size="sm" /> : 'Guardar'}
                </CButton>
              </CCol>
            </CRow>
            {error && <div style={{ marginTop: 8, fontSize: 12, color: '#e03131' }}>{error}</div>}
          </CForm>
        </div>
      </CCollapse>

      {savedMsg && (
        <CAlert color="success" style={{ margin: '12px 16px 0', fontSize: 13 }}>
          ✓ {savedMsg}
        </CAlert>
      )}
      {fetching && !records ? (
        <div className="d-flex justify-content-center py-5"><CSpinner color="primary" /></div>
      ) : (
        <DataGrid
          className="masters-grid"
          style={{ margin: 16 }}
          keyExpr="id"
          dataSource={rows}
          showBorders={true}
          columnAutoWidth={true}
          columnHidingEnabled={true}
          allowColumnResizing={true}
          rowAlternationEnabled={true}
          hoverStateEnabled={true}
          noDataText="Sin conductores aún."
          onRowUpdating={handleRowUpdating}
          onRowRemoving={handleRowRemoving}
        >
          <Editing allowUpdating={true} allowDeleting={true} mode="form">
            <Form colCount={3}>
              <GroupItem caption="Datos personales" colCount={3} colSpan={3}>
                <SimpleItem dataField="name" label={{ text: 'Nombre' }} />
                <SimpleItem dataField="idNumber" label={{ text: 'Cédula' }} />
                <SimpleItem dataField="phone" label={{ text: 'Teléfono' }} />
              </GroupItem>
              <GroupItem caption="Liquidación por defecto" colCount={3} colSpan={3}>
                <SimpleItem dataField="defaultAmount" label={{ text: 'Liq. normal' }} editorType="dxNumberBox" />
                <SimpleItem dataField="defaultAmountSunday" label={{ text: 'Liq. domingo' }} editorType="dxNumberBox" />
                <SimpleItem
                  dataField="defaultVehicle"
                  label={{ text: 'Taxi por defecto' }}
                  editorType="dxSelectBox"
                  editorOptions={{ dataSource: vehicleOptions, valueExpr: 'plate', displayExpr: 'label' }}
                />
              </GroupItem>
            </Form>
          </Editing>
          <Column dataField="name" caption="Nombre" minWidth={150} />
          <Column dataField="idNumber" caption="Cédula" width={130}
            cellRender={({ value }) => (
              <span style={{ fontFamily: 'monospace' }}>{value}</span>
            )}
          />
          <Column dataField="phone" caption="Teléfono" width={130} hidingPriority={1} />
          <Column
            dataField="defaultAmount"
            caption="Liq. normal"
            dataType="number"
            width={130}
            hidingPriority={2}
            cellRender={({ value }) => (
              <span style={{ fontWeight: 600 }}>{value ? fmt(value) : '—'}</span>
            )}
          />
          <Column
            dataField="defaultAmountSunday"
            caption="Liq. domingo"
            dataType="number"
            width={130}
            hidingPriority={3}
            cellRender={({ value }) => (
              <span style={{ fontWeight: 600 }}>{value ? fmt(value) : '—'}</span>
            )}
          />
          <Column
            dataField="defaultVehicle"
            caption="Taxi por defecto"
            width={150}
            hidingPriority={4}
            cellRender={({ value }) => (
              <span style={{ fontFamily: 'monospace' }}>{value || '—'}</span>
            )}
          >
            <Lookup dataSource={vehicleOptions} valueExpr="plate" displayExpr="label" />
          </Column>
        </DataGrid>
      )}
    </CCard>
  )
}

export default Conductores
