import React, { useState } from 'react'
import { CChartBar } from '@coreui/react-chartjs'
import Spinner from 'src/components/shared/Spinner'
import { fetchPriceSeries } from 'src/services/cryptoKlinesService'

const GRANULARITIES = [
  { value: '1d', label: 'Días' },
  { value: '1w', label: 'Semanas' },
  { value: '1M', label: 'Meses' },
]

const BTC_ORANGE = '#f7931a'

const todayStr = () => new Date().toISOString().slice(0, 10)
const monthsAgoStr = (n) => {
  const d = new Date()
  d.setMonth(d.getMonth() - n)
  return d.toISOString().slice(0, 10)
}
const fmtUsd = (v) => `$${Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 })}`

const fmtBucketLabel = (ms, granularity) => {
  const d = new Date(ms)
  if (granularity === '1M')
    return d.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: '2-digit' })
}

export default function BtcHistogram() {
  const [dateFrom, setDateFrom] = useState(monthsAgoStr(3))
  const [dateTo, setDateTo] = useState(todayStr())
  const [granularity, setGranularity] = useState('1d')
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [queried, setQueried] = useState(false)

  const invalid = !dateFrom || !dateTo || dateFrom > dateTo

  const handleQuery = async () => {
    if (invalid) return
    setLoading(true)
    setError(null)
    try {
      const startTime = new Date(`${dateFrom}T00:00:00.000Z`).getTime()
      const endTime = new Date(`${dateTo}T23:59:59.999Z`).getTime()
      const data = await fetchPriceSeries('BTCUSDT', granularity, startTime, endTime)
      setSeries(data)
      setQueried(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const chartData = {
    labels: series.map((p) => fmtBucketLabel(p.time, granularity)),
    datasets: [
      {
        label: 'BTC/USDT',
        data: series.map((p) => p.price),
        backgroundColor: BTC_ORANGE,
        borderRadius: 4,
        maxBarThickness: 28,
      },
    ],
  }

  return (
    <div className="trade-tools__card trade-tools__card--wide">
      <p className="trade-tools__card-title">Histograma BTC/USDT</p>

      <div className="trade-tools__histogram-filters">
        <div className="trade-tools__field">
          <label className="trade-tools__label">Fecha desde</label>
          <input
            type="date"
            className="trade-tools__input"
            value={dateFrom}
            max={dateTo}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="trade-tools__field">
          <label className="trade-tools__label">Fecha hasta</label>
          <input
            type="date"
            className="trade-tools__input"
            value={dateTo}
            min={dateFrom}
            max={todayStr()}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div className="trade-tools__field">
          <label className="trade-tools__label">Comparación</label>
          <select
            className="trade-tools__input"
            value={granularity}
            onChange={(e) => setGranularity(e.target.value)}
          >
            {GRANULARITIES.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="trade-tools__query-btn"
          disabled={invalid || loading}
          onClick={handleQuery}
        >
          {loading ? <Spinner size="sm" /> : 'Consultar'}
        </button>
      </div>

      {error && <p className="trade-tools__error">{error}</p>}

      {queried &&
        !loading &&
        !error &&
        (series.length === 0 ? (
          <p className="trade-tools__empty">Sin datos para ese rango.</p>
        ) : (
          <div className="trade-tools__histogram-chart">
            <CChartBar
              style={{ height: 320 }}
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => ` ${fmtUsd(ctx.parsed.y)}`,
                    },
                  },
                },
                scales: {
                  x: { grid: { display: false } },
                  y: {
                    title: { display: true, text: 'Precio (USD)', font: { size: 11 } },
                    ticks: { callback: (v) => fmtUsd(v) },
                  },
                },
              }}
            />
          </div>
        ))}
    </div>
  )
}
