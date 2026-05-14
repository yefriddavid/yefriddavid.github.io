import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import {
  CButton,
  CSpinner,
  CFormLabel,
  CRow,
  CCol,
} from '@coreui/react'

const fieldError = (err) =>
  err ? (
    <div style={{ fontSize: 11, color: '#e03131', marginTop: 3 }}>{err.message}</div>
  ) : null

const SettlementCreateForm = ({ drivers, vehicles, vehiclesMap, loading, onSave }) => {
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { driver: '', plate: '', amount: '', date: '', comment: '' },
  })

  const plate = watch('plate')
  const date = watch('date')

  const picoPlacaWarning = useMemo(() => {
    if (!plate || !date) return null
    const [, monthStr, dayStr] = date.split('-')
    const month = parseInt(monthStr, 10)
    const day = parseInt(dayStr, 10)
    const vehicle = vehiclesMap?.get(plate)
    const restr = vehicle?.restrictions?.[month] ?? vehicle?.restrictions?.[String(month)]
    if (restr && new Set([restr.d1, restr.d2].filter(Boolean).map(Number)).has(day)) {
      return t('taxis.settlements.errors.picoPlaca', { plate, day })
    }
    return null
  }, [plate, date, vehiclesMap, t])

  const { onChange: driverRhfChange, ...driverReg } = register('driver', {
    required: t('taxis.settlements.errors.allRequired'),
  })

  const handleDriverChange = (e) => {
    driverRhfChange(e)
    const name = e.target.value
    const driver = drivers.find((d) => d.name === name)
    if (driver?.defaultVehicle) setValue('plate', driver.defaultVehicle)
    if (driver?.defaultAmount) setValue('amount', String(driver.defaultAmount))
  }

  const onSubmit = (data) => {
    if (picoPlacaWarning) return
    onSave(data)
  }

  return (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--cui-border-color)' }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CRow className="g-2 align-items-start">
          <CCol sm={3}>
            <CFormLabel style={{ fontSize: 12 }}>{t('taxis.settlements.fields.driver')}</CFormLabel>
            <select
              className="form-select form-select-sm"
              {...driverReg}
              onChange={handleDriverChange}
            >
              <option value="">{t('taxis.settlements.selectOption')}</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                  {d.active === false ? ' (Inactivo)' : ''}
                </option>
              ))}
            </select>
            {fieldError(errors.driver)}
          </CCol>
          <CCol sm={2}>
            <CFormLabel style={{ fontSize: 12 }}>{t('taxis.settlements.fields.plate')}</CFormLabel>
            <select
              className="form-select form-select-sm"
              {...register('plate', { required: t('taxis.settlements.errors.allRequired') })}
            >
              <option value="">{t('taxis.settlements.selectOption')}</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.plate}>
                  {v.plate}
                  {v.brand ? ` · ${v.brand}` : ''}
                  {v.active === false ? ' (Inactivo)' : ''}
                </option>
              ))}
            </select>
            {fieldError(errors.plate)}
          </CCol>
          <CCol sm={2}>
            <CFormLabel style={{ fontSize: 12 }}>{t('taxis.settlements.fields.value')}</CFormLabel>
            <input
              className="form-control form-control-sm"
              type="number"
              placeholder="0"
              {...register('amount', { required: t('taxis.settlements.errors.allRequired') })}
            />
            {fieldError(errors.amount)}
          </CCol>
          <CCol sm={2}>
            <CFormLabel style={{ fontSize: 12 }}>{t('taxis.settlements.fields.date')}</CFormLabel>
            <input
              className={`form-control form-control-sm${picoPlacaWarning ? ' is-invalid' : ''}`}
              type="date"
              {...register('date', { required: t('taxis.settlements.errors.allRequired') })}
            />
            {picoPlacaWarning && (
              <div style={{ fontSize: 11, color: '#e03131', marginTop: 3 }}>
                ⚠ {picoPlacaWarning}
              </div>
            )}
            {!picoPlacaWarning && fieldError(errors.date)}
          </CCol>
          <CCol sm={2}>
            <CFormLabel style={{ fontSize: 12 }}>
              {t('taxis.settlements.fields.comment')}
            </CFormLabel>
            <input
              className="form-control form-control-sm"
              placeholder={t('taxis.settlements.notes')}
              {...register('comment')}
            />
          </CCol>
          <CCol sm={1}>
            <CFormLabel style={{ fontSize: 12, opacity: 0 }}>_</CFormLabel>
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
      </form>
    </div>
  )
}

export default SettlementCreateForm
