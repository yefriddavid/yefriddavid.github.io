import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CAlert, CButton, CCard, CCardBody, CRow, CCol, CBadge, CSpinner, CFormSwitch } from '@coreui/react'
import * as domoticaCurrentActions from 'src/actions/domotica/domoticaCurrentActions'
import * as domoticaTransactionActions from 'src/actions/domotica/domoticaTransactionActions'
import * as domoticaCommandActions from 'src/actions/domotica/domoticaCommandActions'
import CIcon from '@coreui/icons-react'
import {
  cilSun,
  cilBolt,
  cilInputPower,
  cilWarning,
  cilCheckCircle,
  cilSync,
} from '@coreui/icons'
import BatteryGauge from './Components/BatteryGauge'
import MetricCard from './Components/MetricCard'
import VoltageChart from './Components/VoltageChart'
import CurrentChart from './Components/CurrentChart'
import { useRelativeTime } from './hooks/useRelativeTime'
import {
  BATTERY_CAPACITY_WH,
  BATTERY_NOMINAL_V,
  BATTERY_CAPACITY_AH,
  getSocColor,
  STATUS_CONFIG,
} from './constants'

import './SolarPanel.scss'

const fmtDateTime = (iso) => {
  if (!iso) return null
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

const SolarPanel = () => {
  const dispatch = useDispatch()

  const voltageRecord = useSelector((s) =>
    s.domoticaCurrent.data?.find((r) => r.type === 'voltaje'),
  )
  const consumptionRecord = useSelector((s) =>
    s.domoticaCurrent.data?.find((r) => r.type === 'corriente' || r.amps != null || r.watts != null),
  )
  const currentFetchingState = useSelector((s) => s.domoticaCurrent.fetching)
  const commands = useSelector((s) => s.domoticaCommand.commands)
  const updatingIds = useSelector((s) => s.domoticaCommand.updatingIds)

  const voltageRead = commands['voltage_read']?.read ?? false
  const currentRead = commands['current_read']?.read ?? false
  const voltageInterval = commands['voltage_read']?.interval ?? ''
  const currentInterval = commands['current_read']?.interval ?? ''

  const [voltageIntervalInput, setVoltageIntervalInput] = useState('')
  const [currentIntervalInput, setCurrentIntervalInput] = useState('')

  useEffect(() => { setVoltageIntervalInput(voltageInterval !== '' ? String(voltageInterval) : '') }, [voltageInterval])
  useEffect(() => { setCurrentIntervalInput(currentInterval !== '' ? String(currentInterval) : '') }, [currentInterval])

  const commitInterval = (id, value) => {
    const num = Number(value)
    if (value === '' || isNaN(num)) return
    dispatch(domoticaCommandActions.updateRequest({ id, interval: num }))
  }

  const voltageHistory = useSelector((s) => s.domoticaTransaction.voltageData)
  const voltageFetching = useSelector((s) => s.domoticaTransaction.voltageFetching)
  const currentHistory = useSelector((s) => s.domoticaTransaction.currentData)
  const currentFetching = useSelector((s) => s.domoticaTransaction.currentFetching)

  const lastVoltageAt = useSelector((s) => s.domoticaTransaction.voltageData?.at(-1)?.createdAt ?? null)
  const lastCurrentAt = useSelector((s) => s.domoticaTransaction.currentData?.at(-1)?.createdAt ?? null)

  const battery = voltageRecord

  const [online, setOnline] = useState(false)
  const relativeTime = useRelativeTime(battery?.updatedAt || battery?.date)

  // Efecto para determinar si el sistema está en línea
  useEffect(() => {
    const timestamp = battery?.updatedAt || battery?.date
    if (timestamp) {
      const date = new Date(timestamp)
      setOnline(Date.now() - date.getTime() < 5 * 60 * 1000)
    }
  }, [battery])

  const POLL_INTERVAL_MS = 60_000

  useEffect(() => {
    dispatch(domoticaCurrentActions.fetchRequest())
    dispatch(domoticaTransactionActions.fetchVoltageRequest())
    dispatch(domoticaTransactionActions.fetchCurrentRequest())
    dispatch(domoticaCommandActions.fetchRequest())

    const poll = setInterval(() => {
      dispatch(domoticaCurrentActions.fetchRequest())
    }, POLL_INTERVAL_MS)

    return () => clearInterval(poll)
  }, [dispatch])

  const handleRefresh = () => {
    dispatch(domoticaCurrentActions.fetchRequest())
    dispatch(domoticaTransactionActions.fetchVoltageRequest())
    dispatch(domoticaTransactionActions.fetchCurrentRequest())
  }

  const soc = battery?.soc ?? battery?.percent ?? null
  const voltage = voltageRecord?.value ?? null
  const solar = battery?.solar ?? null
  const alert = battery?.alert ?? null
  const status = battery?.status ?? null
  const statusCfg = STATUS_CONFIG[status] ?? null

  const energyWh = soc != null ? Math.round((soc / 100) * BATTERY_CAPACITY_WH) : null
  const color = getSocColor(soc)

  const amps = consumptionRecord?.amps ?? consumptionRecord?.value ?? battery?.amps ?? null
  const watts = consumptionRecord?.watts ?? (amps != null && voltage != null ? amps * voltage : null)
  const currentAlert = battery?.currentAlert ?? null

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
            disabled={currentFetchingState}
            onClick={handleRefresh}
            className="solar-panel__read-btn"
          >
            {currentFetchingState ? (
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

      {currentFetchingState && !battery ? (
        <div className="solar-panel__loading">Cargando datos desde el sistema…</div>
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
          {(amps !== null || watts !== null) && (
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

          {/* Command switches */}
          <div className="solar-panel__section-label">Comandos al dispositivo</div>
          <CCard className="solar-panel__commands-card">
            <CCardBody className="solar-panel__commands-body">
              <div className="solar-panel__command-row">
                <div>
                  <div className="solar-panel__command-label">Leer voltaje</div>
                  <div className="solar-panel__command-sub">voltage_read</div>
                </div>
                <div className="solar-panel__command-controls">
                  <div className="solar-panel__interval-wrap">
                    <input
                      className="solar-panel__interval-input"
                      type="number"
                      min={1}
                      placeholder="interval"
                      value={voltageIntervalInput}
                      onChange={(e) => setVoltageIntervalInput(e.target.value)}
                      onBlur={(e) => commitInterval('voltage_read', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && commitInterval('voltage_read', e.target.value)}
                    />
                    <span className="solar-panel__interval-unit">mins</span>
                  </div>
                  <CFormSwitch
                    checked={voltageRead}
                    disabled={!!updatingIds['voltage_read']}
                    onChange={(e) =>
                      dispatch(domoticaCommandActions.updateRequest({ id: 'voltage_read', read: e.target.checked }))
                    }
                  />
                </div>
              </div>
              <div className="solar-panel__command-row">
                <div>
                  <div className="solar-panel__command-label">Leer corriente</div>
                  <div className="solar-panel__command-sub">current_read</div>
                </div>
                <div className="solar-panel__command-controls">
                  <div className="solar-panel__interval-wrap">
                    <input
                      className="solar-panel__interval-input"
                      type="number"
                      min={1}
                      placeholder="interval"
                      value={currentIntervalInput}
                      onChange={(e) => setCurrentIntervalInput(e.target.value)}
                      onBlur={(e) => commitInterval('current_read', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && commitInterval('current_read', e.target.value)}
                    />
                    <span className="solar-panel__interval-unit">mins</span>
                  </div>
                  <CFormSwitch
                    checked={currentRead}
                    disabled={!!updatingIds['current_read']}
                    onChange={(e) =>
                      dispatch(domoticaCommandActions.updateRequest({ id: 'current_read', read: e.target.checked }))
                    }
                  />
                </div>
              </div>
            </CCardBody>
          </CCard>

          {/* Voltage history chart */}
          <div className="solar-panel__section-label solar-panel__section-label--row">
            <span>
              Historial de voltaje — hoy
              {lastVoltageAt && (
                <span className="solar-panel__last-seen">última transmisión: {fmtDateTime(lastVoltageAt)}</span>
              )}
            </span>
            <CButton
              size="sm"
              color="primary"
              variant="outline"
              disabled={voltageFetching}
              onClick={() => dispatch(domoticaTransactionActions.fetchVoltageRequest())}
            >
              {voltageFetching ? <CSpinner size="sm" /> : <CIcon icon={cilSync} />}
            </CButton>
          </div>
          <CCard className="solar-panel__chart-card">
            <CCardBody>
              <VoltageChart data={voltageHistory} loading={voltageFetching} />
            </CCardBody>
          </CCard>

          <div className="solar-panel__section-label solar-panel__section-label--row">
            <span>
              Historial de corriente — hoy
              {lastCurrentAt && (
                <span className="solar-panel__last-seen">última transmisión: {fmtDateTime(lastCurrentAt)}</span>
              )}
            </span>
            <CButton
              size="sm"
              color="primary"
              variant="outline"
              disabled={currentFetching}
              onClick={() => dispatch(domoticaTransactionActions.fetchCurrentRequest())}
            >
              {currentFetching ? <CSpinner size="sm" /> : <CIcon icon={cilSync} />}
            </CButton>
          </div>
          <CCard className="solar-panel__chart-card">
            <CCardBody>
              <CurrentChart data={currentHistory} loading={currentFetching} />
            </CCardBody>
          </CCard>
        </>
      )}
    </div>
  )
}

export default SolarPanel
