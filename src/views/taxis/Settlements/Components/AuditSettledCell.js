import React from 'react'
import { fmt } from './utils'
import AuditAddForm from './AuditAddForm'

const AuditSettledCell = ({
  day,
  auditDriverFilter,
  drivers,
  periodDrivers,
  addingSettlementDay,
  setAddingSettlementDay,
  setLoadingDay,
  dispatch,
  taxiSettlementActions,
  dispatchCreate,
}) => (
  <td style={{ padding: '8px 6px' }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
      {(auditDriverFilter.size > 0
        ? day.settled.filter((dr) => auditDriverFilter.has(dr))
        : day.settled
      ).map((dr) => {
        const plate = drivers.find((d) => d.name === dr)?.defaultVehicle
        const underpaid = plate ? day.underpaidVehicles.includes(plate) : false
        const driverRecords = day.dayRecords.filter((r) => r.driver === dr)
        return driverRecords.map((rec) => (
          <span
            key={rec.id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 11,
              background: underpaid ? '#fff3cd' : '#dbeafe',
              color: underpaid ? '#7c5e00' : '#1e40af',
              borderRadius: 4,
              padding: '2px 7px',
              fontWeight: 500,
            }}
          >
            {underpaid ? '◐ ' : ''}
            {dr.split(' ')[0]}
            {driverRecords.length > 1 ? ` · ${fmt(rec.amount)}` : ''}
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (
                  window.confirm(
                    `¿Eliminar liquidación de ${dr} (${fmt(rec.amount)}) del ${day.dateStr}?`,
                  )
                ) {
                  setLoadingDay(day.dateStr)
                  setTimeout(() => dispatch(taxiSettlementActions.deleteRequest({ id: rec.id })), 0)
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#e03131',
                fontSize: 12,
                lineHeight: 1,
                padding: 0,
                marginLeft: 1,
              }}
              title="Eliminar liquidación"
            >
              ×
            </button>
          </span>
        ))
      })}
      {!day.isFuture && addingSettlementDay !== day.dateStr && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setAddingSettlementDay(day.dateStr)
          }}
          style={{
            background: 'none',
            border: '1px dashed #93c5fd',
            color: '#3b82f6',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 14,
            lineHeight: 1,
            padding: '1px 7px',
          }}
          title="Agregar liquidación"
        >
          +
        </button>
      )}
    </div>
    {!day.isFuture && addingSettlementDay === day.dateStr && (
      <AuditAddForm
        day={day}
        activeDrivers={drivers.filter((d) => d.active !== false)}
        periodDrivers={periodDrivers}
        onSave={(payload) => {
          dispatchCreate(payload)
          setAddingSettlementDay(null)
        }}
        onCancel={() => setAddingSettlementDay(null)}
      />
    )}
  </td>
)

export default AuditSettledCell
