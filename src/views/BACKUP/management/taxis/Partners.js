import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { Column, Summary, TotalItem } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/App/StandardGrid/Index'
import { CCard, CCardBody, CCardHeader, CSpinner, CBadge, CButton, CCollapse } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilX, cilPencil, cilTrash } from '@coreui/icons'
import StandardForm, { StandardField, SF } from 'src/components/App/StandardForm'
import * as taxiPartnerActions from 'src/actions/CashFlow/taxiPartnerActions'
import '../../../views/movements/payments/Payments.scss'

const EMPTY = { name: '', percentage: '' }

const Partners = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { data, fetching } = useSelector((s) => s.taxiPartner)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)

  const partners = data ?? []
  const loading = fetching && !data

  useEffect(() => {
    dispatch(taxiPartnerActions.fetchRequest())
  }, [dispatch])

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY)
    setShowForm(true)
  }

  const openEdit = (partner) => {
    setEditingId(partner.id)
    setForm({ name: partner.name, percentage: String(partner.percentage) })
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY)
  }

  const handleSave = () => {
    if (!form.name || form.percentage === '') return
    const percentage = Number(form.percentage)
    if (editingId) {
      dispatch(taxiPartnerActions.updateRequest({ id: editingId, name: form.name, percentage }))
    } else {
      dispatch(taxiPartnerActions.createRequest({ name: form.name, percentage }))
    }
    handleCancel()
  }

  const handleDelete = (id) => {
    if (!window.confirm('¿Eliminar este socio?')) return
    dispatch(taxiPartnerActions.deleteRequest({ id }))
  }

  return (
    <CCard>
      <CCardHeader className="d-flex align-items-center justify-content-between gap-2">
        <div className="d-flex align-items-center gap-2">
          <strong>Socios</strong>
          <CBadge color="secondary">{partners.length}</CBadge>
          {fetching && <CSpinner size="sm" />}
        </div>
        <CButton
          size="sm"
          color={showForm && !editingId ? 'danger' : 'primary'}
          variant="outline"
          onClick={showForm && !editingId ? handleCancel : openCreate}
        >
          <CIcon icon={showForm && !editingId ? cilX : cilPlus} size="sm" />
          {' '}{showForm && !editingId ? 'Cancelar' : 'Nuevo socio'}
        </CButton>
      </CCardHeader>

      <CCollapse visible={showForm}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--cui-border-color)', width: '50%' }}>
          <StandardForm
            title={editingId ? 'Editar socio' : 'Nuevo socio'}
            subtitle={editingId ? form.name : undefined}
            onCancel={handleCancel}
            onSave={handleSave}
            saving={fetching}
          >
            <StandardField label="Nombre">
              <input className={SF.input} placeholder="Nombre completo" value={form.name} onChange={set('name')} />
            </StandardField>
            <StandardField label="Porcentaje (%)">
              <input className={SF.input} type="number" min="0" max="100" step="0.1" placeholder="0" value={form.percentage} onChange={set('percentage')} />
            </StandardField>
          </StandardForm>
        </div>
      </CCollapse>

      <CCardBody style={{ padding: 0 }}>
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <CSpinner color="primary" />
          </div>
        ) : (
          <StandardGrid
            id="paymentsGrid"
            dataSource={partners}
            keyExpr="id"
            noDataText="Sin socios registrados."
          >
            <Column dataField="name" caption={t('taxis.partners.fields.name')} minWidth={200} />
            <Column
              dataField="percentage"
              caption={t('taxis.partners.fields.percentage')}
              width={150}
              dataType="number"
              cellRender={({ value }) => (
                <span style={{ fontWeight: 600 }}>{value}%</span>
              )}
            />
            <Column
              caption=""
              width={80}
              allowSorting={false}
              allowResizing={false}
              cellRender={({ data }) => (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => openEdit(data)}
                    style={{ background: 'none', border: 'none', color: '#1e3a5f', cursor: 'pointer', padding: '2px 4px' }}
                    title="Editar"
                  >
                    <CIcon icon={cilPencil} size="sm" />
                  </button>
                  <button
                    onClick={() => handleDelete(data.id)}
                    style={{ background: 'none', border: 'none', color: '#e03131', cursor: 'pointer', padding: '2px 4px' }}
                    title="Eliminar"
                  >
                    <CIcon icon={cilTrash} size="sm" />
                  </button>
                </div>
              )}
            />
            <Summary>
              <TotalItem
                column="percentage"
                summaryType="sum"
                displayFormat="Total: {0}%"
                valueFormat={{ type: 'fixedPoint', precision: 1 }}
              />
            </Summary>
          </StandardGrid>
        )}
      </CCardBody>
    </CCard>
  )
}

export default Partners
