import React, { useRef, useState } from 'react'
import { CChartLine } from '@coreui/react-chartjs'
import Spinner from 'src/components/shared/Spinner'
import { fetchPriceSeries } from 'src/services/cryptoKlinesService'
import { TRADE_PRICE_ASSETS } from 'src/constants/finance'
import { detectBounces } from './bounceUtils'
import './Bounces.scss'

const BASE_COLOR = '#1971c2'
const BOUNCE_COLOR = '#26a69a'
const START_COLOR = '#f5c400'
const END_COLOR = '#e03131'

const todayStr = () => new Date().toISOString().slice(0, 10)
const monthsAgoStr = (n) => {
  const d = new Date()
  d.setMonth(d.getMonth() - n)
  return d.toISOString().slice(0, 10)
}
const fmtUsd = (v) =>
  `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtDate = (ms) =>
  new Date(ms).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: '2-digit' })
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// Groups consecutive daily points that fall in the same month, so the chart can
// label month/year once above the plot area instead of repeating it per day.
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
        monthLabel: capitalize(d.toLocaleDateString('es-CO', { month: 'long' })),
        year: d.getFullYear(),
      })
    }
  })
  return groups
}

// Chart.js plugin: paints an alternating background band per month group and
// writes the month name + year (two lines) above the plot area, so the X axis
// itself only needs the day number.
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
    let lastRight = -Infinity
    groups.forEach((g) => {
      const center = (x.getPixelForValue(g.startIndex) + x.getPixelForValue(g.endIndex)) / 2
      const yearText = String(g.year)
      const width = Math.max(ctx.measureText(g.monthLabel).width, ctx.measureText(yearText).width)
      const left = center - width / 2
      if (left < lastRight + 4) return // would overlap the previous label
      ctx.fillText(g.monthLabel, center, chartArea.top - 19)
      ctx.fillText(yearText, center, chartArea.top - 6)
      lastRight = center + width / 2
    })
    ctx.restore()
  },
}

// Chart.js plugin: writes a "+X%" label above the high point of each detected bounce.
const bounceLabelsPlugin = {
  id: 'bounceLabels',
  afterDraw(chart) {
    const markers = chart.config.options?.plugins?.bounceLabels?.markers
    if (!markers?.length) return
    const { ctx, scales } = chart
    const x = scales.x
    const y = scales.y
    ctx.save()
    ctx.fillStyle = BOUNCE_COLOR
    ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'center'
    markers.forEach((m) => {
      const px = x.getPixelForValue(m.highIndex)
      const py = y.getPixelForValue(m.highPrice)
      ctx.fillText(`+${m.percent.toFixed(0)}%`, px, py - 8)
    })
    ctx.restore()
  },
}

export default function Bounces() {
  const [symbol, setSymbol] = useState(TRADE_PRICE_ASSETS[0].symbol)
  const [from, setFrom] = useState(monthsAgoStr(6))
  const [to, setTo] = useState(todayStr())
  const [minPercent, setMinPercent] = useState(10)
  const [mode, setMode] = useState('auto') // 'auto' | 'manual'

  const [series, setSeries] = useState([])
  const [autoBounces, setAutoBounces] = useState([])
  const [manualBounces, setManualBounces] = useState([])
  const [pendingLow, setPendingLow] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [queried, setQueried] = useState(false)
  const chartRef = useRef(null)

  const bounces = mode === 'auto' ? autoBounces : manualBounces

  const asset = TRADE_PRICE_ASSETS.find((a) => a.symbol === symbol)
  const invalid = !from || !to || from > to || !(Number(minPercent) > 0)

  const handleQuery = async () => {
    if (invalid) return
    setLoading(true)
    setError(null)
    try {
      const startTime = new Date(`${from}T00:00:00.000Z`).getTime()
      const endTime = new Date(`${to}T23:59:59.999Z`).getTime()
      const data = await fetchPriceSeries(symbol, '1d', startTime, endTime)
      setSeries(data)
      setAutoBounces(detectBounces(data, Number(minPercent)))
      setManualBounces([])
      setPendingLow(null)
      setQueried(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChartClick = (e) => {
    if (mode !== 'manual' || !chartRef.current) return
    const elements = chartRef.current.getElementsAtEventForMode(
      e,
      'index',
      { intersect: false },
      true,
    )
    if (!elements.length) return
    const index = elements[0].index

    if (pendingLow === null || index <= pendingLow) {
      setPendingLow(index)
      return
    }
    const low = series[pendingLow]
    const high = series[index]
    setManualBounces((prev) => [
      ...prev,
      {
        lowIndex: pendingLow,
        lowTime: low.time,
        lowPrice: low.close,
        highIndex: index,
        highTime: high.time,
        highPrice: high.close,
        percent: ((high.close - low.close) / low.close) * 100,
      },
    ])
    setPendingLow(null)
  }

  const clearManualSelection = () => {
    setManualBounces([])
    setPendingLow(null)
  }

  const isBounceSegment = (i0, i1) => bounces.some((b) => b.lowIndex <= i0 && i1 <= b.highIndex)
  const boundaryColor = (i) => {
    if (pendingLow === i) return START_COLOR
    if (bounces.some((b) => b.lowIndex === i)) return START_COLOR
    if (bounces.some((b) => b.highIndex === i)) return END_COLOR
    return null
  }

  const monthGroups = computeMonthGroups(series)

  const chartData = {
    labels: series.map((p) => String(new Date(p.time).getDate())),
    datasets: [
      {
        label: `${asset?.label || symbol}/USDT`,
        data: series.map((p) => p.close),
        borderColor: BASE_COLOR,
        backgroundColor: BASE_COLOR + '18',
        segment: {
          borderColor: (ctx) =>
            isBounceSegment(ctx.p0DataIndex, ctx.p1DataIndex) ? BOUNCE_COLOR : BASE_COLOR,
          borderWidth: (ctx) => (isBounceSegment(ctx.p0DataIndex, ctx.p1DataIndex) ? 3 : 1.5),
        },
        pointRadius: (ctx) => (boundaryColor(ctx.dataIndex) ? 5 : 0),
        pointBackgroundColor: (ctx) => boundaryColor(ctx.dataIndex) || BASE_COLOR,
        pointBorderColor: (ctx) => boundaryColor(ctx.dataIndex) || BASE_COLOR,
        pointHoverRadius: (ctx) => (boundaryColor(ctx.dataIndex) ? 6 : 4),
        tension: 0.15,
      },
    ],
  }

  return (
    <div className="bounces-chart">
      <p className="bounces-chart__title">Rebotes de {asset?.label || symbol}</p>

      <div className="bounces-chart__mode-row">
        <span className="bounces-chart__mode-label">Modo:</span>
        <div className="bounces-chart__mode-group">
          <button
            type="button"
            className={`bounces-chart__mode-btn${mode === 'auto' ? ' bounces-chart__mode-btn--active' : ''}`}
            onClick={() => setMode('auto')}
          >
            Automático
          </button>
          <button
            type="button"
            className={`bounces-chart__mode-btn${mode === 'manual' ? ' bounces-chart__mode-btn--active' : ''}`}
            onClick={() => setMode('manual')}
          >
            Manual
          </button>
        </div>
      </div>

      <div className="bounces-chart__filters">
        <div className="bounces-chart__field">
          <label className="bounces-chart__label">Activo</label>
          <select
            className="bounces-chart__input"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          >
            {TRADE_PRICE_ASSETS.map((a) => (
              <option key={a.symbol} value={a.symbol}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
        <div className="bounces-chart__field">
          <label className="bounces-chart__label">Desde</label>
          <input
            type="date"
            className="bounces-chart__input"
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className="bounces-chart__field">
          <label className="bounces-chart__label">Hasta</label>
          <input
            type="date"
            className="bounces-chart__input"
            value={to}
            min={from}
            max={todayStr()}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        {mode === 'auto' && (
          <div className="bounces-chart__field">
            <label className="bounces-chart__label">% mínimo</label>
            <input
              type="number"
              min="1"
              className="bounces-chart__input"
              value={minPercent}
              onChange={(e) => setMinPercent(e.target.value)}
            />
          </div>
        )}
        <button
          type="button"
          className="bounces-chart__query-btn"
          disabled={invalid || loading}
          onClick={handleQuery}
        >
          {loading ? <Spinner size="sm" /> : 'Consultar'}
        </button>
        {mode === 'manual' && manualBounces.length + (pendingLow !== null ? 1 : 0) > 0 && (
          <button type="button" className="bounces-chart__clear-btn" onClick={clearManualSelection}>
            Limpiar selección
          </button>
        )}
      </div>

      {mode === 'manual' && queried && (
        <p className="bounces-chart__hint">
          {pendingLow === null
            ? 'Hacé clic en el punto mínimo (inicio) del rebote.'
            : 'Hacé clic en el punto máximo (final) del rebote.'}
        </p>
      )}

      {error && <p className="bounces-chart__error">{error}</p>}

      {queried && !loading && !error && (
        <>
          {series.length === 0 ? (
            <p className="bounces-chart__empty">No hay datos para ese rango.</p>
          ) : (
            <div className="bounces-chart__chart">
              <CChartLine
                // Forces a full remount whenever the bounce set/pending click changes.
                // @coreui/react-chartjs memoizes chart data via JSON.stringify(data),
                // which silently drops function values — so the scriptable segment/point
                // color callbacks below would otherwise keep the closures from the very
                // first render and never pick up new bounces from clicks alone.
                key={`${mode}-${bounces.map((b) => `${b.lowIndex}:${b.highIndex}`).join(',')}-${pendingLow}`}
                ref={chartRef}
                wrapper={false}
                style={{ height: 360, cursor: mode === 'manual' ? 'crosshair' : 'default' }}
                data={chartData}
                plugins={[monthGroupPlugin, bounceLabelsPlugin]}
                onClick={handleChartClick}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: mode === 'manual' ? false : undefined,
                  layout: { padding: { top: monthGroups.length ? 30 : 0 } },
                  interaction: { mode: 'index', intersect: false },
                  plugins: {
                    legend: { display: false },
                    monthGroups: { groups: monthGroups },
                    bounceLabels: { markers: bounces },
                    tooltip: {
                      callbacks: {
                        title: (items) => fmtDate(series[items[0].dataIndex].time),
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
          )}
          {mode === 'auto' && series.length > 0 && bounces.length === 0 && (
            <p className="bounces-chart__empty">
              No se detectaron rebotes ≥ {minPercent}% en ese rango.
            </p>
          )}
        </>
      )}
    </div>
  )
}
