import React, { useEffect, useState } from 'react'
import {
  CCard, CCardBody, CCardHeader, CSpinner, CBadge,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, CForm, CFormInput, CFormLabel, CRow, CCol, CCollapse,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPlus, cilX, cilPencil, cilCheck } from '@coreui/icons'
import {
  getConductores,
  addConductor,
  updateConductor,
  deleteConductor,
} from 'src/services/providers/firebase/taxiConductores'

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const EMPTY = { nombre: '', cedula: '', telefono: '', defaultAmount: '' }

const Conductores = () => {
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
    getConductores().then(setRecords).finally(() => setLoading(false))
  }, [])

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))
  const setEdit = (field) => (e) => setEditForm((p) => ({ ...p, [field]: e.target.value }))

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.nombre || !form.cedula) {
      setError('Nombre y cédula son requeridos')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const id = await addConductor(form)
      setRecords((prev) =>
        [...prev, { id, ...form, defaultAmount: form.defaultAmount ? Number(form.defaultAmount) : null }]
          .sort((a, b) => a.nombre.localeCompare(b.nombre)),
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
      nombre: r.nombre || '',
      cedula: r.cedula || '',
      telefono: r.telefono || '',
      defaultAmount: r.defaultAmount != null ? String(r.defaultAmount) : '',
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(EMPTY)
  }

  const handleUpdate = async (id) => {
    if (!editForm.nombre || !editForm.cedula) return
    setEditSaving(true)
    try {
      await updateConductor(id, editForm)
      setRecords((prev) =>
        prev
          .map((r) =>
            r.id === id
              ? { ...r, ...editForm, defaultAmount: editForm.defaultAmount ? Number(editForm.defaultAmount) : null }
              : r,
          )
          .sort((a, b) => a.nombre.localeCompare(b.nombre)),
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
    if (!window.confirm('¿Eliminar este conductor?')) return
    await deleteConductor(id)
    setRecords((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <CCard>
      <CCardHeader className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <strong>Conductores</strong>
          <CBadge color="secondary">{records.length}</CBadge>
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
                <CFormInput size="sm" placeholder="Nombre completo" value={form.nombre} onChange={set('nombre')} />
              </CCol>
              <CCol sm={2}>
                <CFormLabel style={{ fontSize: 12 }}>Cédula</CFormLabel>
                <CFormInput size="sm" placeholder="123456789" value={form.cedula} onChange={set('cedula')} />
              </CCol>
              <CCol sm={2}>
                <CFormLabel style={{ fontSize: 12 }}>Teléfono</CFormLabel>
                <CFormInput size="sm" placeholder="300 000 0000" value={form.telefono} onChange={set('telefono')} />
              </CCol>
              <CCol sm={3}>
                <CFormLabel style={{ fontSize: 12 }}>Valor liquidación</CFormLabel>
                <CFormInput size="sm" type="number" placeholder="0" value={form.defaultAmount} onChange={set('defaultAmount')} />
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
          <p className="text-body-secondary text-center py-4">Sin conductores aún.</p>
        ) : (
          <CTable small hover responsive style={{ marginBottom: 0 }}>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Nombre</CTableHeaderCell>
                <CTableHeaderCell>Cédula</CTableHeaderCell>
                <CTableHeaderCell>Teléfono</CTableHeaderCell>
                <CTableHeaderCell>Valor liquidación</CTableHeaderCell>
                <CTableHeaderCell />
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {records.map((r) =>
                editingId === r.id ? (
                  <CTableRow key={r.id} style={{ background: 'var(--cui-primary-bg-subtle, #e7f1ff)' }}>
                    <CTableDataCell>
                      <CFormInput size="sm" value={editForm.nombre} onChange={setEdit('nombre')} />
                    </CTableDataCell>
                    <CTableDataCell>
                      <CFormInput size="sm" value={editForm.cedula} onChange={setEdit('cedula')} />
                    </CTableDataCell>
                    <CTableDataCell>
                      <CFormInput size="sm" value={editForm.telefono} onChange={setEdit('telefono')} />
                    </CTableDataCell>
                    <CTableDataCell>
                      <CFormInput size="sm" type="number" value={editForm.defaultAmount} onChange={setEdit('defaultAmount')} />
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
                    <CTableDataCell style={{ fontWeight: 500 }}>{r.nombre}</CTableDataCell>
                    <CTableDataCell style={{ fontFamily: 'monospace' }}>{r.cedula}</CTableDataCell>
                    <CTableDataCell>{r.telefono || '—'}</CTableDataCell>
                    <CTableDataCell style={{ fontWeight: 600 }}>{r.defaultAmount ? fmt(r.defaultAmount) : '—'}</CTableDataCell>
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

export default Conductores
