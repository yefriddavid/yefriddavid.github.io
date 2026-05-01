import React from 'react'
import { CButton, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSun, cilSync } from '@coreui/icons'

const SolarHeader = ({ online, relativeTime, loading, onRefresh }) => (
  <div className="solar-panel__header">
    <div className="solar-panel__title">
      <CIcon icon={cilSun} className="solar-panel__title-icon" />
      Panel Solar
    </div>
    <div className="solar-panel__header-right">
      <span className={`online-dot online-dot--${online ? 'on' : 'off'}`} />
      <span className="solar-panel__online-label">{online ? 'En línea' : 'Sin señal'}</span>
      <span className="solar-panel__timestamp">{relativeTime}</span>
      <CButton
        size="sm"
        color="primary"
        variant="outline"
        disabled={loading}
        onClick={onRefresh}
        className="solar-panel__read-btn"
      >
        {loading ? (
          <>
            <CSpinner size="sm" className="me-1" />
            Actualizando…
          </>
        ) : (
          <>
            <CIcon icon={cilSync} className="me-1" />
            Actualizar
          </>
        )}
      </CButton>
    </div>
  </div>
)

export default SolarHeader
