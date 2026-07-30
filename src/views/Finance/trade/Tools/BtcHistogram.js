import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CChartBar } from '@coreui/react-chartjs'
import Spinner from 'src/components/shared/Spinner'
import MultiSelectDropdown from 'src/components/shared/MultiSelectDropdown'
import useLocaleData from 'src/hooks/useLocaleData'
import useMultiParam from 'src/hooks/useMultiParam'
import { fetchPriceSeries } from 'src/services/cryptoKlinesService'

const GRANULARITIES = [
  { value: '1d', label: 'Días' },
  { value: '1w', label: 'Semanas' },
  { value: '1M', label: 'Meses' },
]

const UP_COLOR = '#26a69a'
const DOWN_COLOR = '#ef5350'

const CURRENT_YEAR = new Date().getFullYear()
const BTC_LISTING_YEAR = 2017
const YEARS = Array.from(
  { length: CURRENT_YEAR - BTC_LISTING_YEAR + 1 },
  (_, i) => CURRENT_YEAR - i,
)

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

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// Groups consecutive daily points that fall in the same month, so the chart can
// band each month and label it once instead of repeating the month on every tick.
const computeMonthGroups = (points) => {
  const groups = []
  points.forEach((p, i) => {
    const d = new Date(p.time)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const current = groups[groups.length - 1]
    if (current && current.key === key) {
      current.endIndex = i
    } else {
      groups.push({
        key,
        startIndex: i,
        endIndex: i,
        label: capitalize(d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })),
      })
    }
  })
  return groups
}

// Chart.js plugin: paints an alternating background band per month group and
// writes the month name above the plot area. Reads its config from
// options.plugins.monthGroups so it stays in sync as the chart data updates.
const monthGroupPlugin = {
  id: 'monthGroups',
  beforeDraw(chart) {
    const groups = chart.config.options?.plugins?.monthGroups?.groups
    if (!groups?.length) return
    const { ctx, chartArea, scales } = chart
    const x = scales.x
    const bandWidth =
      groups[0].endIndex > groups[0].startIndex || chart.data.labels.length > 1
        ? x.getPixelForValue(1) - x.getPixelForValue(0)
        : chartArea.right - chartArea.left
    ctx.save()
    groups.forEach((g, i) => {
      const left = x.getPixelForValue(g.startIndex) - bandWidth / 2
      const right = x.getPixelForValue(g.endIndex) + bandWidth / 2
      ctx.fillStyle = i % 2 === 0 ? 'rgba(128, 128, 128, 0.05)' : 'rgba(128, 128, 128, 0.13)'
      ctx.fillRect(left, chartArea.top, right - left, chartArea.bottom - chartArea.top)
    })
    ctx.restore()
  },
  afterDraw(chart) {
    const groups = chart.config.options?.plugins?.monthGroups?.groups
    if (!groups?.length) return
    const { ctx, chartArea, scales } = chart
    const x = scales.x
    ctx.save()
    ctx.font = '11px sans-serif'
    ctx.fillStyle = '#888'
    ctx.textAlign = 'center'
    groups.forEach((g) => {
      const center = (x.getPixelForValue(g.startIndex) + x.getPixelForValue(g.endIndex)) / 2
      ctx.fillText(g.label, center, chartArea.top - 6)
    })
    ctx.restore()
  },
}

export default function BtcHistogram() {
  const { monthLabels } = useLocaleData()

  // Filters live in the URL (not useState) so a page refresh restores exactly
  // what was applied instead of resetting to defaults.
  const [searchParams, setSearchParams] = useSearchParams()
  const setParam = (key, value) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === '' || value == null) next.delete(key)
      else next.set(key, String(value))
      return next
    })

  const dateMode = searchParams.get('dateMode') || 'range'
  const setDateMode = (v) => setParam('dateMode', v)
  const rangeFrom = searchParams.get('from') || monthsAgoStr(3)
  const setRangeFrom = (v) => setParam('from', v)
  const rangeTo = searchParams.get('to') || todayStr()
  const setRangeTo = (v) => setParam('to', v)
  const year = Number(searchParams.get('year')) || CURRENT_YEAR
  const setYear = (v) => setParam('year', v)
  const [selectedMonths, setSelectedMonths] = useMultiParam(
    searchParams,
    setSearchParams,
    'months',
    Number,
  )
  const granularity = searchParams.get('granularity') || '1d'
  const setGranularity = (v) => setParam('granularity', v)

  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [queried, setQueried] = useState(false)

  // 'month' mode bounds the year like 'year' mode does, then narrows further by
  // the selected months after fetching — a multiselect can't collapse to one
  // contiguous date range the way a single month picker could.
  const { dateFrom, dateTo } =
    dateMode === 'year' || dateMode === 'month'
      ? { dateFrom: `${year}-01-01`, dateTo: year === CURRENT_YEAR ? todayStr() : `${year}-12-31` }
      : { dateFrom: rangeFrom, dateTo: rangeTo }

  const invalid = !dateFrom || !dateTo || dateFrom > dateTo

  const handleQuery = async () => {
    if (invalid) return
    setLoading(true)
    setError(null)
    try {
      const startTime = new Date(`${dateFrom}T00:00:00.000Z`).getTime()
      const endTime = new Date(`${dateTo}T23:59:59.999Z`).getTime()
      const data = await fetchPriceSeries('BTCUSDT', granularity, startTime, endTime)
      const filtered =
        dateMode === 'month' && selectedMonths.size > 0
          ? data.filter((p) => selectedMonths.has(new Date(p.time).getMonth() + 1))
          : data
      setSeries(filtered)
      setQueried(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const colors = series.map((p) => (p.close >= p.open ? UP_COLOR : DOWN_COLOR))
  const monthGroups = granularity === '1d' ? computeMonthGroups(series) : []

  // Candlestick faked with two overlaid floating-bar datasets (Chart.js supports
  // [min, max] data points natively): a thin wick (low-high) under a wide body (open-close).
  const chartData = {
    labels: series.map((p) =>
      granularity === '1d'
        ? String(new Date(p.time).getDate())
        : fmtBucketLabel(p.time, granularity),
    ),
    datasets: [
      {
        label: 'Rango',
        data: series.map((p) => [p.low, p.high]),
        backgroundColor: colors,
        barThickness: 2,
        grouped: false,
      },
      {
        label: 'BTC/USDT',
        data: series.map((p) => [Math.min(p.open, p.close), Math.max(p.open, p.close)]),
        backgroundColor: colors,
        maxBarThickness: 12,
        grouped: false,
      },
    ],
  }

  return (
    <div className="trade-tools__card trade-tools__card--wide">
      <p className="trade-tools__card-title">Velas BTC/USDT</p>

      <div className="trade-tools__mode-toggle">
        <button
          type="button"
          className={`trade-tools__mode-btn${dateMode === 'range' ? ' trade-tools__mode-btn--active' : ''}`}
          onClick={() => setDateMode('range')}
        >
          Rango de fechas
        </button>
        <button
          type="button"
          className={`trade-tools__mode-btn${dateMode === 'month' ? ' trade-tools__mode-btn--active' : ''}`}
          onClick={() => setDateMode('month')}
        >
          Año y mes
        </button>
        <button
          type="button"
          className={`trade-tools__mode-btn${dateMode === 'year' ? ' trade-tools__mode-btn--active' : ''}`}
          onClick={() => setDateMode('year')}
        >
          Año
        </button>
      </div>

      <div className="trade-tools__histogram-filters">
        {dateMode === 'range' ? (
          <>
            <div className="trade-tools__field">
              <label className="trade-tools__label">Fecha desde</label>
              <input
                type="date"
                className="trade-tools__input"
                value={rangeFrom}
                max={rangeTo}
                onChange={(e) => setRangeFrom(e.target.value)}
              />
            </div>
            <div className="trade-tools__field">
              <label className="trade-tools__label">Fecha hasta</label>
              <input
                type="date"
                className="trade-tools__input"
                value={rangeTo}
                min={rangeFrom}
                max={todayStr()}
                onChange={(e) => setRangeTo(e.target.value)}
              />
            </div>
          </>
        ) : dateMode === 'month' ? (
          <>
            <div className="trade-tools__field">
              <label className="trade-tools__label">Año</label>
              <select
                className="trade-tools__input"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="trade-tools__field">
              <label className="trade-tools__label">Mes</label>
              <MultiSelectDropdown
                label={(size) => (size > 0 ? `Mes (${size})` : 'Mes: Todos')}
                options={monthLabels.map((label, i) => ({ value: i + 1, label }))}
                selected={selectedMonths}
                onToggle={(value) =>
                  setSelectedMonths((prev) => {
                    const next = new Set(prev)
                    next.has(value) ? next.delete(value) : next.add(value)
                    return next
                  })
                }
                onClearAll={() => setSelectedMonths(new Set())}
              />
            </div>
          </>
        ) : (
          <div className="trade-tools__field">
            <label className="trade-tools__label">Año</label>
            <select
              className="trade-tools__input"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}
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
              plugins={[monthGroupPlugin]}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: { top: monthGroups.length ? 18 : 0 } },
                plugins: {
                  legend: { display: false },
                  monthGroups: { groups: monthGroups },
                  tooltip: {
                    filter: (ctx) => ctx.datasetIndex === 1,
                    callbacks: {
                      title: (items) =>
                        fmtBucketLabel(series[items[0].dataIndex].time, granularity),
                      label: (ctx) => {
                        const p = series[ctx.dataIndex]
                        return [
                          `Apertura: ${fmtUsd(p.open)}`,
                          `Máximo: ${fmtUsd(p.high)}`,
                          `Mínimo: ${fmtUsd(p.low)}`,
                          `Cierre: ${fmtUsd(p.close)}`,
                        ]
                      },
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
