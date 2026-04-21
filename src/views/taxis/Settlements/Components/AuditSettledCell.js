import React from 'react'
import { fmt } from './utils'
import AuditAddForm from './AuditAddForm'
import './Audit.scss'

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
  <td className="audit-cell">
    <div className="audit-cell__chips">
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
            className={`settled-chip${underpaid ? ' settled-chip--underpaid' : ' settled-chip--normal'}`}
          >
            {underpaid ? '◐ ' : ''}
            {dr.split(' ')[0]}
            {driverRecords.length > 1 ? ` · ${fmt(rec.amount)}` : ''}
            <button
              className="settled-chip__delete-btn"
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
              title="Eliminar liquidación"
            >
              ×
            </button>
          </span>
        ))
      })}
      {!day.isFuture && addingSettlementDay !== day.dateStr && (
        <button
          className="add-settlement-btn"
          onClick={(e) => {
            e.stopPropagation()
            setAddingSettlementDay(day.dateStr)
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
