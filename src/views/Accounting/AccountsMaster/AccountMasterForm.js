import React from 'react'
import { CButton, CSpinner } from '@coreui/react'
import { useForm } from 'react-hook-form'
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

const fieldError = (err) =>
  err ? (
    <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 2, display: 'block' }}>
      {err.message}
    </span>
  ) : null

const PERIOD_WITH_MONTH = ['Anuales', 'Trimestrales', 'Cuatrimestrales', 'Semestrales', 'N/A']

export default function AccountMasterForm({ initial, saving, onSave, onCancel }) {
  const { monthLabels } = useLocaleData()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: initial ?? EMPTY_FORM })

  const type = watch('type')
  const period = watch('period')
  const active = watch('active') ?? true
  const important = watch('important') ?? false
  const isEdit = !!initial?.id
  const codePlaceholder = `${ACCOUNT_MASTER_CODE_PREFIX[type] ?? '5'}xxx (ej. ${ACCOUNT_MASTER_CODE_PREFIX[type] ?? '5'}195)`

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
            placeholder="Nombre de la cuenta"
            {...register('name', { required: 'El nombre es obligatorio' })}
          />
          {fieldError(errors.name)}
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
            placeholder="Ej: Arrendamientos — inmueble"
            {...register('accountingName')}
          />
        </div>

        <div className="payment-form__field">
          <label className="payment-form__label">Descripción</label>
          <input
            className="payment-form__input"
            type="text"
            placeholder="Descripción corta"
            {...register('description')}
          />
        </div>

        <div className="payment-form__field">
          <label className="payment-form__label">Notas</label>
          <textarea
            className="payment-form__input"
            placeholder="Comentarios u observaciones adicionales…"
            rows={3}
            style={{ resize: 'vertical', lineHeight: 1.5 }}
            {...register('notes')}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          <div className="payment-form__field">
            <label className="payment-form__label">Tipo</label>
            <select
              className="payment-form__input payment-form__input--select"
              {...register('type')}
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
                (clase {ACCOUNT_MASTER_CODE_PREFIX[type] ?? '5'})
              </span>
            </label>
            <input
              className="payment-form__input"
              type="text"
              placeholder={codePlaceholder}
              {...register('code')}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          <div className="payment-form__field">
            <label className="payment-form__label">Naturaleza</label>
            <input
              className="payment-form__input"
              type="text"
              value={ACCOUNT_MASTER_NATURE[type] ?? '—'}
              readOnly
              style={{ background: '#f8f9fa', color: '#6c757d', cursor: 'default' }}
            />
          </div>

          <div className="payment-form__field">
            <label className="payment-form__label">Período</label>
            <select
              className="payment-form__input payment-form__input--select"
              {...register('period')}
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
              {...register('classification')}
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
              {...register('category')}
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
              {...register('maxDatePay')}
            />
          </div>

          <div className="payment-form__field">
            <label className="payment-form__label">Método de pago</label>
            <select
              className="payment-form__input payment-form__input--select"
              {...register('paymentMethod')}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {PERIOD_WITH_MONTH.includes(period) && (
          <div className="payment-form__field">
            <label className="payment-form__label">Mes de inicio / aplica</label>
            <select
              className="payment-form__input payment-form__input--select"
              {...register('monthStartAt')}
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
            placeholder="0 — opcional"
            min="0"
            {...register('defaultValue')}
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
            placeholder="0 — opcional"
            min="0"
            {...register('targetAmount')}
          />
        </div>

        <div className="payment-form__field">
          <label className="payment-form__label">Definición</label>
          <input
            className="payment-form__input"
            type="text"
            placeholder="Ej: Indefinidos"
            {...register('definition')}
          />
        </div>

        <div className="payment-form__field">
          <label className="payment-form__label">Estado</label>
          <select
            className="payment-form__input payment-form__input--select"
            value={active ? 'true' : 'false'}
            onChange={(e) => setValue('active', e.target.value === 'true')}
          >
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>

        <div
          className="payment-form__field"
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          onClick={() => setValue('important', !important)}
        >
          <input
            type="checkbox"
            checked={important}
            onChange={(e) => setValue('important', e.target.checked)}
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
          onClick={handleSubmit(onSave)}
          disabled={saving}
        >
          {saving ? <CSpinner size="sm" /> : 'Guardar'}
        </CButton>
      </div>
    </div>
  )
}
