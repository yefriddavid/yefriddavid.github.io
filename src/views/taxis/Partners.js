import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { Column, Summary, TotalItem } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import { CCard, CCardBody, CCardHeader, CBadge, CButton, CCollapse } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilX, cilPencil, cilTrash } from '@coreui/icons'
import { useForm } from 'react-hook-form'
import StandardForm, { StandardField, SF } from 'src/components/shared/StandardForm'
import * as taxiPartnerActions from 'src/actions/taxi/taxiPartnerActions'
import '../movements/payments/Payments.scss'
import './masters.scss'
import Spinner from 'src/components/shared/Spinner'

const EMPTY = { name: '', percentage: '' }

const fieldError = (err) =>
  err ? (
    <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 2, display: 'block' }}>
      {err.message}
    </span>
  ) : null

const PartnerForm = ({ initial, editingId, onSave, onCancel, saving }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: initial })

  return (
    <StandardForm
      title={editingId ? 'Editar socio' : 'Nuevo socio'}
      subtitle={editingId ? initial.name : undefined}
      onCancel={onCancel}
      onSave={handleSubmit(onSave)}
      saving={saving}
    >
      <StandardField label="Nombre">
        <input
          className={SF.input}
          placeholder="Nombre completo"
          {...register('name', { required: 'El nombre es obligatorio' })}
        />
        {fieldError(errors.name)}
      </StandardField>
      <StandardField label="Porcentaje (%)">
        <input
          className={SF.input}
          type="number"
          min="0"
          max="100"
          step="0.1"
          placeholder="0"
          {...register('percentage', { required: 'El porcentaje es obligatorio' })}
        />
        {fieldError(errors.percentage)}
      </StandardField>
    </StandardForm>
  )
}

const Partners = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { data, fetching } = useSelector((s) => s.taxiPartner)

  const [showForm, setShowForm] = useState(false)
  const [editingPartner, setEditingPartner] = useState(null)

  const partners = data ?? []
  const loading = fetching && !data

  useEffect(() => {
    dispatch(taxiPartnerActions.fetchRequest())
  }, [dispatch])

  const openCreate = () => {
    setEditingPartner(null)
    setShowForm(true)
  }

  const openEdit = (partner) => {
    setEditingPartner(partner)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingPartner(null)
  }

  const handleSave = ({ name, percentage }) => {
    const pct = Number(percentage)
    if (editingPartner) {
      dispatch(taxiPartnerActions.updateRequest({ id: editingPartner.id, name, percentage: pct }))
    } else {
      dispatch(taxiPartnerActions.createRequest({ name, percentage: pct }))
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
          {fetching && <Spinner size="sm" />}
        </div>
        <CButton
          size="sm"
          color={showForm && !editingPartner ? 'danger' : 'primary'}
          variant="outline"
          onClick={showForm && !editingPartner ? handleCancel : openCreate}
        >
          <CIcon icon={showForm && !editingPartner ? cilX : cilPlus} size="sm" />{' '}
          {showForm && !editingPartner ? 'Cancelar' : 'Nuevo socio'}
        </CButton>
      </CCardHeader>

      <CCollapse visible={showForm}>
        <div className="master-form-panel" style={{ maxWidth: '50%' }}>
          <PartnerForm
            key={editingPartner?.id ?? 'new'}
            initial={
              editingPartner
                ? { name: editingPartner.name, percentage: String(editingPartner.percentage) }
                : EMPTY
            }
            editingId={editingPartner?.id ?? null}
            onSave={handleSave}
            onCancel={handleCancel}
            saving={fetching}
          />
        </div>
      </CCollapse>

      <CCardBody className="p-0">
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner color="primary" />
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
              cellRender={({ value }) => <span className="master-amount">{value}%</span>}
            />
            <Column
              caption=""
              width={80}
              allowSorting={false}
              allowResizing={false}
              cellRender={({ data }) => (
                <div className="master-actions">
                  <button className="master-btn master-btn--primary" onClick={() => openEdit(data)} title="Editar"><CIcon icon={cilPencil} size="sm" /></button>
                  <button className="master-btn master-btn--danger" onClick={() => handleDelete(data.id)} title="Eliminar"><CIcon icon={cilTrash} size="sm" /></button>
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
