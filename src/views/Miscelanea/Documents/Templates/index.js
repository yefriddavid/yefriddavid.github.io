import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import StandardForm, { StandardField, SF } from 'src/components/shared/StandardForm'
import { generateHtmlToPdf } from 'src/views/Contratos/contratos/contractPdf'
import { TEMPLATES } from '../templates'
import './Templates.scss'

const fieldError = (err) =>
  err ? (
    <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 2, display: 'block' }}>
      {err.message}
    </span>
  ) : null

const TemplateForm = ({ template, onBack }) => {
  const [generating, setGenerating] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: {} })

  const onGenerate = async (values) => {
    setGenerating(true)
    try {
      await generateHtmlToPdf(template.buildHtml(values), `${template.id}.pdf`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <StandardForm
      title={template.name}
      subtitle={template.description}
      onCancel={onBack}
      onSave={handleSubmit(onGenerate)}
      saving={generating}
      saveLabel="Descargar PDF"
      cancelLabel="Volver"
    >
      {template.fields.map((field) => (
        <StandardField key={field.key} label={field.label}>
          <input
            className={SF.input}
            placeholder={field.placeholder || ''}
            {...register(field.key)}
          />
          {fieldError(errors[field.key])}
        </StandardField>
      ))}
    </StandardForm>
  )
}

const Templates = () => {
  const [selected, setSelected] = useState(null)

  return (
    <div className="doc-templates">
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

      <div className="doc-templates__panel">
        {selected ? (
          <TemplateForm key={selected.id} template={selected} onBack={() => setSelected(null)} />
        ) : (
          <div className="doc-templates__hint">
            Selecciona una plantilla para generar el PDF
          </div>
        )}
      </div>
    </div>
  )
}

export default Templates
