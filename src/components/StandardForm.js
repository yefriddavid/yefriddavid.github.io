import React from 'react'
import { useTranslation } from 'react-i18next'
import { CSpinner } from '@coreui/react'
import '../views/movements/payments/ItemDetail.scss'

// CSS class helpers for inputs inside StandardField
export const SF = {
  input: 'payment-form__input',
  select: 'payment-form__input payment-form__input--select',
  textarea: 'payment-form__input payment-form__input--textarea',
  readonly: 'payment-form__input payment-form__input--readonly',
}

// Wraps a label + input pair
export const StandardField = ({ label, children }) => (
  <div className="payment-form__field">
    <label className="payment-form__label">{label}</label>
    {children}
  </div>
)

// Full form: header + body (children) + cancel/save actions
const StandardForm = ({
  title,
  subtitle,
  onCancel,
  onSave,
  saving = false,
  saveLabel,
  cancelLabel,
  children,
}) => {
  const { t } = useTranslation()
  const resolvedSaveLabel = saveLabel ?? t('common.save')
  const resolvedCancelLabel = cancelLabel ?? t('common.cancel')
  return (
  <div className="payment-form">
    <div className="payment-form__header">
      <span className="payment-form__title">{title}</span>
      {subtitle && <span className="payment-form__id">{subtitle}</span>}
    </div>
    <div className="payment-form__body">{children}</div>
    <div className="payment-form__actions">
      <button className="payment-form__btn payment-form__btn--cancel" onClick={onCancel} disabled={saving}>
        {resolvedCancelLabel}
      </button>
      <button className="payment-form__btn payment-form__btn--save" onClick={onSave} disabled={saving}>
        {saving ? <CSpinner size="sm" /> : resolvedSaveLabel}
      </button>
    </div>
  </div>
  )
}

export default StandardForm
