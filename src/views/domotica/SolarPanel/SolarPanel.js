import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CAlert, CButton, CCard, CCardBody, CRow, CCol, CBadge, CSpinner } from '@coreui/react'
import * as domoticaCurrentActions from 'src/actions/domotica/domoticaCurrentActions'
import * as domoticaTransactionActions from 'src/actions/domotica/domoticaTransactionActions'
import CIcon from '@coreui/icons-react'
import {
  cilSun,
  cilBolt,
  cilInputPower,
  cilWarning,
  cilCheckCircle,
  cilSync,
} from '@coreui/icons'
import {
  // subscribeBatteryStatus,
  // subscribeCurrentStatus,
  triggerRead,
} from 'src/services/firebase/domotica/solarBattery'

import BatteryGauge from './Components/BatteryGauge'
import MetricCard from './Components/MetricCard'
import VoltageChart from './Components/VoltageChart'
import { useRelativeTime } from './hooks/useRelativeTime'
import {
  BATTERY_CAPACITY_WH,
  BATTERY_NOMINAL_V,
  BATTERY_CAPACITY_AH,
  getSocColor,
  STATUS_CONFIG,
} from './constants'

import './SolarPanel.scss'

const SolarPanel = () => {
  const dispatch = useDispatch()

  // Consumir datos directamente del Reducer (Redux Store)
  const voltageRecord = useSelector((s) =>
    s.domoticaCurrent.data?.find((r) => r.device === 'esp8266-battery' && r.type === 'voltaje'),
  )
  const batteryState = useSelector((s) => s.domoticaCurrent.battery)
  const current = useSelector((s) => s.domoticaCurrent.consumption)
  const todayStart = new Date().setHours(0, 0, 0, 0)
  const voltageHistory = useSelector((s) =>
    s.domoticaTransaction.data
      ?.filter(
        (r) =>
          r.device === 'esp8266-battery' &&
          r.type === 'voltaje' &&
          r.createdAt &&
          new Date(r.createdAt).getTime() >= todayStart,
      )
      .slice()
      .reverse() ?? null,
  )
  const historyFetching = useSelector((s) => s.domoticaTransaction.fetching)

  // El sensor envía todo en el registro de voltaje (status, solar, soc, etc)
  const battery = batteryState || voltageRecord

  const [online, setOnline] = useState(false)
  const [readState, setReadState] = useState('idle') // 'idle' | 'loading' | 'done' | 'error'
  const relativeTime = useRelativeTime(battery?.updatedAt || battery?.date)

  // Efecto para determinar si el sistema está en línea
  useEffect(() => {
    const timestamp = battery?.updatedAt || battery?.date
    if (timestamp) {
      const date = new Date(timestamp)
      setOnline(Date.now() - date.getTime() < 5 * 60 * 1000)
    }
  }, [battery])

  useEffect(() => {
    // Reactivamos la consulta inicial a Firebase (vía Redux/Saga)
    dispatch(domoticaCurrentActions.fetchRequest({ device: 'esp8266-battery', type: 'voltaje' }))
    dispatch(domoticaTransactionActions.fetchRequest())

    /* 
       SE MANTIENE DESHABILITADO EL POLLING AL API EXTERNA (3.92.69.78) 
       Y LAS SUSCRIPCIONES QUE DEPENDÍAN DE ELLA.
    */
    /*
    const unsubscribeBattery = subscribeBatteryStatus((data) => {
      dispatch(domoticaCurrentActions.batteryStatusSuccess(data))
    })
    const unsubscribeCurrent = subscribeCurrentStatus((data) => {
      dispatch(domoticaCurrentActions.consumptionStatusSuccess(data))
    })
    */

    return () => {
      /*
      unsubscribeBattery()
      unsubscribeCurrent()
      */
    }
  }, [dispatch])

  const handleRead = async () => {
    if (readState === 'loading') return
    setReadState('loading')
    try {
      const data = await triggerRead()
      dispatch(domoticaCurrentActions.batteryStatusSuccess(data))
      setReadState('done')
    } catch {
      setReadState('error')
    } finally {
      setTimeout(() => setReadState('idle'), 2500)
    }
  }

  const soc = battery?.soc ?? battery?.percent ?? null
  const voltage = voltageRecord?.value ?? null
  const solar = battery?.solar ?? null
  const alert = battery?.alert ?? null
  const status = battery?.status ?? null
  const statusCfg = STATUS_CONFIG[status] ?? null

  const energyWh = soc != null ? Math.round((soc / 100) * BATTERY_CAPACITY_WH) : null
  const color = getSocColor(soc)

  const amps = current?.amps ?? battery?.amps ?? null
  const watts = current?.watts ?? battery?.watts ?? null
  const currentAlert = current?.alert ?? battery?.currentAlert ?? null

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

      {!battery ? (
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
          {(current !== undefined || battery?.amps !== undefined) && (
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

          {/* Voltage history chart */}
          <div className="solar-panel__section-label">Historial de voltaje — hoy</div>
          <CCard className="solar-panel__chart-card">
            <CCardBody>
              <VoltageChart data={voltageHistory} loading={historyFetching} />
            </CCardBody>
          </CCard>
        </>
      )}
    </div>
  )
}

export default SolarPanel
