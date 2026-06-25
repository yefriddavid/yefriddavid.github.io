import React, { useState, useCallback, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton } from '@coreui/react'
import L from 'leaflet'
import Spinner from 'src/components/shared/Spinner'
import 'leaflet/dist/leaflet.css'
import './SolarLocationModal.scss'

const MONTH_KEYS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const markerIcon = L.divIcon({
  className: '',
  html: `<div class="slm__pin"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 20],
})

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng) })
  return null
}

async function fetchSolarData(lat, lon) {
  const url = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${lon.toFixed(4)}&latitude=${lat.toFixed(4)}&format=JSON`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  return json.properties.parameter.ALLSKY_SFC_SW_DWN
}

async function fetchLocationName(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat.toFixed(5)}&lon=${lon.toFixed(5)}&format=json`,
      { headers: { 'Accept-Language': 'es' } },
    )
    const json = await res.json()
    const a = json.address || {}
    return [a.city || a.town || a.village || a.county, a.country].filter(Boolean).join(', ')
  } catch {
    return null
  }
}

function SolarChart({ monthlyData }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !monthlyData) return
    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth, H = canvas.offsetHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    const values = MONTH_KEYS.map((k) => monthlyData[k] ?? 0)
    const maxVal = Math.max(...values, 1)
    const annAvg = monthlyData['ANN'] ?? values.reduce((s, v) => s + v, 0) / 12

    const padL = 38, padR = 10, padT = 22, padB = 36
    const chartW = W - padL - padR
    const chartH = H - padT - padB
    const barW = (chartW / 12) * 0.6
    const barGap = chartW / 12

    // Background
    ctx.fillStyle = '#0a1520'
    ctx.fillRect(0, 0, W, H)

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padT + chartH - (i / 4) * chartH
      ctx.beginPath()
      ctx.strokeStyle = '#1e2d40'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.moveTo(padL, y)
      ctx.lineTo(W - padR, y)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.font = '9px system-ui'
      ctx.fillStyle = '#3a5570'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText(((maxVal * i) / 4).toFixed(1), padL - 4, y)
    }

    // Average line
    const avgY = padT + chartH - (annAvg / maxVal) * chartH
    ctx.beginPath()
    ctx.strokeStyle = '#f59e0b88'
    ctx.lineWidth = 1.5
    ctx.setLineDash([6, 4])
    ctx.moveTo(padL, avgY)
    ctx.lineTo(W - padR, avgY)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.font = 'bold 9px system-ui'
    ctx.fillStyle = '#f59e0b'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${annAvg.toFixed(2)} h`, padL + 4, avgY - 7)

    // Bars
    values.forEach((val, i) => {
      const bh = (val / maxVal) * chartH
      const bx = padL + i * barGap + (barGap - barW) / 2
      const by = padT + chartH - bh

      const ratio = val / maxVal
      const grad = ctx.createLinearGradient(bx, by, bx, by + bh)
      const lo = `rgba(30,80,160,0.7)`, hi = ratio > 0.75 ? `rgba(251,191,36,0.9)` : `rgba(59,130,246,0.9)`
      grad.addColorStop(0, hi)
      grad.addColorStop(1, lo)

      ctx.beginPath()
      ctx.roundRect(bx, by, barW, bh, [3, 3, 0, 0])
      ctx.fillStyle = grad
      ctx.fill()

      // Value label above bar
      ctx.font = '8px system-ui'
      ctx.fillStyle = '#8ab0cc'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText(val.toFixed(1), bx + barW / 2, by - 2)

      // Month label below
      ctx.font = '9px system-ui'
      ctx.fillStyle = '#3a5570'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(MONTH_LABELS[i], bx + barW / 2, padT + chartH + 4)
    })
  }, [monthlyData])

  return (
    <canvas
      ref={canvasRef}
      className="slm__chart"
    />
  )
}

export default function SolarLocationModal({ visible, onClose, onApply }) {
  const [marker, setMarker] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [solarData, setSolarData] = useState(null)
  const [locationName, setLocationName] = useState(null)
  const mapRef = useRef(null)

  const handleMapClick = useCallback(async ({ lat, lng }) => {
    setMarker({ lat, lng })
    setLoading(true)
    setError(null)
    setSolarData(null)
    setLocationName(null)
    try {
      const [solar, name] = await Promise.all([
        fetchSolarData(lat, lng),
        fetchLocationName(lat, lng),
      ])
      setSolarData(solar)
      setLocationName(name)
    } catch (e) {
      setError('No se pudo obtener datos solares para este punto.')
    } finally {
      setLoading(false)
    }
  }, [])

  const annAvg = solarData?.ANN ?? (solarData
    ? MONTH_KEYS.reduce((s, k) => s + (solarData[k] ?? 0), 0) / 12
    : null)

  const handleApply = () => {
    if (!solarData || !marker) return
    onApply({
      hsp: parseFloat(annAvg.toFixed(2)),
      lat: marker.lat,
      lng: marker.lng,
      name: locationName,
      monthly: MONTH_KEYS.map((k) => ({ month: k, hsp: solarData[k] ?? 0 })),
    })
    onClose()
  }

  return (
    <CModal size="lg" visible={visible} onClose={onClose} className="slm__modal" alignment="center" scrollable>
      <CModalHeader>
        <CModalTitle className="slm__modal-title">Radiación Solar por Ubicación</CModalTitle>
      </CModalHeader>

      <CModalBody className="slm__modal-body">
        <p className="slm__hint">
          Haz clic en el mapa para obtener las horas sol pico mensuales de esa ubicación.
        </p>

        <div className="slm__map-wrap">
          <MapContainer
            ref={mapRef}
            center={[4.624, -74.063]}
            zoom={4}
            className="slm__map"
            worldCopyJump
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            />
            <MapClickHandler onMapClick={handleMapClick} />
            {marker && <Marker position={[marker.lat, marker.lng]} icon={markerIcon} />}
          </MapContainer>
        </div>

        {loading && (
          <div className="slm__state">
            <Spinner mode="inline" size="sm" /> Consultando NASA POWER API...
          </div>
        )}

        {error && <div className="slm__error">{error}</div>}

        {solarData && !loading && (
          <div className="slm__results">
            <div className="slm__location-row">
              <div className="slm__coords">
                {marker.lat.toFixed(4)}°{marker.lat >= 0 ? 'N' : 'S'},{' '}
                {Math.abs(marker.lng).toFixed(4)}°{marker.lng >= 0 ? 'E' : 'O'}
              </div>
              {locationName && <div className="slm__location-name">{locationName}</div>}
              <div className="slm__avg-badge">
                Promedio anual: <strong>{annAvg.toFixed(2)} h/día</strong>
              </div>
            </div>

            <SolarChart monthlyData={solarData} />

            <div className="slm__monthly-grid">
              {MONTH_KEYS.map((k, i) => (
                <div key={k} className="slm__month-cell">
                  <span className="slm__month-label">{MONTH_LABELS[i]}</span>
                  <span className="slm__month-value">{(solarData[k] ?? 0).toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CModalBody>

      <CModalFooter className="slm__footer">
        <CButton color="secondary" variant="outline" size="sm" onClick={onClose}>
          Cancelar
        </CButton>
        <CButton
          color="warning"
          size="sm"
          disabled={!solarData}
          onClick={handleApply}
        >
          Usar promedio anual ({annAvg != null ? `${annAvg.toFixed(2)} h` : '—'})
        </CButton>
      </CModalFooter>
    </CModal>
  )
}
