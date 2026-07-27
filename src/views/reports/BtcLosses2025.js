import React from 'react'
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

const BtcLosses2025 = () => {
  const { prices, connected } = useCryptoPrices()
  const livePrice = prices.BTCUSDT?.price ?? null

  const rows = LOTS.map((lot) => {
    const cost = lot.quantity * lot.price
    const value = livePrice != null ? lot.quantity * livePrice : null
    const pnl = value != null ? value - cost : null
    return { ...lot, cost, value, pnl }
  })

  const totals = rows.reduce(
    (acc, r) => ({
      quantity: acc.quantity + r.quantity,
      cost: acc.cost + r.cost,
      value: acc.value + (r.value ?? 0),
      pnl: acc.pnl + (r.pnl ?? 0),
    }),
    { quantity: 0, cost: 0, value: 0, pnl: 0 },
  )

  return (
    <div className="btcl">
      <h1 className="btcl__title">BTC Pérdidas 2025</h1>
      <p className="btcl__subtitle">
        Lotes de BTC comprados en 2025 sin vender todavía (dato fijo, análisis puntual) — PnL
        calculado con el precio de BTC/USDT en vivo.
        {!connected && ' Sin conexión de precios — mostrando el último valor recibido.'}
      </p>

      <div className="btcl__price">
        Precio BTC en vivo:{' '}
        {livePrice != null ? <strong>{fmtUSD(livePrice)}</strong> : <Spinner size="sm" />}
      </div>

      <div className="btcl__scroll">
        <table className="btcl__table">
          <thead>
            <tr>
              <th>Fecha compra</th>
              <th className="num">Cantidad BTC</th>
              <th className="num">Precio compra</th>
              <th className="num">Costo</th>
              <th className="num">Valor actual</th>
              <th className="num">PnL</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
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
                <td className="num">{fmtUSD(r.cost)}</td>
                <td className="num">{r.value != null ? fmtUSD(r.value) : '—'}</td>
                <td
                  className={`num${r.pnl == null ? '' : r.pnl >= 0 ? ' btcl__pnl--positive' : ' btcl__pnl--negative'}`}
                >
                  {r.pnl != null ? `${r.pnl >= 0 ? '+' : ''}${fmtUSD(r.pnl)}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="btcl__total-row">
              <td>Total</td>
              <td className="num">{totals.quantity.toFixed(8)}</td>
              <td className="num">—</td>
              <td className="num">{fmtUSD(totals.cost)}</td>
              <td className="num">{livePrice != null ? fmtUSD(totals.value) : '—'}</td>
              <td
                className={`num${livePrice == null ? '' : totals.pnl >= 0 ? ' btcl__pnl--positive' : ' btcl__pnl--negative'}`}
              >
                {livePrice != null ? `${totals.pnl >= 0 ? '+' : ''}${fmtUSD(totals.pnl)}` : '—'}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="btcl__caption">* Nunca se vendió este lote.</p>
    </div>
  )
}

export default BtcLosses2025
