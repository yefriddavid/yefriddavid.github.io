import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CFormSelect } from '@coreui/react'
import Spinner from 'src/components/shared/Spinner'
import EmptyState from 'src/components/shared/EmptyState'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import * as actions from 'src/actions/finance/cryptoPurchaseActions'
import { CRYPTO_PURCHASE_SYMBOLS } from 'src/constants/finance'
import {
  isSale,
  isAdjustment,
  platformLabel,
  fmtUSD,
} from 'src/views/tools/crypto-purchases/cryptoPurchaseHelpers'
import './CryptoPlatforms.scss'

const CURRENT_YEAR = new Date().getFullYear()
const pad2 = (n) => String(n).padStart(2, '0')
const lastDayOfMonth = (year, month) => new Date(year, month, 0).getDate()
const yearOf = (dateStr) => Number((dateStr || '').slice(0, 4)) || null
const toggleInArray = (arr, value) =>
  arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]

const CryptoPlatforms = () => {
  const dispatch = useDispatch()
  const activeTenantId = useActiveTenantId()
  const { purchases, loading } = useSelector((s) => s.cryptoPurchase)

  const [dateMode, setDateMode] = useState('range') // 'range' | 'month' | 'year'
  const [rangeFrom, setRangeFrom] = useState('')
  const [rangeTo, setRangeTo] = useState('')
  const [year, setYear] = useState(CURRENT_YEAR)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [selectedYears, setSelectedYears] = useState([])
  const [selectedSymbols, setSelectedSymbols] = useState([])

  useEffect(() => {
    dispatch(actions.loadRequest())
  }, [dispatch, activeTenantId])

  // The years multiselect is only shown in "year" mode — clear it on the way
  // out so it doesn't keep silently filtering once the field is hidden.
  useEffect(() => {
    if (dateMode !== 'year') setSelectedYears([])
  }, [dateMode])

  const activity = useMemo(() => purchases.filter((p) => !isAdjustment(p)), [purchases])

  const years = useMemo(() => {
    const set = new Set(activity.map((p) => yearOf(p.purchaseDate)).filter(Boolean))
    set.add(CURRENT_YEAR)
    return [...set].sort((a, b) => b - a)
  }, [activity])

  const { dateFrom, dateTo } =
    dateMode === 'month'
      ? {
          dateFrom: `${year}-${pad2(month)}-01`,
          dateTo: `${year}-${pad2(month)}-${pad2(lastDayOfMonth(year, month))}`,
        }
      : dateMode === 'year'
        ? { dateFrom: '', dateTo: '' } // year mode relies on the "Años" multiselect below instead
        : { dateFrom: rangeFrom, dateTo: rangeTo }

  const filtered = useMemo(
    () =>
      activity
        .filter((p) => !dateFrom || (p.purchaseDate || '') >= dateFrom)
        .filter((p) => !dateTo || (p.purchaseDate || '') <= dateTo)
        .filter((p) => selectedYears.length === 0 || selectedYears.includes(yearOf(p.purchaseDate)))
        .filter((p) => selectedSymbols.length === 0 || selectedSymbols.includes(p.symbol)),
    [activity, dateFrom, dateTo, selectedYears, selectedSymbols],
  )

  const byPlatform = useMemo(() => {
    const map = new Map()
    filtered.forEach((p) => {
      const key = p.platform || 'sin_plataforma'
      const row = map.get(key) || {
        platform: key,
        buysUSD: 0,
        buysCount: 0,
        sellsUSD: 0,
        sellsCount: 0,
      }
      const total = (Number(p.quantity) || 0) * (Number(p.purchasePrice) || 0)
      if (isSale(p)) {
        row.sellsUSD += total
        row.sellsCount += 1
      } else {
        row.buysUSD += total
        row.buysCount += 1
      }
      map.set(key, row)
    })
    return [...map.values()].sort((a, b) => b.buysUSD + b.sellsUSD - (a.buysUSD + a.sellsUSD))
  }, [filtered])

  const totals = useMemo(
    () =>
      byPlatform.reduce(
        (acc, r) => {
          acc.buysUSD += r.buysUSD
          acc.buysCount += r.buysCount
          acc.sellsUSD += r.sellsUSD
          acc.sellsCount += r.sellsCount
          return acc
        },
        { buysUSD: 0, buysCount: 0, sellsUSD: 0, sellsCount: 0 },
      ),
    [byPlatform],
  )

  const platformLabelOf = (key) =>
    key === 'sin_plataforma' ? 'Sin plataforma' : platformLabel(key)

  return (
    <div className="cpl">
      <h1 className="cpl__title">Totales por Plataforma</h1>
      <p className="cpl__subtitle">Compras y ventas totales agrupadas por plataforma.</p>

      <div className="cpl__mode-toggle">
        <button
          type="button"
          className={`cpl__mode-btn${dateMode === 'range' ? ' cpl__mode-btn--active' : ''}`}
          onClick={() => setDateMode('range')}
        >
          Rango de fechas
        </button>
        <button
          type="button"
          className={`cpl__mode-btn${dateMode === 'month' ? ' cpl__mode-btn--active' : ''}`}
          onClick={() => setDateMode('month')}
        >
          Año y mes
        </button>
        <button
          type="button"
          className={`cpl__mode-btn${dateMode === 'year' ? ' cpl__mode-btn--active' : ''}`}
          onClick={() => setDateMode('year')}
        >
          Año
        </button>
      </div>

      <div className="cpl__filters">
        {dateMode === 'range' ? (
          <>
            <div className="cpl__field">
              <label>Fecha desde</label>
              <input
                type="date"
                className="cpl__input"
                value={rangeFrom}
                onChange={(e) => setRangeFrom(e.target.value)}
              />
            </div>
            <div className="cpl__field">
              <label>Fecha hasta</label>
              <input
                type="date"
                className="cpl__input"
                value={rangeTo}
                onChange={(e) => setRangeTo(e.target.value)}
              />
            </div>
          </>
        ) : dateMode === 'year' ? null : (
          <>
            <div className="cpl__field">
              <label>Año</label>
              <CFormSelect size="sm" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </CFormSelect>
            </div>
            <div className="cpl__field">
              <label>Mes</label>
              <CFormSelect
                size="sm"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {pad2(m)}
                  </option>
                ))}
              </CFormSelect>
            </div>
          </>
        )}

        {dateMode === 'year' && (
          <div className="cpl__field">
            <label>Años (multiselección)</label>
            <CFormSelect
              size="sm"
              multiple
              className="cpl__years-select"
              value={selectedYears}
              onChange={(e) =>
                setSelectedYears(Array.from(e.target.selectedOptions, (o) => Number(o.value)))
              }
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </CFormSelect>
          </div>
        )}
      </div>

      <div className="cpl__filters">
        <button
          type="button"
          className={`cpl__chip${selectedSymbols.length === 0 ? ' cpl__chip--active' : ''}`}
          onClick={() => setSelectedSymbols([])}
        >
          Todos
        </button>
        {CRYPTO_PURCHASE_SYMBOLS.map((s) => (
          <button
            type="button"
            key={s.value}
            className={`cpl__chip${selectedSymbols.includes(s.value) ? ' cpl__chip--active' : ''}`}
            onClick={() => setSelectedSymbols((prev) => toggleInArray(prev, s.value))}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner mode="section" />
      ) : byPlatform.length === 0 ? (
        <EmptyState message="Sin operaciones para los filtros seleccionados." />
      ) : (
        <div className="cpl__scroll">
          <table className="cpl__table">
            <thead>
              <tr>
                <th>Plataforma</th>
                <th className="num">Compras (USD)</th>
                <th className="num">#</th>
                <th className="num">Ventas (USD)</th>
                <th className="num">#</th>
                <th className="num">Neto</th>
              </tr>
            </thead>
            <tbody>
              {byPlatform.map((r) => {
                const net = r.sellsUSD - r.buysUSD
                return (
                  <tr key={r.platform}>
                    <td>{platformLabelOf(r.platform)}</td>
                    <td className="num">{fmtUSD(r.buysUSD)}</td>
                    <td className="num">{r.buysCount}</td>
                    <td className="num">{fmtUSD(r.sellsUSD)}</td>
                    <td className="num">{r.sellsCount}</td>
                    <td
                      className={`num${net >= 0 ? ' cpl__amount--positive' : ' cpl__amount--negative'}`}
                    >
                      {fmtUSD(net)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="cpl__total-row">
                <td>Total</td>
                <td className="num">{fmtUSD(totals.buysUSD)}</td>
                <td className="num">{totals.buysCount}</td>
                <td className="num">{fmtUSD(totals.sellsUSD)}</td>
                <td className="num">{totals.sellsCount}</td>
                <td className="num">{fmtUSD(totals.sellsUSD - totals.buysUSD)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

export default CryptoPlatforms
