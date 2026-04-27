import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilBolt } from '@coreui/icons'
import { getSocLabel } from '../constants'

const BatteryGauge = ({ soc, status, color, solar }) => {
  const fillPct = Math.max(0, Math.min(100, soc ?? 0))
  const isCharging = status === 'bulk' || status === 'absorption' || status === 'float'

  return (
    <div className="battery-gauge">
      <div className="battery-gauge__terminal" style={{ borderColor: color }} />
      <div className="battery-gauge__body" style={{ borderColor: color }}>
        <div
          className={`battery-gauge__fill${isCharging ? ' battery-gauge__fill--charging' : ''}${solar ? ' battery-gauge__fill--estimated' : ''}`}
          style={{ height: `${fillPct}%`, background: color }}
        />
        <div className="battery-gauge__segments">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="battery-gauge__segment-line" />
          ))}
        </div>
        <div className="battery-gauge__label">
          <span className="battery-gauge__pct" style={{ color }}>
            {solar && <span className="battery-gauge__estimated-mark">~</span>}
            {soc ?? '--'}
            <span className="battery-gauge__pct-sign">%</span>
          </span>
          <span className="battery-gauge__soc-label" style={{ color }}>
            {solar ? 'Estimado' : getSocLabel(soc)}
          </span>
        </div>
        {isCharging && (
          <div className="battery-gauge__bolt">
            <CIcon icon={cilBolt} />
          </div>
        )}
      </div>
    </div>
  )
}

export default BatteryGauge
