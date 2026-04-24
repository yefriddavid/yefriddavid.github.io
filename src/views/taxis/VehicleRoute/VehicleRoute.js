import React, { useState, useMemo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { CCard, CCardHeader, CCardBody, CRow, CCol, CSpinner, CAlert } from '@coreui/react'
import * as taxiVehicleActions from 'src/actions/taxi/taxiVehicleActions'
import * as vehicleRouteActions from 'src/actions/taxi/vehicleRouteActions'
import { haversineKm, haversineKmh } from 'src/utils/geoUtils'
import RouteControls from './RouteControls'
import RouteSummary from './RouteSummary'
import 'leaflet/dist/leaflet.css'
import './VehicleRoute.scss'

const DEFAULT_CENTER = [-1.6635, -78.6536]

const startIcon = L.divIcon({
  className: '',
  html: '<div style="width:14px;height:14px;border-radius:50%;background:#28a745;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

const endIcon = L.divIcon({
  className: '',
  html: '<div style="width:14px;height:14px;border-radius:50%;background:#dc3545;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

function BoundsController({ positions }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length >= 2) {
      map.fitBounds(positions, { padding: [40, 40] })
    }
  }, [positions, map])
  return null
}

function todayStart() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function todayEnd() {
  const d = new Date()
  d.setHours(23, 59, 0, 0)
  return d
}

const VehicleRoute = () => {
  const dispatch = useDispatch()
  const { data: vehicles } = useSelector((s) => s.taxiVehicle)
  const { data: routePoints, fetching, error } = useSelector((s) => s.vehicleRoute)

  const [vehicleId, setVehicleId] = useState('')
  const [startDate, setStartDate] = useState(todayStart)
  const [endDate, setEndDate] = useState(todayEnd)

  useEffect(() => {
    if (!vehicles) dispatch(taxiVehicleActions.fetchRequest())
  }, [dispatch, vehicles])

  const handleSearch = () => {
    if (!vehicleId) return
    dispatch(vehicleRouteActions.fetchRequest({ vehicleId, startDate, endDate }))
  }

  const handleClear = () => {
    dispatch(vehicleRouteActions.clearRoute())
  }

  const positions = useMemo(() => routePoints.map((p) => [p.lat, p.lng]), [routePoints])

  const routeStats = useMemo(() => {
    if (routePoints.length < 2) return null
    let totalDistanceKm = 0
    let maxSpeed = 0
    const speeds = []

    for (let i = 1; i < routePoints.length; i++) {
      const prev = routePoints[i - 1]
      const curr = routePoints[i]
      const deltaMs = new Date(curr.timestamp) - new Date(prev.timestamp)
      const speed = haversineKmh(prev.lat, prev.lng, curr.lat, curr.lng, deltaMs)
      totalDistanceKm += haversineKm(prev.lat, prev.lng, curr.lat, curr.lng)
      speeds.push(speed)
      if (speed > maxSpeed) maxSpeed = speed
    }

    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length
    const durationMs =
      new Date(routePoints[routePoints.length - 1].timestamp) - new Date(routePoints[0].timestamp)

    return {
      totalPoints: routePoints.length,
      totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
      durationMin: Math.round(durationMs / 60_000),
      maxSpeed: Math.round(maxSpeed),
      avgSpeed: Math.round(avgSpeed),
      stops: speeds.filter((s) => s < 5).length,
    }
  }, [routePoints])

  const selectedVehicle = vehicles?.find((v) => v.id === vehicleId)

  return (
    <CCard className="mb-4 vehicle-route-card">
      <CCardHeader>
        <strong>Ruta de Vehículo</strong>
        {selectedVehicle && routePoints.length > 0 && (
          <span className="ms-2 text-muted fw-normal">— {selectedVehicle.plate}</span>
        )}
      </CCardHeader>
      <CCardBody>
        <CRow>
          <CCol lg={3}>
            <RouteControls
              vehicles={vehicles}
              vehicleId={vehicleId}
              startDate={startDate}
              endDate={endDate}
              fetching={fetching}
              onVehicleChange={setVehicleId}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
              onSearch={handleSearch}
              onClear={handleClear}
            />
            <RouteSummary stats={routeStats} />
          </CCol>

          <CCol lg={9}>
            {error && (
              <CAlert color="danger" className="mb-2">
                {error}
              </CAlert>
            )}

            {fetching ? (
              <div className="empty-state">
                <CSpinner color="primary" />
                <span className="small">Cargando ruta…</span>
              </div>
            ) : routePoints.length > 0 ? (
              <div className="map-wrapper">
                <MapContainer
                  center={DEFAULT_CENTER}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Polyline positions={positions} color="#0d6efd" weight={3} opacity={0.85} />
                  <Marker position={positions[0]} icon={startIcon}>
                    <Popup>
                      <strong>Inicio</strong>
                      <br />
                      <span className="small text-muted">
                        {new Date(routePoints[0].timestamp).toLocaleString()}
                      </span>
                    </Popup>
                  </Marker>
                  <Marker position={positions[positions.length - 1]} icon={endIcon}>
                    <Popup>
                      <strong>Fin</strong>
                      <br />
                      <span className="small text-muted">
                        {new Date(routePoints[routePoints.length - 1].timestamp).toLocaleString()}
                      </span>
                    </Popup>
                  </Marker>
                  <BoundsController positions={positions} />
                </MapContainer>
              </div>
            ) : (
              <div className="empty-state">
                <span style={{ fontSize: '2rem' }}>🗺️</span>
                <span className="small">
                  {routePoints.length === 0 && !fetching && !error
                    ? 'Seleccioná un vehículo y un rango de fechas para ver la ruta'
                    : 'No se encontraron registros para ese período'}
                </span>
              </div>
            )}
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  )
}

export default VehicleRoute
