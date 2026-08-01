import React, { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CChartLine } from '@coreui/react-chartjs'
import Spinner from 'src/components/shared/Spinner'
import MultiSelectDropdown from 'src/components/shared/MultiSelectDropdown'
import AppModal from 'src/components/shared/AppModal'
import SaveViewForm from 'src/components/shared/SaveViewForm'
import SavedViewsList from 'src/components/shared/SavedViewsList'
import useLocaleData from 'src/hooks/useLocaleData'
import useMultiParam from 'src/hooks/useMultiParam'
import useSavedViews from 'src/hooks/useSavedViews'
import { fetchPriceSeries } from 'src/services/cryptoKlinesService'
import { TRADE_PRICE_ASSETS, TRADE_MARKET_EVENTS } from 'src/constants/finance'
import { detectBounces } from './bounceUtils'
import './Bounces.scss'

const SAVED_VIEWS_KEY = 'bounces.savedViews'

const BASE_COLOR = '#1971c2'
const BOUNCE_COLOR = '#26a69a'
const START_COLOR = '#f5c400'
const END_COLOR = '#e03131'

const CURRENT_YEAR = new Date().getFullYear()
const EARLIEST_YEAR = 2017
const YEARS = Array.from({ length: CURRENT_YEAR - EARLIEST_YEAR + 1 }, (_, i) => CURRENT_YEAR - i)

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

// Manual bounces are persisted as "lowTime:highTime" pairs — re-match them to
// the freshly fetched series by timestamp (array indices aren't stable across
// refetches, e.g. after a page reload).
const restoreManualBounces = (series, param) => {
  if (!param) return []
  const indexByTime = new Map(series.map((p, i) => [p.time, i]))
  return param
    .split(',')
    .map((pair) => {
      const [lowTime, highTime] = pair.split(':').map(Number)
      const lowIndex = indexByTime.get(lowTime)
      const highIndex = indexByTime.get(highTime)
      if (lowIndex == null || highIndex == null) return null
      const low = series[lowIndex]
      const high = series[highIndex]
      return {
        lowIndex,
        lowTime: low.time,
        lowPrice: low.close,
        highIndex,
        highTime: high.time,
        highPrice: high.close,
        percent: ((high.close - low.close) / low.close) * 100,
      }
    })
    .filter(Boolean)
}

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
        month: d.getMonth(),
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
      // December gets a darker band regardless of the alternating pattern, so
      // year boundaries stand out at a glance.
      ctx.fillStyle =
        g.month === 11
          ? 'rgba(128, 128, 128, 0.28)'
          : i % 2 === 0
            ? 'rgba(128, 128, 128, 0.05)'
            : 'rgba(128, 128, 128, 0.13)'
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

// Finds each date of every checked market event that falls within the queried
// series and maps it to the index of its closest point, so it can be
// positioned on the category (day-index) axis.
const computeEventMarkers = (points, checkedKeys) => {
  if (!points.length || !checkedKeys?.size) return []
  const from = points[0].time
  const to = points[points.length - 1].time
  const markers = []
  TRADE_MARKET_EVENTS.filter((event) => checkedKeys.has(event.key)).forEach((event) => {
    event.dates.forEach((dateStr) => {
      const t = new Date(`${dateStr}T00:00:00.000Z`).getTime()
      if (t < from || t > to) return
      let closest = 0
      let minDiff = Infinity
      points.forEach((p, i) => {
        const diff = Math.abs(p.time - t)
        if (diff < minDiff) {
          minDiff = diff
          closest = i
        }
      })
      markers.push({ index: closest, label: event.label })
    })
  })
  return markers
}

// Chart.js plugin: draws a dashed vertical line + label at each checked
// market event date that falls inside the current series.
const eventLinesPlugin = {
  id: 'eventLines',
  afterDraw(chart) {
    const markers = chart.config.options?.plugins?.eventLines?.markers
    if (!markers?.length) return
    const { ctx, chartArea, scales } = chart
    const x = scales.x
    ctx.save()
    markers.forEach((m) => {
      const px = x.getPixelForValue(m.index)
      ctx.strokeStyle = '#f7931a'
      ctx.setLineDash([4, 3])
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(px, chartArea.top)
      ctx.lineTo(px, chartArea.bottom)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#f7931a'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(m.label, px + 4, chartArea.top + 12)
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

// Chart.js plugin: draws a dashed horizontal line at the highest high and the
// lowest low of the queried date range, with a small price label on the left.
const minMaxLinesPlugin = {
  id: 'minMaxLines',
  afterDraw(chart) {
    const cfg = chart.config.options?.plugins?.minMaxLines
    if (!cfg || cfg.max == null || cfg.min == null) return
    const { ctx, chartArea, scales } = chart
    const y = scales.y
    ctx.save()
    ctx.strokeStyle = '#adb5bd'
    ctx.setLineDash([5, 4])
    ctx.lineWidth = 1
    ctx.fillStyle = '#868e96'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'left'
    ;[
      { price: cfg.max, label: 'Máx' },
      { price: cfg.min, label: 'Mín' },
    ].forEach(({ price, label }) => {
      const py = y.getPixelForValue(price)
      ctx.beginPath()
      ctx.moveTo(chartArea.left, py)
      ctx.lineTo(chartArea.right, py)
      ctx.stroke()
      ctx.fillText(`${label}: ${fmtUsd(price)}`, chartArea.left + 4, py - 4)
    })
    ctx.restore()
  },
}

export default function Bounces() {
  const { monthLabels } = useLocaleData()
  const {
    showViewModal,
    setShowViewModal,
    savedViews,
    saveViewFormKey,
    saveView,
    deleteView,
    loadView,
  } = useSavedViews(SAVED_VIEWS_KEY)

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

  const symbol = searchParams.get('symbol') || TRADE_PRICE_ASSETS[0].symbol
  const setSymbol = (v) => setParam('symbol', v)

  const mode = searchParams.get('mode') || 'auto' // 'auto' | 'manual'
  const setMode = (v) => setParam('mode', v)

  const dateMode = searchParams.get('dateMode') || 'range' // 'range' | 'month' | 'year'
  const setDateMode = (v) => setParam('dateMode', v)
  const rangeFrom = searchParams.get('from') || monthsAgoStr(6)
  const setRangeFrom = (v) => setParam('from', v)
  const rangeTo = searchParams.get('to') || todayStr()
  const setRangeTo = (v) => setParam('to', v)
  const [selectedYears, setSelectedYears] = useMultiParam(
    searchParams,
    setSearchParams,
    'years',
    Number,
  )
  const [selectedMonths, setSelectedMonths] = useMultiParam(
    searchParams,
    setSearchParams,
    'months',
    Number,
  )
  const minPercent = searchParams.get('minPercent') || 10
  const setMinPercent = (v) => setParam('minPercent', v)
  const [checkedEvents, setCheckedEvents] = useMultiParam(searchParams, setSearchParams, 'events')
  const toggleEvent = (key) =>
    setCheckedEvents((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  // Manual picks are arbitrary clicks, not derivable from the other filters,
  // so they're persisted as low/high timestamps (stable across refetches,
  // unlike array indices) instead of being recomputed like the auto bounces.
  const manualRangesParam = searchParams.get('manualRanges') || ''
  const setManualRangesParam = (list) =>
    setParam(
      'manualRanges',
      list.length ? list.map((b) => `${b.lowTime}:${b.highTime}`).join(',') : null,
    )

  const [series, setSeries] = useState([])
  const [autoBounces, setAutoBounces] = useState([])
  const [manualBounces, setManualBounces] = useState([])
  const [pendingLow, setPendingLow] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [queried, setQueried] = useState(false)
  const [hoverInfo, setHoverInfo] = useState(null)
  const chartRef = useRef(null)

  const bounces = mode === 'auto' ? autoBounces : manualBounces

  const asset = TRADE_PRICE_ASSETS.find((a) => a.symbol === symbol)

  // 'month'/'year' modes fetch the envelope spanning every selected year, then
  // narrow further by the selected years/months after fetching — a multiselect
  // can't collapse to one contiguous date range the way a single picker could.
  const realSelectedYears = [...selectedYears].filter(
    (y) => typeof y === 'number' && !Number.isNaN(y),
  )
  const yearsInScope = realSelectedYears.length > 0 ? realSelectedYears : YEARS
  const minYear = Math.min(...yearsInScope)
  const maxYear = Math.max(...yearsInScope)

  const { dateFrom, dateTo } =
    dateMode === 'year' || dateMode === 'month'
      ? {
          dateFrom: `${minYear}-01-01`,
          dateTo: maxYear === CURRENT_YEAR ? todayStr() : `${maxYear}-12-31`,
        }
      : { dateFrom: rangeFrom, dateTo: rangeTo }

  const invalid = !dateFrom || !dateTo || dateFrom > dateTo || !(Number(minPercent) > 0)

  const handleQuery = async () => {
    if (invalid) return
    setLoading(true)
    setError(null)
    try {
      const startTime = new Date(`${dateFrom}T00:00:00.000Z`).getTime()
      const endTime = new Date(`${dateTo}T23:59:59.999Z`).getTime()
      const data = await fetchPriceSeries(symbol, '1d', startTime, endTime)
      const filtered =
        dateMode === 'range'
          ? data
          : data.filter((p) => {
              const d = new Date(p.time)
              const yearOk = selectedYears.size === 0 || selectedYears.has(d.getFullYear())
              const monthOk =
                dateMode !== 'month' ||
                selectedMonths.size === 0 ||
                selectedMonths.has(d.getMonth() + 1)
              return yearOk && monthOk
            })
      setSeries(filtered)
      setAutoBounces(detectBounces(filtered, Number(minPercent)))
      setManualBounces(restoreManualBounces(filtered, manualRangesParam))
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
    const next = [
      ...manualBounces,
      {
        lowIndex: pendingLow,
        lowTime: low.time,
        lowPrice: low.close,
        highIndex: index,
        highTime: high.time,
        highPrice: high.close,
        percent: ((high.close - low.close) / low.close) * 100,
      },
    ]
    setManualBounces(next)
    setManualRangesParam(next)
    setPendingLow(null)
  }

  const clearManualSelection = () => {
    setManualBounces([])
    setManualRangesParam([])
    setPendingLow(null)
  }

  const deleteRange = (id) => {
    if (mode === 'auto') {
      setAutoBounces((prev) => prev.filter((_, i) => i !== id))
    } else {
      const next = manualBounces.filter((_, i) => i !== id)
      setManualBounces(next)
      setManualRangesParam(next)
    }
  }

  // Shows date/price in a fixed bar above the chart instead of a tooltip that
  // follows the cursor — the floating tooltip got in the way while clicking
  // points in manual mode.
  const handleChartHover = (e) => {
    if (!chartRef.current) return
    const elements = chartRef.current.getElementsAtEventForMode(
      e,
      'index',
      { intersect: false },
      true,
    )
    if (!elements.length) {
      setHoverInfo(null)
      return
    }
    const p = series[elements[0].index]
    if (!p) return
    setHoverInfo({ date: fmtDate(p.time), price: p.close })
  }

  const rangesData = bounces.map((b, i) => ({
    id: i,
    lowDate: fmtDate(b.lowTime),
    lowPrice: b.lowPrice,
    highDate: fmtDate(b.highTime),
    highPrice: b.highPrice,
    percent: b.percent,
  }))

  const isBounceSegment = (i0, i1) => bounces.some((b) => b.lowIndex <= i0 && i1 <= b.highIndex)
  const boundaryColor = (i) => {
    if (pendingLow === i) return START_COLOR
    if (bounces.some((b) => b.lowIndex === i)) return START_COLOR
    if (bounces.some((b) => b.highIndex === i)) return END_COLOR
    return null
  }

  const monthGroups = computeMonthGroups(series)
  const maxPrice = series.length ? Math.max(...series.map((p) => p.high)) : null
  const minPrice = series.length ? Math.min(...series.map((p) => p.low)) : null
  const eventMarkers = computeEventMarkers(series, checkedEvents)

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
      <div className="bounces-chart__top">
        <div className="bounces-chart__top-left">
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

          <div className="bounces-chart__date-mode-group">
            <button
              type="button"
              className={`bounces-chart__date-mode-btn${dateMode === 'range' ? ' bounces-chart__date-mode-btn--active' : ''}`}
              onClick={() => setDateMode('range')}
            >
              Rango de fechas
            </button>
            <button
              type="button"
              className={`bounces-chart__date-mode-btn${dateMode === 'month' ? ' bounces-chart__date-mode-btn--active' : ''}`}
              onClick={() => setDateMode('month')}
            >
              Año y mes
            </button>
            <button
              type="button"
              className={`bounces-chart__date-mode-btn${dateMode === 'year' ? ' bounces-chart__date-mode-btn--active' : ''}`}
              onClick={() => setDateMode('year')}
            >
              Año
            </button>
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
            {dateMode === 'range' ? (
              <>
                <div className="bounces-chart__field">
                  <label className="bounces-chart__label">Desde</label>
                  <input
                    type="date"
                    className="bounces-chart__input"
                    value={rangeFrom}
                    max={rangeTo}
                    onChange={(e) => setRangeFrom(e.target.value)}
                  />
                </div>
                <div className="bounces-chart__field">
                  <label className="bounces-chart__label">Hasta</label>
                  <input
                    type="date"
                    className="bounces-chart__input"
                    value={rangeTo}
                    min={rangeFrom}
                    max={todayStr()}
                    onChange={(e) => setRangeTo(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="bounces-chart__field">
                  <label className="bounces-chart__label">Año</label>
                  <MultiSelectDropdown
                    label={(size) => (size > 0 ? `Año (${size})` : 'Año: Todos')}
                    options={YEARS.map((y) => ({ value: y, label: String(y) }))}
                    selected={selectedYears}
                    onToggle={(value) =>
                      setSelectedYears((prev) => {
                        const next = new Set(prev)
                        next.has(value) ? next.delete(value) : next.add(value)
                        return next
                      })
                    }
                    onClearAll={() => setSelectedYears(new Set())}
                  />
                </div>
                {dateMode === 'month' && (
                  <div className="bounces-chart__field">
                    <label className="bounces-chart__label">Mes</label>
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
                )}
              </>
            )}
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
              <button
                type="button"
                className="bounces-chart__clear-btn"
                onClick={clearManualSelection}
              >
                Limpiar selección
              </button>
            )}
            <button
              type="button"
              className="bounces-chart__view-btn"
              onClick={() => setShowViewModal(true)}
            >
              ⭐ Vista
            </button>
          </div>

          {mode === 'manual' && queried && (
            <p className="bounces-chart__hint">
              {pendingLow === null
                ? 'Hacé clic en el punto mínimo (inicio) del rebote.'
                : 'Hacé clic en el punto máximo (final) del rebote.'}
            </p>
          )}
        </div>

        <div className="bounces-chart__right">
          <div className="bounces-chart__events">
            <p className="bounces-chart__ranges-title">Eventos</p>
            {TRADE_MARKET_EVENTS.map((ev) => (
              <label key={ev.key} className="bounces-chart__event-item">
                <input
                  type="checkbox"
                  checked={checkedEvents.has(ev.key)}
                  onChange={() => toggleEvent(ev.key)}
                />
                <span className="bounces-chart__event-label">{ev.label}</span>
                <span className="bounces-chart__ranges-muted">
                  {ev.dates
                    .map((d) => fmtDate(new Date(`${d}T00:00:00.000Z`).getTime()))
                    .join(', ')}
                </span>
              </label>
            ))}
          </div>

          {queried && (
            <div className="bounces-chart__ranges">
              <p className="bounces-chart__ranges-title">Rangos actuales</p>
              {rangesData.length === 0 ? (
                <p className="bounces-chart__empty">Sin rebotes en el rango actual.</p>
              ) : (
                <table className="bounces-chart__ranges-table">
                  <thead>
                    <tr>
                      <th>Inicio</th>
                      <th>Fin</th>
                      <th>%</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rangesData.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <div>{r.lowDate}</div>
                          <div className="bounces-chart__ranges-muted">{fmtUsd(r.lowPrice)}</div>
                        </td>
                        <td>
                          <div>{r.highDate}</div>
                          <div className="bounces-chart__ranges-muted">{fmtUsd(r.highPrice)}</div>
                        </td>
                        <td className="bounces-chart__ranges-percent">+{r.percent.toFixed(1)}%</td>
                        <td>
                          <button
                            type="button"
                            className="bounces-chart__ranges-delete"
                            title="Eliminar rango"
                            onClick={() => deleteRange(r.id)}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {error && <p className="bounces-chart__error">{error}</p>}

      {queried && !loading && !error && (
        <>
          {series.length === 0 ? (
            <p className="bounces-chart__empty">No hay datos para ese rango.</p>
          ) : (
            <>
              <p className="bounces-chart__hover-info">
                {hoverInfo
                  ? `${hoverInfo.date} · ${fmtUsd(hoverInfo.price)}`
                  : 'Pasá el mouse sobre el gráfico para ver precio y fecha.'}
              </p>
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
                  customTooltips={false}
                  style={{ height: 360, cursor: mode === 'manual' ? 'crosshair' : 'default' }}
                  data={chartData}
                  plugins={[
                    monthGroupPlugin,
                    minMaxLinesPlugin,
                    eventLinesPlugin,
                    bounceLabelsPlugin,
                  ]}
                  onClick={handleChartClick}
                  onMouseMove={handleChartHover}
                  onMouseLeave={() => setHoverInfo(null)}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: mode === 'manual' ? false : undefined,
                    layout: { padding: { top: monthGroups.length ? 30 : 0 } },
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                      legend: { display: false },
                      monthGroups: { groups: monthGroups },
                      minMaxLines: { max: maxPrice, min: minPrice },
                      eventLines: { markers: eventMarkers },
                      bounceLabels: { markers: bounces },
                      tooltip: { enabled: false },
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
            </>
          )}
          {mode === 'auto' && series.length > 0 && bounces.length === 0 && (
            <p className="bounces-chart__empty">
              No se detectaron rebotes ≥ {minPercent}% en ese rango.
            </p>
          )}
        </>
      )}

      {showViewModal && (
        <AppModal
          visible
          onClose={() => setShowViewModal(false)}
          variant="center"
          size="md"
          title="Vistas guardadas"
          subtitle="Guardá los filtros actuales del gráfico con un nombre, para volver a ellos después."
        >
          <SaveViewForm key={saveViewFormKey} onSave={saveView} />
          <SavedViewsList views={savedViews} onLoad={loadView} onDelete={deleteView} />
        </AppModal>
      )}
    </div>
  )
}
