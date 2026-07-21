import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import StandardForm, { StandardField, SF } from 'src/components/shared/StandardForm'
import {
  CRYPTO_PURCHASE_SYMBOLS,
  CRYPTO_PURCHASE_PLATFORMS,
  CRYPTO_PURCHASE_TYPES,
} from 'src/constants/finance'
import { fmtUSD, today } from './cryptoPurchaseHelpers'

const fieldError = (err) =>
  err ? (
    <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 2, display: 'block' }}>
      {err.message}
    </span>
  ) : null

export const EMPTY_PURCHASE = {
  type: 'buy',
  symbol: CRYPTO_PURCHASE_SYMBOLS[0].value,
  platform: CRYPTO_PURCHASE_PLATFORMS[0].value,
  quantity: '',
  purchasePrice: '',
  purchaseDate: today(),
  usdCopRate: '',
  isAdjustment: false,
  notes: '',
}

const CryptoPurchaseForm = ({ initial, onSave, onCancel, saving, liveUsdCopRate }) => {
  const isEdit = !!initial?.id
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: initial ?? EMPTY_PURCHASE })

  const type = watch('type') ?? 'buy'
  const isSale = type === 'sell'
  const quantity = Number(watch('quantity')) || 0
  const purchasePrice = Number(watch('purchasePrice')) || 0
  const total = quantity * purchasePrice

  useEffect(() => {
    if (!isEdit && liveUsdCopRate != null && !watch('usdCopRate')) {
      setValue('usdCopRate', liveUsdCopRate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveUsdCopRate])

  const submit = (form) =>
    onSave({
      ...(initial ?? {}),
      type: form.type,
      symbol: form.symbol,
      platform: form.platform,
      quantity: Number(form.quantity),
      purchasePrice: Number(form.purchasePrice),
      purchaseDate: form.purchaseDate,
      usdCopRate: form.usdCopRate ? Number(form.usdCopRate) : null,
      isAdjustment: isSale && !!form.isAdjustment,
      notes: form.notes.trim(),
    })

  return (
    <StandardForm
      title={
        isEdit
          ? isSale
            ? 'Editar venta'
            : 'Editar compra'
          : isSale
            ? 'Nueva venta'
            : 'Nueva compra'
      }
      onSave={handleSubmit(submit)}
      onCancel={onCancel}
      saving={saving}
      saveLabel={isEdit ? 'Guardar cambios' : isSale ? 'Registrar venta' : 'Registrar compra'}
    >
      <div className="cpu-form__type-toggle">
        {CRYPTO_PURCHASE_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            className={`cpu-form__type-btn${type === t.value ? ' cpu-form__type-btn--active' : ''}${t.value === 'sell' ? ' cpu-form__type-btn--sell' : ''}`}
            onClick={() => setValue('type', t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <StandardField label="Moneda *">
          <select className={SF.select} {...register('symbol', { required: true })}>
            {CRYPTO_PURCHASE_SYMBOLS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </StandardField>

        <StandardField label="Plataforma *">
          <select className={SF.select} {...register('platform', { required: true })}>
            {CRYPTO_PURCHASE_PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </StandardField>
      </div>

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

        <StandardField label={isSale ? 'Precio de venta (USD) *' : 'Precio de compra (USD) *'}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <StandardField label={isSale ? 'Fecha de venta *' : 'Fecha de compra *'}>
          <input
            className={SF.input}
            type="date"
            {...register('purchaseDate', { required: 'La fecha es obligatoria' })}
          />
          {fieldError(errors.purchaseDate)}
        </StandardField>

        <StandardField label="TRM USD/COP">
          <input
            className={SF.input}
            type="number"
            step="any"
            min="0"
            placeholder="0.00"
            {...register('usdCopRate')}
          />
        </StandardField>
      </div>

      {total > 0 && (
        <div className="cpu-form__invested">
          <span>{isSale ? 'Recibido' : 'Invertido'}</span>
          <strong>{fmtUSD(total)}</strong>
        </div>
      )}

      {isSale && (
        <label className="cpu-form__adjustment-check">
          <input type="checkbox" {...register('isAdjustment')} />
          Es un ajuste de saldo (no una venta real) — usa precio 0 y explica el motivo en notas
        </label>
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
