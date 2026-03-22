import React, { useEffect, useState } from 'react'
import { DataGrid, Editing, Column, Button as GButton } from 'devextreme-react/data-grid'
import {
  CCard, CCardHeader, CSpinner, CBadge,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, CForm, CFormInput, CFormLabel, CRow, CCol, CCollapse,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilX, cilCalendar } from '@coreui/icons'
import './masters.scss'
import {
  getVehicles,
  addVehicle,
  updateVehicle,
  updateRestrictions,
  deleteVehicle,
} from 'src/services/providers/firebase/taxiVehiculos'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const EMPTY = { plate: '', brand: '', model: '', year: '' }

const emptyRestrictions = () =>
  Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i + 1, { d1: '', d2: '' }]))

const currentMonthSummary = (restrictions) => {
  if (!restrictions) return '—'
  const month = new Date().getMonth() + 1
  const entry = restrictions[month]
  if (!entry || (!entry.d1 && !entry.d2)) return '—'
  return [entry.d1, entry.d2].filter(Boolean).map((d) => `día ${d}`).join(', ')
}

const Vehiculos = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [restrictModal, setRestrictModal] = useState(null)
  const [restrictForm, setRestrictForm] = useState(emptyRestrictions())
  const [restrictSaving, setRestrictSaving] = useState(false)

  useEffect(() => {
    getVehicles().then(setRecords).finally(() => setLoading(false))
  }, [])

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.plate || !form.brand) {
      setError('Placa y marca son requeridas')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const id = await addVehicle(form)
      setRecords((prev) =>
        [...prev, { id, ...form, plate: form.plate.toUpperCase(), restrictions: {} }]
          .sort((a, b) => a.plate.localeCompare(b.plate)),
      )
      setForm(EMPTY)
      setShowForm(false)
    } catch {
      setError('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleRowUpdating = async (e) => {
    const merged = { ...e.oldData, ...e.newData }
    e.cancel = updateVehicle(e.key, merged).then(() => {
      setRecords((prev) =>
        prev
          .map((r) => r.id === e.key ? { ...r, ...merged, plate: merged.plate?.toUpperCase() ?? r.plate } : r)
          .sort((a, b) => a.plate.localeCompare(b.plate)),
      )
      return false // don't cancel
    })
  }

  const handleRowRemoving = (e) => {
    e.cancel = deleteVehicle(e.key).then(() => false)
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

  const setRestrictDay = (month, field) => (e) =>
    setRestrictForm((prev) => ({ ...prev, [month]: { ...prev[month], [field]: e.target.value } }))

  const handleSaveRestrictions = async () => {
    setRestrictSaving(true)
    try {
      const clean = Object.fromEntries(
        Object.entries(restrictForm).map(([m, v]) => [
          m,
          { d1: v.d1 ? Number(v.d1) : null, d2: v.d2 ? Number(v.d2) : null },
        ]),
      )
      await updateRestrictions(restrictModal.id, clean)
      setRecords((prev) =>
        prev.map((r) => r.id === restrictModal.id ? { ...r, restrictions: clean } : r),
      )
      setRestrictModal(null)
    } catch {
      // stay open on error
    } finally {
      setRestrictSaving(false)
    }
  }

  return (
    <>
      <CCard>
        <CCardHeader className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <strong>Vehículos</strong>
            <CBadge color="secondary">{records.length}</CBadge>
          </div>
          <CButton
            size="sm"
            color={showForm ? 'danger' : 'primary'}
            variant="outline"
            onClick={() => { setShowForm((p) => !p); setError(null) }}
          >
            <CIcon icon={showForm ? cilX : cilPlus} size="sm" />
            {' '}{showForm ? 'Cancelar' : 'Nuevo vehículo'}
          </CButton>
        </CCardHeader>

        <CCollapse visible={showForm}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--cui-border-color)' }}>
            <CForm onSubmit={handleAdd}>
              <CRow className="g-2 align-items-end">
                <CCol sm={2}>
                  <CFormLabel style={{ fontSize: 12 }}>Placa</CFormLabel>
                  <CFormInput size="sm" placeholder="ABC-123" value={form.plate} onChange={set('plate')} />
                </CCol>
                <CCol sm={3}>
                  <CFormLabel style={{ fontSize: 12 }}>Marca</CFormLabel>
                  <CFormInput size="sm" placeholder="Renault" value={form.brand} onChange={set('brand')} />
                </CCol>
                <CCol sm={3}>
                  <CFormLabel style={{ fontSize: 12 }}>Modelo</CFormLabel>
                  <CFormInput size="sm" placeholder="Logan" value={form.model} onChange={set('model')} />
                </CCol>
                <CCol sm={2}>
                  <CFormLabel style={{ fontSize: 12 }}>Año</CFormLabel>
                  <CFormInput size="sm" type="number" placeholder="2020" value={form.year} onChange={set('year')} />
                </CCol>
                <CCol sm={2}>
                  <CButton type="submit" size="sm" color="primary" disabled={saving} style={{ width: '100%' }}>
                    {saving ? <CSpinner size="sm" /> : 'Guardar'}
                  </CButton>
                </CCol>
              </CRow>
              {error && <div style={{ marginTop: 8, fontSize: 12, color: '#e03131' }}>{error}</div>}
            </CForm>
          </div>
        </CCollapse>

        {loading ? (
          <div className="d-flex justify-content-center py-5"><CSpinner color="primary" /></div>
        ) : (
          <DataGrid
            className="masters-grid"
            dataSource={records}
            keyExpr="id"
            showBorders={true}
            columnAutoWidth={true}
            columnHidingEnabled={true}
            allowColumnResizing={true}
            rowAlternationEnabled={true}
            hoverStateEnabled={true}
            onRowUpdating={handleRowUpdating}
            onRowRemoving={handleRowRemoving}
          >
            <Editing allowUpdating={true} allowDeleting={true} mode="row" />
            <Column dataField="plate" caption="Placa" />
            <Column dataField="brand" caption="Marca" />
            <Column dataField="model" caption="Modelo" />
            <Column dataField="year" caption="Año" dataType="number" width={80} />
            <Column
              caption="P&P este mes"
              allowEditing={false}
              hidingPriority={1}
              cellRender={({ data }) => currentMonthSummary(data.restrictions)}
            />
            <Column type="buttons" width={100}>
              <GButton
                hint="Pico y placa"
                icon="event"
                onClick={(e) => openRestrictModal(e.row.data)}
              />
              <GButton name="edit" />
              <GButton name="delete" />
            </Column>
          </DataGrid>
        )}
      </CCard>

      <CModal visible={!!restrictModal} onClose={() => setRestrictModal(null)} size="lg">
        <CModalHeader>
          <CModalTitle>Pico y placa — {restrictModal?.plate}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CTable small bordered style={{ marginBottom: 0 }}>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell style={{ width: 140 }}>Mes</CTableHeaderCell>
                <CTableHeaderCell>Día 1</CTableHeaderCell>
                <CTableHeaderCell>Día 2</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {MONTHS.map((name, i) => {
                const m = i + 1
                return (
                  <CTableRow key={m}>
                    <CTableDataCell style={{ fontWeight: 500 }}>{name}</CTableDataCell>
                    <CTableDataCell>
                      <CFormInput
                        size="sm"
                        type="number"
                        min={1}
                        max={31}
                        placeholder="—"
                        value={restrictForm[m]?.d1 ?? ''}
                        onChange={setRestrictDay(m, 'd1')}
                        style={{ width: 80 }}
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <CFormInput
                        size="sm"
                        type="number"
                        min={1}
                        max={31}
                        placeholder="—"
                        value={restrictForm[m]?.d2 ?? ''}
                        onChange={setRestrictDay(m, 'd2')}
                        style={{ width: 80 }}
                      />
                    </CTableDataCell>
                  </CTableRow>
                )
              })}
            </CTableBody>
          </CTable>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" size="sm" onClick={() => setRestrictModal(null)}>
            Cancelar
          </CButton>
          <CButton color="primary" size="sm" disabled={restrictSaving} onClick={handleSaveRestrictions}>
            {restrictSaving ? <CSpinner size="sm" /> : 'Guardar'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Vehiculos
