import React, { useState } from 'react'
import { CButton, CSpinner } from '@coreui/react'
import {
  CLASSIFICATION_OPTIONS,
  PERIOD_OPTIONS,
  ACCOUNT_MASTER_TYPES,
  ACCOUNT_MASTER_TYPE_LABELS,
  ACCOUNT_MASTER_NATURE,
  ACCOUNT_MASTER_CODE_PREFIX,
} from 'src/constants/accounting'
import { ACCOUNT_CATEGORIES, PAYMENT_METHODS } from 'src/constants/cashFlow'
import { MONTH_NAMES } from 'src/constants/commons'
import useLocaleData from 'src/hooks/useLocaleData'

const EMPTY_FORM = {
  type: 'Outcoming',
  period: 'Mensuales',
  targetAmount: '',
  definition: '',
  classification: 'dispensable',
  category: '',
  maxDatePay: 15,
  monthStartAt: 'January',
  paymentMethod: 'Cash',
  code: '',
  accountingName: '',
  name: '',
  description: '',
  notes: '',
  defaultValue: '',
  active: true,
  important: false,
}

export { EMPTY_FORM }

export default function AccountMasterForm({ initial, saving, onSave, onCancel }) {
  const { monthLabels } = useLocaleData()
  const [form, setForm] = useState(initial ?? EMPTY_FORM)

  const set = (field) => (e) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value
    setForm((prev) => ({ ...prev, [field]: val }))
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    onSave(form)
  }

  const isEdit = !!initial?.id
  const codePlaceholder = `${ACCOUNT_MASTER_CODE_PREFIX[form.type] ?? '5'}xxx (ej. ${ACCOUNT_MASTER_CODE_PREFIX[form.type] ?? '5'}195)`

  return (
    <div className="payment-form">
      <div className="payment-form__header">
        <span className="payment-form__title">
          {isEdit ? 'Editar cuenta maestra' : 'Nueva cuenta maestra'}
        </span>
      </div>
      <div className="payment-form__body">
        <div className="payment-form__field">
          <label className="payment-form__label">Nombre *</label>
          <input
            className="payment-form__input"
            type="text"
            value={form.name}
            onChange={set('name')}
            placeholder="Nombre de la cuenta"
          />
        </div>

        <div className="payment-form__field">
          <label className="payment-form__label">
            Nombre Contable NIIF
            <span style={{ fontSize: 11, color: '#6c757d', fontWeight: 400, marginLeft: 6 }}>
              — nombre según plan de cuentas
            </span>
          </label>
          <input
            className="payment-form__input"
            type="text"
            value={form.accountingName}
            onChange={set('accountingName')}
            placeholder="Ej: Arrendamientos — inmueble"
          />
        </div>

        <div className="payment-form__field">
          <label className="payment-form__label">Descripción</label>
          <input
            className="payment-form__input"
            type="text"
            value={form.description}
            onChange={set('description')}
            placeholder="Descripción corta"
          />
        </div>

        <div className="payment-form__field">
          <label className="payment-form__label">Notas</label>
          <textarea
            className="payment-form__input"
            value={form.notes}
            onChange={set('notes')}
            placeholder="Comentarios u observaciones adicionales…"
            rows={3}
            style={{ resize: 'vertical', lineHeight: 1.5 }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          <div className="payment-form__field">
            <label className="payment-form__label">Tipo</label>
            <select
              className="payment-form__input payment-form__input--select"
              value={form.type}
              onChange={set('type')}
            >
              {ACCOUNT_MASTER_TYPES.map((o) => (
                <option key={o} value={o}>
                  {ACCOUNT_MASTER_TYPE_LABELS[o]}
                </option>
              ))}
            </select>
          </div>

          <div className="payment-form__field">
            <label className="payment-form__label">
              Código PUC *
              <span style={{ fontSize: 10, color: '#6c757d', fontWeight: 400, marginLeft: 4 }}>
                (clase {ACCOUNT_MASTER_CODE_PREFIX[form.type] ?? '5'})
              </span>
            </label>
            <input
              className="payment-form__input"
              type="text"
              value={form.code}
              onChange={set('code')}
              placeholder={codePlaceholder}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          <div className="payment-form__field">
            <label className="payment-form__label">Naturaleza</label>
            <input
              className="payment-form__input"
              type="text"
              value={ACCOUNT_MASTER_NATURE[form.type] ?? '—'}
              readOnly
              style={{ background: '#f8f9fa', color: '#6c757d', cursor: 'default' }}
            />
          </div>

          <div className="payment-form__field">
            <label className="payment-form__label">Período</label>
            <select
              className="payment-form__input payment-form__input--select"
              value={form.period}
              onChange={set('period')}
            >
              {PERIOD_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          <div className="payment-form__field">
            <label className="payment-form__label">Clasificación</label>
            <select
              className="payment-form__input payment-form__input--select"
              value={form.classification}
              onChange={set('classification')}
            >
              {CLASSIFICATION_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
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
              {ACCOUNT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          <div className="payment-form__field">
            <label className="payment-form__label">Día máximo de pago</label>
            <input
              className="payment-form__input"
              type="number"
              min={1}
              max={31}
              value={form.maxDatePay}
              onChange={set('maxDatePay')}
            />
          </div>

          <div className="payment-form__field">
            <label className="payment-form__label">Método de pago</label>
            <select
              className="payment-form__input payment-form__input--select"
              value={form.paymentMethod}
              onChange={set('paymentMethod')}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(form.period === 'Anuales' ||
          form.period === 'Trimestrales' ||
          form.period === 'Cuatrimestrales' ||
          form.period === 'Semestrales' ||
          form.period === 'N/A') && (
          <div className="payment-form__field">
            <label className="payment-form__label">Mes de inicio / aplica</label>
            <select
              className="payment-form__input payment-form__input--select"
              value={form.monthStartAt}
              onChange={set('monthStartAt')}
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={m} value={m}>
                  {monthLabels[i]}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="payment-form__field">
          <label className="payment-form__label">Valor por defecto (COP)</label>
          <input
            className="payment-form__input"
            type="number"
            value={form.defaultValue}
            onChange={set('defaultValue')}
            placeholder="0 — opcional"
            min="0"
          />
        </div>

        <div className="payment-form__field">
          <label className="payment-form__label">
            Deuda total a pagar (COP)
            <span style={{ fontSize: 11, color: '#6c757d', fontWeight: 400, marginLeft: 6 }}>
              — dejar vacío si no es una deuda
            </span>
          </label>
          <input
            className="payment-form__input"
            type="number"
            value={form.targetAmount}
            onChange={set('targetAmount')}
            placeholder="0 — opcional"
            min="0"
          />
        </div>

        <div className="payment-form__field">
          <label className="payment-form__label">Definición</label>
          <input
            className="payment-form__input"
            type="text"
            value={form.definition}
            onChange={set('definition')}
            placeholder="Ej: Indefinidos"
          />
        </div>

        <div className="payment-form__field">
          <label className="payment-form__label">Estado</label>
          <select
            className="payment-form__input payment-form__input--select"
            value={form.active ? 'true' : 'false'}
            onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.value === 'true' }))}
          >
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>

        <div
          className="payment-form__field"
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          onClick={() => setForm((prev) => ({ ...prev, important: !prev.important }))}
        >
          <input
            type="checkbox"
            checked={!!form.important}
            onChange={(e) => setForm((prev) => ({ ...prev, important: e.target.checked }))}
            style={{
              width: 18,
              height: 18,
              accentColor: '#e03131',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <label className="payment-form__label" style={{ marginBottom: 0, cursor: 'pointer' }}>
            <span style={{ color: '#e03131', marginRight: 4 }}>★</span>Importante
          </label>
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
          disabled={saving || !form.name.trim()}
        >
          {saving ? <CSpinner size="sm" /> : 'Guardar'}
        </CButton>
      </div>
    </div>
  )
}
