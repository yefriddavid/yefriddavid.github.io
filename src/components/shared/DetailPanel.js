import React from 'react'
import './DetailPanel.scss'

export const DetailRow = ({ label, value, mono }) =>
  value != null && value !== '' ? (
    <div className="detail-row">
      <span className="detail-row__label">{label}</span>
      <span className={`detail-row__value${mono ? ' detail-row__value--mono' : ''}`}>{value}</span>
    </div>
  ) : null

export const DetailSection = ({ title, children }) => (
  <div className="detail-section">
    <p className="detail-section__title">{title}</p>
    {children}
  </div>
)

const DetailPanel = ({ children, columns = 1 }) => (
  <div className="detail-panel">
    <div className="detail-panel__grid" style={{ '--columns': columns }}>
      {children}
    </div>
  </div>
)

export default DetailPanel
