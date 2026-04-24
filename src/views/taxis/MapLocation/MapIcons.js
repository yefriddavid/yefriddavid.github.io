import L from 'leaflet'
import './MapIcons.scss'

const wifiBadge = (source) => {
  let bg = '#6b7280'
  if (source === 'wss') bg = '#16a34a'
  if (source === 'history') bg = '#f59e0b'
  return `<span class="wifi-badge" style="background:${bg}">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13">
      <circle cx="12" cy="20" r="2" fill="#fff"/>
      <path d="M8.5 16.5a5 5 0 0 1 7 0" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M5 13a10 10 0 0 1 14 0" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M1.5 9.5a15 15 0 0 1 21 0" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </svg>
  </span>`
}

/**
 * Design 1: Black flag with yellow text
 */
export const createTaxiIconFlat = (plate, source) => {
  return L.divIcon({
    className: `custom-taxi-marker-flat-container`,
    html: `
      <div class="custom-taxi-marker-flat">
        ${plate}
        ${wifiBadge(source)}
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
export const createTaxiIconV2 = (plate, driverName, source) => {
  const shortName = driverName ? driverName.split(' ')[0].toUpperCase() : 'S/A'
  return L.divIcon({
    className: `custom-taxi-marker-v2-container`,
    html: `
      <div class="custom-taxi-marker-v2">
        <span class="plate-text">${plate}</span>
        <span class="driver-short-name">${shortName}</span>
        ${wifiBadge(source)}
      </div>
    `,
    iconSize: [80, 30],
    iconAnchor: [40, 30],
    popupAnchor: [0, -30],
  })
}
