import React, { useState, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CCard, CCardBody, CButton, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSync } from '@coreui/icons'
import * as domoticaTransactionActions from 'src/actions/domotica/domoticaTransactionActions'
import {
  selectVoltageHistory,
  selectVoltageFetching,
  selectCurrentHistory,
  selectCurrentFetching,
  selectLastVoltageAt,
  selectLastCurrentAt,
} from 'src/selectors/domoticaSelectors'
import VoltageChart from './VoltageChart'
import CurrentChart from './CurrentChart'

const PRESETS = [
  { key: '24h', label: 'Últ. 24h', hours: 24 },
  { key: '48h', label: 'Últ. 48h', hours: 48 },
  { key: '7d', label: '7 días', hours: 168 },
  { key: '30d', label: '30 días', hours: 720 },
  { key: 'custom', label: 'Personalizado', hours: null },
]

const getPresetRange = (hours) => {
  const end = new Date()
  const start = new Date()
  start.setHours(start.getHours() - hours)
  return { startDate: start.toISOString(), endDate: end.toISOString() }
}

const toDatetimeLocal = (d) => {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const fmt = (iso) => {
  if (!iso) return null
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const ChartSection = ({ label, lastAt, fetching, onRefresh, children }) => (
  <>
    <div className="solar-panel__section-label solar-panel__section-label--row">
      <span>
        {label}
        {lastAt && (
          <span className="solar-panel__last-seen">última transmisión: {fmt(lastAt)}</span>
        )}
      </span>
      <CButton size="sm" color="primary" variant="outline" disabled={fetching} onClick={onRefresh}>
        {fetching ? <CSpinner size="sm" /> : <CIcon icon={cilSync} />}
      </CButton>
    </div>
    <CCard className="solar-panel__chart-card">
      <CCardBody>{children}</CCardBody>
    </CCard>
  </>
)

const HistoryCharts = () => {
  const dispatch = useDispatch()
  const voltageHistory = useSelector(selectVoltageHistory)
  const voltageFetching = useSelector(selectVoltageFetching)
  const currentHistory = useSelector(selectCurrentHistory)
  const currentFetching = useSelector(selectCurrentFetching)
  const lastVoltageAt = useSelector(selectLastVoltageAt)
  const lastCurrentAt = useSelector(selectLastCurrentAt)

  const [preset, setPreset] = useState('24h')
  const [customFrom, setCustomFrom] = useState(() => toDatetimeLocal((() => { const d = new Date(); d.setHours(d.getHours() - 24); return d })()))
  const [customTo, setCustomTo] = useState(() => toDatetimeLocal(new Date()))
  const [dateRange, setDateRange] = useState(() => getPresetRange(24))
  const [filterKey, setFilterKey] = useState(0)

  const fetchBoth = useCallback(
    (range) => {
      dispatch(domoticaTransactionActions.fetchVoltageRequest(range))
      dispatch(domoticaTransactionActions.fetchCurrentRequest(range))
    },
    [dispatch],
  )

  useEffect(() => {
    fetchBoth(dateRange)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const applyPreset = (key) => {
    setPreset(key)
    if (key === 'custom') return
    const p = PRESETS.find((p) => p.key === key)
    const range = getPresetRange(p.hours)
    setDateRange(range)
    setFilterKey((k) => k + 1)
    fetchBoth(range)
  }

  const applyCustom = () => {
    if (!customFrom || !customTo) return
    const range = { startDate: new Date(customFrom).toISOString(), endDate: new Date(customTo).toISOString() }
    setDateRange(range)
    setFilterKey((k) => k + 1)
    fetchBoth(range)
  }

  const handleRefresh = () => fetchBoth(dateRange)

  const fetching = voltageFetching || currentFetching

  return (
    <>
      <div className="solar-panel__history-filter">
        <div className="solar-panel__history-filter-presets">
          {PRESETS.map((p) => (
            <CButton
              key={p.key}
              size="sm"
              color="primary"
              variant={preset === p.key ? undefined : 'outline'}
              onClick={() => applyPreset(p.key)}
              disabled={fetching}
            >
              {p.label}
            </CButton>
          ))}
        </div>
        {preset === 'custom' && (
          <div className="solar-panel__history-filter-custom">
            <input
              type="datetime-local"
              className="solar-panel__datetime-input"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
            />
            <span className="solar-panel__history-filter-sep">—</span>
            <input
              type="datetime-local"
              className="solar-panel__datetime-input"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
            />
            <CButton size="sm" color="success" onClick={applyCustom} disabled={fetching || !customFrom || !customTo}>
              Aplicar
            </CButton>
          </div>
        )}
      </div>

      <ChartSection
        label="Historial de voltaje — hoy"
        lastAt={lastVoltageAt}
        fetching={voltageFetching}
        onRefresh={handleRefresh}
      >
        <VoltageChart key={filterKey} data={voltageHistory} loading={voltageFetching} />
      </ChartSection>

      <ChartSection
        label="Historial de corriente — hoy"
        lastAt={lastCurrentAt}
        fetching={currentFetching}
        onRefresh={handleRefresh}
      >
        <CurrentChart key={filterKey} data={currentHistory} loading={currentFetching} />
      </ChartSection>
    </>
  )
}

export default HistoryCharts
