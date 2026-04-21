import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react'
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
  CButtonGroup,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilFullscreen, cilFullscreenExit } from '@coreui/icons'
import * as taxiVehicleActions from 'src/actions/taxi/taxiVehicleActions'
import * as taxiDriverActions from 'src/actions/taxi/taxiDriverActions'
import 'leaflet/dist/leaflet.css'

const DEFAULT_CENTER = [6.2442, -75.5812]

/**
 * Design 1: Black flag with yellow text
 */
const createTaxiIconFlat = (plate) => {
  return L.divIcon({
    className: 'custom-taxi-marker-flat',
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
 * Design 2: Yellow glossy plate with Driver Name
 */
const createTaxiIconV2 = (plate, driverName) => {
  const shortName = driverName ? driverName.split(' ')[0].toUpperCase() : 'S/A'
  return L.divIcon({
    className: 'custom-taxi-marker-v2',
    html: `
      <div style="
        background: linear-gradient(180deg, #ffd700 0%, #ffcc00 50%, #e6b800 100%);
        color: #000;
        border: 1px solid #b38f00;
        padding: 4px 8px;
        border-radius: 6px;
        font-family: 'Arial', sans-serif;
        font-weight: 900;
        font-size: 14px;
        letter-spacing: 0.5px;
        white-space: nowrap;
        position: relative;
        box-shadow: 0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4);
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 70px;
      ">
        <span style="line-height: 1; margin-bottom: 2px;">${plate}</span>
        <span style="font-size: 7px; align-self: flex-end; font-weight: bold; opacity: 0.8; margin-top: -2px;">${shortName}</span>
        <div style="
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #e6b800;
        "></div>
      </div>
    `,
    iconSize: [80, 30],
    iconAnchor: [40, 30],
    popupAnchor: [0, -30],
  })
}

/**
 * Custom Fullscreen Control that doesn't rely on buggy plugins
 */
const FullscreenControl = ({ isFullScreen, toggle }) => {
  const map = useMap()

  useEffect(() => {
    const Control = L.Control.extend({
      onAdd: () => {
        const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom')
        btn.innerHTML = `
          <div style="
            width: 30px;
            height: 30px;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 18px;
            border-radius: 4px;
            border: 2px solid rgba(0,0,0,0.2);
            background-clip: padding-box;
          ">
            ${isFullScreen ? '⛶' : '⛶'}
          </div>
        `
        btn.title = isFullScreen ? 'Salir de pantalla completa' : 'Pantalla completa'
        btn.onclick = (e) => {
          L.DomEvent.stopPropagation(e)
          toggle()
        }
        return btn
      }
    })

    const control = new Control({ position: 'topleft' })
    map.addControl(control)
    return () => map.removeControl(control)
  }, [map, isFullScreen, toggle])

  return null
}

/**
 * Component to handle map adjustments
 */
const MapController = ({ positions, isFullScreen }) => {
  const map = useMap()

  // Auto-fit bounds
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions.map((p) => [p.lat, p.lng]))
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    }
  }, [positions, map])

  // Fix tiles when resizing
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
  const [iconStyle, setIconStyle] = useState(() => localStorage.getItem('map_icon_style') || 'v2')
  // State to trigger re-renders for updating relative times
  const [refreshTime, setRefreshTime] = useState(0);

  const fetching = fetchingVehicles || fetchingDrivers

  useEffect(() => {
    if (!vehicles) dispatch(taxiVehicleActions.fetchRequest())
    if (!drivers) dispatch(taxiDriverActions.fetchRequest())
  }, [dispatch, vehicles, drivers])

  const handleStyleChange = (style) => {
    setIconStyle(style)
    localStorage.setItem('map_icon_style', style)
  }

  // WebSocket Connection for real-time taxi locations
  useEffect(() => {
    //const socket = new WebSocket('ws://3.92.69.78:1979/echo_test')
    const socket = new WebSocket('wss://3.92.69.78:1979/echo_test')

    socket.onopen = () => {
      console.log('WebSocket connection established')
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.device && data.coords) {
          const { plate } = data.device
          const { latitude, longitude } = data.coords
          setLocations((prevLocations) => {
            const updatedLocations = { ...prevLocations }
            // Ensure the plate exists before updating, or initialize it if new
            if (!updatedLocations[plate]) {
              updatedLocations[plate] = {
                lat: 0, // Default values if new
                lng: 0,
                speed: 0, // Assuming speed is not provided by this WS message
                lastUpdate: new Date(),
              }
            }
            updatedLocations[plate] = {
              ...updatedLocations[plate],
              lat: parseFloat(latitude),
              lng: parseFloat(longitude),
              lastUpdate: new Date(), // Update last seen time
              // Speed is not provided by this websocket, keeping existing or default
            }
            return updatedLocations
          })
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    socket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    // Cleanup: Close the WebSocket connection when the component unmounts
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close()
        console.log('WebSocket connection closed')
      }
    }
  }, [vehicles]) // Re-run if vehicles list changes to potentially initialize new plates


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
  }, [locations, vehicles, drivers]) // `refreshTime` is not a dependency here, as it's not needed for computing activeLocations

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen((prev) => !prev)
  }, [])

  // Handle ESC key to exit fullscreen state
  useEffect(() => {
    const handleEsc = () => {
      if (!document.fullscreenElement && isFullScreen) {
        setIsFullScreen(false)
      }
    }
    document.addEventListener('fullscreenchange', handleEsc)
    return () => document.removeEventListener('fullscreenchange', handleEsc)
  }, [isFullScreen])

  // Effect to periodically update the relative time display
  useEffect(() => {
    const intervalId = setInterval(() => {
      setRefreshTime(prev => prev + 1); // Update state to trigger re-render
    }, 1000); // Update every 5 seconds
    //}, 5000); // Update every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  // Helper function to format time differences into relative strings
  const formatTimeAgo = (date) => {
    if (!date) return ''
    const now = new Date()
    const seconds = Math.floor((now - new Date(date)) / 1000)

    if (seconds === 1) return '1 segundo atras';
    if (seconds < 60) return Math.floor(seconds) + ' segundos atras';

    const minutes = Math.floor(seconds / 60)
    if (minutes === 1) return '1 min atras';
    if (minutes < 60) return minutes + ' mins atras';

    const hours = Math.floor(seconds / 3600)
    if (hours === 1) return '1 hora atras';
    if (hours < 24) return hours + ' horas atras';

    const days = Math.floor(seconds / 86400)
    if (days === 1) return '1 dia atras';
    if (days < 30) return days + ' dias atras';

    const months = Math.floor(seconds / 2592000)
    if (months === 1) return '1 mes atras';
    if (months < 12) return months + ' meses atras';

    const years = Math.floor(seconds / 31536000)
    if (years === 1) return '1 ano atras';
    return years + ' anos atras';
  }

  return (
    <CCard
      className={`mb-4 ${isFullScreen ? 'border-0' : ''}`}
      style={isFullScreen ? { zIndex: 10000, position: 'fixed', inset: 0 } : {}}
    >
      <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="d-flex align-items-center gap-3">
          <strong>Mapa de Ubicación</strong>
          {!isFullScreen && (
            <CButtonGroup size="sm">
              <CButton
                color="dark"
                variant={iconStyle === 'flat' ? undefined : 'outline'}
                onClick={() => handleStyleChange('flat')}
              >
                Plano
              </CButton>
              <CButton
                color="warning"
                variant={iconStyle === 'v2' ? undefined : 'outline'}
                onClick={() => handleStyleChange('v2')}
              >
                Moderno (v2)
              </CButton>
            </CButtonGroup>
          )}
        </div>
        <div className="d-flex gap-2">
          {!isFullScreen && <CBadge color="success" className="d-flex align-items-center">En vivo</CBadge>}
          <CButton color="secondary" variant="outline" size="sm" onClick={toggleFullScreen}>
            <CIcon icon={isFullScreen ? cilFullscreenExit : cilFullscreen} />
            {isFullScreen ? ' Salir' : ' Pantalla Completa'}
          </CButton>
        </div>
      </CCardHeader>
      <CCardBody className={isFullScreen ? 'p-0' : ''}>
        {fetching && !vehicles ? (
          <div className="text-center py-5">
            <CSpinner color="primary" />
          </div>
        ) : (
          <CRow className="g-0">
            <CCol lg={isFullScreen ? 12 : 9}>
              <div style={{
                height: isFullScreen ? 'calc(100vh - 50px)' : '600px',
                borderRadius: isFullScreen ? '0' : '8px',
                overflow: 'hidden',
                border: isFullScreen ? 'none' : '1px solid #ddd'
              }}>
                <MapContainer
                  center={DEFAULT_CENTER}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {activeLocations.map((loc) => (
                    <Marker
                      key={loc.plate}
                      position={[loc.lat, loc.lng]}
                      icon={iconStyle === 'v2' ? createTaxiIconV2(loc.plate, loc.driver?.name) : createTaxiIconFlat(loc.plate)}
                    >
                      <Popup>
                        <div style={{ minWidth: '180px' }}>
                          <h6 className="mb-1" style={{ fontFamily: 'monospace', fontSize: '14px' }}>{loc.plate}</h6>
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
                              <strong>Velocidad:</strong> {Math.round(loc.speed)} km/h<br />
                              <strong>Reporte:</strong> {loc.lastUpdate ? formatTimeAgo(loc.lastUpdate) : ''}
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  <MapController positions={activeLocations} isFullScreen={isFullScreen} />
                  <FullscreenControl isFullScreen={isFullScreen} toggle={toggleFullScreen} />
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
                        <span className="fw-bold" style={{ fontFamily: 'monospace', fontSize: '14px' }}>{loc.plate}</span>
                        <CBadge color={loc.speed > 0 ? 'success' : 'secondary'} shape="rounded-pill">
                          {Math.round(loc.speed)} km/h
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
                        <span>{loc.lastUpdate ? formatTimeAgo(loc.lastUpdate) : ''}</span>
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
