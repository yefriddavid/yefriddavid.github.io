import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CBadge,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CCol,
  CCollapse,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPlus, cilX } from '@coreui/icons'
import { getLiquidaciones, addLiquidacion, deleteLiquidacion } from 'src/services/providers/firebase/taxis'

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const today = () => new Date().toISOString().split('T')[0]

const EMPTY = { conductor: '', placa: '', valor: '', fecha: today() }

const Taxis = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getLiquidaciones()
      .then(setRecords)
      .finally(() => setLoading(false))
  }, [])

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.conductor || !form.placa || !form.valor || !form.fecha) {
      setError('Todos los campos son requeridos')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const id = await addLiquidacion(form)
      const newRecord = {
        id,
        conductor: form.conductor,
        placa: form.placa.toUpperCase(),
        valor: Number(form.valor),
        fecha: form.fecha,
      }
      setRecords((prev) => [newRecord, ...prev])
      setForm(EMPTY)
      setShowForm(false)
    } catch {
      setError('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('¿Eliminar esta liquidación?')) return
    await deleteLiquidacion(id)
    setRecords((prev) => prev.filter((r) => r.id !== id))
  }

  const total = records.reduce((acc, r) => acc + (r.valor || 0), 0)

  // resumen por conductor
  const porConductor = Object.values(
    records.reduce((acc, r) => {
      const k = r.conductor
      if (!acc[k]) acc[k] = { conductor: k, count: 0, total: 0 }
      acc[k].count += 1
      acc[k].total += r.valor || 0
      return acc
    }, {}),
  ).sort((a, b) => b.total - a.total)

  return (
    <>
      {/* Resumen */}
      <CRow className="mb-3">
        <CCol sm={4}>
          <CCard className="text-center">
            <CCardBody>
              <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 4 }}>Total liquidado</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{fmt(total)}</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={8}>
          <CCard>
            <CCardBody style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 6 }}>Por conductor</div>
              {loading ? (
                <CSpinner size="sm" />
              ) : porConductor.length === 0 ? (
                <span style={{ fontSize: 13, color: 'var(--cui-secondary-color)' }}>Sin registros</span>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {porConductor.map((c) => (
                    <div key={c.conductor} style={{
                      background: 'var(--cui-primary-bg-subtle, #e7f1ff)',
                      borderRadius: 8,
                      padding: '4px 12px',
                      fontSize: 13,
                    }}>
                      <strong>{c.conductor}</strong>
                      <span style={{ color: 'var(--cui-secondary-color)', marginLeft: 8 }}>
                        {c.count} liq · {fmt(c.total)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Tabla */}
      <CCard>
        <CCardHeader className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <strong>Liquidaciones de taxis</strong>
            <CBadge color="secondary">{records.length}</CBadge>
          </div>
          <CButton
            size="sm"
            color={showForm ? 'danger' : 'primary'}
            variant="outline"
            onClick={() => { setShowForm((p) => !p); setError(null) }}
          >
            <CIcon icon={showForm ? cilX : cilPlus} size="sm" />
            {' '}{showForm ? 'Cancelar' : 'Nueva liquidación'}
          </CButton>
        </CCardHeader>

        <CCollapse visible={showForm}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--cui-border-color)' }}>
            <CForm onSubmit={handleAdd}>
              <CRow className="g-2 align-items-end">
                <CCol sm={3}>
                  <CFormLabel style={{ fontSize: 12 }}>Conductor</CFormLabel>
                  <CFormInput
                    size="sm"
                    placeholder="Nombre"
                    value={form.conductor}
                    onChange={set('conductor')}
                  />
                </CCol>
                <CCol sm={2}>
                  <CFormLabel style={{ fontSize: 12 }}>Placa</CFormLabel>
                  <CFormInput
                    size="sm"
                    placeholder="ABC-123"
                    value={form.placa}
                    onChange={set('placa')}
                  />
                </CCol>
                <CCol sm={2}>
                  <CFormLabel style={{ fontSize: 12 }}>Valor</CFormLabel>
                  <CFormInput
                    size="sm"
                    type="number"
                    placeholder="0"
                    value={form.valor}
                    onChange={set('valor')}
                  />
                </CCol>
                <CCol sm={2}>
                  <CFormLabel style={{ fontSize: 12 }}>Fecha</CFormLabel>
                  <CFormInput
                    size="sm"
                    type="date"
                    value={form.fecha}
                    onChange={set('fecha')}
                  />
                </CCol>
                <CCol sm={2}>
                  <CButton type="submit" size="sm" color="primary" disabled={saving} style={{ width: '100%' }}>
                    {saving ? <CSpinner size="sm" /> : 'Guardar'}
                  </CButton>
                </CCol>
              </CRow>
              {error && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#e03131' }}>{error}</div>
              )}
            </CForm>
          </div>
        </CCollapse>

        <CCardBody style={{ overflowX: 'auto', padding: 0 }}>
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <CSpinner color="primary" />
            </div>
          ) : records.length === 0 ? (
            <p className="text-body-secondary text-center py-4">Sin liquidaciones aún.</p>
          ) : (
            <CTable small hover responsive style={{ marginBottom: 0 }}>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Fecha</CTableHeaderCell>
                  <CTableHeaderCell>Conductor</CTableHeaderCell>
                  <CTableHeaderCell>Placa</CTableHeaderCell>
                  <CTableHeaderCell>Valor</CTableHeaderCell>
                  <CTableHeaderCell />
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {records.map((r) => (
                  <CTableRow key={r.id}>
                    <CTableDataCell style={{ whiteSpace: 'nowrap' }}>{r.fecha}</CTableDataCell>
                    <CTableDataCell>{r.conductor}</CTableDataCell>
                    <CTableDataCell style={{ fontFamily: 'monospace' }}>{r.placa}</CTableDataCell>
                    <CTableDataCell style={{ fontWeight: 600 }}>{fmt(r.valor)}</CTableDataCell>
                    <CTableDataCell>
                      <button
                        onClick={(e) => handleDelete(r.id, e)}
                        style={{ background: 'none', border: 'none', color: '#e03131', cursor: 'pointer', padding: '2px 6px' }}
                        title="Eliminar"
                      >
                        <CIcon icon={cilTrash} size="sm" />
                      </button>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default Taxis
