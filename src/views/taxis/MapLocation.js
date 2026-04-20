import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CBadge,
  CSpinner,
  CRow,
  CCol,
  CListGroup,
  CListGroupItem,
  CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilFullscreen, cilFullscreenExit } from '@coreui/icons'
import * as taxiVehicleActions from 'src/actions/taxi/taxiVehicleActions'
import * as taxiDriverActions from 'src/actions/taxi/taxiDriverActions'
import 'leaflet/dist/leaflet.css'

const DEFAULT_CENTER = [6.2442, -75.5812]

/**
 * Creates a custom DivIcon that looks like a black flag with yellow text
 */
const createTaxiIcon = (plate) => {
  return L.divIcon({
    className: 'custom-taxi-marker',
    html: `
      <div style="
        background-color: #000;
        color: #ffcc00;
        border: 1px solid #ffcc00;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Monaco', 'Consolas', monospace;
        font-weight: bold;
        font-size: 11px;
        white-space: nowrap;
        position: relative;
        box-shadow: 0 2px 5px rgba(0,0,0,0.5);
      ">
        ${plate}
        <div style="
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid #000;
        "></div>
      </div>
    `,
    iconSize: [60, 20],
    iconAnchor: [30, 20],
    popupAnchor: [0, -20],
  })
}

/**
 * Component to handle map adjustments
 */
const MapController = ({ positions, isFullScreen }) => {
  const map = useMap()
  
  // Auto-fit bounds when positions change
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions.map((p) => [p.lat, p.lng]))
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    }
  }, [positions, map])

  // Invalidate size when entering/exiting fullscreen
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize()
    }, 400)
  }, [isFullScreen, map])

  return null
}

const MapLocation = () => {
  const dispatch = useDispatch()
  const { data: vehicles, fetching: fetchingVehicles } = useSelector((s) => s.taxiVehicle)
  const { data: drivers, fetching: fetchingDrivers } = useSelector((s) => s.taxiDriver)
  const [locations, setLocations] = useState({})
  const [isFullScreen, setIsFullScreen] = useState(false)

  const fetching = fetchingVehicles || fetchingDrivers

  useEffect(() => {
    if (!vehicles) dispatch(taxiVehicleActions.fetchRequest())
    if (!drivers) dispatch(taxiDriverActions.fetchRequest())
  }, [dispatch, vehicles, drivers])

  // WebSocket Simulation
  useEffect(() => {
    if (!vehicles || vehicles.length === 0) return
    const initial = {}
    vehicles.forEach((v) => {
      initial[v.plate] = {
        lat: DEFAULT_CENTER[0] + (Math.random() - 0.5) * 0.05,
        lng: DEFAULT_CENTER[1] + (Math.random() - 0.5) * 0.05,
        speed: Math.floor(Math.random() * 60),
        lastUpdate: new Date().toLocaleTimeString(),
      }
    })
    setLocations(initial)

    const interval = setInterval(() => {
      setLocations((prev) => {
        const next = { ...prev }
        const count = Math.floor(Math.random() * 2) + 1
        const plates = Object.keys(next)
        for (let i = 0; i < count; i++) {
          const plate = plates[Math.floor(Math.random() * plates.length)]
          if (next[plate]) {
            next[plate] = {
              ...next[plate],
              lat: next[plate].lat + (Math.random() - 0.5) * 0.001,
              lng: next[plate].lng + (Math.random() - 0.5) * 0.001,
              speed: Math.max(0, Math.min(100, next[plate].speed + (Math.random() - 0.5) * 10)),
              lastUpdate: new Date().toLocaleTimeString(),
            }
          }
        }
        return next
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [vehicles])

  const activeLocations = useMemo(() => {
    return Object.entries(locations).map(([plate, pos]) => {
      const vehicle = vehicles?.find((v) => v.plate === plate)
      const driver = drivers?.find((d) => d.defaultVehicle === plate && d.active !== false)
      return {
        plate,
        ...pos,
        vehicle,
        driver,
      }
    })
  }, [locations, vehicles, drivers])

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  return (
    <CCard className={`mb-4 ${isFullScreen ? 'border-0' : ''}`} style={isFullScreen ? { zIndex: 10000, position: 'fixed', inset: 0 } : {}}>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <div>
          <strong>Mapa de Ubicación</strong>
          {!isFullScreen && <CBadge color="success" className="ms-2">En vivo</CBadge>}
        </div>
        <CButton color="secondary" variant="outline" size="sm" onClick={toggleFullScreen}>
          <CIcon icon={isFullScreen ? cilFullscreenExit : cilFullscreen} />
          {isFullScreen ? ' Salir' : ' Pantalla Completa'}
        </CButton>
      </CCardHeader>
      <CCardBody className={isFullScreen ? 'p-0' : ''}>
        {fetching && !vehicles ? (
          <div className="text-center py-5">
            <CSpinner color="primary" />
          </div>
        ) : (
          <CRow className="g-0">
            <CCol lg={isFullScreen ? 12 : 9}>
              <div style={isFullScreen ? { height: 'calc(100vh - 50px)' } : { height: '600px' }}>
                <MapContainer 
                  center={DEFAULT_CENTER} 
                  zoom={13} 
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={!isFullScreen}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {activeLocations.map((loc) => (
                    <Marker 
                      key={loc.plate} 
                      position={[loc.lat, loc.lng]}
                      icon={createTaxiIcon(loc.plate)}
                    >
                      <Popup>
                        <div style={{ minWidth: '180px' }}>
                          <h6 className="mb-1" style={{ fontFamily: 'monospace', fontSize: '14px' }}>${loc.plate}</h6>
                          <div className="small text-muted mb-2">
                            {loc.vehicle?.brand} {loc.vehicle?.model}
                          </div>
                          <div style={{ borderTop: '1px solid #eee', paddingTop: '8px' }}>
                            <div className="mb-1">
                              <strong>Conductor:</strong><br />
                              {loc.driver ? loc.driver.name : 'Sin asignar'}
                            </div>
                            {loc.driver?.phone && (
                              <div className="mb-1">
                                <strong>Celular:</strong><br />
                                {loc.driver.phone}
                              </div>
                            )}
                            <div className="mt-2 pt-2 border-top" style={{ fontSize: '10px' }}>
                              <strong>Velocidad:</strong> ${Math.round(loc.speed)} km/h<br />
                              <strong>Reporte:</strong> ${loc.lastUpdate}
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  <MapController positions={activeLocations} isFullScreen={isFullScreen} />
                </MapContainer>
              </div>
            </CCol>
            {!isFullScreen && (
              <CCol lg={3} className="ps-lg-3">
                <h6 className="mb-3 px-2 mt-2 mt-lg-0">Flota Activa ({activeLocations.length})</h6>
                <CListGroup flush style={{ maxHeight: '560px', overflowY: 'auto' }}>
                  {activeLocations.map((loc) => (
                    <CListGroupItem key={loc.plate} className="px-2 py-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold" style={{ fontFamily: 'monospace', fontSize: '14px' }}>${loc.plate}</span>
                        <CBadge color={loc.speed > 0 ? 'success' : 'secondary'} shape="rounded-pill">
                          ${Math.round(loc.speed)} km/h
                        </CBadge>
                      </div>
                      <div className="mt-2">
                        <div style={{ fontSize: '12px', fontWeight: '500' }}>
                          {loc.driver ? loc.driver.name : <span className="text-muted">Sin asignar</span>}
                        </div>
                        {loc.driver?.phone && (
                          <div className="text-muted" style={{ fontSize: '11px' }}>
                            📞 {loc.driver.phone}
                          </div>
                        )}
                      </div>
                      <div className="small text-muted mt-2 d-flex justify-content-between" style={{ fontSize: '10px' }}>
                        <span>{loc.vehicle?.brand} {loc.vehicle?.model}</span>
                        <span>${loc.lastUpdate}</span>
                      </div>
                    </CListGroupItem>
                  ))}
                </CListGroup>
              </CCol>
            )}
          </CRow>
        )}
      </CCardBody>
    </CCard>
  )
}

export default MapLocation
