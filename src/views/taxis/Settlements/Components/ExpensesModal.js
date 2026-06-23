import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
} from '@coreui/react'
import { fmt } from './utils'

const ExpensesModal = ({ visible, onClose, periodExpenses, period }) => {
  const { t } = useTranslation()
  const [checkedExpenses, setCheckedExpenses] = useState(new Set())
  const [tab, setTab] = useState('detail')

  useEffect(() => {
    if (visible) setCheckedExpenses(new Set(periodExpenses.map((r) => r.id)))
  }, [visible, periodExpenses])

  const checkedExpensesList = periodExpenses.filter((r) => checkedExpenses.has(r.id))
  const checkedTotal = checkedExpensesList.reduce((acc, r) => acc + (r.amount || 0), 0)

  const byCategory = Object.values(
    checkedExpensesList.reduce((acc, r) => {
      const key = r.category ?? '—'
      if (!acc[key]) acc[key] = { category: key, count: 0, total: 0 }
      acc[key].count += 1
      acc[key].total += r.amount || 0
      return acc
    }, {}),
  ).sort((a, b) => b.total - a.total)

  const byPlate = Object.values(
    checkedExpensesList.reduce((acc, r) => {
      const key = r.plate ?? '—'
      if (!acc[key]) acc[key] = { plate: key, count: 0, total: 0, drivers: new Set() }
      acc[key].count += 1
      acc[key].total += r.amount || 0
      if (r.driverName) acc[key].drivers.add(r.driverName)
      return acc
    }, {}),
  )
    .map((p) => ({ ...p, drivers: [...p.drivers].join(', ') || '—' }))
    .sort((a, b) => b.total - a.total)

  return (
    <CModal visible={visible} onClose={onClose} size="lg" alignment="center">
      <CModalHeader>
        <CModalTitle>
          {t('taxis.settlements.summary.totalExpenses')} — {period.month}/{period.year}
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CNav variant="tabs" className="mb-3">
          <CNavItem>
            <CNavLink
              active={tab === 'detail'}
              onClick={() => setTab('detail')}
              className="cursor-pointer"
            >
              Detallado
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={tab === 'category'}
              onClick={() => setTab('category')}
              className="cursor-pointer"
            >
              Total por categoría
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={tab === 'plate'}
              onClick={() => setTab('plate')}
              className="cursor-pointer"
            >
              Total por placa
            </CNavLink>
          </CNavItem>
        </CNav>
        <CTabContent>
          <CTabPane visible={tab === 'detail'}>
            {periodExpenses.length === 0 ? (
              <span className="master-empty">{t('taxis.settlements.summary.noRecords')}</span>
            ) : (
              <table className="summary-table">
                <thead>
                  <tr className="summary-table__head-row">
                    <th className="summary-table__th summary-table__th--icon" />
                    <th className="summary-table__th">Fecha</th>
                    <th className="summary-table__th">Descripción</th>
                    <th className="summary-table__th">Categoría</th>
                    <th className="summary-table__th">Placa</th>
                    <th className="summary-table__th">Conductor</th>
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
                        <td className="summary-table__td">{r.driverName ?? '—'}</td>
                        <td className="summary-table__td summary-table__td--right summary-table__td--bold">
                          {fmt(r.amount)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="summary-table__foot-row">
                    <td colSpan={6} className="summary-table__td summary-table__td--bolder">
                      Total
                    </td>
                    <td className="summary-table__td summary-table__td--right summary-table__td--orange">
                      {fmt(checkedTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </CTabPane>
          <CTabPane visible={tab === 'category'}>
            {byCategory.length === 0 ? (
              <span className="master-empty">{t('taxis.settlements.summary.noRecords')}</span>
            ) : (
              <table className="summary-table">
                <thead>
                  <tr className="summary-table__head-row">
                    <th className="summary-table__th">Categoría</th>
                    <th className="summary-table__th summary-table__th--right">Gastos</th>
                    <th className="summary-table__th summary-table__th--right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {byCategory.map((c, i) => (
                    <tr
                      key={c.category}
                      className={`summary-table__row${i % 2 !== 0 ? ' summary-table__row--alt' : ''}`}
                    >
                      <td className="summary-table__td summary-table__td--bold">{c.category}</td>
                      <td className="summary-table__td summary-table__td--right summary-table__td--muted">
                        {c.count}
                      </td>
                      <td className="summary-table__td summary-table__td--right summary-table__td--bold">
                        {fmt(c.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="summary-table__foot-row">
                    <td className="summary-table__td summary-table__td--bolder">Total</td>
                    <td className="summary-table__td summary-table__td--right summary-table__td--bolder">
                      {byCategory.reduce((s, c) => s + c.count, 0)}
                    </td>
                    <td className="summary-table__td summary-table__td--right summary-table__td--orange">
                      {fmt(checkedTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </CTabPane>
          <CTabPane visible={tab === 'plate'}>
            {byPlate.length === 0 ? (
              <span className="master-empty">{t('taxis.settlements.summary.noRecords')}</span>
            ) : (
              <table className="summary-table">
                <thead>
                  <tr className="summary-table__head-row">
                    <th className="summary-table__th">Placa</th>
                    <th className="summary-table__th">Conductor</th>
                    <th className="summary-table__th summary-table__th--right">Gastos</th>
                    <th className="summary-table__th summary-table__th--right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {byPlate.map((p, i) => (
                    <tr
                      key={p.plate}
                      className={`summary-table__row${i % 2 !== 0 ? ' summary-table__row--alt' : ''}`}
                    >
                      <td className="summary-table__td summary-table__td--bold">{p.plate}</td>
                      <td className="summary-table__td summary-table__td--muted">{p.drivers}</td>
                      <td className="summary-table__td summary-table__td--right summary-table__td--muted">
                        {p.count}
                      </td>
                      <td className="summary-table__td summary-table__td--right summary-table__td--bold">
                        {fmt(p.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="summary-table__foot-row">
                    <td colSpan={2} className="summary-table__td summary-table__td--bolder">
                      Total
                    </td>
                    <td className="summary-table__td summary-table__td--right summary-table__td--bolder">
                      {byPlate.reduce((s, p) => s + p.count, 0)}
                    </td>
                    <td className="summary-table__td summary-table__td--right summary-table__td--orange">
                      {fmt(checkedTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </CTabPane>
        </CTabContent>
      </CModalBody>
    </CModal>
  )
}

export default ExpensesModal
