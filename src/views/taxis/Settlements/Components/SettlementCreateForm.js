import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  CButton,
  CSpinner,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
  CCol,
} from '@coreui/react'

const SettlementCreateForm = ({
  form,
  drivers,
  vehicles,
  loading,
  picoPlacaWarning,
  error,
  onSubmit,
  onDriverChange,
  onChange,
}) => {
  const { t } = useTranslation()

  return (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--cui-border-color)' }}>
      <CForm onSubmit={onSubmit}>
        <CRow className="g-2 align-items-end">
          <CCol sm={3}>
            <CFormLabel style={{ fontSize: 12 }}>{t('taxis.settlements.fields.driver')}</CFormLabel>
            <CFormSelect size="sm" value={form.driver} onChange={onDriverChange}>
              <option value="">{t('taxis.settlements.selectOption')}</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                  {d.active === false ? ' (Inactivo)' : ''}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol sm={2}>
            <CFormLabel style={{ fontSize: 12 }}>{t('taxis.settlements.fields.plate')}</CFormLabel>
            <CFormSelect size="sm" value={form.plate} onChange={onChange('plate')}>
              <option value="">{t('taxis.settlements.selectOption')}</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.plate}>
                  {v.plate}
                  {v.brand ? ` · ${v.brand}` : ''}
                  {v.active === false ? ' (Inactivo)' : ''}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol sm={2}>
            <CFormLabel style={{ fontSize: 12 }}>{t('taxis.settlements.fields.value')}</CFormLabel>
            <CFormInput
              size="sm"
              type="number"
              placeholder="0"
              value={form.amount}
              onChange={onChange('amount')}
            />
          </CCol>
          <CCol sm={2}>
            <CFormLabel style={{ fontSize: 12 }}>{t('taxis.settlements.fields.date')}</CFormLabel>
            <CFormInput
              size="sm"
              type="date"
              value={form.date}
              onChange={onChange('date')}
              invalid={!!picoPlacaWarning}
            />
            {picoPlacaWarning && (
              <div style={{ fontSize: 11, color: '#e03131', marginTop: 3 }}>
                ⚠ {picoPlacaWarning}
              </div>
            )}
          </CCol>
          <CCol sm={2}>
            <CFormLabel style={{ fontSize: 12 }}>
              {t('taxis.settlements.fields.comment')}
            </CFormLabel>
            <CFormInput
              size="sm"
              placeholder={t('taxis.settlements.notes')}
              value={form.comment}
              onChange={onChange('comment')}
            />
          </CCol>
          <CCol sm={2}>
            <CButton
              type="submit"
              size="sm"
              color="primary"
              disabled={loading || !!picoPlacaWarning}
              style={{ width: '100%' }}
            >
              {loading ? <CSpinner size="sm" /> : t('common.save')}
            </CButton>
          </CCol>
        </CRow>
        {error && <div style={{ marginTop: 8, fontSize: 12, color: '#e03131' }}>{error}</div>}
      </CForm>
    </div>
  )
}

export default SettlementCreateForm
