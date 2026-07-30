import React, { useMemo, useState } from 'react'
import Spinner from 'src/components/shared/Spinner'
import { useCryptoPrices } from 'src/views/Finance/trade/Prices/useCryptoPrices'
import { fmtUSD } from 'src/views/tools/crypto-purchases/cryptoPurchaseHelpers'
import moment from 'src/utils/moment'
import './BtcLosses2025.scss'

const fmtDateLong = (date) => (date ? moment(date).format('D [de] MMMM [de] YYYY') : '')

// Fixed snapshot from a manual FIFO buy/sell match run on 2026-07-27 — the BTC
// purchase lots from 2025 that were still unsold. See docs/btc-remaining-lots-2025.md.
// Extended 2026-07-28 with additional unsold lots found in Crypto Query; the two
// grouped rows (Binance orders split across several partial fills) are entered as
// one lot each, using the group's total quantity and weighted-average price.
const LOTS = [
  { date: '2025-08-17', quantity: 0.00334, price: 117389.98, trm: 4019.24 },
  { date: '2025-08-18', quantity: 0.01735, price: 115236.61, trm: 4019.24 },
  { date: '2025-08-19', quantity: 0.00878, price: 113822.74, trm: 4019.24 },
  { date: '2025-10-10', quantity: 0.00833, price: 120000, trm: 3894.99 },
  { date: '2025-10-10', quantity: 0.01407, price: 111527.53, trm: 3894.99 },
  { date: '2025-10-10', quantity: 0.01713, price: 116810.92, trm: 3894.99 },
  { date: '2025-10-10', quantity: 0.01854, price: 111527.17, trm: 3894.99 },
  { date: '2025-10-13', quantity: 0.00868, price: 115150.11, trm: 3913.24 },
  { date: '2025-10-14', quantity: 0.01799, price: 111133.56, trm: 3913.24 },
  { date: '2025-10-28', quantity: 0.00887, price: 112739.15, trm: 3844.2, note: 'Nunca se vendió' },
  { date: '2025-10-29', quantity: 0.0091, price: 109874.76, trm: 3874.84 },
  { date: '2025-10-30', quantity: 0.00459, price: 108910.8, trm: 3885.29 },
  { date: '2025-11-03', quantity: 0.0047, price: 106330.01, trm: 3860.12 },
  { date: '2025-11-04', quantity: 0.00287, price: 104468.66, trm: 3860.12 },
  { date: '2025-11-04', quantity: 0.00192, price: 104304.01, trm: 3860.12 },
  { date: '2025-11-04', quantity: 0.00099, price: 100981.43, trm: 3860.12 },
  { date: '2025-11-18', quantity: 0.00535, price: 93448.79, trm: 3764.77 },
]

// Purchases made in 2026 — not just unsold lots like LOTS above, the full set
// for the year. Same shape: { date, quantity, price, note? }. Grouped orders
// from Crypto Query (Binance orders split across several partial fills) are
// entered as one lot each, using the group's total quantity and weighted-
// average price — same convention as LOTS above.
const LOTS_2026 = [
  { date: '2026-01-15', quantity: 0.00067, price: 95653.17, trm: 3655.16 },
  { date: '2026-01-15', quantity: 0.00524, price: 95406.53, trm: 3655.16 },
  { date: '2026-01-23', quantity: 0.00337, price: 89004.49, trm: 3630.33 },
  { date: '2026-01-29', quantity: 0.00351, price: 85375.9, trm: 3665.97 },
  { date: '2026-01-29', quantity: 0.0012, price: 83568.01, trm: 3665.97 },
  { date: '2026-01-29', quantity: 0.00121, price: 82116, trm: 3665.97 },
  { date: '2026-01-30', quantity: 0.00592, price: 84354.86, trm: 3661.29 },
  { date: '2026-01-31', quantity: 0.00128, price: 77840, trm: 3670.47 },
  { date: '2026-01-31', quantity: 0.00629, price: 79440.67, trm: 3670.47 },
  { date: '2026-01-31', quantity: 0.00633, price: 79043.31, trm: 3670.47 },
  { date: '2026-02-02', quantity: 0.00128, price: 78416.99, trm: 3670.47 },
  { date: '2026-02-04', quantity: 0.0075, price: 70972.17, trm: 3622 },
  { date: '2026-02-05', quantity: 0.00777, price: 66346.57, trm: 3644.93 },
  { date: '2026-02-23', quantity: 0.00007, price: 64865.85, trm: 3691.34 },
  { date: '2026-02-26', quantity: 0.00149, price: 66744.81, trm: 3703.69 },
  { date: '2026-02-27', quantity: 0.00763, price: 65485.85, trm: 3745.78 },
  { date: '2026-03-31', quantity: 0.01797, price: 66752.7, trm: 3669.96 },
  { date: '2026-04-30', quantity: 0.00254, price: 76310.14, trm: 3621.86 },
  { date: '2026-04-30', quantity: 0.01304, price: 76344.21, trm: 3621.86 },
  { date: '2026-05-17', quantity: 0.00153, price: 77997.53, trm: 3796.78 },
  { date: '2026-05-25', quantity: 0.00112, price: 76746.33, trm: 3667.06, note: 'vía USDC' },
  { date: '2026-05-25', quantity: 0.00011, price: 76815.26, trm: 3667.06 },
  { date: '2026-05-31', quantity: 0.00271, price: 73538, trm: 3678.15 },
  { date: '2026-05-31', quantity: 0.0034, price: 73521.68, trm: 3678.15 },
  { date: '2026-05-31', quantity: 0.0135, price: 73806.01, trm: 3678.15 },
  { date: '2026-06-02', quantity: 0.00301, price: 66414.48, trm: 3560.24 },
  { date: '2026-06-02', quantity: 0.00147, price: 67923.24, trm: 3560.24 },
  { date: '2026-06-03', quantity: 0.00315, price: 63554, trm: 3562 },
  { date: '2026-06-03', quantity: 0.00306, price: 65181.41, trm: 3562 },
  { date: '2026-06-03', quantity: 0.00303, price: 65927.01, trm: 3562 },
  { date: '2026-06-03', quantity: 0.00322, price: 62182.57, trm: 3562 },
  { date: '2026-06-03', quantity: 0.00311, price: 64322.93, trm: 3562 },
  { date: '2026-06-05', quantity: 0.00165, price: 60520, trm: 3565.32 },
  { date: '2026-06-05', quantity: 0.00333, price: 59975.26, trm: 3565.32 },
  { date: '2026-06-05', quantity: 0.00321, price: 62151.6, trm: 3565.32 },
  { date: '2026-06-30', quantity: 0.0025, price: 59568.09, trm: 3443.59 },
  { date: '2026-06-30', quantity: 0.00579, price: 59602, trm: 3443.59 },
  { date: '2026-06-30', quantity: 0.00834, price: 59700.01, trm: 3443.59 },
  {
    date: '2026-07-04',
    quantity: 0.00799,
    price: 62612.78,
    trm: 3334.93,
    note: 'Vender en 67500 — comprado con préstamo (Binance Loans)',
  },
]

const LOAN_RATE_EA = 0.05
// Effective monthly rate equivalent to 5% EA — (1+EA)^(1/12) - 1, the standard
// conversion so compounding monthly still lands on 5% after a full year.
const LOAN_RATE_MONTHLY = Math.pow(1 + LOAN_RATE_EA, 1 / 12) - 1

// Compound interest at a 5% effective-annual rate, from the purchase date to today.
const loanInterest = (cost, purchaseDate) => {
  const days = (Date.now() - new Date(`${purchaseDate}T00:00:00`).getTime()) / 86_400_000
  const years = days / 365
  return cost * (Math.pow(1 + LOAN_RATE_EA, years) - 1)
}

const monthlyInterest = (cost) => cost * LOAN_RATE_MONTHLY

// Renders one sortable lots table + totals footer — shared by the 2025
// unsold-lots table and the 2026 all-purchases table below it.
const LotsTable = ({ title, lots, effectivePrice }) => {
  const rows = lots.map((lot) => {
    const cost = lot.quantity * lot.price
    const value = effectivePrice != null ? lot.quantity * effectivePrice : null
    const pnl = value != null ? value - cost : null
    const interest = loanInterest(cost, lot.date)
    const perMonth = monthlyInterest(cost)
    return { ...lot, cost, value, pnl, interest, perMonth }
  })

  const [sort, setSort] = useState({ key: 'date', dir: 'desc' })
  const toggleSort = (key) =>
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' },
    )
  const sortedRows = [...rows].sort((a, b) => {
    const sign = sort.dir === 'asc' ? 1 : -1
    if (sort.key === 'date' || sort.key === 'note')
      return sign * String(a[sort.key] || '').localeCompare(String(b[sort.key] || ''))
    return sign * ((a[sort.key] ?? 0) - (b[sort.key] ?? 0))
  })

  const totals = rows.reduce(
    (acc, r) => ({
      quantity: acc.quantity + r.quantity,
      cost: acc.cost + r.cost,
      value: acc.value + (r.value ?? 0),
      pnl: acc.pnl + (r.pnl ?? 0),
      interest: acc.interest + r.interest,
      perMonth: acc.perMonth + r.perMonth,
    }),
    { quantity: 0, cost: 0, value: 0, pnl: 0, interest: 0, perMonth: 0 },
  )

  return (
    <>
      <h2 className="btcl__section-title">{title}</h2>
      <div className="btcl__scroll">
        <table className="btcl__table">
          <thead>
            <tr>
              {[
                { key: 'date', label: 'Fecha compra' },
                { key: 'quantity', label: 'Cantidad BTC', num: true },
                { key: 'price', label: 'Precio compra', num: true },
                { key: 'cost', label: 'Costo', num: true, cost: true },
                { key: 'value', label: 'Valor actual', num: true },
                { key: 'pnl', label: 'PnL', num: true },
                { key: 'interest', label: 'Interés préstamo (5% EA)', num: true },
                { key: 'perMonth', label: 'Interés / mes', num: true },
                { key: 'note', label: 'Notas' },
                { key: 'trm', label: 'TRM USD/COP', num: true },
              ].map((col) => (
                <th
                  key={col.key}
                  className={`btcl__th--sortable${col.num ? ' num' : ''}${col.cost ? ' btcl__cost-col' : ''}`}
                  onClick={() => toggleSort(col.key)}
                >
                  {col.label}
                  {sort.key === col.key && (
                    <span className="btcl__th-sort-arrow">{sort.dir === 'asc' ? ' ▲' : ' ▼'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={10} className="btcl__empty">
                  Sin registros todavía.
                </td>
              </tr>
            ) : (
              sortedRows.map((r, i) => (
                <tr key={i}>
                  <td>{fmtDateLong(r.date)}</td>
                  <td className="num">{r.quantity}</td>
                  <td className="num">{fmtUSD(r.price)}</td>
                  <td className="num btcl__cost-col">{fmtUSD(r.cost)}</td>
                  <td className="num">{r.value != null ? fmtUSD(r.value) : '—'}</td>
                  <td
                    className={`num${r.pnl == null ? '' : r.pnl >= 0 ? ' btcl__pnl--positive' : ' btcl__pnl--negative'}`}
                  >
                    {r.pnl != null ? `${r.pnl >= 0 ? '+' : ''}${fmtUSD(r.pnl)}` : '—'}
                  </td>
                  <td className="num">{fmtUSD(r.interest)}</td>
                  <td className="num">{fmtUSD(r.perMonth)}</td>
                  <td>{r.note}</td>
                  <td className="num">{r.trm}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="btcl__total-row">
              <td>Total</td>
              <td className="num">{totals.quantity.toFixed(8)}</td>
              <td className="num">—</td>
              <td className="num btcl__cost-col">{fmtUSD(totals.cost)}</td>
              <td className="num">{effectivePrice != null ? fmtUSD(totals.value) : '—'}</td>
              <td
                className={`num${effectivePrice == null ? '' : totals.pnl >= 0 ? ' btcl__pnl--positive' : ' btcl__pnl--negative'}`}
              >
                {effectivePrice != null
                  ? `${totals.pnl >= 0 ? '+' : ''}${fmtUSD(totals.pnl)}`
                  : '—'}
              </td>
              <td className="num">{fmtUSD(totals.interest)}</td>
              <td className="num">{fmtUSD(totals.perMonth)}</td>
              <td />
              <td />
            </tr>
            <tr className="btcl__total-row">
              <td colSpan={4}>Costo − Valor actual</td>
              <td
                className={`num${effectivePrice == null ? '' : totals.cost - totals.value >= 0 ? ' btcl__pnl--negative' : ' btcl__pnl--positive'}`}
              >
                {effectivePrice != null ? fmtUSD(totals.cost - totals.value) : '—'}
              </td>
              <td />
              <td />
              <td />
              <td />
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  )
}

const BtcLosses2025 = () => {
  const { prices, connected } = useCryptoPrices()
  const livePrice = prices.BTCUSDT?.price ?? null

  const [simInput, setSimInput] = useState('')
  const [simPrice, setSimPrice] = useState(null)

  const handleApplySim = () => {
    const parsed = Number(simInput)
    if (simInput !== '' && parsed > 0) setSimPrice(parsed)
  }
  const handleResetSim = () => {
    setSimInput('')
    setSimPrice(null)
  }

  const effectivePrice = simPrice ?? livePrice

  // Combines both tables (2025 unsold lots + all 2026 purchases) into one
  // headline cost/loss figure — same cost/value math as LotsTable, kept
  // separate since LotsTable doesn't expose its computed totals to the parent.
  const { totalCost, totalLoss, cost2025, cost2026, loss2025, loss2026 } = useMemo(() => {
    const allLots = [...LOTS, ...LOTS_2026]
    const cost = allLots.reduce((s, l) => s + l.quantity * l.price, 0)
    const c2025 = LOTS.reduce((s, l) => s + l.quantity * l.price, 0)
    const c2026 = LOTS_2026.reduce((s, l) => s + l.quantity * l.price, 0)
    const base = { totalCost: cost, cost2025: c2025, cost2026: c2026 }
    if (effectivePrice == null) return { ...base, totalLoss: null, loss2025: null, loss2026: null }
    const value = allLots.reduce((s, l) => s + l.quantity * effectivePrice, 0)
    const v2025 = LOTS.reduce((s, l) => s + l.quantity * effectivePrice, 0)
    const v2026 = LOTS_2026.reduce((s, l) => s + l.quantity * effectivePrice, 0)
    return { ...base, totalLoss: cost - value, loss2025: c2025 - v2025, loss2026: c2026 - v2026 }
  }, [effectivePrice])

  const pct2025 = totalCost ? (cost2025 / totalCost) * 100 : 0
  const pct2026 = totalCost ? (cost2026 / totalCost) * 100 : 0

  const lossAbsTotal = totalLoss != null ? Math.abs(loss2025) + Math.abs(loss2026) : 0
  const lossPct2025 = lossAbsTotal ? (Math.abs(loss2025) / lossAbsTotal) * 100 : 0
  const lossPct2026 = lossAbsTotal ? (Math.abs(loss2026) / lossAbsTotal) * 100 : 0

  return (
    <div className="btcl">
      <h1 className="btcl__title">BTC Pérdidas 2025</h1>
      <p className="btcl__subtitle">
        Lotes de BTC comprados en 2025 sin vender todavía (dato fijo, análisis puntual) — PnL
        calculado con el precio de BTC/USDT en vivo. El interés de préstamo simula qué pasaría si el
        costo de cada compra fuera plata prestada al 5% efectivo anual, compuesto desde la fecha de
        compra hasta hoy. «Interés / mes» es la tasa mensual equivalente a ese 5% EA aplicada al
        costo — cuánto suma la deuda simulada por cada mes que pase.
        {!connected && ' Sin conexión de precios — mostrando el último valor recibido.'}
      </p>

      <div className="btcl__notes">
        <div className="btcl__note">
          📌 Vender en {fmtUSD(130000)} · nota del {fmtDateLong('2026-07-29')} · BTC hoy: {fmtUSD(64000)}
        </div>
        <div className="btcl__note">
          🏦 En billetera: mantener todo · en Binance ARG: dejar {fmtUSD(10000)} para trade
        </div>
        <div className="btcl__note">🎯 Llegar a 1 BTC</div>
        <div className="btcl__note">💳 Después de haber llegado a 1 BTC, pagar deuda</div>
      </div>

      <div className="btcl__kpi-row">
        <div className="btcl__kpi-card">
          <span className="btcl__kpi-label">Costo total (2025 + 2026)</span>
          <strong className="btcl__kpi-value">{fmtUSD(totalCost)}</strong>
          <div className="btcl__kpi-split" title={`2025: ${fmtUSD(cost2025)} · 2026: ${fmtUSD(cost2026)}`}>
            <div className="btcl__kpi-split-bar">
              <span className="btcl__kpi-split-seg btcl__kpi-split-seg--2025" style={{ width: `${pct2025}%` }} />
              <span className="btcl__kpi-split-seg btcl__kpi-split-seg--2026" style={{ width: `${pct2026}%` }} />
            </div>
            <div className="btcl__kpi-split-legend">
              <span className="btcl__kpi-split-item btcl__kpi-split-item--2025">
                2025 · {fmtUSD(cost2025)} <em>({pct2025.toFixed(0)}%)</em>
              </span>
              <span className="btcl__kpi-split-item btcl__kpi-split-item--2026">
                2026 · {fmtUSD(cost2026)} <em>({pct2026.toFixed(0)}%)</em>
              </span>
            </div>
          </div>
        </div>
        <div className="btcl__kpi-card">
          <span className="btcl__kpi-label">Pérdida total (2025 + 2026)</span>
          <strong
            className={`btcl__kpi-value${totalLoss == null ? '' : totalLoss >= 0 ? ' btcl__pnl--negative' : ' btcl__pnl--positive'}`}
          >
            {totalLoss != null ? fmtUSD(totalLoss) : <Spinner size="sm" />}
          </strong>
          {totalLoss != null && (
            <div
              className="btcl__kpi-split"
              title={`2025: ${loss2025 >= 0 ? '+' : ''}${fmtUSD(loss2025)} · 2026: ${loss2026 >= 0 ? '+' : ''}${fmtUSD(loss2026)}`}
            >
              <div className="btcl__kpi-split-bar">
                <span
                  className={`btcl__kpi-split-seg${loss2025 >= 0 ? ' btcl__kpi-split-seg--loss' : ' btcl__kpi-split-seg--gain'}`}
                  style={{ width: `${lossPct2025}%` }}
                />
                <span
                  className={`btcl__kpi-split-seg${loss2026 >= 0 ? ' btcl__kpi-split-seg--loss' : ' btcl__kpi-split-seg--gain'}`}
                  style={{ width: `${lossPct2026}%` }}
                />
              </div>
              <div className="btcl__kpi-split-legend">
                <span className="btcl__kpi-split-item">
                  <em className="btcl__kpi-split-dot btcl__kpi-split-dot--2025" />
                  2025 ·{' '}
                  <span className={loss2025 >= 0 ? 'btcl__pnl--negative' : 'btcl__pnl--positive'}>
                    {loss2025 >= 0 ? '+' : ''}
                    {fmtUSD(loss2025)}
                  </span>
                </span>
                <span className="btcl__kpi-split-item">
                  <em className="btcl__kpi-split-dot btcl__kpi-split-dot--2026" />
                  2026 ·{' '}
                  <span className={loss2026 >= 0 ? 'btcl__pnl--negative' : 'btcl__pnl--positive'}>
                    {loss2026 >= 0 ? '+' : ''}
                    {fmtUSD(loss2026)}
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="btcl__price">
        Precio BTC en vivo:{' '}
        {livePrice != null ? <strong>{fmtUSD(livePrice)}</strong> : <Spinner size="sm" />}
        {simPrice != null && (
          <span className="btcl__sim-active"> — simulando a {fmtUSD(simPrice)}</span>
        )}
      </div>

      <div className="btcl__sim">
        <label className="btcl__sim-label">Simular precio BTC (USD)</label>
        <input
          type="number"
          className="btcl__sim-input"
          placeholder="Ej: 150000"
          value={simInput}
          onChange={(e) => setSimInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleApplySim()}
        />
        <button type="button" className="btcl__sim-btn" onClick={handleApplySim}>
          Aplicar
        </button>
        <button
          type="button"
          className="btcl__sim-btn btcl__sim-btn--reset"
          onClick={handleResetSim}
        >
          Reset
        </button>
      </div>

      <LotsTable title="Lotes sin vender (2025)" lots={LOTS} effectivePrice={effectivePrice} />
      <LotsTable title="Compras 2026" lots={LOTS_2026} effectivePrice={effectivePrice} />
    </div>
  )
}

export default BtcLosses2025
