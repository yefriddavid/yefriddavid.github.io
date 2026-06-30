import React from 'react'
import { useForm } from 'react-hook-form'
import StandardForm, { StandardField, SF } from 'src/components/shared/StandardForm'
import { CRYPTO_PURCHASE_SYMBOLS } from 'src/constants/finance'
import { fmtUSD, today } from './cryptoPurchaseHelpers'

const fieldError = (err) =>
  err ? (
    <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 2, display: 'block' }}>
      {err.message}
    </span>
  ) : null

export const EMPTY_PURCHASE = {
  symbol: CRYPTO_PURCHASE_SYMBOLS[0].value,
  quantity: '',
  purchasePrice: '',
  purchaseDate: today(),
  notes: '',
}

const CryptoPurchaseForm = ({ initial, onSave, onCancel, saving }) => {
  const isEdit = !!initial?.id
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: initial ?? EMPTY_PURCHASE })

  const quantity = Number(watch('quantity')) || 0
  const purchasePrice = Number(watch('purchasePrice')) || 0
  const invested = quantity * purchasePrice

  const submit = (form) =>
    onSave({
      ...(initial ?? {}),
      symbol: form.symbol,
      quantity: Number(form.quantity),
      purchasePrice: Number(form.purchasePrice),
      purchaseDate: form.purchaseDate,
      notes: form.notes.trim(),
    })

  return (
    <StandardForm
      title={isEdit ? 'Editar compra' : 'Nueva compra'}
      onSave={handleSubmit(submit)}
      onCancel={onCancel}
      saving={saving}
      saveLabel={isEdit ? 'Guardar cambios' : 'Registrar compra'}
    >
      <StandardField label="Moneda *">
        <select className={SF.select} {...register('symbol', { required: true })}>
          {CRYPTO_PURCHASE_SYMBOLS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </StandardField>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <StandardField label="Cantidad *">
          <input
            className={SF.input}
            type="number"
            step="any"
            min="0"
            placeholder="0.00000000"
            {...register('quantity', {
              required: 'La cantidad es obligatoria',
              min: { value: 1e-9, message: 'Debe ser mayor a 0' },
            })}
          />
          {fieldError(errors.quantity)}
        </StandardField>

        <StandardField label="Precio de compra (USD) *">
          <input
            className={SF.input}
            type="number"
            step="any"
            min="0"
            placeholder="0.00"
            {...register('purchasePrice', {
              required: 'El precio es obligatorio',
              min: { value: 1e-9, message: 'Debe ser mayor a 0' },
            })}
          />
          {fieldError(errors.purchasePrice)}
        </StandardField>
      </div>

      <StandardField label="Fecha de compra *">
        <input
          className={SF.input}
          type="date"
          {...register('purchaseDate', { required: 'La fecha es obligatoria' })}
        />
        {fieldError(errors.purchaseDate)}
      </StandardField>

      {invested > 0 && (
        <div className="cpu-form__invested">
          <span>Invertido</span>
          <strong>{fmtUSD(invested)}</strong>
        </div>
      )}

      <StandardField label="Notas">
        <textarea
          className={SF.textarea}
          rows={2}
          placeholder="Exchange, wallet, observaciones…"
          {...register('notes')}
        />
      </StandardField>
    </StandardForm>
  )
}

export default CryptoPurchaseForm
