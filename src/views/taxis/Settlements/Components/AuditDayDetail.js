import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import DetailPanel, { DetailSection, DetailRow } from 'src/components/shared/DetailPanel'
import * as taxiSettlementActions from 'src/actions/taxi/taxiSettlementActions'
import { fmt } from './utils'

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
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 0',
        borderBottom: '1px solid #e8e8e8',
      }}
    >
      <span style={{ minWidth: 150, fontSize: 12, color: '#374151', fontWeight: 500 }}>
        {[record.driver, record.plate].filter(Boolean).join(' · ')}
      </span>

      {editing ? (
        <input
          autoFocus
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (!dirty) setEditing(false)
          }}
          style={{
            width: 110,
            fontSize: 12,
            fontWeight: 600,
            padding: '1px 4px',
            border: 'none',
            borderBottom: '2px dotted #94a3b8',
            outline: 'none',
            background: 'transparent',
            color: '#374151',
          }}
        />
      ) : (
        <span
          onClick={() => setEditing(true)}
          title="Click para editar"
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#374151',
            borderBottom: '2px dotted #94a3b8',
            cursor: 'text',
            paddingBottom: 1,
          }}
        >
          {fmt(Number(amount))}
        </span>
      )}

      {dirty && (
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 10px',
            borderRadius: 4,
            border: 'none',
            background: '#1e3a5f',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          {saving ? '…' : 'Guardar'}
        </button>
      )}
      {record.comment && <span style={{ fontSize: 11, color: '#6b7280' }}>{record.comment}</span>}
    </div>
  )
}

const AuditDayDetail = ({ day, periodDrivers, getNote, t }) => (
  <tr>
    <td colSpan={7} style={{ padding: 0, background: 'var(--cui-card-bg, #fff)' }}>
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
                <div
                  key={dr}
                  style={{
                    display: 'flex',
                    gap: 8,
                    padding: '5px 0',
                    borderBottom: '1px solid #e8e8e8',
                  }}
                >
                  <span style={{ minWidth: 150, fontSize: 12, color: '#6b21a8', fontWeight: 500 }}>
                    🚫 {dr}
                  </span>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#6b21a8' }}>
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
