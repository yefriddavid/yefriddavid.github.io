import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Column } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import StandardList, { SL } from 'src/components/shared/StandardList/Index'
import { CCard, CCardBody, CCardHeader, CBadge, CButton, CCollapse, CModal, CModalHeader, CModalTitle, CModalBody } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilX, cilPencil, cilTrash } from '@coreui/icons'
import { useForm } from 'react-hook-form'
import StandardForm, { StandardField, SF } from 'src/components/shared/StandardForm'
import * as actions from 'src/actions/taxi/taxiDriverDocumentActions'
import useIsMobile from 'src/hooks/useIsMobile'
import Spinner from 'src/components/shared/Spinner'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import './masters.scss'

const EMPTY = { name: '', template: '', comment: '' }

const fieldError = (err) =>
  err ? (
    <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 2, display: 'block' }}>
      {err.message}
    </span>
  ) : null

const DocumentForm = ({ initial, editingId, onSave, onCancel, saving }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: initial })

  return (
    <StandardForm
      title={editingId ? 'Editar plantilla' : 'Nueva plantilla'}
      subtitle={editingId ? initial.name : undefined}
      onCancel={onCancel}
      onSave={handleSubmit(onSave)}
      saving={saving}
    >
      <StandardField label="Nombre *">
        <input
          className={SF.input}
          placeholder="Nombre de la plantilla"
          {...register('name', { required: 'El nombre es obligatorio' })}
        />
        {fieldError(errors.name)}
      </StandardField>
      <StandardField label="Plantilla *">
        <textarea
          className={SF.textarea}
          rows={8}
          placeholder="Contenido de la plantilla..."
          {...register('template', { required: 'La plantilla es obligatoria' })}
        />
        {fieldError(errors.template)}
      </StandardField>
      <StandardField label="Comentario">
        <input
          className={SF.input}
          placeholder="Observaciones opcionales"
          {...register('comment')}
        />
      </StandardField>
    </StandardForm>
  )
}

const DriverDocuments = () => {
  const dispatch = useDispatch()
  const isMobile = useIsMobile()
  const activeTenantId = useActiveTenantId()
  const { data, fetching } = useSelector((s) => s.taxiDriverDocument)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const documents = data ?? []
  const loading = fetching && !data

  useEffect(() => {
    dispatch(actions.fetchRequest())
  }, [dispatch, activeTenantId])

  const openCreate = () => {
    setEditing(null)
    setShowForm(true)
  }

  const openEdit = (doc) => {
    setEditing(doc)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditing(null)
  }

  const handleSave = (form) => {
    if (editing) {
      dispatch(actions.updateRequest({ id: editing.id, ...form }))
    } else {
      dispatch(actions.createRequest(form))
    }
    handleCancel()
  }

  const handleDelete = (id) => {
    if (!window.confirm('¿Eliminar esta plantilla?')) return
    dispatch(actions.deleteRequest({ id }))
  }

  return (
    <CCard>
      <CCardHeader className="d-flex align-items-center justify-content-between gap-2">
        <div className="d-flex align-items-center gap-2">
          <strong>Plantillas de documentos</strong>
          <CBadge color="secondary">{documents.length}</CBadge>
          {fetching && <Spinner size="sm" />}
        </div>
        <CButton
          size="sm"
          color={showForm && !editing ? 'danger' : 'primary'}
          variant="outline"
          onClick={showForm && !editing ? handleCancel : openCreate}
        >
          <CIcon icon={showForm && !editing ? cilX : cilPlus} size="sm" />{' '}
          {showForm && !editing ? 'Cancelar' : 'Nueva plantilla'}
        </CButton>
      </CCardHeader>

      <CCollapse visible={!isMobile && showForm}>
        <div className="master-form-panel">
          <DocumentForm
            key={editing?.id ?? 'new'}
            initial={editing ? { name: editing.name, template: editing.template, comment: editing.comment } : EMPTY}
            editingId={editing?.id ?? null}
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
          <StandardList
            data={documents}
            keyExpr="id"
            emptyText="Sin plantillas registradas."
            renderTitle={(d) => d.name}
            renderRows={(d) => [
              [d.comment && <><span className={SL.label}>Nota </span>{d.comment}</>],
            ]}
            renderActions={(d) => [
              { icon: cilPencil, color: 'primary', title: 'Editar', onClick: () => openEdit(d) },
              { icon: cilTrash, color: 'danger', title: 'Eliminar', onClick: () => handleDelete(d.id) },
            ]}
          />
        ) : (
          <StandardGrid dataSource={documents} keyExpr="id" noDataText="Sin plantillas registradas.">
            <Column dataField="name" caption="Nombre" minWidth={200} />
            <Column dataField="template" caption="Plantilla" minWidth={300} />
            <Column dataField="comment" caption="Comentario" minWidth={180} />
            <Column
              caption=""
              width={80}
              allowSorting={false}
              allowResizing={false}
              cellRender={({ data: d }) => (
                <div className="master-actions">
                  <button
                    className="master-btn master-btn--primary"
                    onClick={() => openEdit(d)}
                    title="Editar"
                  >
                    <CIcon icon={cilPencil} size="sm" />
                  </button>
                  <button
                    className="master-btn master-btn--danger"
                    onClick={() => handleDelete(d.id)}
                    title="Eliminar"
                  >
                    <CIcon icon={cilTrash} size="sm" />
                  </button>
                </div>
              )}
            />
          </StandardGrid>
        )}
      </CCardBody>

      {isMobile && showForm && (
        <CModal visible onClose={handleCancel} size="lg" scrollable>
          <CModalHeader>
            <CModalTitle>{editing ? 'Editar plantilla' : 'Nueva plantilla'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <DocumentForm
              key={editing?.id ?? 'new'}
              initial={editing ? { name: editing.name, template: editing.template, comment: editing.comment } : EMPTY}
              editingId={editing?.id ?? null}
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

export default DriverDocuments
