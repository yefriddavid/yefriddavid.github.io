import L from 'leaflet'
import './MapIcons.scss'

/**
 * Design 1: Black flag with yellow text
 */
export const createTaxiIconFlat = (plate) => {
  return L.divIcon({
    className: 'custom-taxi-marker-flat-container',
    html: `
      <div class="custom-taxi-marker-flat">
        ${plate}
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
export const createTaxiIconV2 = (plate, driverName) => {
  const shortName = driverName ? driverName.split(' ')[0].toUpperCase() : 'S/A'
  return L.divIcon({
    className: 'custom-taxi-marker-v2-container',
    html: `
      <div class="custom-taxi-marker-v2">
        <span class="plate-text">${plate}</span>
        <span class="driver-short-name">${shortName}</span>
      </div>
    `,
    iconSize: [80, 30],
    iconAnchor: [40, 30],
    popupAnchor: [0, -30],
  })
}
