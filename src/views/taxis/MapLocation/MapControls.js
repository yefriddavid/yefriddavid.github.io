import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import './MapControls.scss'

/**
 * Custom Fullscreen Control that doesn't rely on buggy plugins
 */
export const FullscreenControl = ({ isFullScreen, toggle }) => {
  const map = useMap()

  useEffect(() => {
    const Control = L.Control.extend({
      onAdd: () => {
        const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom')
        btn.innerHTML = `
          <div class="leaflet-control-custom-btn">
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
export const MapController = ({ positions, isFullScreen, centerOn }) => {
  const map = useMap()

  // Auto-fit bounds
  useEffect(() => {
    if (positions.length > 0 && !centerOn) {
      const bounds = L.latLngBounds(positions.map((p) => [p.lat, p.lng]))
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    }
  }, [positions, map, centerOn])

  // Center on specific point if requested
  useEffect(() => {
    if (centerOn) {
      map.setView(centerOn, 16)
    }
  }, [centerOn, map])

  // Fix tiles when resizing
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize()
    }, 400)
  }, [isFullScreen, map])

  return null
}
