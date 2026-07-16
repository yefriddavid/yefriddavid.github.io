import React, { useMemo, useState } from 'react'
import { fmt, fmtCompact } from 'src/utils/formatters'
import { TYPES } from './assetConstants'
import './AssetsAnalytics.scss'

const TYPE_LABEL = { financial: 'Financiero', fixed: 'Fijo', crypto: 'Cripto' }
// Validated categorical triple (CVD-safe, both themes) — chart-only, distinct
// from the app-wide ASSET_TYPE_COLOR badge colors which are tuned for text,
// not filled chart marks. Resolved via CSS custom properties so dark mode
// swaps automatically — see AssetsAnalytics.scss.
const TYPE_CHART_COLOR = {
  financial: 'var(--aa-type-financial)',
  fixed: 'var(--aa-type-fixed)',
  crypto: 'var(--aa-type-crypto)',
}

const pct = (value, total) => (total > 0 ? (value / total) * 100 : 0)

// Hand-rolled SVG donut — part-to-whole by type. viewBox is a 100×100 square
// so trig-computed label/tooltip positions map 1:1 to CSS percentages.
const TypeDonut = ({ segments, total, hovered, onHover }) => {
  const R = 40
  const STROKE = 16
  const C = 2 * Math.PI * R
  const GAP = segments.length > 1 ? 3 : 0

  let cumulative = 0
  const arcs = segments.map((s) => {
    const frac = s.value / total
    const dash = Math.max(frac * C - GAP, 0)
    const offset = -(cumulative * C)
    const midAngle = ((-90 + (cumulative + frac / 2) * 360) * Math.PI) / 180
    cumulative += frac
    return {
      ...s,
      dash,
      offset,
      x: 50 + R * Math.cos(midAngle),
      y: 50 + R * Math.sin(midAngle),
    }
  })

  return (
    <div className="assets-analytics__donut-wrap">
      <svg viewBox="0 0 100 100" className="assets-analytics__donut">
        <circle
          cx="50"
          cy="50"
          r={R}
          className="assets-analytics__donut-track"
          strokeWidth={STROKE}
        />
        {arcs.map((s, i) => (
          <circle
            key={s.type}
            cx="50"
            cy="50"
            r={R}
            strokeWidth={hovered === s.type ? STROKE + 3 : STROKE}
            tabIndex={0}
            className="assets-analytics__donut-seg"
            style={{
              '--seg-color': TYPE_CHART_COLOR[s.type] ?? 'var(--aa-type-other)',
              strokeDasharray: `${s.dash} ${C - s.dash}`,
              strokeDashoffset: s.offset,
              opacity: hovered && hovered !== s.type ? 0.4 : 1,
              animationDelay: `${i * 120}ms`,
            }}
            onMouseEnter={() => onHover(s.type)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(s.type)}
            onBlur={() => onHover(null)}
          />
        ))}
      </svg>
      <div className="assets-analytics__donut-center">
        <div className="assets-analytics__donut-center-label">TOTAL</div>
        <div className="assets-analytics__donut-center-value">{fmtCompact(total)}</div>
      </div>
      {arcs.map((s) =>
        hovered === s.type ? (
          <div
            key={s.type}
            className="assets-analytics__donut-tooltip"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
          >
            <strong>{fmt(s.value)}</strong>
            <span>
              {TYPE_LABEL[s.type] ?? s.type} · {pct(s.value, total).toFixed(1)}%
            </span>
          </div>
        ) : null,
      )}
    </div>
  )
}

const RankedBars = ({ rows, hue, labelKey = 'label', total }) => {
  const max = Math.max(...rows.map((r) => r.value), 1)
  return (
    <div className="assets-analytics__ranked">
      {rows.map((r, i) => (
        <div
          key={r[labelKey]}
          className="assets-analytics__bar-row"
          tabIndex={0}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <span className="assets-analytics__bar-label">{r[labelKey]}</span>
          <span className="assets-analytics__bar-track">
            <span
              className={`assets-analytics__bar-fill assets-analytics__bar-fill--${hue}`}
              style={{ '--bar-pct': `${(r.value / max) * 100}%` }}
            />
          </span>
          <span className="assets-analytics__bar-value">{fmtCompact(r.value)}</span>
          <div className="assets-analytics__tooltip">
            <strong>{fmt(r.value)}</strong>
            <span>{pct(r.value, total).toFixed(1)}% del portafolio</span>
          </div>
        </div>
      ))}
    </div>
  )
}

const StatTile = ({ label, value, tone }) => (
  <div className={`assets-analytics__stat ${tone ? `assets-analytics__stat--${tone}` : ''}`}>
    <div className="assets-analytics__stat-label">{label}</div>
    <div className="assets-analytics__stat-value">{value}</div>
  </div>
)

const MeterTile = ({ label, value }) => (
  <div className="assets-analytics__stat">
    <div className="assets-analytics__stat-label">{label}</div>
    <div className="assets-analytics__meter">
      <span className="assets-analytics__meter-track">
        <span
          className="assets-analytics__meter-fill"
          style={{ '--meter-pct': `${Math.min(value, 100)}%` }}
        />
      </span>
      <span className="assets-analytics__meter-value">{value.toFixed(0)}%</span>
    </div>
  </div>
)

export default function AssetsAnalytics({ assets }) {
  const [showTable, setShowTable] = useState(false)
  const [hoveredType, setHoveredType] = useState(null)

  const active = useMemo(() => assets.filter((a) => !a.archived), [assets])

  const valueOf = (a) => (Number(a.quantity) || 0) * (Number(a.unitPrice) || 0)

  const total = useMemo(() => active.reduce((s, a) => s + valueOf(a), 0), [active])

  const byType = useMemo(() => {
    const map = {}
    active.forEach((a) => {
      map[a.type] = (map[a.type] || 0) + valueOf(a)
    })
    return TYPES.map((t) => ({ type: t, value: map[t] || 0 })).filter((x) => x.value > 0)
  }, [active])

  const byLocation = useMemo(() => {
    const map = {}
    active.forEach((a) => {
      const key = a.location || 'sin ubicación'
      map[key] = (map[key] || 0) + valueOf(a)
    })
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .filter((x) => x.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 7)
  }, [active])

  const topHoldings = useMemo(
    () =>
      active
        .map((a) => ({ label: a.name, value: valueOf(a) }))
        .filter((x) => x.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 7),
    [active],
  )

  const liquidValue = useMemo(
    () => active.filter((a) => a.liquid).reduce((s, a) => s + valueOf(a), 0),
    [active],
  )
  const liquidPct = pct(liquidValue, total)
  const monthlyGain = useMemo(
    () => active.reduce((s, a) => s + (Number(a.monthlyGain) || 0), 0),
    [active],
  )

  if (total === 0) {
    return (
      <div className="assets-analytics">
        <div className="assets-analytics__empty">Sin datos para graficar todavía.</div>
      </div>
    )
  }

  return (
    <div className="assets-analytics">
      <div className="assets-analytics__kpis">
        <StatTile label="PORTAFOLIO TOTAL" value={fmt(total)} />
        <StatTile
          label="GANANCIA MENSUAL"
          value={fmt(monthlyGain)}
          tone={monthlyGain > 0 ? 'good' : undefined}
        />
        <MeterTile label="LIQUIDEZ" value={liquidPct} />
      </div>

      <div className="assets-analytics__panel">
        <div className="assets-analytics__panel-head">
          <h3 className="assets-analytics__panel-title">Composición por tipo</h3>
          <button
            className="assets-analytics__table-toggle"
            onClick={() => setShowTable((v) => !v)}
          >
            {showTable ? '📊 Ver gráfica' : '📋 Ver tabla'}
          </button>
        </div>

        {showTable ? (
          <table className="assets-analytics__table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Ubicación</th>
                <th>Valor</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {byType.map((t) => (
                <tr key={t.type}>
                  <td>{TYPE_LABEL[t.type] ?? t.type}</td>
                  <td />
                  <td>{fmt(t.value)}</td>
                  <td>{pct(t.value, total).toFixed(1)}%</td>
                </tr>
              ))}
              {byLocation.map((l) => (
                <tr key={l.label}>
                  <td />
                  <td>{l.label}</td>
                  <td>{fmt(l.value)}</td>
                  <td>{pct(l.value, total).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="assets-analytics__donut-row">
            <TypeDonut
              segments={byType}
              total={total}
              hovered={hoveredType}
              onHover={setHoveredType}
            />
            <div className="assets-analytics__legend assets-analytics__legend--col">
              {byType.map((t) => (
                <div
                  key={t.type}
                  className={`assets-analytics__legend-item ${hoveredType && hoveredType !== t.type ? 'assets-analytics__legend-item--dim' : ''}`}
                  tabIndex={0}
                  onMouseEnter={() => setHoveredType(t.type)}
                  onMouseLeave={() => setHoveredType(null)}
                  onFocus={() => setHoveredType(t.type)}
                  onBlur={() => setHoveredType(null)}
                >
                  <span
                    className="assets-analytics__legend-swatch"
                    style={{ background: TYPE_CHART_COLOR[t.type] ?? 'var(--aa-type-other)' }}
                  />
                  <span className="assets-analytics__legend-label">
                    {TYPE_LABEL[t.type] ?? t.type}
                  </span>
                  <span className="assets-analytics__legend-value">{fmt(t.value)}</span>
                  <span className="assets-analytics__legend-pct">
                    {pct(t.value, total).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!showTable && (
        <div className="assets-analytics__grid-2">
          <div className="assets-analytics__panel">
            <div className="assets-analytics__panel-head">
              <h3 className="assets-analytics__panel-title">Por ubicación</h3>
            </div>
            <RankedBars rows={byLocation} hue="blue" total={total} />
          </div>
          <div className="assets-analytics__panel">
            <div className="assets-analytics__panel-head">
              <h3 className="assets-analytics__panel-title">Mayores posiciones</h3>
            </div>
            <RankedBars rows={topHoldings} hue="green" total={total} />
          </div>
        </div>
      )}
    </div>
  )
}
