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

// Handles both "(50-60)" style and bare "Inversion 50-60" / "Inversion <50" names
const extractX = (name) => {
  if (!name) return null
  // Try the standard parser first (parenthesised ranges)
  const r = parseRangeFromName(name)
  if (r) {
    if (r.type === 'lt') return r.value
    if (r.type === 'gt') return r.value
    if (r.type === 'between') return (r.min + r.max) / 2
  }
  // Fallback: bare range in the name — "< 50", "> 100", "50-60", "50 - 60"
  const lt = name.match(/<\s*(\d+)/)
  if (lt) return Number(lt[1])
  const gt = name.match(/>\s*(\d+)/)
  if (gt) return Number(gt[1])
  const between = name.match(/(\d+)\s*-\s*(\d+)/)
  if (between) return (Number(between[1]) + Number(between[2])) / 2
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

  const { points, targets } = useMemo(() => {
    if (!distributions?.length) return { points: [], targets: [] }

    // Build X points from distributions that have a range in their name
    const pts = distributions
      .map((d) => {
        const x = extractX(d.name)
        if (x === null) return null
        return { x, label: `${x}K`, totals: amountByTarget(d), name: d.name }
      })
      .filter(Boolean)
      .sort((a, b) => a.x - b.x)

    // Collect unique non-empty targets preserving order
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

  const isVisible = (t) => visible[t] !== false

  const toggle = (t) => setVisible((v) => ({ ...v, [t]: !isVisible(t) }))

  if (!points.length) return null

  const labels = points.map((p) => p.label)

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
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--cui-border-color)',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <span
          style={{ fontSize: 13, fontWeight: 700, color: 'var(--cui-body-color)', marginRight: 4 }}
        >
          🥚 Distribución por precio del huevo
        </span>
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
              color: isVisible(t)
                ? LINE_COLORS[i % LINE_COLORS.length]
                : 'var(--cui-secondary-color)',
              userSelect: 'none',
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

      {/* Chart */}
      <div style={{ padding: '12px 16px 16px' }}>
        <CChartLine
          style={{ height: 280 }}
          data={{ labels, datasets }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  title: (items) => `Precio huevo: ${items[0]?.label}`,
                  label: (ctx) => {
                    if (ctx.parsed.y === null) return null
                    return ` ${ctx.dataset.label}: $${Number(ctx.parsed.y).toLocaleString('es-CO')}`
                  },
                },
              },
            },
            scales: {
              x: {
                title: { display: true, text: 'Precio del huevo (K)', font: { size: 11 } },
                grid: { display: false },
              },
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
