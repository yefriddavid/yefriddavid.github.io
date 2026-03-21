import React, { useEffect, useState } from 'react'
import {
  CCard, CCardBody, CCardHeader, CSpinner, CBadge,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, CForm, CFormInput, CFormLabel, CRow, CCol, CCollapse,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPlus, cilX, cilPencil, cilCheck } from '@coreui/icons'
import {
  getVehiculos,
  addVehiculo,
  updateVehiculo,
  deleteVehiculo,
} from 'src/services/providers/firebase/taxiVehiculos'

const EMPTY = { placa: '', marca: '', modelo: '', anio: '' }

const Vehiculos = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(EMPTY)
  const [editSaving, setEditSaving] = useState(false)

  useEffect(() => {
    getVehiculos().then(setRecords).finally(() => setLoading(false))
  }, [])

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))
  const setEdit = (field) => (e) => setEditForm((p) => ({ ...p, [field]: e.target.value }))

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.placa || !form.marca) {
      setError('Placa y marca son requeridas')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const id = await addVehiculo(form)
      const newRecord = { id, ...form, placa: form.placa.toUpperCase() }
      setRecords((prev) =>
        [...prev, newRecord].sort((a, b) => a.placa.localeCompare(b.placa)),
      )
      setForm(EMPTY)
      setShowForm(false)
    } catch {
      setError('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (r) => {
    setEditingId(r.id)
    setEditForm({
      placa: r.placa || '',
      marca: r.marca || '',
      modelo: r.modelo || '',
      anio: r.anio ? String(r.anio) : '',
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(EMPTY)
  }

  const handleUpdate = async (id) => {
    if (!editForm.placa || !editForm.marca) return
    setEditSaving(true)
    try {
      await updateVehiculo(id, editForm)
      setRecords((prev) =>
        prev
          .map((r) =>
            r.id === id ? { ...r, ...editForm, placa: editForm.placa.toUpperCase() } : r,
          )
          .sort((a, b) => a.placa.localeCompare(b.placa)),
      )
      setEditingId(null)
    } catch {
      // keep editing open on error
    } finally {
      setEditSaving(false)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('¿Eliminar este vehículo?')) return
    await deleteVehiculo(id)
    setRecords((prev) => prev.filter((r) => r.id !== id))
  }

  return (
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
                <CFormInput size="sm" placeholder="ABC-123" value={form.placa} onChange={set('placa')} />
              </CCol>
              <CCol sm={3}>
                <CFormLabel style={{ fontSize: 12 }}>Marca</CFormLabel>
                <CFormInput size="sm" placeholder="Renault" value={form.marca} onChange={set('marca')} />
              </CCol>
              <CCol sm={3}>
                <CFormLabel style={{ fontSize: 12 }}>Modelo</CFormLabel>
                <CFormInput size="sm" placeholder="Logan" value={form.modelo} onChange={set('modelo')} />
              </CCol>
              <CCol sm={2}>
                <CFormLabel style={{ fontSize: 12 }}>Año</CFormLabel>
                <CFormInput size="sm" type="number" placeholder="2020" value={form.anio} onChange={set('anio')} />
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

      <CCardBody style={{ overflowX: 'auto', padding: 0 }}>
        {loading ? (
          <div className="d-flex justify-content-center py-5"><CSpinner color="primary" /></div>
        ) : records.length === 0 ? (
          <p className="text-body-secondary text-center py-4">Sin vehículos aún.</p>
        ) : (
          <CTable small hover responsive style={{ marginBottom: 0 }}>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Placa</CTableHeaderCell>
                <CTableHeaderCell>Marca</CTableHeaderCell>
                <CTableHeaderCell>Modelo</CTableHeaderCell>
                <CTableHeaderCell>Año</CTableHeaderCell>
                <CTableHeaderCell />
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {records.map((r) =>
                editingId === r.id ? (
                  <CTableRow key={r.id} style={{ background: 'var(--cui-primary-bg-subtle, #e7f1ff)' }}>
                    <CTableDataCell>
                      <CFormInput size="sm" value={editForm.placa} onChange={setEdit('placa')} />
                    </CTableDataCell>
                    <CTableDataCell>
                      <CFormInput size="sm" value={editForm.marca} onChange={setEdit('marca')} />
                    </CTableDataCell>
                    <CTableDataCell>
                      <CFormInput size="sm" value={editForm.modelo} onChange={setEdit('modelo')} />
                    </CTableDataCell>
                    <CTableDataCell>
                      <CFormInput size="sm" type="number" value={editForm.anio} onChange={setEdit('anio')} />
                    </CTableDataCell>
                    <CTableDataCell style={{ whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => handleUpdate(r.id)}
                        disabled={editSaving}
                        style={{ background: 'none', border: 'none', color: '#2f9e44', cursor: 'pointer', padding: '2px 6px' }}
                        title="Guardar"
                      >
                        {editSaving ? <CSpinner size="sm" /> : <CIcon icon={cilCheck} size="sm" />}
                      </button>
                      <button
                        onClick={cancelEdit}
                        style={{ background: 'none', border: 'none', color: '#868e96', cursor: 'pointer', padding: '2px 6px' }}
                        title="Cancelar"
                      >
                        <CIcon icon={cilX} size="sm" />
                      </button>
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  <CTableRow key={r.id}>
                    <CTableDataCell style={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.placa}</CTableDataCell>
                    <CTableDataCell>{r.marca}</CTableDataCell>
                    <CTableDataCell>{r.modelo || '—'}</CTableDataCell>
                    <CTableDataCell>{r.anio || '—'}</CTableDataCell>
                    <CTableDataCell style={{ whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => startEdit(r)}
                        style={{ background: 'none', border: 'none', color: '#1971c2', cursor: 'pointer', padding: '2px 6px' }}
                        title="Editar"
                      >
                        <CIcon icon={cilPencil} size="sm" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(r.id, e)}
                        style={{ background: 'none', border: 'none', color: '#e03131', cursor: 'pointer', padding: '2px 6px' }}
                        title="Eliminar"
                      >
                        <CIcon icon={cilTrash} size="sm" />
                      </button>
                    </CTableDataCell>
                  </CTableRow>
                ),
              )}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  )
}

export default Vehiculos
