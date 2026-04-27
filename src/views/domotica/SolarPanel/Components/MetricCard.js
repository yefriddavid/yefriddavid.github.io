import React from 'react'
import { CCard, CCardBody } from '@coreui/react'
import CIcon from '@coreui/icons-react'

const MetricCard = ({ label, value, unit, icon, accent, sub }) => (
  <CCard className="metric-card">
    <CCardBody className="metric-card__body">
      <div className="metric-card__icon-wrap" style={{ background: `${accent}18`, color: accent }}>
        <CIcon icon={icon} className="metric-card__icon" />
      </div>
      <div className="metric-card__content">
        <div className="metric-card__label">{label}</div>
        <div className="metric-card__value">
          <span style={{ color: accent }}>{value ?? '—'}</span>
          {unit && <span className="metric-card__unit">{unit}</span>}
        </div>
        {sub && <div className="metric-card__sub">{sub}</div>}
      </div>
    </CCardBody>
  </CCard>
)

export default MetricCard
