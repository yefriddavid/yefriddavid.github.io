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
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilFullscreen, cilFullscreenExit, cilHistory } from '@coreui/icons'
import * as taxiVehicleActions from 'src/actions/taxi/taxiVehicleActions'
import * as taxiDriverActions from 'src/actions/taxi/taxiDriverActions'
import * as vehicleLocationHistoryActions from 'src/actions/taxi/vehicleLocationHistoryActions'
import * as currentPositionsActions from 'src/actions/taxi/currentPositionsActions'
import { useVehicleLocationSnapshot } from 'src/hooks/useVehicleLocationSnapshot'
import { shouldPersist } from 'src/utils/locationThrottle'
import { haversineKmh } from 'src/utils/geoUtils'
import { taxiWebSocket } from 'src/services/websocketService'
import { getHistory, getLastKnownPosition } from 'src/services/firebase/taxi/vehicleLocationHistory'
import 'leaflet/dist/leaflet.css'
import './MapLocation.scss'

import { createTaxiIconFlat, createTaxiIconV2 } from './MapIcons'
import { FullscreenControl, MapController } from './MapControls'
import { DEFAULT_CENTER, formatTimeAgo } from './utils'

const MapLocation = () => {
  const dispatch = useDispatch()
  const { data: vehicles, fetching: fetchingVehicles } = useSelector((s) => s.taxiVehicle)
  const { data: drivers, fetching: fetchingDrivers } = useSelector((s) => s.taxiDriver)
  const currentPositions = useSelector((s) => s.currentPositions)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [iconStyle, setIconStyle] = useState(() => localStorage.getItem('map_icon_style') || 'v2')
  const [, setRefreshTime] = useState(0)

  const [histories, setHistories] = useState({}) // { vehicleId: [pos1, pos2, ...] }
  const [loadingHistory, setLoadingHistory] = useState({}) // { vehicleId: boolean }
  const [manualPositions, setManualPositions] = useState({}) // { vehicleId: {lat, lng} }
  const [centerOn, setCenterOn] = useState(null)

  const vehiclesRef = useRef(vehicles)
  const prevPositionsRef = useRef(new Map())
  const fetching = fetchingVehicles || fetchingDrivers

  useEffect(() => {
    vehiclesRef.current = vehicles
  }, [vehicles])

  useEffect(() => {
    if (!vehicles) dispatch(taxiVehicleActions.fetchRequest())
    if (!drivers) dispatch(taxiDriverActions.fetchRequest())
  }, [dispatch, vehicles, drivers])

  useEffect(() => {
    if (!vehicles) return
    // Fetch last known position for vehicles that don't have one in Redux yet
    vehicles.forEach(async (v) => {
      if (!currentPositions[v.id]) {
        const last = await getLastKnownPosition(v.id)
        if (last) {
          dispatch(
            currentPositionsActions.updateFromApp({
              vehicleId: v.id,
              lat: parseFloat(last.latitude),
              lng: parseFloat(last.longitude),
              lastUpdate: last.timestamp,
            }),
          )
        }
      }
    })
  }, [vehicles, dispatch]) // Only on vehicles load

  useVehicleLocationSnapshot()

  useEffect(() => {
    const unsubscribe = taxiWebSocket.subscribe((data) => {
      if (!data.device?.plate || !data.coords) return
      const { plate } = data.device
      const lat = parseFloat(data.coords.latitude)
      const lng = parseFloat(data.coords.longitude)

      const vehicle = vehiclesRef.current?.find((v) => v.plate === plate)
      if (!vehicle?.id) return

      // When a new update arrives, clear manual position for this vehicle
      setManualPositions((prev) => {
        if (prev[vehicle.id]) {
          const next = { ...prev }
          delete next[vehicle.id]
          return next
        }
        return prev
      })

      const prev = prevPositionsRef.current.get(vehicle.id)
      const now = Date.now()
      const speed = prev ? haversineKmh(prev.lat, prev.lng, lat, lng, now - prev.time) : 0
      prevPositionsRef.current.set(vehicle.id, { lat, lng, time: now })

      dispatch(
        currentPositionsActions.updateFromWss({
          vehicleId: vehicle.id,
          lat,
          lng,
          speed,
          lastUpdate: new Date().toISOString(),
        }),
      )

      if (shouldPersist(vehicle.id)) {
        dispatch(
          vehicleLocationHistoryActions.createRequest({
            vehicleId: vehicle.id,
            plate,
            latitude: lat,
            longitude: lng,
            source: 'wss',
            createdAt: new Date().toISOString(),
          }),
        )
      }
    })

    return () => {
      unsubscribe()
      if (taxiWebSocket.listenerCount === 0) taxiWebSocket.disconnect()
    }
  }, [dispatch])

  useEffect(() => {
    const handleEsc = () => {
      if (!document.fullscreenElement && isFullScreen) setIsFullScreen(false)
    }
    document.addEventListener('fullscreenchange', handleEsc)
    return () => document.removeEventListener('fullscreenchange', handleEsc)
  }, [isFullScreen])

  useEffect(() => {
    const id = setInterval(() => setRefreshTime((p) => p + 1), 5000)
    return () => clearInterval(id)
  }, [])

  const handleStyleChange = (style) => {
    setIconStyle(style)
    localStorage.setItem('map_icon_style', style)
  }

  const toggleFullScreen = useCallback(() => setIsFullScreen((p) => !p), [])

  const fetchVehicleHistory = async (vehicleId, plate) => {
    if (histories[vehicleId] || loadingHistory[vehicleId]) return
    setLoadingHistory((prev) => ({ ...prev, [vehicleId]: true }))
    try {
      const data = await getHistory(vehicleId, plate)
      // data is already limited to 5 in service
      setHistories((prev) => ({ ...prev, [vehicleId]: data }))
    } catch (e) {
      console.error('Error fetching history for vehicle', vehicleId, e)
    } finally {
      setLoadingHistory((prev) => ({ ...prev, [vehicleId]: false }))
    }
  }

  const fleetList = useMemo(() => {
    if (!vehicles) return []
    return vehicles.map((vehicle) => {
      const pos = currentPositions[vehicle.id] ?? null
      const manual = manualPositions[vehicle.id]
      const driver = drivers?.find((d) => d.defaultVehicle === vehicle.plate && d.active !== false)
      return {
        plate: vehicle.plate,
        vehicle,
        driver,
        lat: manual ? manual.lat : (pos?.lat ?? null),
        lng: manual ? manual.lng : (pos?.lng ?? null),
        speed: manual ? 0 : (pos?.speed ?? 0),
        lastUpdate: pos?.lastUpdate ?? null,
        source: manual ? 'history' : (pos?.source ?? null),
      }
    })
  }, [currentPositions, vehicles, drivers, manualPositions])

  const activeOnMap = useMemo(() => fleetList.filter((loc) => loc.lat !== null), [fleetList])

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
            <CCol lg={9}>
              <div
                className={`map-container-wrapper ${isFullScreen ? 'fullscreen' : ''}`}
                style={{ height: isFullScreen ? 'auto' : '600px' }}
              >
                <MapContainer
                  center={DEFAULT_CENTER}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {activeOnMap.map((loc) => (
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
                              <strong>Reporte:</strong>{' '}
                              {loc.lastUpdate ? formatTimeAgo(loc.lastUpdate) : ''}
                              <br />
                              <strong>Fuente:</strong>{' '}
                              {loc.source === 'wss'
                                ? 'Antena (WSS)'
                                : loc.source === 'app'
                                  ? 'App (Firebase)'
                                  : loc.source === 'history'
                                    ? 'Histórico'
                                    : 'Desconocido'}
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  <MapController
                    positions={activeOnMap}
                    isFullScreen={isFullScreen}
                    centerOn={centerOn}
                  />
                  <FullscreenControl isFullScreen={isFullScreen} toggle={toggleFullScreen} />
                </MapContainer>
              </div>
            </CCol>
            <CCol lg={3} className={`ps-lg-3 side-panel ${isFullScreen ? 'fullscreen' : ''}`}>
              <h6 className="mb-3 px-2 mt-2 mt-lg-0">
                Flota ({activeOnMap.length}/{fleetList.length})
              </h6>
              <CAccordion flush className="flota-activa-list">
                {fleetList.map((loc) => (
                  <CAccordionItem key={loc.vehicle?.id || loc.plate} itemKey={loc.vehicle?.id}>
                    <CAccordionHeader
                      onClick={() => fetchVehicleHistory(loc.vehicle?.id, loc.plate)}
                      className="vehicle-accordion-header"
                    >
                      <div className="w-100 pe-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold list-item-plate">
                            {loc.plate}
                            {loc.source === 'app' && (
                              <span
                                className="ms-2 badge rounded-pill bg-info"
                                style={{ fontSize: '9px', verticalAlign: 'middle' }}
                              >
                                App
                              </span>
                            )}
                            {loc.source === 'history' && (
                              <span
                                className="ms-2 badge rounded-pill bg-warning"
                                style={{ fontSize: '9px', verticalAlign: 'middle' }}
                              >
                                Histórico
                              </span>
                            )}
                            {!loc.source && (
                              <span
                                className="ms-2 badge rounded-pill bg-secondary"
                                style={{ fontSize: '9px', verticalAlign: 'middle' }}
                              >
                                Sin reporte
                              </span>
                            )}
                          </span>
                          <CBadge
                            color={loc.speed > 0 ? 'success' : 'secondary'}
                            shape="rounded-pill"
                          >
                            {Math.round(loc.speed)} km/h
                          </CBadge>
                        </div>
                        <div className="mt-1">
                          <div style={{ fontSize: '12px', fontWeight: '500' }}>
                            {loc.driver ? (
                              loc.driver.name
                            ) : (
                              <span className="text-muted">Sin asignar</span>
                            )}
                          </div>
                        </div>
                        <div className="small text-muted mt-1 d-flex justify-content-between list-item-details">
                          <span>
                            {loc.vehicle?.brand} {loc.vehicle?.model}
                          </span>
                          <span>{loc.lastUpdate ? formatTimeAgo(loc.lastUpdate) : ''}</span>
                        </div>
                      </div>
                    </CAccordionHeader>
                    <CAccordionBody className="p-2">
                      <div className="d-flex align-items-center mb-2 px-1">
                        <CIcon icon={cilHistory} size="sm" className="me-1" />
                        <span className="small fw-bold">Últimas 5 posiciones</span>
                      </div>
                      {loadingHistory[loc.vehicle?.id] && (
                        <div className="text-center py-2">
                          <CSpinner size="sm" color="primary" />
                        </div>
                      )}
                      <div className="history-list">
                        {histories[loc.vehicle?.id]?.map((h, i) => (
                          <div
                            key={h.id || i}
                            className="history-item"
                            onClick={() => {
                              const pos = { lat: h.latitude, lng: h.longitude }
                              setManualPositions((prev) => ({
                                ...prev,
                                [loc.vehicle.id]: pos,
                              }))
                              setCenterOn([pos.lat, pos.lng])
                            }}
                          >
                            <div className="d-flex justify-content-between">
                              <span className="history-time">{formatTimeAgo(h.timestamp)}</span>
                              <span className="history-coords">
                                {parseFloat(h.latitude).toFixed(4)},{' '}
                                {parseFloat(h.longitude).toFixed(4)}
                              </span>
                            </div>
                          </div>
                        ))}
                        {histories[loc.vehicle?.id]?.length === 0 && (
                          <div className="small text-muted text-center py-2">Sin historial</div>
                        )}
                        {loc.source === 'history' && (
                          <div className="mt-2 text-center">
                            <CButton
                              size="sm"
                              color="link"
                              className="p-0 text-decoration-none"
                              style={{ fontSize: '10px' }}
                              onClick={() => {
                                setManualPositions((prev) => {
                                  const next = { ...prev }
                                  delete next[loc.vehicle.id]
                                  return next
                                })
                                setCenterOn(null)
                              }}
                            >
                              Volver a vivo
                            </CButton>
                          </div>
                        )}
                      </div>
                    </CAccordionBody>
                  </CAccordionItem>
                ))}
              </CAccordion>
            </CCol>
          </CRow>
        )}
      </CCardBody>
    </CCard>
  )
}

export default MapLocation
