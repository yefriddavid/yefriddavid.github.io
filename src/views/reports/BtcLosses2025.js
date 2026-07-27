import React, { useState } from 'react'
import Spinner from 'src/components/shared/Spinner'
import { useCryptoPrices } from 'src/views/Finance/trade/Prices/useCryptoPrices'
import { fmtUSD } from 'src/views/tools/crypto-purchases/cryptoPurchaseHelpers'
import './BtcLosses2025.scss'

// Fixed snapshot from a manual FIFO buy/sell match run on 2026-07-27 — the BTC
// purchase lots from 2025 that were still unsold. See docs/btc-remaining-lots-2025.md.
const LOTS = [
  { date: '2025-08-17', quantity: 0.00334, price: 117389.98 },
  { date: '2025-08-18', quantity: 0.01735, price: 115236.61 },
  { date: '2025-08-19', quantity: 0.00878, price: 113822.74 },
  { date: '2025-10-10', quantity: 0.00833, price: 120000 },
  { date: '2025-10-10', quantity: 0.01407, price: 111527.53 },
  { date: '2025-10-10', quantity: 0.01713, price: 116810.92 },
  { date: '2025-10-13', quantity: 0.00868, price: 115150.11 },
  { date: '2025-10-14', quantity: 0.01799, price: 111133.56 },
  { date: '2025-10-28', quantity: 0.00887, price: 112739.15, note: 'Nunca se vendió' },
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

  const rows = LOTS.map((lot) => {
    const cost = lot.quantity * lot.price
    const value = effectivePrice != null ? lot.quantity * effectivePrice : null
    const pnl = value != null ? value - cost : null
    const interest = loanInterest(cost, lot.date)
    const perMonth = monthlyInterest(cost)
    return { ...lot, cost, value, pnl, interest, perMonth }
  })

  const [sort, setSort] = useState({ key: 'date', dir: 'asc' })
  const toggleSort = (key) =>
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' },
    )
  const sortedRows = [...rows].sort((a, b) => {
    const sign = sort.dir === 'asc' ? 1 : -1
    if (sort.key === 'date') return sign * a.date.localeCompare(b.date)
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
            {sortedRows.map((r, i) => (
              <tr key={i}>
                <td>
                  {r.date}
                  {r.note && (
                    <span className="btcl__note" title={r.note}>
                      {' '}
                      *
                    </span>
                  )}
                </td>
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
              </tr>
            ))}
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
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="btcl__caption">* Nunca se vendió este lote.</p>
    </div>
  )
}

export default BtcLosses2025
