import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { Column } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/App/StandardGrid/Index'
import {
  CCard, CCardBody, CCardHeader, CSpinner, CBadge, CButton, CRow, CCol,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CForm, CFormInput, CFormLabel,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilReload, cilCash, cilTrash } from '@coreui/icons'
import * as taxiDistributionActions from 'src/actions/Taxi/taxiDistributionActions'
import * as taxiPartnerActions from 'src/actions/Taxi/taxiPartnerActions'
import * as taxiSettlementActions from 'src/actions/Taxi/taxiSettlementActions'
import * as taxiExpenseActions from 'src/actions/Taxi/taxiExpenseActions'
import '../../../views/movements/payments/Payments.scss'

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n ?? 0)

const today = () => new Date().toISOString().split('T')[0]

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const Distributions = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const now = new Date()

  const { data: distributionsData, fetching: loadingDist } = useSelector((s) => s.taxiDistribution)
  const { data: partnersData } = useSelector((s) => s.taxiPartner)
  const { data: settlementsData } = useSelector((s) => s.taxiSettlement)
  const { data: expensesData } = useSelector((s) => s.taxiExpense)

  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })
  const [payModal, setPayModal] = useState(null)

  const partners = partnersData ?? []
  const distributions = distributionsData ?? []
  const loading = loadingDist && !distributionsData

  useEffect(() => {
    dispatch(taxiDistributionActions.fetchRequest())
    dispatch(taxiPartnerActions.fetchRequest())
    dispatch(taxiSettlementActions.fetchRequest())
    dispatch(taxiExpenseActions.fetchRequest())
  }, [dispatch])

  const periodStr = `${period.year}-${String(period.month).padStart(2, '0')}`

  const distribution = distributions.find((d) => d.period === periodStr) ?? null

  const totalIncome = (settlementsData ?? [])
    .filter((r) => r.date?.startsWith(periodStr))
    .reduce((acc, r) => acc + (r.amount || 0), 0)

  const periodExpenses = (expensesData ?? []).filter((r) => r.date?.startsWith(periodStr))
  const totalExpenses = periodExpenses.reduce((acc, r) => acc + (r.amount || 0), 0)
  const totalExpensesPaid = periodExpenses.filter((r) => r.paid).reduce((acc, r) => acc + (r.amount || 0), 0)
  const totalExpensesPending = totalExpenses - totalExpensesPaid

  const net = totalIncome - totalExpenses

  const totalPercentage = partners.reduce((acc, p) => acc + (p.percentage || 0), 0)

  const availableYears = [...new Set(
    [...distributions.map((d) => Number(d.period?.slice(0, 4))), now.getFullYear()],
  )].sort((a, b) => b - a)

  // rows for the table: either from saved distribution or preview from current partners
  const paymentRows = distribution
    ? Object.entries(distribution.payments).map(([partnerId, p]) => ({ id: partnerId, partnerId, ...p }))
    : partners.map((p) => ({
        id: p.id,
        partnerId: p.id,
        partnerName: p.name,
        percentage: p.percentage,
        calculatedAmount: Math.round(net * p.percentage / 100),
        paidAmount: null,
        paidDate: null,
        paid: false,
      }))

  const handleGenerate = () => {
    if (!window.confirm(`¿Generar repartición para ${MONTHS[period.month - 1]} ${period.year}?`)) return
    const payments = {}
    partners.forEach((p) => {
      payments[p.id] = {
        partnerName: p.name,
        percentage: p.percentage,
        calculatedAmount: Math.round(net * p.percentage / 100),
        paidAmount: null,
        paidDate: null,
        paid: false,
      }
    })
    dispatch(taxiDistributionActions.createRequest({
      period: periodStr,
      date: today(),
      totalIncome,
      totalExpenses,
      net,
      payments,
    }))
  }

  const handleDeleteDistribution = () => {
    if (!distribution) return
    if (!window.confirm('¿Eliminar esta repartición? Los datos de pago se perderán.')) return
    dispatch(taxiDistributionActions.deleteRequest({ id: distribution.id }))
  }

  const openPayModal = (row) => {
    setPayModal({
      distributionId: distribution.id,
      partnerId: row.partnerId,
      partnerName: row.partnerName,
      percentage: row.percentage,
      calculatedAmount: row.calculatedAmount,
      paidAmount: String(row.calculatedAmount),
      paidDate: today(),
    })
  }

  const handleMarkPaid = () => {
    if (!payModal.paidAmount || !payModal.paidDate) return
    dispatch(taxiDistributionActions.updatePaymentRequest({
      distributionId: payModal.distributionId,
      partnerId: payModal.partnerId,
      partnerName: payModal.partnerName,
      percentage: payModal.percentage,
      calculatedAmount: payModal.calculatedAmount,
      paidAmount: Number(payModal.paidAmount),
      paidDate: payModal.paidDate,
    }))
    setPayModal(null)
  }

  const totalPaid = paymentRows.filter((r) => r.paid).reduce((acc, r) => acc + (r.paidAmount || 0), 0)
  const totalPending = paymentRows.filter((r) => !r.paid).reduce((acc, r) => acc + (r.calculatedAmount || 0), 0)

  return (
    <>
      {/* Pay modal */}
      <CModal visible={!!payModal} onClose={() => setPayModal(null)}>
        <CModalHeader>
          <CModalTitle>Registrar pago — {payModal?.partnerName}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow className="g-3">
              <CCol xs={12}>
                <div style={{ fontSize: 13, color: 'var(--cui-secondary-color)', marginBottom: 4 }}>
                  Monto calculado: <strong>{fmt(payModal?.calculatedAmount)}</strong>
                </div>
              </CCol>
              <CCol sm={6}>
                <CFormLabel style={{ fontSize: 12 }}>Monto pagado</CFormLabel>
                <CFormInput
                  type="number"
                  value={payModal?.paidAmount ?? ''}
                  onChange={(e) => setPayModal((p) => ({ ...p, paidAmount: e.target.value }))}
                />
              </CCol>
              <CCol sm={6}>
                <CFormLabel style={{ fontSize: 12 }}>Fecha de pago</CFormLabel>
                <CFormInput
                  type="date"
                  value={payModal?.paidDate ?? ''}
                  onChange={(e) => setPayModal((p) => ({ ...p, paidDate: e.target.value }))}
                />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setPayModal(null)}>Cancelar</CButton>
          <CButton color="primary" onClick={handleMarkPaid} disabled={loadingDist}>
            {loadingDist ? <CSpinner size="sm" /> : 'Confirmar pago'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Summary cards */}
      <CRow className="mb-3 d-none d-sm-flex">
        <CCol sm={3}>
          <CCard className="text-center">
            <CCardBody>
              <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 4 }}>Total liquidaciones</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#2f9e44' }}>{fmt(totalIncome)}</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={3}>
          <CCard className="text-center">
            <CCardBody>
              <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 4 }}>Total gastos</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#e03131' }}>{fmt(totalExpenses)}</div>
              {totalExpensesPending > 0 && (
                <div style={{ fontSize: 11, color: '#e67700', marginTop: 4, fontWeight: 600 }}>⏳ {fmt(totalExpensesPending)} pendiente</div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={3}>
          <CCard className="text-center">
            <CCardBody>
              <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 4 }}>Neto disponible</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: net >= 0 ? '#1e40af' : '#e03131' }}>{fmt(net)}</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={3}>
          <CCard className="text-center">
            <CCardBody>
              <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 4 }}>
                {distribution ? 'Pendiente de pago' : `% asignado (${totalPercentage}%)`}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: distribution ? '#e67700' : (totalPercentage === 100 ? '#2f9e44' : '#e67700') }}>
                {distribution ? fmt(totalPending) : `${totalPercentage}%`}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Main card */}
      <CCard>
        <CCardHeader className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <strong>Repartición de ganancias</strong>
            {distribution && <CBadge color="secondary">{paymentRows.length} socios</CBadge>}
            {loadingDist && <CSpinner size="sm" />}
          </div>

          {/* Period selector */}
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)', whiteSpace: 'nowrap' }}>Periodo</span>
            <select
              className="form-select form-select-sm"
              style={{ width: 130 }}
              value={period.month}
              onChange={(e) => setPeriod((p) => ({ ...p, month: Number(e.target.value) }))}
            >
              {MONTHS.map((name, i) => (
                <option key={i + 1} value={i + 1}>{name}</option>
              ))}
            </select>
            <select
              className="form-select form-select-sm"
              style={{ width: 90 }}
              value={period.year}
              onChange={(e) => setPeriod((p) => ({ ...p, year: Number(e.target.value) }))}
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="d-flex align-items-center gap-2">
            <CButton
              size="sm"
              color="secondary"
              variant="outline"
              onClick={() => dispatch(taxiDistributionActions.fetchRequest())}
              title="Refrescar"
            >
              <CIcon icon={cilReload} size="sm" />
            </CButton>
            {distribution && (
              <CButton size="sm" color="danger" variant="outline" onClick={handleDeleteDistribution} title="Eliminar repartición">
                <CIcon icon={cilTrash} size="sm" />
              </CButton>
            )}
            {!distribution && partners.length > 0 && (
              <CButton size="sm" color="primary" onClick={handleGenerate} disabled={loadingDist}>
                <CIcon icon={cilCash} size="sm" />
                {' '}Generar repartición
              </CButton>
            )}
          </div>
        </CCardHeader>

        <CCardBody style={{ padding: 0 }}>
          {loading ? (
            <div className="d-flex justify-content-center py-5"><CSpinner color="primary" /></div>
          ) : partners.length === 0 ? (
            <div className="text-center py-5" style={{ color: 'var(--cui-secondary-color)', fontSize: 14 }}>
              No hay socios registrados. Agrega socios primero.
            </div>
          ) : (
            <>
              {!distribution && (
                <div style={{ padding: '12px 16px', background: 'var(--cui-warning-bg-subtle, #fff3cd)', borderBottom: '1px solid var(--cui-border-color)', fontSize: 13 }}>
                  Vista previa — presiona <strong>Generar repartición</strong> para guardar.
                </div>
              )}
              <StandardGrid
                id="paymentsGrid"
                dataSource={paymentRows}
                keyExpr="id"
                noDataText="Sin datos."
                onRowPrepared={(e) => {
                  if (e.rowType !== 'data') return
                  if (e.data.paid) e.rowElement.style.opacity = '0.65'
                }}
              >
                <Column dataField="partnerName" caption={t('taxis.distributions.columns.partner')} minWidth={180} />
                <Column
                  dataField="percentage"
                  caption={t('taxis.distributions.columns.percentage')}
                  width={80}
                  cellRender={({ value }) => <span style={{ fontWeight: 600 }}>{value}%</span>}
                />
                <Column
                  dataField="calculatedAmount"
                  caption={t('taxis.distributions.columns.calculatedAmount')}
                  width={160}
                  cellRender={({ value }) => (
                    <span style={{ fontWeight: 700, color: '#1e40af' }}>{fmt(value)}</span>
                  )}
                />
                <Column
                  dataField="paidAmount"
                  caption={t('taxis.distributions.columns.paidAmount')}
                  width={150}
                  cellRender={({ value }) =>
                    value != null ? <span style={{ fontWeight: 600, color: '#2f9e44' }}>{fmt(value)}</span>
                    : <span style={{ color: 'var(--cui-secondary-color)' }}>—</span>
                  }
                />
                <Column
                  dataField="paidDate"
                  caption={t('taxis.distributions.columns.paymentDate')}
                  width={120}
                  cellRender={({ value }) =>
                    value ? <span>{value}</span> : <span style={{ color: 'var(--cui-secondary-color)' }}>—</span>
                  }
                />
                <Column
                  caption={t('taxis.distributions.columns.status')}
                  width={110}
                  allowSorting={false}
                  cellRender={({ data }) =>
                    data.paid ? (
                      <CBadge color="success">Pagado</CBadge>
                    ) : (
                      <CBadge color="warning">Pendiente</CBadge>
                    )
                  }
                />
                {distribution && (
                  <Column
                    caption=""
                    width={140}
                    allowSorting={false}
                    cellRender={({ data }) =>
                      !data.paid ? (
                        <CButton
                          size="sm"
                          color="primary"
                          variant="outline"
                          style={{ fontSize: 11 }}
                          onClick={() => openPayModal(data)}
                        >
                          Marcar pagado
                        </CButton>
                      ) : null
                    }
                  />
                )}
              </StandardGrid>

              {distribution && paymentRows.some((r) => r.paid) && (
                <div style={{ padding: '8px 24px 16px', textAlign: 'right', fontSize: 13 }}>
                  <span style={{ color: 'var(--cui-secondary-color)', marginRight: 12 }}>
                    Total pagado:
                  </span>
                  <span style={{ fontWeight: 700, color: '#2f9e44', fontSize: 15 }}>{fmt(totalPaid)}</span>
                </div>
              )}
            </>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default Distributions
