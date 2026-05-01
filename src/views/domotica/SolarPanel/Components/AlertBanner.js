import React from 'react'
import { CAlert } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilWarning } from '@coreui/icons'

const AlertBanner = ({ alert }) => {
  if (!alert) return null
  return (
    <CAlert
      color={alert.type === 'critical' ? 'danger' : 'warning'}
      className="d-flex align-items-start gap-2 mb-3"
    >
      <CIcon icon={cilWarning} className="flex-shrink-0 mt-1" />
      <div>
        <strong>Alerta {alert.type}</strong>
        {' — '}
        {alert.since
          ? `desde ${new Date(alert.since).toLocaleString('es-CO', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}`
          : ''}
        {(alert.voltage != null || alert.percent != null) && (
          <span className="ms-2 text-body-secondary">
            ({alert.voltage != null ? `${alert.voltage}V` : ''}
            {alert.voltage != null && alert.percent != null ? ' · ' : ''}
            {alert.percent != null ? `${alert.percent}%` : ''})
          </span>
        )}
      </div>
    </CAlert>
  )
}

export default AlertBanner
