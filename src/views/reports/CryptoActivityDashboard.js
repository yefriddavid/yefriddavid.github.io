import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CFormSelect } from '@coreui/react'
import Spinner from 'src/components/shared/Spinner'
import EmptyState from 'src/components/shared/EmptyState'
import AppModal from 'src/components/shared/AppModal'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import useLocaleData from 'src/hooks/useLocaleData'
import { useCryptoPrices } from 'src/views/Finance/trade/Prices/useCryptoPrices'
import * as actions from 'src/actions/finance/cryptoPurchaseActions'
import { CRYPTO_PURCHASE_SYMBOLS, CRYPTO_PURCHASE_SYMBOL_COLORS } from 'src/constants/finance'
import {
  isSale,
  isAdjustment,
  symbolLabel,
  fmtUSD,
} from 'src/views/tools/crypto-purchases/cryptoPurchaseHelpers'
import './CryptoActivityDashboard.scss'

const BAR_MAX_PX = 130
const CURRENT_YEAR = new Date().getFullYear()

const monthKey = (dateStr) => (dateStr || '').slice(0, 7)
const yearOf = (dateStr) => Number((dateStr || '').slice(0, 4)) || null

const CryptoActivityDashboard = () => {
  const dispatch = useDispatch()
  const activeTenantId = useActiveTenantId()
  const { purchases, loading } = useSelector((s) => s.cryptoPurchase)
  const { monthLabels } = useLocaleData()
  const { prices } = useCryptoPrices()
  const [year, setYear] = useState(CURRENT_YEAR)
  const [barFilter, setBarFilter] = useState(null) // { month: 'YYYY-MM', type: 'buy' | 'sell' }
  const [symbolFilter, setSymbolFilter] = useState('all')
  const [coinMonthModal, setCoinMonthModal] = useState(null) // { month: 'YYYY-MM', symbol, label }

  useEffect(() => {
    dispatch(actions.loadRequest())
  }, [dispatch, activeTenantId])

  // Balance adjustments aren't real trading activity — they'd distort counts
  // and volumes here, so this dashboard only looks at genuine buy/sell records.
  const allActivity = useMemo(() => purchases.filter((p) => !isAdjustment(p)), [purchases])

  const years = useMemo(() => {
    const set = new Set(allActivity.map((p) => yearOf(p.purchaseDate)).filter(Boolean))
    return [...set].sort((a, b) => b - a)
  }, [allActivity])

  useEffect(() => {
    if (years.length > 0 && !years.includes(year)) setYear(years[0])
  }, [years, year])

  const activity = useMemo(
    () => allActivity.filter((p) => yearOf(p.purchaseDate) === year),
    [allActivity, year],
  )

  const handleYearChange = (e) => {
    setYear(Number(e.target.value))
    setBarFilter(null)
  }
  const buys = useMemo(() => activity.filter((p) => !isSale(p)), [activity])
  const sells = useMemo(() => activity.filter((p) => isSale(p)), [activity])

  const totals = useMemo(() => {
    const invested = buys.reduce(
      (s, p) => s + (Number(p.quantity) || 0) * (Number(p.purchasePrice) || 0),
      0,
    )
    const proceeds = sells.reduce(
      (s, p) => s + (Number(p.quantity) || 0) * (Number(p.purchasePrice) || 0),
      0,
    )
    const thisMonth = monthKey(new Date().toISOString())
    const buysThisMonth = buys.filter((p) => monthKey(p.purchaseDate) === thisMonth).length
    const sellsThisMonth = sells.filter((p) => monthKey(p.purchaseDate) === thisMonth).length
    const ratio = sells.length > 0 ? buys.length / sells.length : null

    const dates = activity
      .map((p) => p.purchaseDate)
      .filter(Boolean)
      .sort()
    let streakLabel = '—'
    if (dates.length > 0) {
      const first = new Date(dates[0])
      const last = new Date(dates[dates.length - 1])
      const months =
        (last.getFullYear() - first.getFullYear()) * 12 + (last.getMonth() - first.getMonth()) + 1
      streakLabel = `${months} meses`
    }

    return {
      investedCount: buys.length,
      invested,
      proceedsCount: sells.length,
      proceeds,
      buysThisMonth,
      sellsThisMonth,
      ratio,
      streakLabel,
      rangeLabel:
        dates.length > 0 ? `${dates[0].slice(0, 7)} → ${dates[dates.length - 1].slice(0, 7)}` : '',
    }
  }, [activity, buys, sells])

  const monthly = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`)
    const rows = months.map((m) => ({
      month: m,
      label: monthLabels[Number(m.slice(5, 7)) - 1]?.slice(0, 3) ?? m,
      buys: buys.filter((p) => monthKey(p.purchaseDate) === m).length,
      sells: sells.filter((p) => monthKey(p.purchaseDate) === m).length,
    }))
    const max = Math.max(1, ...rows.flatMap((r) => [r.buys, r.sells]))
    return { rows, max }
  }, [buys, sells, monthLabels, year])

  const byCoin = useMemo(() => {
    const rows = CRYPTO_PURCHASE_SYMBOLS.map((s) => {
      const invested = buys
        .filter((p) => p.symbol === s.value)
        .reduce((sum, p) => sum + (Number(p.quantity) || 0) * (Number(p.purchasePrice) || 0), 0)
      return { symbol: s.value, label: s.label, invested }
    }).filter((r) => r.invested > 0)
    const max = Math.max(1, ...rows.map((r) => r.invested))
    return { rows: rows.sort((a, b) => b.invested - a.invested), max }
  }, [buys])

  // Total compras/ventas por mes y por moneda — independiente de los filtros
  // del ledger (barra/chip), siempre sobre el año seleccionado.
  const monthlyByCoin = useMemo(() => {
    const groups = {}
    activity.forEach((p) => {
      const month = monthKey(p.purchaseDate)
      if (!month) return
      const key = `${month}|${p.symbol}`
      if (!groups[key]) groups[key] = { month, symbol: p.symbol, buys: 0, sells: 0 }
      const value = (Number(p.quantity) || 0) * (Number(p.purchasePrice) || 0)
      if (isSale(p)) groups[key].sells += value
      else groups[key].buys += value
    })
    const sorted = Object.values(groups)
      .map((g) => ({ ...g, label: symbolLabel(g.symbol) }))
      .sort((a, b) => b.month.localeCompare(a.month) || a.label.localeCompare(b.label))

    // Total invertido de TODAS las monedas ese mes (no solo la fila/moneda actual).
    const monthTotals = {}
    sorted.forEach((g) => {
      monthTotals[g.month] = (monthTotals[g.month] ?? 0) + g.buys
    })

    // Mark the first row of each month group with how many rows it spans, so
    // the table can merge the "Mes" cell instead of repeating it per coin.
    return sorted.map((g, i) => ({
      ...g,
      monthRowSpan:
        sorted[i - 1]?.month === g.month ? 0 : sorted.filter((r) => r.month === g.month).length,
      monthTotalInvested: monthTotals[g.month],
      isLastOfMonth: sorted[i + 1]?.month !== g.month,
    }))
  }, [activity])

  const recent = useMemo(() => {
    let base = activity
    if (barFilter) {
      base = base.filter(
        (p) =>
          monthKey(p.purchaseDate) === barFilter.month && isSale(p) === (barFilter.type === 'sell'),
      )
    }
    if (symbolFilter !== 'all') {
      base = base.filter((p) => p.symbol === symbolFilter)
    }
    const sorted = [...base].sort((a, b) =>
      (b.purchaseDate || '').localeCompare(a.purchaseDate || ''),
    )
    return barFilter || symbolFilter !== 'all' ? sorted : sorted.slice(0, 10)
  }, [activity, barFilter, symbolFilter])

  // Unrealized gain/loss per purchase vs the live price — only meaningful for
  // buys (a sell already realized its own price, no FIFO cost basis to compare against).
  const gainLossFor = (p) => {
    if (isSale(p)) return null
    const livePrice = prices[p.symbol]?.price
    if (livePrice == null) return null
    return (livePrice - (Number(p.purchasePrice) || 0)) * (Number(p.quantity) || 0)
  }

  const recentTotals = useMemo(
    () =>
      recent.reduce(
        (acc, p) => {
          const qty = Number(p.quantity) || 0
          const price = Number(p.purchasePrice) || 0
          const gainLoss = gainLossFor(p)
          acc.count += 1
          acc.quantity += qty
          acc.value += qty * price
          if (gainLoss != null) acc.gainLoss += gainLoss
          return acc
        },
        { count: 0, quantity: 0, value: 0, gainLoss: 0 },
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recent, prices],
  )

  const monthlyByCoinTotals = useMemo(
    () =>
      monthlyByCoin.reduce(
        (acc, g) => {
          acc.buys += g.buys
          acc.sells += g.sells
          return acc
        },
        { buys: 0, sells: 0 },
      ),
    [monthlyByCoin],
  )

  const coinMonthRecords = useMemo(() => {
    if (!coinMonthModal) return []
    return [...activity]
      .filter(
        (p) =>
          monthKey(p.purchaseDate) === coinMonthModal.month && p.symbol === coinMonthModal.symbol,
      )
      .sort((a, b) => (b.purchaseDate || '').localeCompare(a.purchaseDate || ''))
  }, [activity, coinMonthModal])

  if (loading) return <Spinner mode="section" />
  if (activity.length === 0)
    return <EmptyState message="Sin compras o ventas registradas para mostrar actividad." />

  return (
    <div className="cad">
      <div className="cad__head">
        <h1 className="cad__title">Compras y Ventas</h1>
        <CFormSelect
          size="sm"
          className="cad__year-select"
          value={year}
          onChange={handleYearChange}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </CFormSelect>
      </div>
      <p className="cad__subtitle">Actividad de trading — {totals.rangeLabel}</p>

      <div className="cad__kpis">
        <div className="cad__kpi cad__kpi--buy">
          <div className="cad__kpi-label">Compras</div>
          <div className="cad__kpi-value">{totals.investedCount}</div>
          <div className="cad__kpi-sub">{fmtUSD(totals.invested)} invertidos</div>
        </div>
        <div className="cad__kpi cad__kpi--sell">
          <div className="cad__kpi-label">Ventas</div>
          <div className="cad__kpi-value">{totals.proceedsCount}</div>
          <div className="cad__kpi-sub">{fmtUSD(totals.proceeds)} recibidos</div>
        </div>
        <div className="cad__kpi">
          <div className="cad__kpi-label">Este mes</div>
          <div className="cad__kpi-value">{totals.buysThisMonth + totals.sellsThisMonth}</div>
          <div className="cad__kpi-sub">
            <span className="cad__pill cad__pill--buy">
              <span className="cad__dot" />
              {totals.buysThisMonth}
            </span>{' '}
            <span className="cad__pill cad__pill--sell">
              <span className="cad__dot" />
              {totals.sellsThisMonth}
            </span>
          </div>
        </div>
        <div className="cad__kpi">
          <div className="cad__kpi-label">Ratio compra / venta</div>
          <div className="cad__kpi-value">
            {totals.ratio != null ? `${totals.ratio.toFixed(1)} : 1` : '—'}
          </div>
          <div className="cad__kpi-sub">
            {totals.investedCount} compras por {totals.proceedsCount} ventas
          </div>
        </div>
        <div className="cad__kpi">
          <div className="cad__kpi-label">Racha activa</div>
          <div className="cad__kpi-value">{totals.streakLabel}</div>
          <div className="cad__kpi-sub">{totals.rangeLabel}</div>
        </div>
      </div>

      <div className="cad__grid">
        <div className="cad__panel">
          <p className="cad__panel-title">Actividad mensual</p>
          <p className="cad__panel-hint">Número de operaciones por mes, {year}</p>
          <div className="cad__scroll">
            <div className="cad__months">
              {monthly.rows.map((r) => (
                <div className="cad__month" key={r.month}>
                  <div className="cad__month-bars">
                    <div
                      className={`cad__bar cad__bar--buy${barFilter?.month === r.month && barFilter?.type === 'buy' ? ' cad__bar--active' : ''}`}
                      style={{ height: `${(r.buys / monthly.max) * BAR_MAX_PX}px` }}
                      title={`Compras ${r.month}: ${r.buys}`}
                      onClick={() => r.buys > 0 && setBarFilter({ month: r.month, type: 'buy' })}
                    />
                    <div
                      className={`cad__bar cad__bar--sell${barFilter?.month === r.month && barFilter?.type === 'sell' ? ' cad__bar--active' : ''}`}
                      style={{ height: `${(r.sells / monthly.max) * BAR_MAX_PX}px` }}
                      title={`Ventas ${r.month}: ${r.sells}`}
                      onClick={() => r.sells > 0 && setBarFilter({ month: r.month, type: 'sell' })}
                    />
                  </div>
                  <div className="cad__month-label">{r.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="cad__legend">
            <span>
              <i style={{ background: 'var(--cad-buy)' }} />
              Compras
            </span>
            <span>
              <i style={{ background: 'var(--cad-sell)' }} />
              Ventas
            </span>
          </div>
        </div>

        <div className="cad__panel">
          <p className="cad__panel-title">Volumen comprado por moneda</p>
          <p className="cad__panel-hint">USD invertido en {year}</p>
          {byCoin.rows.map((r) => (
            <div className="cad__coin-row" key={r.symbol}>
              <div className="cad__coin-name">{r.label}</div>
              <div className="cad__coin-track">
                <div
                  className="cad__coin-fill"
                  style={{
                    width: `${(r.invested / byCoin.max) * 100}%`,
                    background: CRYPTO_PURCHASE_SYMBOL_COLORS[r.symbol],
                  }}
                />
              </div>
              <div className="cad__coin-value">{fmtUSD(r.invested)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="cad__ledger">
        <div className="cad__ledger-head">
          <p className="cad__panel-title">
            {barFilter
              ? `${barFilter.type === 'sell' ? 'Ventas' : 'Compras'} — ${monthLabels[Number(barFilter.month.slice(5, 7)) - 1]} ${barFilter.month.slice(0, 4)}`
              : 'Últimas operaciones'}
          </p>
          {barFilter && (
            <button type="button" className="cad__clear-filter" onClick={() => setBarFilter(null)}>
              ✕ Quitar filtro
            </button>
          )}
        </div>
        <div className="cad__coin-filters">
          <button
            type="button"
            className={`cad__coin-chip${symbolFilter === 'all' ? ' cad__coin-chip--active' : ''}`}
            onClick={() => setSymbolFilter('all')}
          >
            Todas
          </button>
          {CRYPTO_PURCHASE_SYMBOLS.map((s) => (
            <button
              key={s.value}
              type="button"
              className={`cad__coin-chip${symbolFilter === s.value ? ' cad__coin-chip--active' : ''}`}
              style={
                symbolFilter === s.value
                  ? { background: CRYPTO_PURCHASE_SYMBOL_COLORS[s.value] }
                  : undefined
              }
              onClick={() => setSymbolFilter(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="cad__scroll">
          <table className="cad__table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Moneda</th>
                <th>Tipo</th>
                <th className="num">Cantidad</th>
                <th className="num">Precio</th>
                <th className="num">Total</th>
                <th className="num">Ganancia / Pérdida</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((p) => {
                const total = (Number(p.quantity) || 0) * (Number(p.purchasePrice) || 0)
                const gainLoss = gainLossFor(p)
                return (
                  <tr key={p.id}>
                    <td>{p.purchaseDate}</td>
                    <td>
                      <span className="cad__sym">
                        <i style={{ background: CRYPTO_PURCHASE_SYMBOL_COLORS[p.symbol] }} />
                        {symbolLabel(p.symbol)}
                      </span>
                    </td>
                    <td>
                      {isSale(p) ? (
                        <span className="cad__pill cad__pill--sell">
                          <span className="cad__dot" />
                          Venta
                        </span>
                      ) : (
                        <span className="cad__pill cad__pill--buy">
                          <span className="cad__dot" />
                          Compra
                        </span>
                      )}
                    </td>
                    <td className="num">{p.quantity}</td>
                    <td className="num">{fmtUSD(p.purchasePrice)}</td>
                    <td className="num">{fmtUSD(total)}</td>
                    <td className="num">
                      {gainLoss == null ? (
                        <span className="cad__muted">—</span>
                      ) : (
                        <span
                          className={`cad__amount${gainLoss >= 0 ? ' cad__amount--positive' : ' cad__amount--negative'}`}
                        >
                          {gainLoss >= 0 ? '+' : ''}
                          {fmtUSD(gainLoss)}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="cad__total-row">
                <td colSpan={3}>Total ({recentTotals.count})</td>
                <td className="num">{recentTotals.quantity.toFixed(8)}</td>
                <td className="num">—</td>
                <td className="num">{fmtUSD(recentTotals.value)}</td>
                <td className="num">
                  <span
                    className={`cad__amount${recentTotals.gainLoss >= 0 ? ' cad__amount--positive' : ' cad__amount--negative'}`}
                  >
                    {recentTotals.gainLoss >= 0 ? '+' : ''}
                    {fmtUSD(recentTotals.gainLoss)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="cad__ledger">
        <p className="cad__panel-title">Total por mes y moneda</p>
        <p className="cad__panel-hint">Valor de compras y ventas, {year}</p>
        <div className="cad__scroll">
          <table className="cad__table">
            <thead>
              <tr>
                <th>Mes</th>
                <th className="num">Invertido total</th>
                <th>Moneda</th>
                <th className="num">Compras (USD)</th>
                <th className="num">Ventas (USD)</th>
                <th className="num">Neto (Ventas − Compras)</th>
              </tr>
            </thead>
            <tbody>
              {monthlyByCoin.map((g) => {
                const net = g.sells - g.buys
                return (
                  <tr
                    key={`${g.month}-${g.symbol}`}
                    className={g.isLastOfMonth ? 'cad__row--month-end' : undefined}
                  >
                    {g.monthRowSpan > 0 && (
                      <>
                        <td
                          rowSpan={g.monthRowSpan}
                          className="cad__month-cell cad__month-cell--middle"
                        >
                          {monthLabels[Number(g.month.slice(5, 7)) - 1]} {g.month.slice(0, 4)}
                        </td>
                        <td
                          rowSpan={g.monthRowSpan}
                          className="cad__month-cell cad__month-cell--middle num"
                        >
                          {fmtUSD(g.monthTotalInvested)}
                        </td>
                      </>
                    )}
                    <td
                      className="cad__coin-link"
                      onClick={() =>
                        setCoinMonthModal({ month: g.month, symbol: g.symbol, label: g.label })
                      }
                    >
                      <span className="cad__sym">
                        <i style={{ background: CRYPTO_PURCHASE_SYMBOL_COLORS[g.symbol] }} />
                        {g.label}
                      </span>
                    </td>
                    <td className="num">
                      {g.buys > 0 ? fmtUSD(g.buys) : <span className="cad__muted">—</span>}
                    </td>
                    <td className="num">
                      {g.sells > 0 ? fmtUSD(g.sells) : <span className="cad__muted">—</span>}
                    </td>
                    <td className="num">
                      <span className="cad__amount cad__amount--neutral">
                        {fmtUSD(Math.abs(net))}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="cad__total-row">
                <td colSpan={3}>Total ({year})</td>
                <td className="num">{fmtUSD(monthlyByCoinTotals.buys)}</td>
                <td className="num">{fmtUSD(monthlyByCoinTotals.sells)}</td>
                <td className="num">
                  <span className="cad__amount cad__amount--neutral">
                    {fmtUSD(Math.abs(monthlyByCoinTotals.sells - monthlyByCoinTotals.buys))}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {coinMonthModal && (
        <AppModal
          visible
          onClose={() => setCoinMonthModal(null)}
          variant="center"
          size="md"
          title={`${coinMonthModal.label} — ${monthLabels[Number(coinMonthModal.month.slice(5, 7)) - 1]} ${coinMonthModal.month.slice(0, 4)}`}
        >
          <div className="cad__scroll">
            <table className="cad__table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th className="num">Cantidad</th>
                  <th className="num">Precio</th>
                  <th className="num">Total</th>
                </tr>
              </thead>
              <tbody>
                {coinMonthRecords.map((p) => {
                  const total = (Number(p.quantity) || 0) * (Number(p.purchasePrice) || 0)
                  return (
                    <tr key={p.id}>
                      <td>{p.purchaseDate}</td>
                      <td>
                        {isSale(p) ? (
                          <span className="cad__pill cad__pill--sell">
                            <span className="cad__dot" />
                            Venta
                          </span>
                        ) : (
                          <span className="cad__pill cad__pill--buy">
                            <span className="cad__dot" />
                            Compra
                          </span>
                        )}
                      </td>
                      <td className="num">{p.quantity}</td>
                      <td className="num">{fmtUSD(p.purchasePrice)}</td>
                      <td className="num">{fmtUSD(total)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </AppModal>
      )}
    </div>
  )
}

export default CryptoActivityDashboard
