import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
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
import { onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from 'src/services/firebase/settings'
import { getTenantId } from 'src/services/tenantContext'
import * as taxiVehicleActions from 'src/actions/taxi/taxiVehicleActions'
import * as taxiDriverActions from 'src/actions/taxi/taxiDriverActions'
import * as vehicleLocationHistoryActions from 'src/actions/taxi/vehicleLocationHistoryActions'
import 'leaflet/dist/leaflet.css'
import './MapLocation.scss'

import { createTaxiIconFlat, createTaxiIconV2 } from './MapIcons'
import { FullscreenControl, MapController } from './MapControls'
import { DEFAULT_CENTER, formatTimeAgo } from './utils'

const MapLocation = () => {
  const dispatch = useDispatch()
  const { data: vehicles, fetching: fetchingVehicles } = useSelector((s) => s.taxiVehicle)
  const { data: drivers, fetching: fetchingDrivers } = useSelector((s) => s.taxiDriver)
  const { data: history } = useSelector((s) => s.vehicleLocationHistory)
  const [locations, setLocations] = useState({}) // Clave: vehicleId
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [iconStyle, setIconStyle] = useState(() => localStorage.getItem('map_icon_style') || 'v2')
  const [refreshTime, setRefreshTime] = useState(0)

  // WebSocket state management with REFS to avoid re-render loops
  const socketRef = useRef(null)
  const reconnectTimerIdRef = useRef(null)
  const reconnectAttemptRef = useRef(0)
  const vehiclesRef = useRef(vehicles)

  // Keep vehicles ref updated for the socket message handler
  useEffect(() => {
    vehiclesRef.current = vehicles
  }, [vehicles])

  const fetching = fetchingVehicles || fetchingDrivers

  useEffect(() => {
    if (!vehicles) dispatch(taxiVehicleActions.fetchRequest())
    if (!drivers) dispatch(taxiDriverActions.fetchRequest())
  }, [dispatch, vehicles, drivers])

  useEffect(() => {
    dispatch(vehicleLocationHistoryActions.fetchRequest())
  }, [dispatch])

  // Real-time listener for Firebase (Source 2)
  useEffect(() => {
    const tenantId = getTenantId()
    if (!tenantId) return

    const q = query(
      collection(db, 'Taxi_vehicle_location_history'),
      where('tenantId', '==', tenantId),
      orderBy('timestamp', 'desc'),
      limit(20),
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const entry = change.doc.data()
          if (!entry.vehicleId) return

          const timestamp = entry.timestamp?.toDate?.() || entry.timestamp

          setLocations((prev) => {
            const current = prev[entry.vehicleId]
            // Only update if it's a newer record than what we have
            if (
              !current ||
              !current.lastUpdate ||
              new Date(timestamp) > new Date(current.lastUpdate)
            ) {
              return {
                ...prev,
                [entry.vehicleId]: {
                  lat: parseFloat(entry.latitude),
                  lng: parseFloat(entry.longitude),
                  speed: 0,
                  lastUpdate: timestamp,
                  source: 'firebase',
                },
              }
            }
            return prev
          })
        }
      })
    })

    return () => unsubscribe()
  }, [])

  // Initialize locations from history table
  useEffect(() => {
    if (history && history.length > 0) {
      console.log('Initializing locations from history:', history.length, 'entries')
      setLocations((prev) => {
        const next = { ...prev }
        // Process history (which is desc by timestamp)
        history.forEach((entry) => {
          if (entry.vehicleId && !next[entry.vehicleId]) {
            next[entry.vehicleId] = {
              lat: entry.latitude,
              lng: entry.longitude,
              speed: 0,
              lastUpdate: entry.timestamp,
              source: 'firebase',
            }
          }
        })
        return next
      })
    }
  }, [history])

  const handleStyleChange = (style) => {
    setIconStyle(style)
    localStorage.setItem('map_icon_style', style)
  }

  // Pure connect function using refs
  const connect = useCallback(() => {
    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return
    }

    if (reconnectTimerIdRef.current) {
      clearTimeout(reconnectTimerIdRef.current)
      reconnectTimerIdRef.current = null
    }

    const attempt = reconnectAttemptRef.current + 1
    console.log(`WebSocket: Connection attempt ${attempt}...`)

    const ws = new WebSocket('wss://3.92.69.78:1979/echo_test')

    ws.onopen = () => {
      console.log('WebSocket: Connected successfully')
      reconnectAttemptRef.current = 0
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.device && data.coords) {
          const { plate } = data.device
          const { latitude, longitude } = data.coords

          const vehicle = vehiclesRef.current?.find((v) => v.plate === plate)
          if (vehicle?.id) {
            // Save to history
            dispatch(
              vehicleLocationHistoryActions.createRequest({
                vehicleId: vehicle.id,
                plate,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                createdAt: new Date().toISOString(),
              }),
            )

            // Update state using vehicleId as key
            setLocations((prev) => ({
              ...prev,
              [vehicle.id]: {
                ...prev[vehicle.id],
                lat: parseFloat(latitude),
                lng: parseFloat(longitude),
                lastUpdate: new Date(),
                source: 'wss',
              },
            }))
          }
        }
      } catch (error) {
        console.error('WebSocket: Message error', error)
      }
    }

    ws.onclose = (e) => {
      console.log(`WebSocket: Closed (${e.code})`)
      socketRef.current = null
      scheduleReconnect()
    }

    ws.onerror = (err) => {
      console.error('WebSocket: Error', err)
    }

    socketRef.current = ws
  }, [dispatch])

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimerIdRef.current) return
    const attempt = reconnectAttemptRef.current
    const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 30000)
    reconnectTimerIdRef.current = setTimeout(() => {
      reconnectAttemptRef.current += 1
      reconnectTimerIdRef.current = null
      connect()
    }, delay)
  }, [connect])

  useEffect(() => {
    connect()
    return () => {
      if (socketRef.current) socketRef.current.close()
      if (reconnectTimerIdRef.current) clearTimeout(reconnectTimerIdRef.current)
    }
  }, [connect])

  useEffect(() => {
    const onFocus = () => {
      if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
        reconnectAttemptRef.current = 0
        connect()
      }
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [connect])

  const activeLocations = useMemo(() => {
    return Object.entries(locations).map(([vehicleId, pos]) => {
      const vehicle = vehicles?.find((v) => v.id === vehicleId)
      const plate = vehicle?.plate || 'Unknown'
      const driver = drivers?.find((d) => d.defaultVehicle === plate && d.active !== false)
      return {
        plate,
        ...pos,
        vehicle,
        driver,
      }
    })
  }, [locations, vehicles, drivers])

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen((prev) => !prev)
  }, [])

  useEffect(() => {
    const handleEsc = () => {
      if (!document.fullscreenElement && isFullScreen) setIsFullScreen(false)
    }
    document.addEventListener('fullscreenchange', handleEsc)
    return () => document.removeEventListener('fullscreenchange', handleEsc)
  }, [isFullScreen])

  useEffect(() => {
    const intervalId = setInterval(() => setRefreshTime((prev) => prev + 1), 5000)
    return () => clearInterval(intervalId)
  }, [])

  return (
    <CCard className={`mb-4 map-location-card ${isFullScreen ? 'is-fullscreen' : ''}`}>
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
          {!isFullScreen && (
            <CBadge color="success" className="d-flex align-items-center">
              En vivo
            </CBadge>
          )}
          <CButton color="secondary" variant="outline" size="sm" onClick={toggleFullScreen}>
            <CIcon icon={isFullScreen ? cilFullscreenExit : cilFullscreen} />
            {isFullScreen ? ' Salir' : ' Pantalla Completa'}
          </CButton>
        </div>
      </CCardHeader>
      <CCardBody className="card-body">
        {fetching && !vehicles ? (
          <div className="text-center py-5">
            <CSpinner color="primary" />
          </div>
        ) : (
          <CRow className="g-0">
            <CCol lg={isFullScreen ? 12 : 9}>
              <div className={`map-container-wrapper ${isFullScreen ? 'fullscreen' : ''}`} style={{ height: isFullScreen ? 'auto' : '600px' }}>
                <MapContainer center={DEFAULT_CENTER} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {activeLocations.map((loc) => (
                    <Marker
                      key={loc.vehicle?.id || loc.plate}
                      position={[loc.lat, loc.lng]}
                      icon={
                        iconStyle === 'v2'
                          ? createTaxiIconV2(loc.plate, loc.driver?.name, loc.source)
                          : createTaxiIconFlat(loc.plate, loc.source)
                      }
                    >
                      <Popup>
                        <div className="popup-content">
                          <h6 className="mb-1 plate-title">{loc.plate}</h6>
                          <div className="small text-muted mb-2">
                            {loc.vehicle?.brand} {loc.vehicle?.model}
                          </div>
                          <div style={{ borderTop: '1px solid #eee', paddingTop: '8px' }}>
                            <div className="mb-1">
                              <strong>Conductor:</strong>
                              <br />
                              {loc.driver ? loc.driver.name : 'Sin asignar'}
                            </div>
                            {loc.driver?.phone && (
                              <div className="mb-1">
                                <strong>Celular:</strong>
                                <br />
                                {loc.driver.phone}
                              </div>
                            )}
                            <div className="report-details">
                              <strong>Velocidad:</strong> {Math.round(loc.speed)} km/h
                              <br />
                              <strong>Reporte:</strong> {loc.lastUpdate ? formatTimeAgo(loc.lastUpdate) : ''}
                              <br />
                              <strong>Fuente:</strong> {loc.source === 'wss' ? 'Antena (WSS)' : 'App (Firebase)'}
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
                <CListGroup flush className="flota-activa-list">
                  {activeLocations.map((loc) => (
                    <CListGroupItem key={loc.vehicle?.id || loc.plate} className="px-2 py-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold list-item-plate">
                          {loc.plate}
                          {loc.source === 'firebase' && (
                            <span className="ms-2 badge rounded-pill bg-info" style={{ fontSize: '9px', verticalAlign: 'middle' }}>
                              App
                            </span>
                          )}
                        </span>
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
                      <div className="small text-muted mt-2 d-flex justify-content-between list-item-details">
                        <span>
                          {loc.vehicle?.brand} {loc.vehicle?.model}
                        </span>
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
