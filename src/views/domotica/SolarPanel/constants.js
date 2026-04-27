import {
  cilBolt,
  cilCheckCircle,
  cilArrowBottom,
  cilWarning,
} from '@coreui/icons'

// 12V 100Ah = 1200 Wh
export const BATTERY_CAPACITY_WH = 1800
export const BATTERY_NOMINAL_V = 12
export const BATTERY_CAPACITY_AH = 150

export const getSocColor = (soc) => {
  if (soc == null) return '#64748b'
  if (soc <= 15) return '#ef4444'
  if (soc <= 35) return '#f59e0b'
  return '#22c55e'
}

export const getSocLabel = (soc) => {
  if (soc == null) return 'Desconocido'
  if (soc <= 15) return 'Crítico'
  if (soc <= 35) return 'Bajo'
  if (soc <= 65) return 'Moderado'
  if (soc <= 90) return 'Bueno'
  return 'Completo'
}

export const STATUS_CONFIG = {
  bulk: {
    label: 'Cargando (bulk)',
    color: 'success',
    icon: cilBolt,
  },
  absorption: {
    label: 'Absorción',
    color: 'success',
    icon: cilBolt,
  },
  float: {
    label: 'Flotación — llena',
    color: 'success',
    icon: cilCheckCircle,
  },
  discharging: {
    label: 'Descargando',
    color: 'info',
    icon: cilArrowBottom,
  },
  lvd_risk: {
    label: 'Riesgo de corte (LVD)',
    color: 'warning',
    icon: cilWarning,
  },
  critical: {
    label: 'Crítico',
    color: 'danger',
    icon: cilWarning,
  },
}
