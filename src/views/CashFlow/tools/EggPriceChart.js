import React, { useState, useMemo } from 'react'
import { CChartLine } from '@coreui/react-chartjs'
import { computeDistribution, parseRangeFromName } from './salaryUtils'

const LINE_COLORS = [
  '#1971c2',
  '#e03131',
  '#2f9e44',
  '#f59f00',
  '#7c3aed',
  '#0ca678',
  '#d6336c',
  '#1098ad',
  '#e67700',
  '#5c7cfa',
]

// Extract midpoint X from a distribution name
const extractX = (name) => {
  if (!name) return null
  const r = parseRangeFromName(name)
  if (r) {
    if (r.type === 'lt') return r.value
    if (r.type === 'gt') return r.value
    if (r.type === 'between') return (r.min + r.max) / 2
  }
  const lt = name.match(/<\s*(\d+)/)
  if (lt) return Number(lt[1])
  const gt = name.match(/>\s*(\d+)/)
  if (gt) return Number(gt[1])
  const between = name.match(/(\d+)\s*-\s*(\d+)/)
  if (between) return (Number(between[1]) + Number(between[2])) / 2
  return null
}

// Extract full [xMin, xMax] range from a distribution name
const extractRange = (name, globalMin, globalMax) => {
  if (!name) return null
  const r = parseRangeFromName(name)
  if (r) {
    if (r.type === 'lt') return [globalMin, r.value]
    if (r.type === 'gt') return [r.value, globalMax]
    if (r.type === 'between') return [r.min, r.max]
  }
  const lt = name.match(/<\s*(\d+)/)
  if (lt) return [globalMin, Number(lt[1])]
  const gt = name.match(/>\s*(\d+)/)
  if (gt) return [Number(gt[1]), globalMax]
  const between = name.match(/(\d+)\s*-\s*(\d+)/)
  if (between) return [Number(between[1]), Number(between[2])]
  return null
}

const amountByTarget = (d) => {
  const dist = computeDistribution(d.salary, d.invert, d.rows)
  const totals = {}
  for (const r of dist) {
    const key = r.target || ''
    totals[key] = (totals[key] ?? 0) + (r.amount || 0)
  }
  return totals
}

export default function EggPriceChart({ distributions }) {
  const [visible, setVisible] = useState({})
  const [rangeMode, setRangeMode] = useState(false)

  const isVisible = (t) => visible[t] !== false
  const toggle = (t) => setVisible((v) => ({ ...v, [t]: !isVisible(t) }))

  // ── Point mode data ──────────────────────────────────────────────────────────
  const pointData = useMemo(() => {
    if (!distributions?.length) return { points: [], targets: [] }
    const pts = distributions
      .map((d) => {
        const x = extractX(d.name)
        if (x === null) return null
        return { x, label: `${x}K`, totals: amountByTarget(d) }
      })
      .filter(Boolean)
      .sort((a, b) => a.x - b.x)

    const seen = new Set()
    const tgts = []
    for (const pt of pts) {
      for (const key of Object.keys(pt.totals)) {
        if (key && !seen.has(key)) {
          seen.add(key)
          tgts.push(key)
        }
      }
    }
    return { points: pts, targets: tgts }
  }, [distributions])

  // ── Range mode data ──────────────────────────────────────────────────────────
  const rangeData = useMemo(() => {
    if (!distributions?.length) return { segments: [], targets: [] }

    // First pass: gather all X boundaries to compute global min/max
    const boundaries = []
    for (const d of distributions) {
      const x = extractX(d.name)
      if (x !== null) boundaries.push(x)
    }
    const globalMin = Math.max(0, Math.min(...boundaries) - 10)
    const globalMax = Math.max(...boundaries) + 10

    const segs = distributions
      .map((d) => {
        const rng = extractRange(d.name, globalMin, globalMax)
        if (!rng) return null
        return { range: rng, label: d.name, totals: amountByTarget(d) }
      })
      .filter(Boolean)
      .sort((a, b) => a.range[0] - b.range[0])

    const seen = new Set()
    const tgts = []
    for (const s of segs) {
      for (const key of Object.keys(s.totals)) {
        if (key && !seen.has(key)) {
          seen.add(key)
          tgts.push(key)
        }
      }
    }
    return { segments: segs, targets: tgts }
  }, [distributions])

  const targets = rangeMode ? rangeData.targets : pointData.targets

  if (!pointData.points.length) return null

  // ── Build Chart.js datasets ──────────────────────────────────────────────────
  let chartData
  let xScaleOpts

  if (rangeMode) {
    // Linear X axis — two points per segment to form a step
    const { segments } = rangeData
    const datasets = targets.map((target, i) => {
      const pts = []
      for (const seg of segments) {
        const y = seg.totals[target] ?? null
        pts.push({ x: seg.range[0], y })
        pts.push({ x: seg.range[1], y })
      }
      return {
        label: target,
        data: pts,
        borderColor: LINE_COLORS[i % LINE_COLORS.length],
        backgroundColor: LINE_COLORS[i % LINE_COLORS.length] + '18',
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0,
        spanGaps: false,
        hidden: !isVisible(target),
      }
    })
    chartData = { datasets }
    xScaleOpts = {
      type: 'linear',
      title: { display: true, text: 'Precio del huevo (K)', font: { size: 11 } },
      grid: { display: false },
      ticks: { callback: (v) => `${v}K` },
    }
  } else {
    // Categorical X axis — one point per distribution at midpoint
    const { points } = pointData
    const datasets = targets.map((target, i) => ({
      label: target,
      data: points.map((p) => p.totals[target] ?? null),
      borderColor: LINE_COLORS[i % LINE_COLORS.length],
      backgroundColor: LINE_COLORS[i % LINE_COLORS.length] + '18',
      borderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0.3,
      spanGaps: false,
      hidden: !isVisible(target),
    }))
    chartData = { labels: points.map((p) => p.label), datasets }
    xScaleOpts = {
      title: { display: true, text: 'Precio del huevo (K)', font: { size: 11 } },
      grid: { display: false },
    }
  }

  return (
    <div
      style={{
        marginTop: 24,
        marginBottom: 8,
        border: '1px solid var(--cui-border-color)',
        borderRadius: 10,
        background: 'var(--cui-body-bg)',
        overflow: 'hidden',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--cui-border-color)',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--cui-body-color)' }}>
          🥚 Distribución por precio del huevo
        </span>

        {/* Range mode toggle */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            userSelect: 'none',
            color: rangeMode ? '#1971c2' : 'var(--cui-secondary-color)',
            borderLeft: '1px solid var(--cui-border-color)',
            paddingLeft: 12,
          }}
        >
          <input
            type="checkbox"
            checked={rangeMode}
            onChange={(e) => setRangeMode(e.target.checked)}
            style={{ accentColor: '#1971c2', width: 14, height: 14, cursor: 'pointer' }}
          />
          Ver rangos
        </label>

        <div style={{ width: 1, height: 18, background: 'var(--cui-border-color)' }} />

        {/* Target toggles */}
        {targets.map((t, i) => (
          <label
            key={t}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              userSelect: 'none',
              color: isVisible(t)
                ? LINE_COLORS[i % LINE_COLORS.length]
                : 'var(--cui-secondary-color)',
              opacity: isVisible(t) ? 1 : 0.45,
              transition: 'opacity 0.15s',
            }}
          >
            <input
              type="checkbox"
              checked={isVisible(t)}
              onChange={() => toggle(t)}
              style={{
                accentColor: LINE_COLORS[i % LINE_COLORS.length],
                width: 14,
                height: 14,
                cursor: 'pointer',
              }}
            />
            {t}
          </label>
        ))}
      </div>

      {/* ── Chart ── */}
      <div style={{ padding: '12px 16px 16px' }}>
        <CChartLine
          key={rangeMode ? 'range' : 'point'}
          style={{ height: 280 }}
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: rangeMode ? 'nearest' : 'index', intersect: false },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  title: (items) =>
                    rangeMode
                      ? `Precio: ${items[0]?.parsed?.x}K`
                      : `Precio huevo: ${items[0]?.label}`,
                  label: (ctx) => {
                    if (ctx.parsed.y === null) return null
                    return ` ${ctx.dataset.label}: $${Number(ctx.parsed.y).toLocaleString('es-CO')}`
                  },
                },
              },
            },
            scales: {
              x: xScaleOpts,
              y: {
                title: { display: true, text: 'Monto (COP)', font: { size: 11 } },
                ticks: {
                  callback: (v) =>
                    v >= 1000
                      ? `$${(v / 1000).toFixed(0)}M`
                      : `$${Number(v).toLocaleString('es-CO')}`,
                },
              },
            },
          }}
        />
      </div>
    </div>
  )
}
