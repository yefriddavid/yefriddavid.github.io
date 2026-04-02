import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil } from '@coreui/icons'
import StandardForm, { StandardField, SF } from 'src/components/App/StandardForm'
import DetailPanel, { DetailSection, DetailRow } from 'src/components/App/DetailPanel'
import { fmt } from './utils'

const SettlementMasterDetail = ({ data, drivers, vehicles, onSave, saving, editingRowIdRef }) => {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(() => editingRowIdRef?.current === data.id)
  const [form, setForm] = useState({
    date: data.date || '',
    driver: data.driver || '',
    plate: data.plate || '',
    amount: data.amount || '',
    comment: data.comment || '',
    paid_at: data.paid_at || '',
  })
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const driver = drivers.find((d) => d.name === data.driver)
  const vehicle = vehicles.find((v) => v.plate === data.plate)

  if (editing) {
    return (
      <div style={{ width: '50%', padding: 16 }}>
        <StandardForm
          title={t('taxis.settlements.editSettlement')}
          subtitle={data.date}
          onCancel={() => setEditing(false)}
          onSave={() => {
            onSave({ ...data, ...form, amount: Number(form.amount) })
            setEditing(false)
          }}
          saving={saving}
        >
          <StandardField label={t('taxis.settlements.fields.date')}>
            <input className={SF.input} type="date" value={form.date} onChange={set('date')} />
          </StandardField>
          <StandardField label={t('taxis.settlements.fields.driver')}>
            <select className={SF.select} value={form.driver} onChange={set('driver')}>
              <option value="">{t('taxis.settlements.selectOption')}</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </StandardField>
          <StandardField label={t('taxis.settlements.fields.plate')}>
            <select className={SF.select} value={form.plate} onChange={set('plate')}>
              <option value="">{t('taxis.settlements.selectOption')}</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.plate}>
                  {v.plate}
                  {v.brand ? ` · ${v.brand}` : ''}
                </option>
              ))}
            </select>
          </StandardField>
          <StandardField label={t('taxis.settlements.fields.value')}>
            <input
              className={SF.input}
              type="number"
              value={form.amount}
              onChange={set('amount')}
              placeholder="0"
            />
          </StandardField>
          <StandardField label={t('taxis.settlements.fields.comment')}>
            <textarea
              className={SF.textarea}
              value={form.comment || ''}
              onChange={set('comment')}
              rows={3}
            />
          </StandardField>
          <StandardField label="Pagado el">
            <input
              className={SF.input}
              type="datetime-local"
              value={form.paid_at || ''}
              onChange={set('paid_at')}
            />
          </StandardField>
        </StandardForm>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px 0' }}>
        <CButton size="sm" color="primary" variant="outline" onClick={() => setEditing(true)}>
          <CIcon icon={cilPencil} size="sm" /> {t('common.edit')}
        </CButton>
      </div>
      <DetailPanel columns={3}>
        <DetailSection title={t('taxis.settlements.fields.settlement')}>
          <DetailRow label={t('taxis.settlements.fields.date')} value={data.date} />
          <DetailRow label={t('taxis.settlements.fields.value')} value={fmt(data.amount)} />
          <DetailRow label={t('taxis.settlements.fields.driver')} value={data.driver} />
          <DetailRow label={t('taxis.settlements.fields.plate')} value={data.plate} mono />
          <DetailRow label={t('taxis.settlements.fields.comment')} value={data.comment} />
          <DetailRow
            label="Pagado el"
            value={data.paid_at ? new Date(data.paid_at).toLocaleString('es-CO') : null}
          />
        </DetailSection>
        <DetailSection title={t('taxis.settlements.fields.driver')}>
          {driver ? (
            <>
              <DetailRow
                label={t('taxis.settlements.fields.idNumber')}
                value={driver.idNumber}
                mono
              />
              <DetailRow label={t('taxis.settlements.fields.phone')} value={driver.phone} />
              <DetailRow
                label={t('taxis.settlements.fields.defaultAmount')}
                value={driver.defaultAmount ? fmt(driver.defaultAmount) : null}
              />
              <DetailRow
                label={t('taxis.settlements.fields.defaultAmountSunday')}
                value={driver.defaultAmountSunday ? fmt(driver.defaultAmountSunday) : null}
              />
            </>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)' }}>
              {t('taxis.settlements.noDataInfo')}
            </span>
          )}
        </DetailSection>
        <DetailSection title={t('taxis.settlements.fields.vehicle')}>
          {vehicle ? (
            <>
              <DetailRow label={t('taxis.settlements.fields.plate')} value={vehicle.plate} mono />
              <DetailRow label={t('taxis.settlements.fields.brand')} value={vehicle.brand} />
              <DetailRow label={t('taxis.settlements.fields.model')} value={vehicle.model} />
              <DetailRow label={t('taxis.settlements.fields.year')} value={vehicle.year} />
            </>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)' }}>
              {t('taxis.settlements.noDataInfo')}
            </span>
          )}
        </DetailSection>
      </DetailPanel>
    </div>
  )
}

export default SettlementMasterDetail
