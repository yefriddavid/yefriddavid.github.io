import React from 'react'
import { CButton, CFormLabel, CFormSelect, CFormInput, CAlert } from '@coreui/react'

const MAX_RANGE_DAYS = 7

function toLocalDatetimeValue(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const RouteControls = ({
  vehicles,
  vehicleId,
  startDate,
  endDate,
  fetching,
  onVehicleChange,
  onStartChange,
  onEndChange,
  onSearch,
  onClear,
}) => {
  const rangeMs = endDate - startDate
  const rangeDays = rangeMs / 86_400_000
  const rangeExceeded = rangeDays > MAX_RANGE_DAYS
  const endBeforeStart = endDate <= startDate
  const searchDisabled = !vehicleId || rangeExceeded || endBeforeStart || fetching

  return (
    <div className="route-controls">
      <div className="mb-3">
        <CFormLabel className="fw-semibold">Vehículo</CFormLabel>
        <CFormSelect value={vehicleId} onChange={(e) => onVehicleChange(e.target.value)}>
          <option value="">— Seleccionar —</option>
          {vehicles?.map((v) => (
            <option key={v.id} value={v.id}>
              {v.plate} {v.brand ? `· ${v.brand}` : ''}
            </option>
          ))}
        </CFormSelect>
      </div>

      <div className="mb-3">
        <CFormLabel className="fw-semibold">Desde</CFormLabel>
        <CFormInput
          type="datetime-local"
          value={toLocalDatetimeValue(startDate)}
          onChange={(e) => onStartChange(new Date(e.target.value))}
        />
      </div>

      <div className="mb-3">
        <CFormLabel className="fw-semibold">Hasta</CFormLabel>
        <CFormInput
          type="datetime-local"
          value={toLocalDatetimeValue(endDate)}
          onChange={(e) => onEndChange(new Date(e.target.value))}
        />
      </div>

      {endBeforeStart && (
        <CAlert color="warning" className="py-2 small">
          La fecha de fin debe ser posterior al inicio.
        </CAlert>
      )}
      {rangeExceeded && (
        <CAlert color="warning" className="py-2 small">
          El rango máximo es {MAX_RANGE_DAYS} días.
        </CAlert>
      )}

      <div className="d-grid gap-2">
        <CButton color="primary" disabled={searchDisabled} onClick={onSearch}>
          {fetching ? 'Buscando…' : 'Buscar ruta'}
        </CButton>
        <CButton color="secondary" variant="outline" onClick={onClear}>
          Limpiar
        </CButton>
      </div>
    </div>
  )
}

export default RouteControls
