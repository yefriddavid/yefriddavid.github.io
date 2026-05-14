import React from 'react'
import { CButton, CSpinner } from '@coreui/react'
import { useForm } from 'react-hook-form'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from 'src/constants/cashFlow'
import { EMPTY_FORM } from './helpers'

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
    <div className="payment-form">
      <div className="payment-form__header">
        <span className="payment-form__title">
          {isEdit ? 'Editar transacción' : 'Nueva transacción'}
        </span>
      </div>
      <div className="payment-form__body">
        {initial?.accountMasterName && (
          <div className="payment-form__field">
            <label className="payment-form__label">Cuenta maestra</label>
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
          </div>
        )}
        <div className="payment-form__field">
          <label className="payment-form__label">Tipo</label>
          <select
            className="payment-form__input payment-form__input--select"
            {...register('type', {
              onChange: () => setValue('category', ''),
            })}
          >
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </select>
        </div>
        <div className="payment-form__field">
          <label className="payment-form__label">Categoría</label>
          <select
            className="payment-form__input payment-form__input--select"
            {...register('category')}
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="payment-form__field">
          <label className="payment-form__label">Descripción</label>
          <input
            className="payment-form__input"
            type="text"
            placeholder="Descripción del movimiento"
            {...register('description')}
          />
        </div>
        <div className="payment-form__field">
          <label className="payment-form__label">Monto (COP)</label>
          <input
            className="payment-form__input"
            type="number"
            placeholder="0"
            min="0"
            {...register('amount', { required: 'El monto es obligatorio' })}
          />
          {fieldError(errors.amount)}
        </div>
        <div className="payment-form__field">
          <label className="payment-form__label">Fecha</label>
          <input
            className="payment-form__input"
            type="date"
            {...register('date', { required: 'La fecha es obligatoria' })}
          />
          {fieldError(errors.date)}
        </div>
        <div className="payment-form__field">
          <label className="payment-form__label">Método de pago</label>
          <select
            className="payment-form__input payment-form__input--select"
            {...register('paymentMethod')}
          >
            <option value="">Sin método</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="payment-form__actions">
        <CButton
          className="payment-form__btn payment-form__btn--cancel"
          onClick={onCancel}
          disabled={saving}
        >
          Cancelar
        </CButton>
        <CButton
          className="payment-form__btn payment-form__btn--save"
          onClick={handleSubmit(onSubmit)}
          disabled={saving}
        >
          {saving ? <CSpinner size="sm" /> : 'Guardar'}
        </CButton>
      </div>
    </div>
  )
}
