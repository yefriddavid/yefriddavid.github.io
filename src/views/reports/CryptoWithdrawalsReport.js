import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CFormSelect } from '@coreui/react'
import Spinner from 'src/components/shared/Spinner'
import moment from 'src/utils/moment'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import useLocaleData from 'src/hooks/useLocaleData'
import { useCryptoPrices } from 'src/views/Finance/trade/Prices/useCryptoPrices'
import { useHistoricalCryptoPrice } from 'src/hooks/useHistoricalCryptoPrice'
import * as actions from 'src/actions/finance/cryptoWithdrawalActions'
import { CRYPTO_PURCHASE_SYMBOLS } from 'src/constants/finance'
import {
  fmtAmount,
  statusLabel,
  statusVariant,
  splitApplyTime,
} from 'src/views/tools/crypto-withdrawals/cryptoWithdrawalHelpers'
import { fmtUSD } from 'src/views/tools/crypto-purchases/cryptoPurchaseHelpers'
import './CryptoQuery.scss'

const CURRENT_YEAR = new Date().getFullYear()
const pad2 = (n) => String(n).padStart(2, '0')
const lastDayOfMonth = (year, month) => new Date(year, month, 0).getDate()
const fmtDateLong = (date) => (date ? moment(date).format('D [de] MMMM [de] YYYY') : '')
const pairSymbol = (coin) => CRYPTO_PURCHASE_SYMBOLS.find((s) => s.label === coin)?.value

const CryptoWithdrawalsReport = () => {
  const dispatch = useDispatch()
  const activeTenantId = useActiveTenantId()
  const { withdrawals, loading } = useSelector((s) => s.cryptoWithdrawal)
  const { monthLabels } = useLocaleData()

  const coins = useMemo(() => [...new Set(withdrawals.map((w) => w.coin))].sort(), [withdrawals])
  const [coin, setCoin] = useState('all')
  const [dateMode, setDateMode] = useState('range') // 'range' | 'month' | 'year'
  const [rangeFrom, setRangeFrom] = useState('')
  const [rangeTo, setRangeTo] = useState('')
  const [year, setYear] = useState(CURRENT_YEAR)
  const [month, setMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    dispatch(actions.loadRequest())
  }, [dispatch, activeTenantId])

  const years = useMemo(() => {
    const set = new Set(
      withdrawals.map((w) => Number(splitApplyTime(w.applyTime).date.slice(0, 4))).filter(Boolean),
    )
    set.add(CURRENT_YEAR)
    return [...set].sort((a, b) => b - a)
  }, [withdrawals])

  const { dateFrom, dateTo } =
    dateMode === 'month'
      ? {
          dateFrom: `${year}-${pad2(month)}-01`,
          dateTo: `${year}-${pad2(month)}-${pad2(lastDayOfMonth(year, month))}`,
        }
      : dateMode === 'year'
        ? { dateFrom: `${year}-01-01`, dateTo: `${year}-12-31` }
        : { dateFrom: rangeFrom, dateTo: rangeTo }

  const filtered = useMemo(() => {
    return withdrawals
      .filter((w) => coin === 'all' || w.coin === coin)
      .filter((w) => !dateFrom || splitApplyTime(w.applyTime).date >= dateFrom)
      .filter((w) => !dateTo || splitApplyTime(w.applyTime).date <= dateTo)
      .sort((a, b) => (b.applyTime || '').localeCompare(a.applyTime || ''))
  }, [withdrawals, coin, dateFrom, dateTo])

  const totals = useMemo(() => {
    const byCoin = {}
    filtered.forEach((w) => {
      byCoin[w.coin] = (byCoin[w.coin] ?? 0) + (Number(w.amount) || 0)
    })
    return { count: filtered.length, byCoin }
  }, [filtered])

  const { prices: livePrices } = useCryptoPrices()
  const { fetchPrice } = useHistoricalCryptoPrice()
  const historicalPricesRef = useRef({})
  const [, forceRender] = useState(0)

  useEffect(() => {
    const toFetch = []
    filtered.forEach((w) => {
      const symbol = pairSymbol(w.coin)
      const { date } = splitApplyTime(w.applyTime)
      if (!symbol || !date) return
      const key = `${symbol}_${date}`
      if (!(key in historicalPricesRef.current)) {
        historicalPricesRef.current[key] = null
        toFetch.push({ symbol, date, key })
      }
    })
    if (toFetch.length === 0) return
    Promise.all(toFetch.map(({ symbol, date }) => fetchPrice(symbol, date).catch(() => null))).then(
      (results) => {
        toFetch.forEach(({ key }, i) => {
          historicalPricesRef.current[key] = results[i]
        })
        forceRender((n) => n + 1)
      },
    )
  }, [filtered, fetchPrice])

  return (
    <div className="cq">
      <h1 className="cq__title">Reporte de Retiros</h1>
      <p className="cq__subtitle">Filtra los retiros de cripto por rango de fechas y por activo.</p>

      <div className="cq__mode-toggle">
        <button
          type="button"
          className={`cq__mode-btn${dateMode === 'range' ? ' cq__mode-btn--active' : ''}`}
          onClick={() => setDateMode('range')}
        >
          Rango de fechas
        </button>
        <button
          type="button"
          className={`cq__mode-btn${dateMode === 'month' ? ' cq__mode-btn--active' : ''}`}
          onClick={() => setDateMode('month')}
        >
          Año y mes
        </button>
        <button
          type="button"
          className={`cq__mode-btn${dateMode === 'year' ? ' cq__mode-btn--active' : ''}`}
          onClick={() => setDateMode('year')}
        >
          Año
        </button>
      </div>

      <div className="cq__filters">
        <div className="cq__field">
          <label>Activo</label>
          <CFormSelect size="sm" value={coin} onChange={(e) => setCoin(e.target.value)}>
            <option value="all">Todos</option>
            {coins.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </CFormSelect>
        </div>
        {dateMode === 'range' ? (
          <>
            <div className="cq__field">
              <label>Fecha desde</label>
              <input
                type="date"
                className="cq__input"
                value={rangeFrom}
                onChange={(e) => setRangeFrom(e.target.value)}
              />
            </div>
            <div className="cq__field">
              <label>Fecha hasta</label>
              <input
                type="date"
                className="cq__input"
                value={rangeTo}
                onChange={(e) => setRangeTo(e.target.value)}
              />
            </div>
          </>
        ) : dateMode === 'year' ? (
          <div className="cq__field">
            <label>Año</label>
            <CFormSelect size="sm" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </CFormSelect>
          </div>
        ) : (
          <>
            <div className="cq__field">
              <label>Año</label>
              <CFormSelect size="sm" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </CFormSelect>
            </div>
            <div className="cq__field">
              <label>Mes</label>
              <CFormSelect
                size="sm"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {monthLabels.map((label, i) => (
                  <option key={i + 1} value={i + 1}>
                    {label}
                  </option>
                ))}
              </CFormSelect>
            </div>
          </>
        )}
      </div>

      {loading ? (
        <Spinner mode="section" />
      ) : (
        <>
          <div className="cq__kpis">
            {Object.entries(totals.byCoin).map(([c, amount]) => (
              <div className="cq__kpi" key={c}>
                <div className="cq__kpi-label">{c} retirado</div>
                <div className="cq__kpi-value">{fmtAmount(amount, c)}</div>
              </div>
            ))}
          </div>

          <div className="cq__ledger">
            <div className="cq__panel-header">
              <p className="cq__panel-title">{totals.count} retiros</p>
            </div>
            <div className="cq__scroll">
              <table className="cq__table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th className="num">Cantidad</th>
                    <th className="num">Precio en el retiro</th>
                    <th className="num">Valor en el retiro</th>
                    <th className="num">Valor hoy</th>
                    <th>Red</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((w) => {
                    const { date } = splitApplyTime(w.applyTime)
                    const symbol = pairSymbol(w.coin)
                    const historicalPrice = symbol
                      ? historicalPricesRef.current[`${symbol}_${date}`]
                      : null
                    const valueAtWithdrawal =
                      historicalPrice != null ? (Number(w.amount) || 0) * historicalPrice : null
                    const livePrice = symbol ? livePrices[symbol]?.price : null
                    const valueToday =
                      livePrice != null ? (Number(w.amount) || 0) * livePrice : null
                    return (
                      <tr key={w.id}>
                        <td>{fmtDateLong(date)}</td>
                        <td>
                          <span className={`cq__pill cq__pill--${statusVariant(w.status)}`}>
                            <span className="cq__dot" />
                            {statusLabel(w.status)}
                          </span>
                        </td>
                        <td className="num">{fmtAmount(w.amount, w.coin)}</td>
                        <td className="num">
                          {historicalPrice != null ? fmtUSD(historicalPrice) : '—'}
                        </td>
                        <td className="num">
                          {valueAtWithdrawal != null ? fmtUSD(valueAtWithdrawal) : '—'}
                        </td>
                        <td className="num">{valueToday != null ? fmtUSD(valueToday) : '—'}</td>
                        <td>{w.network}</td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="cq__empty">
                        Sin retiros para los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CryptoWithdrawalsReport
