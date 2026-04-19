import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CCard,
  CCardBody,
  CButton,
  CSpinner,
  CBadge,
  CCollapse,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CRow,
  CCol,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilChevronBottom, cilChevronRight, cilInfo } from '@coreui/icons'
import { fmt } from './utils'

const PeriodSummary = ({
  summaryOpen,
  toggleSummary,
  total,
  projection,
  isCurrentPeriod,
  daysElapsed: _daysElapsed,
  daysInMonth,
  totalExpenses,
  periodExpenses,
  byDriver,
  byVehicle,
  totalExpensesPaid,
  settlementAbbr,
  pendingRows,
  now,
  period,
  loading,
}) => {
  const { t } = useTranslation()

  const InfoTip = ({ content }) => (
    <CTooltip content={content} placement="top">
      <CIcon
        icon={cilInfo}
        size="sm"
        style={{ marginLeft: 5, color: '#adb5bd', cursor: 'help', verticalAlign: 'middle' }}
      />
    </CTooltip>
  )

  const [expensesModalOpen, setExpensesModalOpen] = useState(false)
  const [byDriverModalOpen, setByDriverModalOpen] = useState(false)
  const [pendingModalOpen, setPendingModalOpen] = useState(false)
  const [totalSettledModalOpen, setTotalSettledModalOpen] = useState(false)
  const [totalSettledTab, setTotalSettledTab] = useState('byVehicle')
  const [checkedExpenses, setCheckedExpenses] = useState(new Set())
  const [includePending, setIncludePending] = useState(false)

  return (
    <>
      <div
        onClick={toggleSummary}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          padding: '6px 4px',
          marginBottom: 8,
          userSelect: 'none',
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--cui-secondary-color)',
            letterSpacing: '.03em',
            textTransform: 'uppercase',
          }}
        >
          Resumen del período
        </span>
        <CIcon
          icon={summaryOpen ? cilChevronBottom : cilChevronRight}
          size="sm"
          style={{ color: 'var(--cui-secondary-color)' }}
        />
      </div>

      <CCollapse visible={summaryOpen}>
        <CRow className="mb-3">
          {/* Total settled */}
          <CCol xs={6} sm={2}>
            <CCard
              className="text-center"
              style={{ cursor: 'pointer' }}
              onClick={() => setTotalSettledModalOpen(true)}
            >
              <CCardBody>
                <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 4 }}>
                  {t('taxis.settlements.summary.totalSettled')}
                  <InfoTip content="Suma total de todas las liquidaciones registradas en el período." />
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#2f9e44' }}>{fmt(total)}</div>
              </CCardBody>
            </CCard>

            <CModal
              visible={totalSettledModalOpen}
              onClose={() => setTotalSettledModalOpen(false)}
              size="lg"
              alignment="center"
            >
              <CModalHeader>
                <CModalTitle>
                  {t('taxis.settlements.summary.totalSettled')} — {period.month}/{period.year}
                </CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CNav variant="tabs" className="mb-3">
                  <CNavItem>
                    <CNavLink
                      active={totalSettledTab === 'byVehicle'}
                      onClick={() => setTotalSettledTab('byVehicle')}
                      style={{ cursor: 'pointer' }}
                    >
                      Por taxi
                    </CNavLink>
                  </CNavItem>
                </CNav>
                <CTabContent>
                  <CTabPane visible={totalSettledTab === 'byVehicle'}>
                    {!byVehicle?.length ? (
                      <span style={{ fontSize: 13, color: 'var(--cui-secondary-color)' }}>
                        {t('taxis.settlements.summary.noRecords')}
                      </span>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid var(--cui-border-color)' }}>
                            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Placa</th>
                            <th style={{ padding: '8px 12px', textAlign: 'right' }}>
                              Liquidaciones
                            </th>
                            <th style={{ padding: '8px 12px', textAlign: 'right' }}>
                              Total pagado
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {byVehicle.map((v, i) => (
                            <tr
                              key={v.plate}
                              style={{
                                borderBottom: '1px solid var(--cui-border-color)',
                                background:
                                  i % 2 === 0 ? 'transparent' : 'var(--cui-tertiary-bg, #f8f9fa)',
                              }}
                            >
                              <td style={{ padding: '8px 12px', fontWeight: 600 }}>{v.plate}</td>
                              <td
                                style={{
                                  padding: '8px 12px',
                                  textAlign: 'right',
                                  color: 'var(--cui-secondary-color)',
                                }}
                              >
                                {v.count} {settlementAbbr}
                              </td>
                              <td
                                style={{
                                  padding: '8px 12px',
                                  textAlign: 'right',
                                  fontWeight: 700,
                                  color: '#2f9e44',
                                }}
                              >
                                {fmt(v.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr
                            style={{
                              borderTop: '2px solid var(--cui-border-color)',
                              background: 'var(--cui-tertiary-bg, #f8f9fa)',
                            }}
                          >
                            <td style={{ padding: '8px 12px', fontWeight: 700 }}>Total</td>
                            <td
                              style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}
                            >
                              {byVehicle.reduce((s, v) => s + v.count, 0)} {settlementAbbr}
                            </td>
                            <td
                              style={{
                                padding: '8px 12px',
                                textAlign: 'right',
                                fontWeight: 700,
                                color: '#2f9e44',
                              }}
                            >
                              {fmt(byVehicle.reduce((s, v) => s + v.total, 0))}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    )}
                  </CTabPane>
                </CTabContent>
              </CModalBody>
            </CModal>
          </CCol>

          {/* Projection */}
          <CCol xs={6} sm={2}>
            <CCard className="text-center">
              <CCardBody>
                <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 4 }}>
                  {t('taxis.settlements.summary.monthProjection')}
                  <span style={{ marginLeft: 6, fontStyle: 'italic', fontSize: 11 }}>
                    si todos pagaran
                  </span>
                  <InfoTip content="Total hipotético si todos los conductores activos liquidaran cada día hábil del mes al valor por defecto. No es extrapolación lineal." />
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: projection ? 'var(--cui-primary)' : 'var(--cui-secondary-color)',
                  }}
                >
                  {projection ? fmt(projection) : '—'}
                </div>
              </CCardBody>
            </CCard>
          </CCol>

          {/* Deficit */}
          <CCol xs={6} sm={2}>
            <CCard className="text-center">
              <CCardBody>
                <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 4 }}>
                  {t('taxis.settlements.summary.deficit')}
                  <InfoTip content="Diferencia entre la proyección del mes y lo efectivamente liquidado. Rojo = falta por cobrar, verde = se superó la proyección." />
                </div>
                {projection !== null ? (
                  (() => {
                    const diff = projection - total
                    return (
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 700,
                          color: diff > 0 ? '#e03131' : '#2f9e44',
                        }}
                      >
                        {fmt(Math.abs(diff))}
                      </div>
                    )
                  })()
                ) : (
                  <div
                    style={{ fontSize: 22, fontWeight: 700, color: 'var(--cui-secondary-color)' }}
                  >
                    —
                  </div>
                )}
              </CCardBody>
            </CCard>
          </CCol>

          {/* Expenses */}
          <CCol xs={6} sm={2}>
            <CCard style={{ height: '100%' }}>
              <CCardBody
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 4 }}>
                  {t('taxis.settlements.summary.totalExpenses')}
                  <InfoTip content="Suma de todos los gastos registrados en el período (pagados y pendientes)." />
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#e67700', marginBottom: 8 }}>
                  {fmt(totalExpenses)}
                </div>
                <CButton
                  size="sm"
                  color="warning"
                  variant="outline"
                  disabled={periodExpenses.length === 0}
                  onClick={() => {
                    setCheckedExpenses(new Set(periodExpenses.map((r) => r.id)))
                    setExpensesModalOpen(true)
                  }}
                >
                  {`${periodExpenses.length} gastos`}
                </CButton>
              </CCardBody>
            </CCard>

            <CModal
              visible={expensesModalOpen}
              onClose={() => setExpensesModalOpen(false)}
              size="lg"
              alignment="center"
            >
              <CModalHeader>
                <CModalTitle>
                  {t('taxis.settlements.summary.totalExpenses')} — {period.month}/{period.year}
                </CModalTitle>
              </CModalHeader>
              <CModalBody>
                {periodExpenses.length === 0 ? (
                  <span style={{ fontSize: 13, color: 'var(--cui-secondary-color)' }}>
                    {t('taxis.settlements.summary.noRecords')}
                  </span>
                ) : (
                  (() => {
                    const checkedTotal = periodExpenses
                      .filter((r) => checkedExpenses.has(r.id))
                      .reduce((acc, r) => acc + (r.amount || 0), 0)
                    return (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid var(--cui-border-color)' }}>
                            <th style={{ padding: '8px 8px' }} />
                            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Fecha</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Descripción</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Categoría</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Placa</th>
                            <th style={{ padding: '8px 12px', textAlign: 'right' }}>Monto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {periodExpenses.map((r) => {
                            const checked = checkedExpenses.has(r.id)
                            return (
                              <tr
                                key={r.id}
                                style={{
                                  borderBottom: '1px solid var(--cui-border-color)',
                                  opacity: checked ? 1 : 0.4,
                                  cursor: 'pointer',
                                }}
                                onClick={() =>
                                  setCheckedExpenses((prev) => {
                                    const next = new Set(prev)
                                    checked ? next.delete(r.id) : next.add(r.id)
                                    return next
                                  })
                                }
                              >
                                <td style={{ padding: '8px 8px', textAlign: 'center' }}>
                                  <input type="checkbox" checked={checked} onChange={() => {}} />
                                </td>
                                <td style={{ padding: '8px 12px' }}>{r.date}</td>
                                <td style={{ padding: '8px 12px' }}>{r.description}</td>
                                <td style={{ padding: '8px 12px' }}>{r.category}</td>
                                <td style={{ padding: '8px 12px' }}>{r.plate ?? '—'}</td>
                                <td
                                  style={{
                                    padding: '8px 12px',
                                    textAlign: 'right',
                                    fontWeight: 600,
                                  }}
                                >
                                  {fmt(r.amount)}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                        <tfoot>
                          <tr
                            style={{
                              borderTop: '2px solid var(--cui-border-color)',
                              background: 'var(--cui-tertiary-bg)',
                            }}
                          >
                            <td colSpan={5} style={{ padding: '8px 12px', fontWeight: 700 }}>
                              Total
                            </td>
                            <td
                              style={{
                                padding: '8px 12px',
                                textAlign: 'right',
                                fontWeight: 700,
                                color: '#e67700',
                              }}
                            >
                              {fmt(checkedTotal)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    )
                  })()
                )}
              </CModalBody>
            </CModal>
          </CCol>

          {/* Net */}
          <CCol xs={6} sm={2}>
            <CCard className="text-center">
              <CCardBody>
                <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 4 }}>
                  {t('taxis.settlements.summary.net')}
                  <InfoTip content="Total liquidado menos gastos. Activar 'Incluir pendientes' para descontar también los gastos aún no pagados." />
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color:
                      total - (includePending ? totalExpenses : totalExpensesPaid) >= 0
                        ? '#1e40af'
                        : '#e03131',
                  }}
                >
                  {fmt(total - (includePending ? totalExpenses : totalExpensesPaid))}
                </div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    marginTop: 8,
                    cursor: 'pointer',
                    fontSize: 11,
                    color: 'var(--cui-secondary-color)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={includePending}
                    onChange={(e) => setIncludePending(e.target.checked)}
                  />
                  Incluir pendientes
                </label>
              </CCardBody>
            </CCard>
          </CCol>

          {/* By driver */}
          <CCol xs={6} sm={2}>
            <CCard style={{ height: '100%' }}>
              <CCardBody
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 8 }}>
                  {t('taxis.settlements.summary.byDriver')}
                  <InfoTip content="Liquidaciones del período agrupadas por conductor: total pagado, por cobrar y proyección del resto del mes." />
                </div>
                <CButton
                  size="sm"
                  color="primary"
                  variant="outline"
                  disabled={loading || byDriver.length === 0}
                  onClick={() => setByDriverModalOpen(true)}
                >
                  {loading ? <CSpinner size="sm" /> : `${byDriver.length} conductores`}
                </CButton>
              </CCardBody>
            </CCard>

            <CModal
              visible={byDriverModalOpen}
              onClose={() => setByDriverModalOpen(false)}
              size="lg"
              alignment="center"
            >
              <CModalHeader>
                <CModalTitle>{t('taxis.settlements.summary.byDriver')}</CModalTitle>
              </CModalHeader>
              <CModalBody>
                {byDriver.length === 0 ? (
                  <span style={{ fontSize: 13, color: 'var(--cui-secondary-color)' }}>
                    {t('taxis.settlements.summary.noRecords')}
                  </span>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--cui-border-color)' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Conductor</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Liquidaciones</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total</th>
                        {isCurrentPeriod && (
                          <th style={{ padding: '8px 12px', textAlign: 'right' }}>Por cobrar</th>
                        )}
                        {isCurrentPeriod && (
                          <th style={{ padding: '8px 12px', textAlign: 'right' }}>Resta del mes</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {byDriver.map((d, i) => (
                        <tr
                          key={d.driver}
                          style={{
                            background:
                              i % 2 === 0 ? 'transparent' : 'var(--cui-tertiary-bg, #f8f9fa)',
                            borderBottom: '1px solid var(--cui-border-color)',
                          }}
                        >
                          <td style={{ padding: '8px 12px', fontWeight: 600 }}>{d.driver}</td>
                          <td
                            style={{
                              padding: '8px 12px',
                              textAlign: 'right',
                              color: 'var(--cui-secondary-color)',
                            }}
                          >
                            {d.count} {settlementAbbr}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>
                            {fmt(d.total)}
                          </td>
                          {isCurrentPeriod && (
                            <td
                              style={{
                                padding: '8px 12px',
                                textAlign: 'right',
                                fontWeight: 700,
                                color: d.remaining > 0 ? '#e67700' : '#2f9e44',
                              }}
                            >
                              {fmt(d.remaining)}
                            </td>
                          )}
                          {isCurrentPeriod && (
                            <td
                              style={{
                                padding: '8px 12px',
                                textAlign: 'right',
                                fontWeight: 700,
                                color: d.future === null ? 'var(--cui-secondary-color)' : '#1971c2',
                              }}
                            >
                              {d.future === null ? '—' : fmt(d.future)}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr
                        style={{
                          borderTop: '2px solid var(--cui-border-color)',
                          background: 'var(--cui-tertiary-bg, #f8f9fa)',
                        }}
                      >
                        <td style={{ padding: '8px 12px', fontWeight: 700 }}>Total</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>
                          {byDriver.reduce((s, d) => s + d.count, 0)} {settlementAbbr}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>
                          {fmt(byDriver.reduce((s, d) => s + d.total, 0))}
                        </td>
                        {isCurrentPeriod && (
                          <td
                            style={{
                              padding: '8px 12px',
                              textAlign: 'right',
                              fontWeight: 700,
                              color: '#e67700',
                            }}
                          >
                            {fmt(byDriver.reduce((s, d) => s + (d.remaining || 0), 0))}
                          </td>
                        )}
                        {isCurrentPeriod && (
                          <td
                            style={{
                              padding: '8px 12px',
                              textAlign: 'right',
                              fontWeight: 700,
                              color: '#1971c2',
                            }}
                          >
                            {fmt(
                              byDriver
                                .filter((d) => d.future !== null)
                                .reduce((s, d) => s + d.future, 0),
                            )}
                          </td>
                        )}
                      </tr>
                    </tfoot>
                  </table>
                )}
              </CModalBody>
            </CModal>
          </CCol>
        </CRow>

        <CRow className="mb-3">
          {/* Pending */}
          <CCol xs={6} sm={2}>
            <CCard style={!isCurrentPeriod ? { opacity: 0.5 } : undefined}>
              <CCardBody
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 4 }}>
                  {t('taxis.settlements.summary.pendingDrivers')}
                  <InfoTip content="Monto que los conductores activos aún deben pagar por los días restantes del mes actual, calculado a su valor por defecto." />
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: isCurrentPeriod && pendingRows.length > 0 ? '#e67700' : '#2f9e44',
                    marginBottom: 4,
                  }}
                >
                  {isCurrentPeriod ? fmt(pendingRows.reduce((s, r) => s + r.amount, 0)) : '--'}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--cui-secondary-color)',
                    marginBottom: 8,
                  }}
                >
                  {isCurrentPeriod
                    ? t('taxis.settlements.summary.remainingDays', {
                        days: daysInMonth - now.getDate(),
                      })
                    : '--'}
                </div>
                <CButton
                  size="sm"
                  color="warning"
                  variant="outline"
                  disabled={!isCurrentPeriod || pendingRows.length === 0}
                  onClick={() => setPendingModalOpen(true)}
                >
                  {isCurrentPeriod ? `${pendingRows.length} pendientes` : '--'}
                </CButton>
              </CCardBody>
            </CCard>

            <CModal
              visible={pendingModalOpen}
              onClose={() => setPendingModalOpen(false)}
              size="lg"
              alignment="center"
            >
              <CModalHeader>
                <CModalTitle>
                  Liquidaciones pendientes — {period.month}/{period.year}
                </CModalTitle>
              </CModalHeader>
              <CModalBody>
                {pendingRows.length === 0 ? (
                  <span style={{ fontSize: 13, color: 'var(--cui-secondary-color)' }}>
                    {t('taxis.settlements.summary.noRecords')}
                  </span>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--cui-border-color)' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Fecha</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Placa</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Conductor</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Valor esperado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingRows.map((r, i) => (
                        <tr
                          key={i}
                          style={{
                            borderBottom: '1px solid var(--cui-border-color)',
                            background:
                              r.isHoliday || r.isSunday ? 'var(--cui-tertiary-bg)' : undefined,
                          }}
                        >
                          <td style={{ padding: '8px 12px' }}>
                            {r.date}
                            {r.isHoliday && (
                              <CBadge color="info" style={{ marginLeft: 6, fontSize: 10 }}>
                                Festivo
                              </CBadge>
                            )}
                            {!r.isHoliday && r.isSunday && (
                              <CBadge color="secondary" style={{ marginLeft: 6, fontSize: 10 }}>
                                Dom
                              </CBadge>
                            )}
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: 600 }}>{r.plate}</td>
                          <td style={{ padding: '8px 12px' }}>{r.driver}</td>
                          <td
                            style={{
                              padding: '8px 12px',
                              textAlign: 'right',
                              fontWeight: 600,
                            }}
                          >
                            {fmt(r.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr
                        style={{
                          borderTop: '2px solid var(--cui-border-color)',
                          background: 'var(--cui-tertiary-bg)',
                        }}
                      >
                        <td colSpan={3} style={{ padding: '8px 12px', fontWeight: 700 }}>
                          Total esperado
                        </td>
                        <td
                          style={{
                            padding: '8px 12px',
                            textAlign: 'right',
                            fontWeight: 700,
                            color: '#e67700',
                          }}
                        >
                          {fmt(pendingRows.reduce((s, r) => s + r.amount, 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </CModalBody>
            </CModal>
          </CCol>
        </CRow>
      </CCollapse>
    </>
  )
}

export default PeriodSummary
