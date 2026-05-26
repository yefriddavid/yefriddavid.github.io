import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Column } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import StandardList, { SL } from 'src/components/shared/StandardList/Index'
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash, cilCloudDownload } from '@coreui/icons'
import { useForm } from 'react-hook-form'
import StandardForm, { StandardField, SF } from 'src/components/shared/StandardForm'
import * as genDocActions from 'src/actions/taxi/taxiDriverGenDocActions'
import * as templateActions from 'src/actions/taxi/taxiDriverDocumentActions'
import { DRIVER_DOC_PLACEHOLDERS } from 'src/constants/taxi'
import { applyPlaceholders, buildDocHtml } from 'src/utils/driverDocUtils'
import { generateHtmlToPdf } from '../Contratos/contratos/contractPdf'
import Spinner from 'src/components/shared/Spinner'
import './masters.scss'

const fieldError = (err) =>
  err ? (
    <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 2, display: 'block' }}>
      {err.message}
    </span>
  ) : null

// ── Generate modal: pick template → preview/edit → save ──────────────────────

const GenerateDocModal = ({ driver, templates, onSave, onClose, saving }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { title: '', content: '' },
  })

  const content = watch('content')

  const handleTemplateChange = (e) => {
    const tpl = templates.find((t) => t.id === e.target.value)
    if (!tpl) { setSelectedTemplate(null); return }
    setSelectedTemplate(tpl)
    setValue('title', tpl.name)
    setValue('content', applyPlaceholders(tpl.template, driver))
  }

  const handleDownload = () => {
    const title = watch('title') || 'Documento'
    generateHtmlToPdf(buildDocHtml(title, content), `${title}.pdf`)
  }

  const onSubmit = (data) => {
    onSave({
      driverId: driver.id,
      templateId: selectedTemplate?.id ?? '',
      templateName: selectedTemplate?.name ?? '',
      title: data.title,
      content: data.content,
    })
  }

  return (
    <CModal visible onClose={onClose} size="lg" scrollable>
      <CModalHeader>
        <CModalTitle>Generar documento — {driver.name}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <StandardForm
          title=""
          onCancel={onClose}
          onSave={handleSubmit(onSubmit)}
          saving={saving}
          saveLabel="Guardar"
        >
          <StandardField label="Plantilla base">
            <select className={SF.select} onChange={handleTemplateChange} defaultValue="">
              <option value="">— Seleccionar plantilla —</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </StandardField>

          <div className="driver-gen-docs__placeholders">
            <span className="driver-gen-docs__ph-label">Marcadores disponibles:</span>
            {DRIVER_DOC_PLACEHOLDERS.map((p) => (
              <span key={p.key} className="driver-gen-docs__ph-chip" title={p.label}>
                {p.key}
              </span>
            ))}
          </div>

          <StandardField label="Título *">
            <input
              className={SF.input}
              placeholder="Título del documento"
              {...register('title', { required: 'El título es obligatorio' })}
            />
            {fieldError(errors.title)}
          </StandardField>

          <StandardField label="Contenido *">
            <textarea
              className={SF.textarea}
              rows={12}
              placeholder="Contenido del documento..."
              {...register('content', { required: 'El contenido es obligatorio' })}
            />
            {fieldError(errors.content)}
          </StandardField>
        </StandardForm>
      </CModalBody>
      <CModalFooter>
        <CButton size="sm" color="secondary" variant="outline" onClick={handleDownload} disabled={!content}>
          <CIcon icon={cilCloudDownload} size="sm" /> Descargar PDF
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

// ── Edit modal ────────────────────────────────────────────────────────────────

const EditDocModal = ({ doc, onSave, onClose, saving }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { title: doc.title, content: doc.content },
  })

  const content = watch('content')

  const handleDownload = () => {
    const title = watch('title') || 'Documento'
    generateHtmlToPdf(buildDocHtml(title, content), `${title}.pdf`)
  }

  return (
    <CModal visible onClose={onClose} size="lg" scrollable>
      <CModalHeader>
        <CModalTitle>Editar documento</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <StandardForm
          title=""
          subtitle={doc.templateName ? `Plantilla: ${doc.templateName}` : undefined}
          onCancel={onClose}
          onSave={handleSubmit((data) => onSave({ id: doc.id, ...data }))}
          saving={saving}
          saveLabel="Guardar"
        >
          <StandardField label="Título *">
            <input
              className={SF.input}
              {...register('title', { required: 'El título es obligatorio' })}
            />
            {fieldError(errors.title)}
          </StandardField>
          <StandardField label="Contenido *">
            <textarea
              className={SF.textarea}
              rows={12}
              {...register('content', { required: 'El contenido es obligatorio' })}
            />
            {fieldError(errors.content)}
          </StandardField>
        </StandardForm>
      </CModalBody>
      <CModalFooter>
        <CButton size="sm" color="secondary" variant="outline" onClick={handleDownload} disabled={!content}>
          <CIcon icon={cilCloudDownload} size="sm" /> Descargar PDF
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

const DriverGenDocsPanel = ({ driver, isMobile }) => {
  const dispatch = useDispatch()
  const { data: genDocs, fetching } = useSelector((s) => s.taxiDriverGenDoc)
  const { data: templates, fetching: loadingTemplates } = useSelector((s) => s.taxiDriverDocument)

  const [showGenerate, setShowGenerate] = useState(false)
  const [editingDoc, setEditingDoc] = useState(null)

  useEffect(() => {
    dispatch(genDocActions.fetchRequest(driver.id))
    if (!templates) dispatch(templateActions.fetchRequest())
  }, [driver.id, dispatch])

  const docs = genDocs ?? []
  const tplList = templates ?? []
  const loading = fetching && !genDocs

  const handleSaveNew = (payload) => {
    dispatch(genDocActions.createRequest(payload))
    setShowGenerate(false)
  }

  const handleSaveEdit = (payload) => {
    dispatch(genDocActions.updateRequest(payload))
    setEditingDoc(null)
  }

  const handleDelete = (doc) => {
    if (!window.confirm(`¿Eliminar "${doc.title}"?`)) return
    dispatch(genDocActions.deleteRequest({ id: doc.id }))
  }

  const handleDownload = (doc) => {
    generateHtmlToPdf(buildDocHtml(doc.title, doc.content), `${doc.title}.pdf`)
  }

  return (
    <div className="driver-gen-docs">
      <div className="driver-gen-docs__header">
        <span className="driver-gen-docs__count">{docs.length} documento{docs.length !== 1 ? 's' : ''}</span>
        {fetching && <Spinner size="sm" />}
        <CButton
          size="sm"
          color="primary"
          variant="outline"
          onClick={() => setShowGenerate(true)}
          disabled={loadingTemplates && !tplList.length}
        >
          <CIcon icon={cilPlus} size="sm" /> Generar documento
        </CButton>
      </div>

      {loading ? (
        <div className="driver-gen-docs__spinner">
          <Spinner color="primary" />
        </div>
      ) : isMobile ? (
        <StandardList
          data={docs}
          keyExpr="id"
          emptyText="Sin documentos generados."
          renderTitle={(d) => d.title}
          renderRows={(d) => [
            [d.templateName && <><span className={SL.label}>Plantilla </span>{d.templateName}</>],
          ]}
          renderActions={(d) => [
            { icon: cilPencil, color: 'primary', title: 'Editar', onClick: () => setEditingDoc(d) },
            { label: '↓', color: 'info', title: 'Descargar PDF', onClick: () => handleDownload(d) },
            { icon: cilTrash, color: 'danger', title: 'Eliminar', onClick: () => handleDelete(d) },
          ]}
        />
      ) : (
        <StandardGrid dataSource={docs} keyExpr="id" noDataText="Sin documentos generados.">
          <Column dataField="title" caption="Título" minWidth={200} />
          <Column dataField="templateName" caption="Plantilla base" width={180} />
          <Column
            caption=""
            width={100}
            allowSorting={false}
            allowResizing={false}
            cellRender={({ data: d }) => (
              <div className="master-actions">
                <button
                  className="master-btn master-btn--primary"
                  onClick={() => setEditingDoc(d)}
                  title="Editar"
                >
                  <CIcon icon={cilPencil} size="sm" />
                </button>
                <button
                  className="master-btn master-btn--info"
                  onClick={() => handleDownload(d)}
                  title="Descargar PDF"
                >
                  <CIcon icon={cilCloudDownload} size="sm" />
                </button>
                <button
                  className="master-btn master-btn--danger"
                  onClick={() => handleDelete(d)}
                  title="Eliminar"
                >
                  <CIcon icon={cilTrash} size="sm" />
                </button>
              </div>
            )}
          />
        </StandardGrid>
      )}

      {showGenerate && (
        <GenerateDocModal
          driver={driver}
          templates={tplList}
          onSave={handleSaveNew}
          onClose={() => setShowGenerate(false)}
          saving={fetching}
        />
      )}

      {editingDoc && (
        <EditDocModal
          doc={editingDoc}
          onSave={handleSaveEdit}
          onClose={() => setEditingDoc(null)}
          saving={fetching}
        />
      )}
    </div>
  )
}

export default DriverGenDocsPanel
