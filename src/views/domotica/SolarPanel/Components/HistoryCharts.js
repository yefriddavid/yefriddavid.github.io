import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CCard, CCardBody, CButton, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSync } from '@coreui/icons'
import * as domoticaTransactionActions from 'src/actions/domotica/domoticaTransactionActions'
import VoltageChart from './VoltageChart'
import CurrentChart from './CurrentChart'

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
  const voltageHistory = useSelector((s) => s.domoticaTransaction.voltageData)
  const voltageFetching = useSelector((s) => s.domoticaTransaction.voltageFetching)
  const currentHistory = useSelector((s) => s.domoticaTransaction.currentData)
  const currentFetching = useSelector((s) => s.domoticaTransaction.currentFetching)
  const lastVoltageAt = useSelector(
    (s) => s.domoticaTransaction.voltageData?.at(-1)?.createdAt ?? null,
  )
  const lastCurrentAt = useSelector(
    (s) => s.domoticaTransaction.currentData?.at(-1)?.createdAt ?? null,
  )

  return (
    <>
      <ChartSection
        label="Historial de voltaje — hoy"
        lastAt={lastVoltageAt}
        fetching={voltageFetching}
        onRefresh={() => dispatch(domoticaTransactionActions.fetchVoltageRequest())}
      >
        <VoltageChart data={voltageHistory} loading={voltageFetching} />
      </ChartSection>

      <ChartSection
        label="Historial de corriente — hoy"
        lastAt={lastCurrentAt}
        fetching={currentFetching}
        onRefresh={() => dispatch(domoticaTransactionActions.fetchCurrentRequest())}
      >
        <CurrentChart data={currentHistory} loading={currentFetching} />
      </ChartSection>
    </>
  )
}

export default HistoryCharts
