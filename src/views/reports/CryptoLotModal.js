import React, { memo, useMemo } from 'react'
import { CChartLine } from '@coreui/react-chartjs'
import AppModal from 'src/components/shared/AppModal'
import {
  isSale,
  isAdjustment,
  typeLabel,
  fmtUSD,
} from 'src/views/tools/crypto-purchases/cryptoPurchaseHelpers'

// Status colors (fixed, never themed) — a month's average buy price either
// beats the current price (good) or sits above it (critical); never color
// alone, always paired with the legend chip's label.
const GOOD = '#0ca30c'
const CRITICAL = '#d03b3b'
const REFERENCE = '#2a78d6'

// One point per month (weighted-average buy price) instead of one per trade —
// a high-frequency coin can have hundreds of individual buys, which turns a
// per-transaction chart into an unreadable wall of slivers.
const monthlyAverages = (buys) => {
  const byMonth = {}
  buys.forEach((p) => {
    const month = (p.purchaseDate || '').slice(0, 7)
    if (!month) return
    const qty = Number(p.quantity) || 0
    const price = Number(p.purchasePrice) || 0
    if (!byMonth[month]) byMonth[month] = { qtySum: 0, costSum: 0 }
    byMonth[month].qtySum += qty
    byMonth[month].costSum += qty * price
  })
  return Object.keys(byMonth)
    .sort()
    .map((month) => ({
      month,
      avgPrice: byMonth[month].qtySum > 0 ? byMonth[month].costSum / byMonth[month].qtySum : 0,
      qty: byMonth[month].qtySum,
    }))
}

const CryptoLotModal = ({ symbol, label, livePrice, purchases, onClose }) => {
  const months = useMemo(() => monthlyAverages(purchases.filter((p) => !isSale(p))), [purchases])

  const transactions = useMemo(
    () => [...purchases].sort((a, b) => (b.purchaseDate || '').localeCompare(a.purchaseDate || '')),
    [purchases],
  )

  return (
    <AppModal
      visible={!!symbol}
      onClose={onClose}
      variant="center"
      size="lg"
      title={`${label} — Detalle de lotes`}
      subtitle={livePrice != null ? `Precio actual: ${fmtUSD(livePrice)}` : undefined}
    >
      {months.length === 0 ? (
        <p className="crypto-report__muted">Sin compras registradas para esta moneda.</p>
      ) : (
        <>
          <div className="crypto-report__chart-legend">
            <span className="crypto-report__legend-chip">
              <span className="crypto-report__legend-dot" style={{ background: GOOD }} />
              Compraste por debajo del precio actual
            </span>
            <span className="crypto-report__legend-chip">
              <span className="crypto-report__legend-dot" style={{ background: CRITICAL }} />
              Compraste por encima del precio actual
            </span>
          </div>

          <CChartLine
            style={{ maxHeight: 260 }}
            data={{
              labels: months.map((m) => m.month),
              datasets: [
                {
                  label: 'Precio promedio de compra',
                  data: months.map((m) => m.avgPrice),
                  borderColor: REFERENCE,
                  backgroundColor: 'transparent',
                  pointBackgroundColor:
                    livePrice != null
                      ? months.map((m) => (m.avgPrice <= livePrice ? GOOD : CRITICAL))
                      : REFERENCE,
                  pointRadius: 5,
                  borderWidth: 2,
                  tension: 0.2,
                  order: 1,
                },
                ...(livePrice != null
                  ? [
                      {
                        label: 'Precio actual',
                        data: months.map(() => livePrice),
                        borderColor: 'rgba(137,135,129,0.7)',
                        borderDash: [6, 4],
                        borderWidth: 2,
                        pointRadius: 0,
                        fill: false,
                        order: 0,
                      },
                    ]
                  : []),
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (ctx) => {
                      if (ctx.dataset.label === 'Precio actual')
                        return `Precio actual: ${fmtUSD(ctx.raw)}`
                      const m = months[ctx.dataIndex]
                      return [
                        `Precio promedio: ${fmtUSD(m.avgPrice)}`,
                        `Cantidad comprada ese mes: ${m.qty}`,
                      ]
                    },
                  },
                },
              },
              scales: {
                x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                y: {
                  grid: { color: 'rgba(0,0,0,0.06)' },
                  ticks: { callback: (v) => fmtUSD(v) },
                },
              },
            }}
          />
        </>
      )}

      <div className="crypto-report__scroll" style={{ marginTop: 20 }}>
        <table className="crypto-report__table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Notas</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((p) => (
              <tr key={p.id}>
                <td className="crypto-report__row-label">{p.purchaseDate}</td>
                <td>{isAdjustment(p) ? 'Ajuste de saldo' : typeLabel(p.type ?? 'buy')}</td>
                <td>{p.quantity}</td>
                <td>{fmtUSD(p.purchasePrice)}</td>
                <td className="crypto-report__row-label">{p.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppModal>
  )
}

export default memo(CryptoLotModal)
