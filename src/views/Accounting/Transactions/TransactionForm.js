import React from 'react'
import { useForm } from 'react-hook-form'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from 'src/constants/cashFlow'
import { EMPTY_FORM } from './helpers'
import StandardForm, { StandardField, SF } from 'src/components/shared/StandardForm'

const fieldError = (err) =>
  err ? (
    <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 2, display: 'block' }}>
      {err.message}
    </span>
  ) : null

export default function TransactionForm({ initial, saving, onSave, onCancel }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: initial ?? EMPTY_FORM })

  const type = watch('type')
  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
  const isEdit = !!initial?.id

  const onSubmit = (data) => {
    onSave({ ...data, amount: Number(String(data.amount).replace(/\D/g, '')) })
  }

  return (
    <StandardForm
      title={isEdit ? 'Editar transacción' : 'Nueva transacción'}
      onCancel={onCancel}
      onSave={handleSubmit(onSubmit)}
      saving={saving}
    >
      {initial?.accountMasterName && (
        <StandardField label="Cuenta maestra">
          <div
            style={{
              padding: '8px 12px',
              background: '#eef4ff',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              color: '#1e3a5f',
            }}
          >
            {initial.accountMasterImportant && (
              <span style={{ color: '#e03131', fontSize: 13, marginRight: 4 }}>★</span>
            )}
            {initial.accountMasterName}
          </div>
        </StandardField>
      )}
      <StandardField label="Tipo">
        <select
          className={SF.select}
          {...register('type', {
            onChange: () => setValue('category', ''),
          })}
        >
          <option value="expense">Gasto</option>
          <option value="income">Ingreso</option>
        </select>
      </StandardField>
      <StandardField label="Categoría">
        <select className={SF.select} {...register('category')}>
          <option value="">Sin categoría</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </StandardField>
      <StandardField label="Descripción">
        <input
          className={SF.input}
          type="text"
          placeholder="Descripción del movimiento"
          {...register('description')}
        />
      </StandardField>
      <StandardField label="Monto (COP)">
        <input
          className={SF.input}
          type="number"
          placeholder="0"
          min="0"
          {...register('amount', { required: 'El monto es obligatorio' })}
        />
        {fieldError(errors.amount)}
      </StandardField>
      <StandardField label="Fecha">
        <input
          className={SF.input}
          type="date"
          {...register('date', { required: 'La fecha es obligatoria' })}
        />
        {fieldError(errors.date)}
      </StandardField>
      <StandardField label="Método de pago">
        <select className={SF.select} {...register('paymentMethod')}>
          <option value="">Sin método</option>
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </StandardField>
    </StandardForm>
  )
}
