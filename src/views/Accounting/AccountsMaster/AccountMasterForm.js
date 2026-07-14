import React from 'react'
import { useForm } from 'react-hook-form'
import {
  CLASSIFICATION_OPTIONS,
  PERIOD_OPTIONS,
  ACCOUNT_MASTER_TYPES,
  ACCOUNT_MASTER_TYPE_LABELS,
  ACCOUNT_MASTER_NATURE,
  ACCOUNT_MASTER_CODE_PREFIX,
} from 'src/constants/accounting'
import {
  ACCOUNT_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  BANK_NAMES,
  BANK_ACCOUNT_TYPES,
} from 'src/constants/cashFlow'
import { MONTH_NAMES } from 'src/constants/commons'
import useLocaleData from 'src/hooks/useLocaleData'
import StandardForm, { StandardField, SF } from 'src/components/shared/StandardForm'

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
  bankName: '',
  bankAccountType: '',
  bankAccountNumber: '',
  bankAccountHolder: '',
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
    formState: { errors, isValid },
  } = useForm({ defaultValues: initial ?? EMPTY_FORM, mode: 'onChange' })

  const type = watch('type')
  const period = watch('period')
  const categoryOptions = type === 'Incoming' ? INCOME_CATEGORIES : ACCOUNT_CATEGORIES
  const active = watch('active') ?? true
  const important = watch('important') ?? false
  const isEdit = !!initial?.id
  const codePlaceholder = `${ACCOUNT_MASTER_CODE_PREFIX[type] ?? '5'}xxx (ej. ${ACCOUNT_MASTER_CODE_PREFIX[type] ?? '5'}195)`

  return (
    <StandardForm
      title={isEdit ? 'Editar cuenta maestra' : 'Nueva cuenta maestra'}
      onCancel={onCancel}
      onSave={handleSubmit(onSave)}
      saving={saving}
      disabled={!isValid}
    >
      <StandardField label="Nombre *">
        <input
          className={SF.input}
          type="text"
          placeholder="Nombre de la cuenta"
          {...register('name', { required: 'El nombre es obligatorio' })}
        />
        {fieldError(errors.name)}
      </StandardField>

      <StandardField
        label={
          <>
            Nombre Contable NIIF
            <span style={{ fontSize: 11, color: '#6c757d', fontWeight: 400, marginLeft: 6 }}>
              — nombre según plan de cuentas
            </span>
          </>
        }
      >
        <input
          className={SF.input}
          type="text"
          placeholder="Ej: Arrendamientos — inmueble"
          {...register('accountingName')}
        />
      </StandardField>

      <StandardField label="Descripción">
        <input
          className={SF.input}
          type="text"
          placeholder="Descripción corta"
          {...register('description')}
        />
      </StandardField>

      <StandardField label="Notas">
        <textarea
          className={SF.textarea}
          placeholder="Comentarios u observaciones adicionales…"
          rows={3}
          style={{ resize: 'vertical', lineHeight: 1.5 }}
          {...register('notes')}
        />
      </StandardField>

      <div className="payment-form__row">
        <StandardField label="Tipo">
          <select className={SF.select} {...register('type')}>
            {ACCOUNT_MASTER_TYPES.map((o) => (
              <option key={o} value={o}>
                {ACCOUNT_MASTER_TYPE_LABELS[o]}
              </option>
            ))}
          </select>
        </StandardField>
        <StandardField
          label={
            <>
              Código PUC *
              <span style={{ fontSize: 10, color: '#6c757d', fontWeight: 400, marginLeft: 4 }}>
                (clase {ACCOUNT_MASTER_CODE_PREFIX[type] ?? '5'})
              </span>
            </>
          }
        >
          <input
            className={SF.input}
            type="text"
            placeholder={codePlaceholder}
            {...register('code')}
          />
        </StandardField>
      </div>

      <div className="payment-form__row">
        <StandardField label="Naturaleza">
          <input
            className={SF.readonly}
            type="text"
            value={ACCOUNT_MASTER_NATURE[type] ?? '—'}
            readOnly
            style={{ background: '#f8f9fa', color: '#6c757d', cursor: 'default' }}
          />
        </StandardField>
        <StandardField label="Período">
          <select className={SF.select} {...register('period')}>
            {PERIOD_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </StandardField>
      </div>

      <div className="payment-form__row">
        <StandardField label="Clasificación">
          <select className={SF.select} {...register('classification')}>
            {CLASSIFICATION_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </StandardField>
        <StandardField label="Categoría">
          <select className={SF.select} {...register('category')}>
            <option value="">Sin categoría</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </StandardField>
      </div>

      <div className="payment-form__row">
        <StandardField label="Día máximo de pago">
          <input className={SF.input} type="number" min={1} max={31} {...register('maxDatePay')} />
        </StandardField>
        <StandardField label="Método de pago">
          <select className={SF.select} {...register('paymentMethod')}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </StandardField>
      </div>

      <div className="payment-form__row">
        <StandardField label="Banco">
          <select className={SF.select} {...register('bankName')}>
            <option value="">Sin banco</option>
            {BANK_NAMES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </StandardField>
        <StandardField label="Tipo de cuenta">
          <select className={SF.select} {...register('bankAccountType')}>
            <option value="">Sin tipo</option>
            {BANK_ACCOUNT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </StandardField>
      </div>

      <div className="payment-form__row">
        <StandardField label="Número de cuenta">
          <input
            className={SF.input}
            type="text"
            placeholder="Ej: 123-456789-00"
            {...register('bankAccountNumber')}
          />
        </StandardField>
        <StandardField label="Titular de la cuenta">
          <input
            className={SF.input}
            type="text"
            placeholder="Nombre del titular"
            {...register('bankAccountHolder')}
          />
        </StandardField>
      </div>

      {PERIOD_WITH_MONTH.includes(period) && (
        <StandardField label="Mes de inicio / aplica">
          <select className={SF.select} {...register('monthStartAt')}>
            {MONTH_NAMES.map((m, i) => (
              <option key={m} value={m}>
                {monthLabels[i]}
              </option>
            ))}
          </select>
        </StandardField>
      )}

      <StandardField label="Valor por defecto (COP)">
        <input
          className={SF.input}
          type="number"
          placeholder="0 — opcional"
          min="0"
          {...register('defaultValue')}
        />
      </StandardField>

      <StandardField
        label={
          <>
            Deuda total a pagar (COP)
            <span style={{ fontSize: 11, color: '#6c757d', fontWeight: 400, marginLeft: 6 }}>
              — dejar vacío si no es una deuda
            </span>
          </>
        }
      >
        <input
          className={SF.input}
          type="number"
          placeholder="0 — opcional"
          min="0"
          {...register('targetAmount')}
        />
      </StandardField>

      <StandardField label="Definición">
        <input
          className={SF.input}
          type="text"
          placeholder="Ej: Indefinidos"
          {...register('definition')}
        />
      </StandardField>

      <StandardField label="Estado">
        <select
          className={SF.select}
          value={active ? 'true' : 'false'}
          onChange={(e) => setValue('active', e.target.value === 'true')}
        >
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
      </StandardField>

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
    </StandardForm>
  )
}
