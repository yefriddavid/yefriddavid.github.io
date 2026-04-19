import React from 'react'
import { CTooltip } from '@coreui/react'
import './StatCard.scss'

const InfoTip = ({ content }) => (
  <CTooltip content={content} placement="top">
    <span className="stat-card__tip">!</span>
  </CTooltip>
)

const StatCard = ({ label, value, color, tip, children, onClick, fade }) => (
  <div
    className={[
      'stat-card',
      onClick ? 'stat-card--clickable' : '',
      fade ? 'stat-card--faded' : '',
    ]
      .filter(Boolean)
      .join(' ')}
    style={{ '--stat-card-color': color }}
    onClick={onClick}
  >
    <div className="stat-card__label">
      {label}
      {tip && <InfoTip content={tip} />}
    </div>
    {value !== undefined && <div className="stat-card__value">{value}</div>}
    {children}
  </div>
)

export { InfoTip }
export default StatCard
