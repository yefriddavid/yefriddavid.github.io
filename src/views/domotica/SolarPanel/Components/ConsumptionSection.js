import React from 'react'
import { CAlert, CRow, CCol } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilWarning, cilBolt, cilInputPower } from '@coreui/icons'
import MetricCard from './MetricCard'

const ConsumptionSection = ({ amps, watts, currentAlert }) => {
  if (amps === null && watts === null) return null
  return (
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
  )
}

export default ConsumptionSection
