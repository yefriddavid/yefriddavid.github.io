import React from 'react'
import PropTypes from 'prop-types'
import { CCard, CCardBody } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowTop, cilArrowBottom } from '@coreui/icons'
import './KPICard.scss'

/**
 * Delta indicator for KPI cards.
 */
const Delta = ({ value, invert = false }) => {
  if (value === null || value === undefined) return null
  const positive = invert ? value < 0 : value > 0
  const icon = value >= 0 ? cilArrowTop : cilArrowBottom
  return (
    <span className={`kpi-delta kpi-delta--${positive ? 'pos' : 'neg'}`}>
      <CIcon icon={icon} className="kpi-delta__icon" />
      {Math.abs(value).toFixed(1)}%
    </span>
  )
}

Delta.propTypes = {
  value: PropTypes.number,
  invert: PropTypes.bool,
}

/**
 * A shared KPI Card component for dashboards.
 */
const KPICard = ({ label, value, sub, accent, icon, delta, deltaInvert }) => (
  <CCard className="kpi-card" style={{ '--kpi-accent': accent }}>
    <CCardBody className="kpi-card__body">
      <div className="kpi-card__top">
        <span className="kpi-card__label">{label}</span>
        {icon && (
          <div className="kpi-card__icon-wrap">
            <CIcon icon={icon} className="kpi-card__icon" />
          </div>
        )}
      </div>
      <div className="kpi-card__value">{value}</div>
      <div className="kpi-card__bottom">
        {sub && <span className="kpi-card__sub">{sub}</span>}
        <Delta value={delta} invert={deltaInvert} />
      </div>
    </CCardBody>
  </CCard>
)

KPICard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  sub: PropTypes.string,
  accent: PropTypes.string,
  icon: PropTypes.any,
  delta: PropTypes.number,
  deltaInvert: PropTypes.bool,
}

export default KPICard
