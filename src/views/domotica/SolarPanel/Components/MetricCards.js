import React from 'react'
import { CRow, CCol } from '@coreui/react'
import { cilSun, cilInputPower, cilWarning, cilCheckCircle } from '@coreui/icons'
import MetricCard from './MetricCard'
import { BATTERY_NOMINAL_V } from '../constants'

const MetricCards = ({ voltage, solar, alert }) => (
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
        accent={!alert ? '#22c55e' : alert.type === 'critical' ? '#ef4444' : '#f59e0b'}
        sub={
          alert?.since
            ? `Desde ${new Date(alert.since).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`
            : null
        }
      />
    </CCol>
  </CRow>
)

export default MetricCards
