import React, { useState } from 'react'
import { CButton, CSpinner } from '@coreui/react'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from 'src/constants/cashFlow'
import { EMPTY_FORM } from './helpers'

export default function TransactionForm({ initial, saving, onSave, onCancel }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM)

  const set = (field) => (e) => {
    const val = e.target.value
    setForm((prev) => {
      const next = { ...prev, [field]: val }
      if (field === 'type') next.category = ''
      return next
    })
  }

  const categories = form.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  const handleSave = () => {
    if (!form.amount || !form.date) return
    onSave({ ...form, amount: Number(String(form.amount).replace(/\D/g, '')) })
  }

  const isEdit = !!initial?.id

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
            value={form.type}
            onChange={set('type')}
          >
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </select>
        </div>
        <div className="payment-form__field">
          <label className="payment-form__label">Categoría</label>
          <select
            className="payment-form__input payment-form__input--select"
            value={form.category}
            onChange={set('category')}
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
            value={form.description}
            onChange={set('description')}
            placeholder="Descripción del movimiento"
          />
        </div>
        <div className="payment-form__field">
          <label className="payment-form__label">Monto (COP)</label>
          <input
            className="payment-form__input"
            type="number"
            value={form.amount}
            onChange={set('amount')}
            placeholder="0"
            min="0"
          />
        </div>
        <div className="payment-form__field">
          <label className="payment-form__label">Fecha</label>
          <input
            className="payment-form__input"
            type="date"
            value={form.date}
            onChange={set('date')}
          />
        </div>
        <div className="payment-form__field">
          <label className="payment-form__label">Método de pago</label>
          <select
            className="payment-form__input payment-form__input--select"
            value={form.paymentMethod ?? ''}
            onChange={set('paymentMethod')}
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
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <CSpinner size="sm" /> : 'Guardar'}
        </CButton>
      </div>
    </div>
  )
}
