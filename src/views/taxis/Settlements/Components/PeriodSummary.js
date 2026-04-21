import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilChevronBottom, cilChevronRight } from '@coreui/icons'
import { fmt } from './utils'
import StatCard from 'src/components/StatCard'
import './PeriodSummary.scss'

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

  const [expensesModalOpen, setExpensesModalOpen] = useState(false)
  const [byDriverModalOpen, setByDriverModalOpen] = useState(false)
  const [pendingModalOpen, setPendingModalOpen] = useState(false)
  const [totalSettledModalOpen, setTotalSettledModalOpen] = useState(false)
  const [totalSettledTab, setTotalSettledTab] = useState('byVehicle')
  const [checkedExpenses, setCheckedExpenses] = useState(new Set())
  const [includePending, setIncludePending] = useState(false)

  return (
    <>
      <div className="period-summary__toggle" onClick={toggleSummary}>
        <span className="period-summary__toggle-label">Resumen del período</span>
        <CIcon
          icon={summaryOpen ? cilChevronBottom : cilChevronRight}
          size="sm"
          className="period-summary__toggle-icon"
        />
      </div>

      <CCollapse visible={summaryOpen}>
        <CRow className="g-2 mb-2">
          {/* Total settled */}
          <CCol xs={6} sm={2}>
            <StatCard
              label={t('taxis.settlements.summary.totalSettled')}
              value={fmt(total)}
              color="#2f9e44"
              tip="Suma total de todas las liquidaciones registradas en el período."
              onClick={() => setTotalSettledModalOpen(true)}
            />

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
                      className="cursor-pointer"
                    >
                      Por taxi
                    </CNavLink>
                  </CNavItem>
                </CNav>
                <CTabContent>
                  <CTabPane visible={totalSettledTab === 'byVehicle'}>
                    {!byVehicle?.length ? (
                      <span className="master-empty">{t('taxis.settlements.summary.noRecords')}</span>
                    ) : (
                      <table className="summary-table">
                        <thead>
                          <tr className="summary-table__head-row">
                            <th className="summary-table__th">Placa</th>
                            <th className="summary-table__th summary-table__th--right">Liquidaciones</th>
                            <th className="summary-table__th summary-table__th--right">Total pagado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {byVehicle.map((v, i) => (
                            <tr
                              key={v.plate}
                              className={`summary-table__row${i % 2 !== 0 ? ' summary-table__row--alt' : ''}`}
                            >
                              <td className="summary-table__td summary-table__td--bold">{v.plate}</td>
                              <td className="summary-table__td summary-table__td--right summary-table__td--muted">
                                {v.count} {settlementAbbr}
                              </td>
                              <td className="summary-table__td summary-table__td--right summary-table__td--green">
                                {fmt(v.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="summary-table__foot-row">
                            <td className="summary-table__td summary-table__td--bolder">Total</td>
                            <td className="summary-table__td summary-table__td--right summary-table__td--bolder">
                              {byVehicle.reduce((s, v) => s + v.count, 0)} {settlementAbbr}
                            </td>
                            <td className="summary-table__td summary-table__td--right summary-table__td--green">
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
            <StatCard
              label={
                <>{t('taxis.settlements.summary.monthProjection')}{' '}
                  <span style={{ fontStyle: 'italic', fontSize: 10, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>si todos pagaran</span>
                </>
              }
              value={projection ? fmt(projection) : '—'}
              color={projection ? 'var(--cui-primary)' : 'var(--cui-secondary-color)'}
              tip="Total hipotético si todos los conductores activos liquidaran cada día hábil del mes al valor por defecto. No es extrapolación lineal."
            />
          </CCol>

          {/* Deficit */}
          <CCol xs={6} sm={2}>
            {(() => {
              const diff = projection !== null ? projection - total : null
              return (
                <StatCard
                  label={t('taxis.settlements.summary.deficit')}
                  value={diff !== null ? fmt(Math.abs(diff)) : '—'}
                  color={diff === null ? 'var(--cui-secondary-color)' : diff > 0 ? '#e03131' : '#2f9e44'}
                  tip="Diferencia entre la proyección del mes y lo efectivamente liquidado. Rojo = falta por cobrar, verde = se superó la proyección."
                />
              )
            })()}
          </CCol>

          {/* Expenses */}
          <CCol xs={6} sm={2}>
            <StatCard
              label={t('taxis.settlements.summary.totalExpenses')}
              value={fmt(totalExpenses)}
              color="#e67700"
              tip="Suma de todos los gastos registrados en el período (pagados y pendientes)."
            >
              <CButton
                size="sm"
                color="warning"
                variant="outline"
                disabled={periodExpenses.length === 0}
                onClick={(e) => {
                  e.stopPropagation()
                  setCheckedExpenses(new Set(periodExpenses.map((r) => r.id)))
                  setExpensesModalOpen(true)
                }}
                className="period-summary__stat-btn"
              >
                {`${periodExpenses.length} gastos`}
              </CButton>
            </StatCard>

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
                  <span className="master-empty">{t('taxis.settlements.summary.noRecords')}</span>
                ) : (
                  (() => {
                    const checkedTotal = periodExpenses
                      .filter((r) => checkedExpenses.has(r.id))
                      .reduce((acc, r) => acc + (r.amount || 0), 0)
                    return (
                      <table className="summary-table">
                        <thead>
                          <tr className="summary-table__head-row">
                            <th className="summary-table__th summary-table__th--icon" />
                            <th className="summary-table__th">Fecha</th>
                            <th className="summary-table__th">Descripción</th>
                            <th className="summary-table__th">Categoría</th>
                            <th className="summary-table__th">Placa</th>
                            <th className="summary-table__th summary-table__th--right">Monto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {periodExpenses.map((r) => {
                            const checked = checkedExpenses.has(r.id)
                            return (
                              <tr
                                key={r.id}
                                className="summary-table__row summary-table__row--clickable"
                                style={{ opacity: checked ? 1 : 0.4 }}
                                onClick={() =>
                                  setCheckedExpenses((prev) => {
                                    const next = new Set(prev)
                                    checked ? next.delete(r.id) : next.add(r.id)
                                    return next
                                  })
                                }
                              >
                                <td className="summary-table__td summary-table__td--icon">
                                  <input type="checkbox" checked={checked} onChange={() => {}} />
                                </td>
                                <td className="summary-table__td">{r.date}</td>
                                <td className="summary-table__td">{r.description}</td>
                                <td className="summary-table__td">{r.category}</td>
                                <td className="summary-table__td">{r.plate ?? '—'}</td>
                                <td className="summary-table__td summary-table__td--right summary-table__td--bold">
                                  {fmt(r.amount)}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="summary-table__foot-row">
                            <td colSpan={5} className="summary-table__td summary-table__td--bolder">Total</td>
                            <td className="summary-table__td summary-table__td--right summary-table__td--orange">
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
            {(() => {
              const net = total - (includePending ? totalExpenses : totalExpensesPaid)
              return (
                <StatCard
                  label={t('taxis.settlements.summary.net')}
                  value={fmt(net)}
                  color={net >= 0 ? '#1e40af' : '#e03131'}
                  tip="Total liquidado menos gastos. Activar 'Incluir pendientes' para descontar también los gastos aún no pagados."
                >
                  <label
                    className="period-summary__include-label"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input type="checkbox" checked={includePending} onChange={(e) => setIncludePending(e.target.checked)} />
                    Incluir pendientes
                  </label>
                </StatCard>
              )
            })()}
          </CCol>

          {/* By driver */}
          <CCol xs={6} sm={2}>
            <StatCard
              label={t('taxis.settlements.summary.byDriver')}
              color="#6f42c1"
              tip="Liquidaciones del período agrupadas por conductor: total pagado, por cobrar y proyección del resto del mes."
            >
              <CButton
                size="sm"
                color="primary"
                variant="outline"
                disabled={loading || byDriver.length === 0}
                onClick={(e) => { e.stopPropagation(); setByDriverModalOpen(true) }}
                className="period-summary__stat-btn"
              >
                {loading ? <CSpinner size="sm" /> : `${byDriver.length} conductores`}
              </CButton>
            </StatCard>

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
                  <span className="master-empty">{t('taxis.settlements.summary.noRecords')}</span>
                ) : (
                  <table className="summary-table">
                    <thead>
                      <tr className="summary-table__head-row">
                        <th className="summary-table__th">Conductor</th>
                        <th className="summary-table__th summary-table__th--right">Liquidaciones</th>
                        <th className="summary-table__th summary-table__th--right">Total</th>
                        {isCurrentPeriod && <th className="summary-table__th summary-table__th--right">Por cobrar</th>}
                        {isCurrentPeriod && <th className="summary-table__th summary-table__th--right">Resta del mes</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {byDriver.map((d, i) => (
                        <tr
                          key={d.driver}
                          className={`summary-table__row${i % 2 !== 0 ? ' summary-table__row--alt' : ''}`}
                        >
                          <td className="summary-table__td summary-table__td--bold">{d.driver}</td>
                          <td className="summary-table__td summary-table__td--right summary-table__td--muted">
                            {d.count} {settlementAbbr}
                          </td>
                          <td className="summary-table__td summary-table__td--right summary-table__td--bolder">
                            {fmt(d.total)}
                          </td>
                          {isCurrentPeriod && (
                            <td
                              className={`summary-table__td summary-table__td--right summary-table__td--bolder${d.remaining > 0 ? ' summary-table__td--orange' : ' summary-table__td--green'}`}
                            >
                              {fmt(d.remaining)}
                            </td>
                          )}
                          {isCurrentPeriod && (
                            <td
                              className={`summary-table__td summary-table__td--right summary-table__td--bolder${d.future === null ? ' summary-table__td--muted' : ' summary-table__td--blue'}`}
                            >
                              {d.future === null ? '—' : fmt(d.future)}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="summary-table__foot-row">
                        <td className="summary-table__td summary-table__td--bolder">Total</td>
                        <td className="summary-table__td summary-table__td--right summary-table__td--bolder">
                          {byDriver.reduce((s, d) => s + d.count, 0)} {settlementAbbr}
                        </td>
                        <td className="summary-table__td summary-table__td--right summary-table__td--bolder">
                          {fmt(byDriver.reduce((s, d) => s + d.total, 0))}
                        </td>
                        {isCurrentPeriod && (
                          <td className="summary-table__td summary-table__td--right summary-table__td--orange">
                            {fmt(byDriver.reduce((s, d) => s + (d.remaining || 0), 0))}
                          </td>
                        )}
                        {isCurrentPeriod && (
                          <td className="summary-table__td summary-table__td--right summary-table__td--blue">
                            {fmt(byDriver.filter((d) => d.future !== null).reduce((s, d) => s + d.future, 0))}
                          </td>
                        )}
                      </tr>
                    </tfoot>
                  </table>
                )}
              </CModalBody>
            </CModal>
          </CCol>

          {/* Pending */}
          <CCol xs={6} sm={2}>
            <StatCard
              label={t('taxis.settlements.summary.pendingDrivers')}
              value={isCurrentPeriod ? fmt(pendingRows.reduce((s, r) => s + r.amount, 0)) : '—'}
              color={isCurrentPeriod && pendingRows.length > 0 ? '#e67700' : '#2f9e44'}
              tip="Monto que los conductores activos aún deben pagar por los días restantes del mes actual, calculado a su valor por defecto."
              fade={!isCurrentPeriod}
            >
              {isCurrentPeriod && (
                <div className="period-summary__pending-hint">
                  {t('taxis.settlements.summary.remainingDays', { days: daysInMonth - now.getDate() })}
                </div>
              )}
              <CButton
                size="sm"
                color="warning"
                variant="outline"
                disabled={!isCurrentPeriod || pendingRows.length === 0}
                onClick={(e) => { e.stopPropagation(); setPendingModalOpen(true) }}
                className="period-summary__stat-btn"
              >
                {isCurrentPeriod ? `${pendingRows.length} pendientes` : '—'}
              </CButton>
            </StatCard>

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
                  <span className="master-empty">{t('taxis.settlements.summary.noRecords')}</span>
                ) : (
                  <table className="summary-table">
                    <thead>
                      <tr className="summary-table__head-row">
                        <th className="summary-table__th">Fecha</th>
                        <th className="summary-table__th">Placa</th>
                        <th className="summary-table__th">Conductor</th>
                        <th className="summary-table__th summary-table__th--right">Valor esperado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingRows.map((r, i) => (
                        <tr
                          key={i}
                          className="summary-table__row"
                          style={r.isHoliday || r.isSunday ? { background: 'var(--cui-tertiary-bg)' } : undefined}
                        >
                          <td className="summary-table__td">
                            {r.date}
                            {r.isHoliday && (
                              <CBadge color="info" className="summary-table__badge">Festivo</CBadge>
                            )}
                            {!r.isHoliday && r.isSunday && (
                              <CBadge color="secondary" className="summary-table__badge">Dom</CBadge>
                            )}
                          </td>
                          <td className="summary-table__td summary-table__td--bold">{r.plate}</td>
                          <td className="summary-table__td">{r.driver}</td>
                          <td className="summary-table__td summary-table__td--right summary-table__td--bold">
                            {fmt(r.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="summary-table__foot-row">
                        <td colSpan={3} className="summary-table__td summary-table__td--bolder">Total esperado</td>
                        <td className="summary-table__td summary-table__td--right summary-table__td--orange">
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
