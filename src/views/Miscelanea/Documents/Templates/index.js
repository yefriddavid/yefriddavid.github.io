import React, { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import CIcon from '@coreui/icons-react'
import { cilX } from '@coreui/icons'
import StandardForm, { StandardField, SF } from 'src/components/shared/StandardForm'
import { generateHtmlToPdf } from 'src/views/Contratos/contratos/contractPdf'
import { TEMPLATES } from '../templates'
import './Templates.scss'

//const PREVIEW_SCALE = 0.40
const PREVIEW_SCALE = 1
const FRAME_W = 816
const FRAME_H = 1140
const SCALED_W = Math.round(FRAME_W * PREVIEW_SCALE)
const SCALED_H = Math.min(Math.round(FRAME_H * PREVIEW_SCALE), 820)

const fieldError = (err) =>
  err ? (
    <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 2, display: 'block' }}>
      {err.message}
    </span>
  ) : null

// ── Live preview (uses contentDocument.write to avoid iframe flicker) ─────────

const LivePreview = ({ html }) => {
  const ref = useRef(null)

  useEffect(() => {
    const frame = ref.current
    if (!frame) return
    const doc = frame.contentDocument || frame.contentWindow?.document
    if (!doc) return
    doc.open()
    doc.write(html)
    doc.close()
  }, [html])

  return (
    <div className="doc-preview" style={{ width: SCALED_W, height: SCALED_H }}>
      <iframe
        ref={ref}
        title="Vista previa"
        style={{
          width: FRAME_W,
          height: FRAME_H,
          border: 'none',
          transform: `scale(${PREVIEW_SCALE})`,
          transformOrigin: 'top left',
          display: 'block',
        }}
      />
    </div>
  )
}

// ── Workspace: form + live preview ────────────────────────────────────────────

const TemplateWorkspace = ({ template, onBack }) => {
  const [generating, setGenerating] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewHtml, setPreviewHtml] = useState(() => template.buildHtml({}))
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({ defaultValues: {} })
  const values = watch()

  useEffect(() => {
    const timer = setTimeout(() => setPreviewHtml(template.buildHtml(values)), 500)
    return () => clearTimeout(timer)
  }, [values, template])

  const onGenerate = async (vals) => {
    setGenerating(true)
    try {
      await generateHtmlToPdf(template.buildHtml(vals), `${template.id}.pdf`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <div className="doc-workspace__preview">
        <p className="doc-workspace__preview-label">Vista previa</p>
        <LivePreview html={previewHtml} />
      </div>

      <div className="doc-workspace__form">
        <p className="doc-workspace__form-label">Formulario</p>
        <StandardForm
          title={template.name}
          subtitle={template.description}
          onCancel={onBack}
          onSave={handleSubmit(onGenerate)}
          saving={generating}
          saveLabel="Descargar PDF"
          cancelLabel="Volver"
        >
          <button
            type="button"
            className="doc-workspace__preview-toggle"
            onClick={() => setPreviewOpen(true)}
          >
            Vista previa
          </button>
          {template.fields.map((field) => {
            const fill = field.autoFill || (field.placeholder ? () => field.placeholder : null)
            return (
              <StandardField key={field.key} label={field.label}>
                <div className={fill ? 'doc-workspace__field-row' : undefined}>
                  <input
                    className={SF.input}
                    placeholder={field.placeholder || ''}
                    {...register(field.key)}
                  />
                  {fill && (
                    <button
                      type="button"
                      className="doc-workspace__autofill-btn"
                      title="Autocompletar"
                      onClick={() => setValue(field.key, fill())}
                    >
                      {field.autoFill ? 'Hoy' : '↺'}
                    </button>
                  )}
                </div>
                {fieldError(errors[field.key])}
              </StandardField>
            )
          })}
        </StandardForm>
      </div>

      {previewOpen && (
        <div className="doc-preview-modal">
          <div className="doc-preview-modal__bar">
            <span className="doc-preview-modal__title">Vista previa</span>
            <button
              className="doc-preview-modal__close"
              onClick={() => setPreviewOpen(false)}
              aria-label="Cerrar"
            >
              <CIcon icon={cilX} />
            </button>
          </div>
          <iframe
            srcDoc={previewHtml}
            className="doc-preview-modal__frame"
            title="Vista previa"
          />
        </div>
      )}
    </>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────────

const Templates = () => {
  const [selected, setSelected] = useState(null)

  return (
    <div className={`doc-templates${selected ? ' doc-templates--selected' : ''}`}>
      <div className="doc-templates__list">
        <p className="doc-templates__list-title">Plantillas disponibles</p>
        {TEMPLATES.map((t) => (
          <div
            key={t.id}
            className={`doc-templates__card${selected?.id === t.id ? ' doc-templates__card--active' : ''}`}
            onClick={() => setSelected(t)}
          >
            <div className="doc-templates__card__name">{t.name}</div>
            <div className="doc-templates__card__desc">{t.description}</div>
          </div>
        ))}
      </div>

      {selected ? (
        <TemplateWorkspace
          key={selected.id}
          template={selected}
          onBack={() => setSelected(null)}
        />
      ) : (
        <div className="doc-templates__hint">
          Selecciona una plantilla para generar el PDF
        </div>
      )}
    </div>
  )
}

export default Templates
