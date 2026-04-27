import React, { useEffect, useState } from 'react'
import { CAlert, CButton, CCard, CCardBody, CRow, CCol, CBadge, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSun,
  cilBolt,
  cilInputPower,
  cilWarning,
  cilCheckCircle,
  cilArrowBottom,
  cilSync,
} from '@coreui/icons'
import {
  subscribeBatteryStatus,
  subscribeCurrentStatus,
  triggerRead,
} from 'src/services/firebase/domotica/solarBattery'
import './SolarPanel.scss'

// 12V 100Ah = 1200 Wh
const BATTERY_CAPACITY_WH = 1800
const BATTERY_NOMINAL_V = 12
const BATTERY_CAPACITY_AH = 150

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
  const [current, setCurrent] = useState(undefined)
  const [online, setOnline] = useState(false)
  const [readState, setReadState] = useState('idle') // 'idle' | 'loading' | 'done' | 'error'
  const relativeTime = useRelativeTime(battery?.updatedAt)

  const applyData = (data) => {
    setBattery(data)
    if (data?.updatedAt) {
      const date = new Date(data.updatedAt)
      setOnline(Date.now() - date.getTime() < 5 * 60 * 1000)
    }
  }

  useEffect(() => {
    return subscribeBatteryStatus(applyData)
  }, [])

  useEffect(() => {
    return subscribeCurrentStatus(setCurrent)
  }, [])

  const handleRead = async () => {
    if (readState === 'loading') return
    setReadState('loading')
    try {
      const data = await triggerRead()
      applyData(data)
      setReadState('done')
    } catch {
      setReadState('error')
    } finally {
      setTimeout(() => setReadState('idle'), 2500)
    }
  }

  const soc = battery?.soc ?? null
  const voltage = battery?.voltage ?? null
  const solar = battery?.solar ?? null
  const alert = battery?.alert ?? null
  const status = battery?.status ?? null
  const statusCfg = STATUS_CONFIG[status] ?? null

  const energyWh = soc != null ? Math.round((soc / 100) * BATTERY_CAPACITY_WH) : null
  const color = getSocColor(soc)

  const amps = current?.amps ?? null
  const watts = current?.watts ?? null
  const currentAlert = current?.alert ?? null

  const hoursRemaining =
    amps > 0 && soc > 0
      ? (soc / 100) * BATTERY_CAPACITY_AH / amps
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
          <CButton
            size="sm"
            color="primary"
            variant="outline"
            disabled={readState === 'loading'}
            onClick={handleRead}
            className={`solar-panel__read-btn${readState === 'error' ? ' solar-panel__read-btn--error' : ''}`}
          >
            {readState === 'loading' ? (
              <>
                <CSpinner size="sm" className="me-1" />
                Leyendo…
              </>
            ) : readState === 'done' ? (
              <>
                <CIcon icon={cilCheckCircle} className="me-1" />
                Actualizado
              </>
            ) : readState === 'error' ? (
              <>
                <CIcon icon={cilWarning} className="me-1" />
                Sin respuesta
              </>
            ) : (
              <>
                <CIcon icon={cilSync} className="me-1" />
                Leer ahora
              </>
            )}
          </CButton>
        </div>
      </div>

      {battery === undefined ? (
        <div className="solar-panel__loading">Conectando con el sistema solar…</div>
      ) : (
        <>
          {/* Alert banner */}
          {alert && (
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
          )}
          {/* Main card: battery gauge + info */}
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
                    <span className="solar-panel__spec-chip">Gel ciclo profundo</span>
                  </div>

                  {/* Energy bar */}
                  <div className="solar-panel__energy-section">
                    <div className="solar-panel__energy-label">
                      <span>
                        Energía disponible
                        {solar && (
                          <span className="solar-panel__estimated-tag">estimado</span>
                        )}
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

                  {/* Remaining time */}
                  {hoursRemaining != null && (
                    <div className={`solar-panel__autonomy${solar ? ' solar-panel__autonomy--estimated' : ''}`}>
                      <CIcon icon={cilInputPower} className="solar-panel__time-icon" />
                      <span>Autonomía restante</span>
                      <strong>
                        {hoursRemaining >= 1
                          ? `${hoursRemaining.toFixed(1)} h`
                          : `${Math.round(hoursRemaining * 60)} min`}
                      </strong>
                      {solar && (
                        <span className="solar-panel__autonomy-note">
                          (panel activo — podría ser más)
                        </span>
                      )}
                    </div>
                  )}

                  {/* Solar panels indicator */}
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

          {/* Metric cards */}
          <CRow className="g-3">
            <CCol xs={6} md={4}>
              <MetricCard
                label="Voltaje"
                value={voltage != null ? voltage.toFixed(2) : null}
                unit="V"
                icon={cilInputPower}
                accent="#1971c2"
                sub={`Nominal: ${BATTERY_NOMINAL_V}V`}
              />
            </CCol>
            <CCol xs={6} md={4}>
              <MetricCard
                label="Panel solar"
                value={solar == null ? null : solar ? 'Activo' : 'Inactivo'}
                icon={cilSun}
                accent={solar ? '#e67700' : '#64748b'}
              />
            </CCol>
            <CCol xs={12} md={4}>
              <MetricCard
                label="Alerta"
                value={alert ? alert.type : 'Normal'}
                icon={alert ? cilWarning : cilCheckCircle}
                accent={
                  !alert ? '#22c55e' : alert.type === 'critical' ? '#ef4444' : '#f59e0b'
                }
                sub={
                  alert?.since
                    ? `Desde ${new Date(alert.since).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`
                    : null
                }
              />
            </CCol>
          </CRow>

          {/* Consumption cards */}
          {current !== undefined && (
            <>
              {currentAlert && (
                <CAlert
                  color={currentAlert.type === 'critical' ? 'danger' : 'warning'}
                  className="d-flex align-items-start gap-2 mt-3 mb-0"
                >
                  <CIcon icon={cilWarning} className="flex-shrink-0 mt-1" />
                  <div>
                    <strong>Alerta consumo — {currentAlert.type}</strong>
                    {currentAlert.since && (
                      <span className="ms-2 text-body-secondary">
                        desde{' '}
                        {new Date(currentAlert.since).toLocaleString('es-CO', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                </CAlert>
              )}
              <div className="solar-panel__section-label">Consumo actual</div>
              <CRow className="g-3">
                <CCol xs={6}>
                  <MetricCard
                    label="Corriente"
                    value={amps != null ? amps.toFixed(1) : null}
                    unit="A"
                    icon={cilBolt}
                    accent="#7c3aed"
                    sub="Consumo instantáneo"
                  />
                </CCol>
                <CCol xs={6}>
                  <MetricCard
                    label="Potencia"
                    value={watts != null ? watts.toFixed(0) : null}
                    unit="W"
                    icon={cilInputPower}
                    accent="#0891b2"
                    sub="Carga activa"
                  />
                </CCol>
              </CRow>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default SolarPanel
