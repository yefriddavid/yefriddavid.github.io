import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import DetailPanel, { DetailSection, DetailRow } from 'src/components/shared/DetailPanel'
import * as taxiSettlementActions from 'src/actions/taxi/taxiSettlementActions'
import { fmt } from './utils'
import './Settlements.scss'

const SettlementRow = ({ record }) => {
  const dispatch = useDispatch()
  const [amount, setAmount] = useState(String(record.amount))
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const dirty = Number(amount) !== record.amount

  const handleSave = () => {
    if (!dirty || isNaN(Number(amount))) return
    setSaving(true)
    dispatch(taxiSettlementActions.updateRequest({ ...record, amount: Number(amount) }))
    setSaving(false)
    setEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') {
      setAmount(String(record.amount))
      setEditing(false)
    }
  }

  return (
    <div className="settlement-row">
      <span className="settlement-row__label">
        {[record.driver, record.plate].filter(Boolean).join(' · ')}
      </span>

      {editing ? (
        <input
          autoFocus
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (!dirty) setEditing(false) }}
          className="settlement-row__amount-input"
        />
      ) : (
        <span
          className="settlement-row__amount-display"
          onClick={() => setEditing(true)}
          title="Click para editar"
        >
          {fmt(Number(amount))}
        </span>
      )}

      {dirty && (
        <button className="settlement-row__save-btn" onClick={handleSave} disabled={saving}>
          {saving ? '…' : 'Guardar'}
        </button>
      )}
      {record.comment && <span className="settlement-row__comment">{record.comment}</span>}
    </div>
  )
}

const AuditDayDetail = ({ day, periodDrivers, getNote, t }) => (
  <tr>
    <td colSpan={7} className="audit-day-cell">
      <DetailPanel columns={2}>
        <DetailSection title={t('taxis.settlements.audit.colDay')}>
          <DetailRow label={t('taxis.settlements.fields.date')} value={day.dateStr} />
          <DetailRow
            label={t('taxis.settlements.audit.colStatus')}
            value={
              day.status === 'none'
                ? t('taxis.settlements.audit.statusNone')
                : day.status === 'partial'
                  ? t('taxis.settlements.audit.statusPartial')
                  : day.status === 'full'
                    ? t('taxis.settlements.audit.statusFull')
                    : t('taxis.settlements.audit.statusFuture')
            }
          />
          <DetailRow label={t('taxis.settlements.audit.colCount')} value={day.dayRecords.length} />
          <DetailRow
            label={t('taxis.settlements.audit.colTotal')}
            value={day.total > 0 ? fmt(day.total) : null}
          />
        </DetailSection>

        <DetailSection
          title={
            day.dayRecords.length > 0
              ? t('taxis.settlements.audit.colSettled')
              : t('taxis.settlements.audit.colMissing')
          }
        >
          {day.dayRecords.length > 0
            ? day.dayRecords.map((r) => <SettlementRow key={r.id} record={r} />)
            : day.missing.map((dr) => (
                <DetailRow key={dr} label={dr} value={getNote(day.dateStr, dr) || '—'} />
              ))}

          {day.hasPicoPlaca &&
            day.picoPlacaDrivers.map((dr) => {
              const driverObj = periodDrivers.find((pd) => pd.name === dr)
              return (
                <div key={dr} className="pico-placa-row">
                  <span className="pico-placa-row__driver">🚫 {dr}</span>
                  <span className="pico-placa-row__vehicle">
                    {driverObj?.defaultVehicle || ''} · Pico y placa
                  </span>
                </div>
              )
            })}
        </DetailSection>
      </DetailPanel>
    </td>
  </tr>
)

export default AuditDayDetail
