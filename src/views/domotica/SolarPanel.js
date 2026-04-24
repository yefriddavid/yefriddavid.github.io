import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CRow, CCol, CBadge } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSun,
  cilBolt,
  cilInputPower,
  cilWarning,
  cilCheckCircle,
  cilMinus,
  cilArrowBottom,
  cilFire,
} from '@coreui/icons'
import { subscribeBatteryStatus } from 'src/services/firebase/domotica/solarBattery'
import './SolarPanel.scss'

// 12V 100Ah = 1200 Wh
const BATTERY_CAPACITY_WH = 1200
const BATTERY_NOMINAL_V = 12
const BATTERY_CAPACITY_AH = 100

const getSocColor = (soc) => {
  if (soc == null) return '#64748b'
  if (soc <= 15) return '#ef4444'
  if (soc <= 35) return '#f59e0b'
  return '#22c55e'
}

const getSocLabel = (soc) => {
  if (soc == null) return 'Desconocido'
  if (soc <= 15) return 'Crítico'
  if (soc <= 35) return 'Bajo'
  if (soc <= 65) return 'Moderado'
  if (soc <= 90) return 'Bueno'
  return 'Completo'
}

const STATUS_CONFIG = {
  charging: {
    label: 'Cargando',
    color: 'success',
    icon: cilBolt,
  },
  discharging: {
    label: 'Descargando',
    color: 'info',
    icon: cilArrowBottom,
  },
  full: {
    label: 'Carga completa',
    color: 'success',
    icon: cilCheckCircle,
  },
  idle: {
    label: 'Inactivo',
    color: 'secondary',
    icon: cilMinus,
  },
  low: {
    label: 'Batería baja',
    color: 'danger',
    icon: cilWarning,
  },
}

const BatteryGauge = ({ soc, status, color }) => {
  const fillPct = Math.max(0, Math.min(100, soc ?? 0))
  const isCharging = status === 'charging'

  return (
    <div className="battery-gauge">
      <div className="battery-gauge__terminal" style={{ borderColor: color }} />
      <div className="battery-gauge__body" style={{ borderColor: color }}>
        <div
          className={`battery-gauge__fill${isCharging ? ' battery-gauge__fill--charging' : ''}`}
          style={{ height: `${fillPct}%`, background: color }}
        />
        <div className="battery-gauge__segments">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="battery-gauge__segment-line" />
          ))}
        </div>
        <div className="battery-gauge__label">
          <span className="battery-gauge__pct" style={{ color }}>
            {soc ?? '--'}
            <span className="battery-gauge__pct-sign">%</span>
          </span>
          <span className="battery-gauge__soc-label" style={{ color }}>
            {getSocLabel(soc)}
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

const useRelativeTime = (timestamp) => {
  const [label, setLabel] = useState('—')

  useEffect(() => {
    if (!timestamp) return
    const update = () => {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      const diff = Math.floor((Date.now() - date.getTime()) / 1000)
      if (diff < 10) setLabel('Ahora mismo')
      else if (diff < 60) setLabel(`Hace ${diff}s`)
      else if (diff < 3600) setLabel(`Hace ${Math.floor(diff / 60)}m`)
      else setLabel(`Hace ${Math.floor(diff / 3600)}h`)
    }
    update()
    const id = setInterval(update, 5000)
    return () => clearInterval(id)
  }, [timestamp])

  return label
}

const SolarPanel = () => {
  const [battery, setBattery] = useState(undefined)
  const [online, setOnline] = useState(false)
  const relativeTime = useRelativeTime(battery?.updatedAt)

  useEffect(() => {
    const unsub = subscribeBatteryStatus((data) => {
      setBattery(data)
      if (data?.updatedAt) {
        const date = data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
        setOnline(Date.now() - date.getTime() < 5 * 60 * 1000)
      }
    })
    return unsub
  }, [])

  const soc = battery?.soc ?? null
  const voltage = battery?.voltage ?? null
  const current = battery?.current ?? null
  const power = battery?.power ?? (voltage != null && current != null ? voltage * current : null)
  const temperature = battery?.temperature ?? null
  const status = battery?.status ?? null
  const statusCfg = STATUS_CONFIG[status] ?? null

  const energyWh = soc != null ? Math.round((soc / 100) * BATTERY_CAPACITY_WH) : null
  const color = getSocColor(soc)

  const currentSign = current != null && current >= 0 ? '+' : ''
  const hoursRemaining =
    current != null && current < 0 && soc != null
      ? ((soc / 100) * BATTERY_CAPACITY_AH) / Math.abs(current)
      : null

  return (
    <div className="solar-panel">
      {/* Header */}
      <div className="solar-panel__header">
        <div className="solar-panel__title">
          <CIcon icon={cilSun} className="solar-panel__title-icon" />
          Panel Solar
        </div>
        <div className="solar-panel__header-right">
          <span className={`online-dot online-dot--${online ? 'on' : 'off'}`} />
          <span className="solar-panel__online-label">{online ? 'En línea' : 'Sin señal'}</span>
          <span className="solar-panel__timestamp">{relativeTime}</span>
        </div>
      </div>

      {battery === undefined ? (
        <div className="solar-panel__loading">Conectando con el sistema solar…</div>
      ) : (
        <>
          {/* Main card: battery gauge + info */}
          <CRow className="g-3 mb-3">
            <CCol md={4} lg={3}>
              <CCard className="solar-panel__battery-card">
                <CCardBody className="solar-panel__battery-body">
                  <BatteryGauge soc={soc} status={status} color={color} />
                </CCardBody>
              </CCard>
            </CCol>

            <CCol md={8} lg={9}>
              <CCard className="solar-panel__info-card h-100">
                <CCardBody className="solar-panel__info-body">
                  {/* Status badge */}
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

                  {/* Specs */}
                  <div className="solar-panel__specs">
                    <span className="solar-panel__spec-chip">{BATTERY_NOMINAL_V}V</span>
                    <span className="solar-panel__spec-chip">{BATTERY_CAPACITY_AH} Ah</span>
                    <span className="solar-panel__spec-chip">Plomo-ácido</span>
                  </div>

                  {/* Energy bar */}
                  <div className="solar-panel__energy-section">
                    <div className="solar-panel__energy-label">
                      <span>Energía disponible</span>
                      <strong style={{ color }}>
                        {energyWh != null ? `${energyWh} Wh` : '— Wh'}
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

                  {/* Time remaining */}
                  {hoursRemaining != null && (
                    <div className="solar-panel__time-remaining">
                      <CIcon icon={cilInputPower} className="solar-panel__time-icon" />
                      Tiempo estimado restante:{' '}
                      <strong>
                        {hoursRemaining >= 1
                          ? `${hoursRemaining.toFixed(1)} h`
                          : `${Math.round(hoursRemaining * 60)} min`}
                      </strong>
                    </div>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>

          {/* Metric cards */}
          <CRow className="g-3">
            <CCol xs={6} md={3}>
              <MetricCard
                label="Voltaje"
                value={voltage != null ? voltage.toFixed(2) : null}
                unit="V"
                icon={cilInputPower}
                accent="#1971c2"
                sub={`Nominal: ${BATTERY_NOMINAL_V}V`}
              />
            </CCol>
            <CCol xs={6} md={3}>
              <MetricCard
                label="Corriente"
                value={current != null ? `${currentSign}${Math.abs(current).toFixed(1)}` : null}
                unit="A"
                icon={cilBolt}
                accent={current != null && current >= 0 ? '#22c55e' : '#f59e0b'}
                sub={current != null ? (current >= 0 ? 'Entrada' : 'Salida') : null}
              />
            </CCol>
            <CCol xs={6} md={3}>
              <MetricCard
                label="Potencia"
                value={power != null ? Math.abs(power).toFixed(1) : null}
                unit="W"
                icon={cilSun}
                accent="#e67700"
                sub={power != null ? (power >= 0 ? 'Cargando' : 'Consumiendo') : null}
              />
            </CCol>
            <CCol xs={6} md={3}>
              <MetricCard
                label="Temperatura"
                value={temperature != null ? temperature.toFixed(1) : null}
                unit="°C"
                icon={cilFire}
                accent={
                  temperature == null ? '#64748b' : temperature > 45 ? '#ef4444' : '#1971c2'
                }
                sub={
                  temperature != null
                    ? temperature > 45
                      ? 'Alta — revisar'
                      : 'Normal'
                    : 'No disponible'
                }
              />
            </CCol>
          </CRow>
        </>
      )}
    </div>
  )
}

export default SolarPanel
