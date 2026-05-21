import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { Column, Summary, TotalItem } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import { CCard, CCardBody, CCardHeader, CBadge, CButton, CCollapse, CModal, CModalHeader, CModalTitle, CModalBody } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilX, cilPencil, cilTrash } from '@coreui/icons'
import { useForm } from 'react-hook-form'
import StandardForm, { StandardField, SF } from 'src/components/shared/StandardForm'
import * as taxiPartnerActions from 'src/actions/taxi/taxiPartnerActions'
import useIsMobile from 'src/hooks/useIsMobile'
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

const PartnerCardList = ({ partners, onEdit, onDelete }) => {
  if (partners.length === 0) {
    return (
      <div
        style={{
          padding: '32px 0',
          textAlign: 'center',
          color: 'var(--cui-secondary-color)',
          fontSize: 13,
        }}
      >
        Sin socios registrados.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 0' }}>
      {partners.map((partner) => (
        <div
          key={partner.id}
          style={{
            border: '1px solid var(--cui-border-color)',
            borderRadius: 10,
            padding: '12px 14px',
            background: 'var(--cui-body-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--cui-body-color)' }}>
              {partner.name}
            </span>
            <span style={{ fontSize: 13, color: 'var(--cui-secondary-color)' }}>
              Participación
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <span style={{ fontSize: 20, fontWeight: 700 }}>{partner.percentage}%</span>
            <button
              onClick={() => onEdit(partner)}
              style={{ background: 'none', border: 'none', color: 'var(--cui-primary)', cursor: 'pointer', padding: '4px 8px' }}
              title="Editar"
            >
              <CIcon icon={cilPencil} size="sm" />
            </button>
            <button
              onClick={() => onDelete(partner.id)}
              style={{ background: 'none', border: 'none', color: '#e03131', cursor: 'pointer', padding: '4px 8px' }}
              title="Eliminar"
            >
              <CIcon icon={cilTrash} size="sm" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

const Partners = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const isMobile = useIsMobile()
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

      <CCollapse visible={!isMobile && showForm}>
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
        ) : isMobile ? (
          <div style={{ padding: '0 12px' }}>
            <PartnerCardList partners={partners} onEdit={openEdit} onDelete={handleDelete} />
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
                  <button
                    className="master-btn master-btn--primary"
                    onClick={() => openEdit(data)}
                    title="Editar"
                  >
                    <CIcon icon={cilPencil} size="sm" />
                  </button>
                  <button
                    className="master-btn master-btn--danger"
                    onClick={() => handleDelete(data.id)}
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

      {/* Create / Edit modal — mobile */}
      {isMobile && showForm && (
        <CModal visible onClose={handleCancel} size="lg" scrollable>
          <CModalHeader>
            <CModalTitle>{editingPartner ? 'Editar socio' : 'Nuevo socio'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
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
          </CModalBody>
        </CModal>
      )}
    </CCard>
  )
}

export default Partners
