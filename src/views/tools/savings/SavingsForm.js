import React from 'react'
import { useForm } from 'react-hook-form'
import StandardForm, { StandardField, SF } from 'src/components/shared/StandardForm'
import { today } from './savingsHelpers'

const fieldError = (err) =>
  err ? (
    <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 2, display: 'block' }}>
      {err.message}
    </span>
  ) : null

export const EMPTY_SAVING = {
  date: today(),
  value: '',
  comment: '',
}

const SavingsForm = ({ initial, onSave, onCancel, saving }) => {
  const isEdit = !!initial?.id
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: initial ?? EMPTY_SAVING })

  const submit = (form) =>
    onSave({
      ...(initial ?? {}),
      date: form.date,
      value: Number(form.value),
      comment: form.comment.trim(),
    })

  return (
    <StandardForm
      title={isEdit ? 'Editar ahorro' : 'Nuevo ahorro'}
      onSave={handleSubmit(submit)}
      onCancel={onCancel}
      saving={saving}
      saveLabel={isEdit ? 'Guardar cambios' : 'Registrar ahorro'}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <StandardField label="Fecha *">
          <input
            className={SF.input}
            type="date"
            {...register('date', { required: 'La fecha es obligatoria' })}
          />
          {fieldError(errors.date)}
        </StandardField>

        <StandardField label="Valor *">
          <input
            className={SF.input}
            type="number"
            step="any"
            min="0"
            placeholder="0"
            {...register('value', {
              required: 'El valor es obligatorio',
              min: { value: 1, message: 'Debe ser mayor a 0' },
            })}
          />
          {fieldError(errors.value)}
        </StandardField>
      </div>

      <StandardField label="Comentario">
        <textarea
          className={SF.textarea}
          rows={2}
          placeholder="Observaciones…"
          {...register('comment')}
        />
      </StandardField>
    </StandardForm>
  )
}

export default SavingsForm
