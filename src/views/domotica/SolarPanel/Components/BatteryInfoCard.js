import React from 'react'
import { CCard, CCardBody, CBadge, CRow, CCol } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSun, cilInputPower } from '@coreui/icons'
import BatteryGauge from './BatteryGauge'
import { BATTERY_NOMINAL_V, BATTERY_CAPACITY_AH, BATTERY_CAPACITY_WH } from '../constants'

const BatteryInfoCard = ({ soc, status, statusCfg, solar, energyWh, color, hoursRemaining }) => (
  <CRow className="g-3 mb-3">
    <CCol md={4} lg={3}>
      <CCard className="solar-panel__battery-card">
        <CCardBody className="solar-panel__battery-body">
          <BatteryGauge soc={soc} status={status} color={color} solar={solar} />
        </CCardBody>
      </CCard>
    </CCol>

    <CCol md={8} lg={9}>
      <CCard className="solar-panel__info-card h-100">
        <CCardBody className="solar-panel__info-body">
          <div className="solar-panel__status-row">
            {statusCfg ? (
              <CBadge color={statusCfg.color} className="solar-panel__status-badge">
                <CIcon icon={statusCfg.icon} className="solar-panel__badge-icon" />
                {statusCfg.label}
              </CBadge>
            ) : (
              <CBadge color="secondary" className="solar-panel__status-badge">
                Sin datos
              </CBadge>
            )}
          </div>

          <div className="solar-panel__specs">
            <span className="solar-panel__spec-chip">{BATTERY_NOMINAL_V}V</span>
            <span className="solar-panel__spec-chip">{BATTERY_CAPACITY_AH} Ah</span>
            <span className="solar-panel__spec-chip">Gel ciclo profundo</span>
          </div>

          <div className="solar-panel__energy-section">
            <div className="solar-panel__energy-label">
              <span>
                Energía disponible
                {solar && <span className="solar-panel__estimated-tag">estimado</span>}
              </span>
              <strong style={{ color, opacity: solar ? 0.6 : 1 }}>
                {energyWh != null ? `${solar ? '~' : ''}${energyWh} Wh` : '— Wh'}
              </strong>
            </div>
            <div className="solar-panel__energy-track">
              <div
                className="solar-panel__energy-fill"
                style={{ width: `${soc ?? 0}%`, background: color }}
              />
            </div>
            <div className="solar-panel__energy-footer">
              <span>0 Wh</span>
              <span>{BATTERY_CAPACITY_WH} Wh</span>
            </div>
          </div>

          {hoursRemaining != null && (
            <div
              className={`solar-panel__autonomy${solar ? ' solar-panel__autonomy--estimated' : ''}`}
            >
              <CIcon icon={cilInputPower} className="solar-panel__time-icon" />
              <span>Autonomía restante</span>
              <strong>
                {hoursRemaining >= 1
                  ? `${hoursRemaining.toFixed(1)} h`
                  : `${Math.round(hoursRemaining * 60)} min`}
              </strong>
              {solar && (
                <span className="solar-panel__autonomy-note">(panel activo — podría ser más)</span>
              )}
            </div>
          )}

          {solar != null && (
            <div className="solar-panel__time-remaining">
              <CIcon icon={cilSun} className="solar-panel__time-icon" />
              Panel solar:{' '}
              <strong style={{ color: solar ? '#22c55e' : '#64748b' }}>
                {solar ? 'Activo' : 'Inactivo'}
              </strong>
            </div>
          )}
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
)

export default BatteryInfoCard
