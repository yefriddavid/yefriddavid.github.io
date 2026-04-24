import React from 'react'
import { CListGroup, CListGroupItem } from '@coreui/react'

const RouteSummary = ({ stats }) => {
  if (!stats) return null

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m}min` : `${h}h`
  }

  const rows = [
    { label: 'Puntos registrados', value: stats.totalPoints },
    { label: 'Distancia total', value: `${stats.totalDistanceKm} km` },
    { label: 'Duración', value: formatDuration(stats.durationMin) },
    { label: 'Vel. máxima', value: `${stats.maxSpeed} km/h` },
    { label: 'Vel. promedio', value: `${stats.avgSpeed} km/h` },
    { label: 'Paradas detectadas', value: stats.stops },
  ]

  return (
    <div className="route-summary mt-3">
      <p className="fw-semibold mb-2 small text-uppercase text-muted">Resumen</p>
      <CListGroup flush>
        {rows.map(({ label, value }) => (
          <CListGroupItem key={label} className="d-flex justify-content-between px-0 py-2 small">
            <span className="text-muted">{label}</span>
            <span className="fw-semibold">{value}</span>
          </CListGroupItem>
        ))}
      </CListGroup>
    </div>
  )
}

export default RouteSummary
