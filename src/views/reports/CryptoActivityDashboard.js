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
  fmtQty,
} from 'src/views/tools/crypto-purchases/cryptoPurchaseHelpers'
import './CryptoActivityDashboard.scss'

const BAR_MAX_PX = 130
const PRICE_BAR_MAX_PX = 260
const CURRENT_YEAR = new Date().getFullYear()
const BTC_SYMBOL = 'BTCUSDT'
const PRICE_BUCKET_SIZE = 10000
const PRICE_BUCKET_MAX = 120000 // buckets cover 0-120k; anything higher lands in an overflow bucket

const monthKey = (dateStr) => (dateStr || '').slice(0, 7)
const yearOf = (dateStr) => Number((dateStr || '').slice(0, 4)) || null
const bucketShortLabel = (r) =>
  r.to != null ? `${r.from / 1000}k-${r.to / 1000}k` : `${r.from / 1000}k+`
const bucketFullLabel = (r) =>
  r.to != null
    ? `$${r.from.toLocaleString()}–$${r.to.toLocaleString()}`
    : `$${r.from.toLocaleString()}+`
const qtyLabel = (qty, symbol) => `${qty.toFixed(4)} ${symbolLabel(symbol)}`

const CryptoActivityDashboard = () => {
  const dispatch = useDispatch()
  const activeTenantId = useActiveTenantId()
  const { purchases, loading } = useSelector((s) => s.cryptoPurchase)
  const { monthLabels } = useLocaleData()
  const { prices } = useCryptoPrices()
  const [year, setYear] = useState(CURRENT_YEAR)
  const [monthlyAssetFilter, setMonthlyAssetFilter] = useState(BTC_SYMBOL)
  const [priceAssetFilter, setPriceAssetFilter] = useState(BTC_SYMBOL)
  const [equilibriumAssetFilter, setEquilibriumAssetFilter] = useState(BTC_SYMBOL)
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

  // Buys and sells of the selected asset for the selected year, bucketed by
  // purchase price in $10k steps (0-10k, 10k-20k, ... 110k-120k), plus a
  // 120k+ overflow bucket. The $10k step is sized for BTC-range prices — for
  // cheaper assets (ETH, LINK, SOL, BNB) most activity will land in the
  // first bucket or two.
  const priceBuckets = useMemo(() => {
    const bucketCount = PRICE_BUCKET_MAX / PRICE_BUCKET_SIZE
    const buckets = Array.from({ length: bucketCount }, (_, i) => ({
      from: i * PRICE_BUCKET_SIZE,
      to: (i + 1) * PRICE_BUCKET_SIZE,
      buyQty: 0,
      buyInvested: 0,
      sellQty: 0,
      sellProceeds: 0,
    }))
    const overflow = {
      from: PRICE_BUCKET_MAX,
      to: null,
      buyQty: 0,
      buyInvested: 0,
      sellQty: 0,
      sellProceeds: 0,
    }

    activity
      .filter((p) => p.symbol === priceAssetFilter)
      .forEach((p) => {
        const price = Number(p.purchasePrice) || 0
        const qty = Number(p.quantity) || 0
        const bucket =
          price >= PRICE_BUCKET_MAX ? overflow : buckets[Math.floor(price / PRICE_BUCKET_SIZE)]
        if (!bucket) return
        if (isSale(p)) {
          bucket.sellQty += qty
          bucket.sellProceeds += qty * price
        } else {
          bucket.buyQty += qty
          bucket.buyInvested += qty * price
        }
      })

    const rows = [...buckets, overflow]
    // Quantities are fractional (often well under 1) — clamping the floor to
    // 1 like the monthly counts chart does would make every bar's ratio
    // tiny. Only fall back to 1 when everything is 0.
    const max = Math.max(...rows.flatMap((r) => [r.buyQty, r.sellQty])) || 1
    return { rows, max }
  }, [activity, priceAssetFilter])

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

  // Break-even price for the selected asset, scoped to the selected year:
  // the price at which the net quantity still held (buys minus sells) would
  // be worth exactly the net cash put in (buys cost minus sell proceeds) —
  // i.e. gain/loss == 0. Only meaningful when there's a net position left.
  const equilibrium = useMemo(() => {
    let netInvested = 0
    let netQty = 0
    activity
      .filter((p) => p.symbol === equilibriumAssetFilter)
      .forEach((p) => {
        const qty = Number(p.quantity) || 0
        const price = Number(p.purchasePrice) || 0
        const sign = isSale(p) ? -1 : 1
        netInvested += sign * qty * price
        netQty += sign * qty
      })
    const price = netQty > 0 ? netInvested / netQty : null
    const livePrice = prices[equilibriumAssetFilter]?.price ?? null
    return { price, netQty, livePrice }
  }, [activity, equilibriumAssetFilter, prices])

  const monthly = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`)
    const investedOf = (list) =>
      list.reduce((s, p) => s + (Number(p.quantity) || 0) * (Number(p.purchasePrice) || 0), 0)
    const qtyOf = (list) => list.reduce((s, p) => s + (Number(p.quantity) || 0), 0)
    // Counts (bar height) stay across all coins, but the USD/quantity labels
    // only make sense for one asset at a time — mixing BTC + ETH + LINK
    // quantities into a single number would be meaningless.
    const assetBuys = buys.filter((p) => p.symbol === monthlyAssetFilter)
    const assetSells = sells.filter((p) => p.symbol === monthlyAssetFilter)
    const rows = months.map((m) => {
      const monthBuys = buys.filter((p) => monthKey(p.purchaseDate) === m)
      const monthSells = sells.filter((p) => monthKey(p.purchaseDate) === m)
      const monthAssetBuys = assetBuys.filter((p) => monthKey(p.purchaseDate) === m)
      const monthAssetSells = assetSells.filter((p) => monthKey(p.purchaseDate) === m)
      return {
        month: m,
        label: monthLabels[Number(m.slice(5, 7)) - 1]?.slice(0, 3) ?? m,
        buys: monthBuys.length,
        sells: monthSells.length,
        buysQty: qtyOf(monthAssetBuys),
        sellsQty: qtyOf(monthAssetSells),
        buysInvested: investedOf(monthAssetBuys),
        sellsProceeds: investedOf(monthAssetSells),
      }
    })
    const max = Math.max(1, ...rows.flatMap((r) => [r.buys, r.sells]))
    return { rows, max }
  }, [buys, sells, monthLabels, year, monthlyAssetFilter])

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

  // Total gain/loss per coin for the selected year: net cash flow (buys cost
  // minus sell proceeds) compared against the current value of whatever
  // quantity is still held, valued at the live price. Sales reduce net
  // invested and net quantity, so a coin that was fully sold off nets out to
  // its realized result instead of showing a phantom unrealized position.
  const gainLossByCoin = useMemo(() => {
    const rows = CRYPTO_PURCHASE_SYMBOLS.map((s) => {
      let netInvested = 0
      let netQty = 0
      let hasActivity = false
      activity
        .filter((p) => p.symbol === s.value)
        .forEach((p) => {
          hasActivity = true
          const qty = Number(p.quantity) || 0
          const price = Number(p.purchasePrice) || 0
          const sign = isSale(p) ? -1 : 1
          netInvested += sign * qty * price
          netQty += sign * qty
        })
      const livePrice = prices[s.value]?.price ?? null
      const gainLoss = livePrice != null ? netQty * livePrice - netInvested : null
      return { symbol: s.value, label: s.label, gainLoss, hasActivity }
    }).filter((r) => r.hasActivity)
    const max = Math.max(1, ...rows.map((r) => Math.abs(r.gainLoss ?? 0)))
    return {
      rows: rows.sort((a, b) => Math.abs(b.gainLoss ?? 0) - Math.abs(a.gainLoss ?? 0)),
      max,
    }
  }, [activity, prices])

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
        <div className="cad__kpi">
          <div className="cad__kpi-label-row">
            <div className="cad__kpi-label">Precio de equilibrio</div>
            <CFormSelect
              size="sm"
              className="cad__kpi-select"
              value={equilibriumAssetFilter}
              onChange={(e) => setEquilibriumAssetFilter(e.target.value)}
            >
              {CRYPTO_PURCHASE_SYMBOLS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </CFormSelect>
          </div>
          <div className="cad__kpi-value">
            {equilibrium.price != null ? fmtUSD(equilibrium.price) : '—'}
          </div>
          <div className="cad__kpi-sub">
            {equilibrium.netQty > 0
              ? `${qtyLabel(equilibrium.netQty, equilibriumAssetFilter)} en posición`
              : 'Sin posición neta este año'}
          </div>
          {equilibrium.price != null && equilibrium.livePrice != null && (
            <div
              className={`cad__kpi-sub cad__price-value-gl${equilibrium.livePrice >= equilibrium.price ? ' cad__price-value-gl--gain' : ' cad__price-value-gl--loss'}`}
            >
              {equilibrium.livePrice >= equilibrium.price
                ? 'Ya por encima del equilibrio'
                : `Falta ${fmtUSD(equilibrium.price - equilibrium.livePrice)} para equilibrio`}
            </div>
          )}
        </div>
      </div>

      <div className="cad__grid">
        <div className="cad__panel">
          <div className="cad__panel-head">
            <div>
              <p className="cad__panel-title">Actividad mensual</p>
              <p className="cad__panel-hint">Número de operaciones por mes, {year}</p>
            </div>
            <CFormSelect
              size="sm"
              className="cad__panel-select"
              value={monthlyAssetFilter}
              onChange={(e) => setMonthlyAssetFilter(e.target.value)}
            >
              {CRYPTO_PURCHASE_SYMBOLS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </CFormSelect>
          </div>
          <div className="cad__scroll">
            <div className="cad__months">
              {monthly.rows.map((r) => {
                const livePrice = prices[monthlyAssetFilter]?.price ?? null
                const buyGainLoss =
                  r.buysQty > 0 && livePrice != null ? livePrice * r.buysQty - r.buysInvested : null
                return (
                  <div className="cad__month" key={r.month}>
                    <div className="cad__month-bars">
                      <div className="cad__price-bar-group">
                        {r.buys > 0 && (
                          <div className="cad__price-values">
                            <span className="cad__price-value-usd">{fmtUSD(r.buysInvested)}</span>
                            <span className="cad__price-value-qty">
                              {qtyLabel(r.buysQty, monthlyAssetFilter)}
                            </span>
                            {buyGainLoss != null && (
                              <span
                                className={`cad__price-value-gl${buyGainLoss >= 0 ? ' cad__price-value-gl--gain' : ' cad__price-value-gl--loss'}`}
                              >
                                {buyGainLoss >= 0 ? '+' : ''}
                                {fmtUSD(buyGainLoss)}
                              </span>
                            )}
                          </div>
                        )}
                        <div
                          className={`cad__bar cad__bar--buy${barFilter?.month === r.month && barFilter?.type === 'buy' ? ' cad__bar--active' : ''}`}
                          style={{ height: `${(r.buys / monthly.max) * BAR_MAX_PX}px` }}
                          title={`Compras ${r.month}: ${r.buys}`}
                          onClick={() =>
                            r.buys > 0 && setBarFilter({ month: r.month, type: 'buy' })
                          }
                        />
                      </div>
                      <div className="cad__price-bar-group">
                        {r.sells > 0 && (
                          <div className="cad__price-values">
                            <span className="cad__price-value-usd">{fmtUSD(r.sellsProceeds)}</span>
                            <span className="cad__price-value-qty">
                              {qtyLabel(r.sellsQty, monthlyAssetFilter)}
                            </span>
                          </div>
                        )}
                        <div
                          className={`cad__bar cad__bar--sell${barFilter?.month === r.month && barFilter?.type === 'sell' ? ' cad__bar--active' : ''}`}
                          style={{ height: `${(r.sells / monthly.max) * BAR_MAX_PX}px` }}
                          title={`Ventas ${r.month}: ${r.sells}`}
                          onClick={() =>
                            r.sells > 0 && setBarFilter({ month: r.month, type: 'sell' })
                          }
                        />
                      </div>
                    </div>
                    <div className="cad__month-label">{r.label}</div>
                  </div>
                )
              })}
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

      <div className="cad__panel">
        <p className="cad__panel-title">Ganancias y pérdidas por moneda</p>
        <p className="cad__panel-hint">
          Ganancia/pérdida total (compras y ventas) vs. precio en vivo, {year}
        </p>
        {gainLossByCoin.rows.map((r) => (
          <div className="cad__coin-row" key={r.symbol}>
            <div className="cad__coin-name">{r.label}</div>
            <div className="cad__coin-track">
              {r.gainLoss != null && (
                <div
                  className="cad__coin-fill"
                  style={{
                    width: `${(Math.abs(r.gainLoss) / gainLossByCoin.max) * 100}%`,
                    background: r.gainLoss >= 0 ? 'var(--cad-gain)' : 'var(--cad-loss)',
                  }}
                />
              )}
            </div>
            <div
              className="cad__coin-value"
              style={{
                color:
                  r.gainLoss == null
                    ? undefined
                    : r.gainLoss >= 0
                      ? 'var(--cad-gain)'
                      : 'var(--cad-loss)',
              }}
            >
              {r.gainLoss == null ? '—' : `${r.gainLoss >= 0 ? '+' : ''}${fmtUSD(r.gainLoss)}`}
            </div>
          </div>
        ))}
      </div>

      <div className="cad__panel">
        <div className="cad__panel-head">
          <div>
            <p className="cad__panel-title">
              Compras de {symbolLabel(priceAssetFilter)} por rango de precio
            </p>
            <p className="cad__panel-hint">
              {symbolLabel(priceAssetFilter)} comprado y vendido por rango de USD, {year}
            </p>
          </div>
          <CFormSelect
            size="sm"
            className="cad__panel-select"
            value={priceAssetFilter}
            onChange={(e) => setPriceAssetFilter(e.target.value)}
          >
            {CRYPTO_PURCHASE_SYMBOLS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </CFormSelect>
        </div>
        <div className="cad__scroll">
          <div className="cad__price-chart">
            {priceBuckets.rows.map((r, i) => {
              const livePrice = prices[priceAssetFilter]?.price ?? null
              const buyGainLoss =
                r.buyQty > 0 && livePrice != null ? livePrice * r.buyQty - r.buyInvested : null
              return (
                <div className="cad__price-col" key={i}>
                  <div className="cad__price-bars">
                    <div className="cad__price-bar-group">
                      {r.buyQty > 0 && (
                        <div className="cad__price-values">
                          <span className="cad__price-value-usd">{fmtUSD(r.buyInvested)}</span>
                          <span className="cad__price-value-qty">
                            {qtyLabel(r.buyQty, priceAssetFilter)}
                          </span>
                          {buyGainLoss != null && (
                            <span
                              className={`cad__price-value-gl${buyGainLoss >= 0 ? ' cad__price-value-gl--gain' : ' cad__price-value-gl--loss'}`}
                            >
                              {buyGainLoss >= 0 ? '+' : ''}
                              {fmtUSD(buyGainLoss)}
                            </span>
                          )}
                        </div>
                      )}
                      <div
                        className="cad__price-bar cad__price-bar--buy"
                        style={{
                          height: `${(r.buyQty / priceBuckets.max) * PRICE_BAR_MAX_PX}px`,
                        }}
                        title={`Compras ${bucketFullLabel(r)}: ${fmtQty(r.buyQty, priceAssetFilter)}`}
                      />
                    </div>
                    <div className="cad__price-bar-group">
                      {r.sellQty > 0 && (
                        <div className="cad__price-values">
                          <span className="cad__price-value-usd">{fmtUSD(r.sellProceeds)}</span>
                          <span className="cad__price-value-qty">
                            {qtyLabel(r.sellQty, priceAssetFilter)}
                          </span>
                        </div>
                      )}
                      <div
                        className="cad__price-bar cad__price-bar--sell"
                        style={{
                          height: `${(r.sellQty / priceBuckets.max) * PRICE_BAR_MAX_PX}px`,
                        }}
                        title={`Ventas ${bucketFullLabel(r)}: ${fmtQty(r.sellQty, priceAssetFilter)}`}
                      />
                    </div>
                  </div>
                  <div className="cad__price-label">{bucketShortLabel(r)}</div>
                </div>
              )
            })}
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
