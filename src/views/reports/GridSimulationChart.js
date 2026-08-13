import React, { useRef, useState } from 'react'
import { fmtPrice, fmtUSD } from './gridSimulationHelpers'

const ROW_H = 46
const MARGIN_X = 92
const MARGIN_RIGHT = 78
const MARGIN_Y = 34
const W = 900
// Clean gap left of the wave's start so it doesn't begin right on top of the
// level dots/price labels at MARGIN_X.
const WAVE_GAP = 60

const GridSimulationChart = ({
  levels,
  upper,
  lower,
  centerPrice,
  points,
  markers,
  pairs,
  perGrid,
  onLevelChange,
  onMarkerChange,
}) => {
  const gridCount = levels.length - 1
  const H = gridCount * ROW_H + MARGIN_Y * 2
  const waveStartX = MARGIN_X + WAVE_GAP
  const waveW = W - MARGIN_RIGHT - waveStartX
  const svgRef = useRef(null)
  const [dragLevelIndex, setDragLevelIndex] = useState(null)
  const [dragMarkerIndex, setDragMarkerIndex] = useState(null)

  const toY = (price) =>
    MARGIN_Y + (H - 2 * MARGIN_Y) - ((price - lower) / (upper - lower)) * (H - 2 * MARGIN_Y)
  // Only the wave path/markers/connectors use toX — the grid lines span the
  // full width via MARGIN_X/MARGIN_RIGHT directly, so shifting this alone
  // moves where the wave begins without touching anything else.
  const toX = (frac) => waveStartX + frac * waveW

  // Inverse of toY — maps a mouse clientY (via the SVG's rendered bounding
  // box, since viewBox scaling differs from actual pixel size) back to price.
  const clientYToPrice = (clientY) => {
    const rect = svgRef.current.getBoundingClientRect()
    const svgY = ((clientY - rect.top) / rect.height) * H
    const frac = 1 - (svgY - MARGIN_Y) / (H - 2 * MARGIN_Y)
    return lower + frac * (upper - lower)
  }

  // Markers only slide along the fixed wave — never off it — so a drag finds
  // the closest sampled point on the curve to the cursor instead of placing
  // the marker at the cursor's raw (frac, price).
  const nearestOnCurve = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect()
    const mx = ((clientX - rect.left) / rect.width) * W
    const my = ((clientY - rect.top) / rect.height) * H
    let best = points[0]
    let bestDist = Infinity
    for (const p of points) {
      const dx = toX(p.frac) - mx
      const dy = toY(p.price) - my
      const dist = dx * dx + dy * dy
      if (dist < bestDist) {
        bestDist = dist
        best = p
      }
    }
    return best
  }

  const startLevelDrag = (index) => (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragLevelIndex(index)
  }

  const onLevelDrag = (index) => (e) => {
    if (dragLevelIndex !== index) return
    const lo = index > 0 ? levels[index - 1] : lower
    const hi = index < levels.length - 1 ? levels[index + 1] : upper
    const gap = (upper - lower) * 0.01
    const price = Math.min(Math.max(clientYToPrice(e.clientY), lo + gap), hi - gap)
    onLevelChange(index, price)
  }

  const startMarkerDrag = (index) => (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragMarkerIndex(index)
  }

  const onMarkerDrag = (index) => (e) => {
    if (dragMarkerIndex !== index) return
    const { frac, price } = nearestOnCurve(e.clientX, e.clientY)
    onMarkerChange(index, { frac, price })
  }

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.frac)},${toY(p.price)}`)
    .join(' ')

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="gts-chart__svg">
      {levels.map((price, i) => {
        const isSellLevel = price > centerPrice
        const color = isSellLevel ? 'var(--gts-sell)' : 'var(--gts-buy)'
        const y = toY(price)
        return (
          <g key={i}>
            <line
              x1={MARGIN_X}
              y1={y}
              x2={W - MARGIN_RIGHT}
              y2={y}
              stroke={color}
              strokeDasharray="7,5"
              strokeWidth={1.4}
              opacity={0.85}
            />
            {i < gridCount && perGrid > 0 && (
              <text
                x={W - MARGIN_RIGHT + 6}
                y={y + ROW_H / 2 + 3}
                fontSize={9}
                fill="var(--cui-secondary-color)"
              >
                {fmtUSD(perGrid)}/grid
              </text>
            )}
            <text
              x={MARGIN_X}
              y={y - 12}
              fontSize={11}
              fontWeight={700}
              fill={color}
              textAnchor="middle"
            >
              {fmtPrice(price)}
            </text>
            <circle
              className="gts-chart__handle"
              cx={MARGIN_X}
              cy={y}
              r={dragLevelIndex === i ? 8 : 6}
              fill={color}
              stroke="var(--cui-body-bg)"
              strokeWidth={1.5}
              onPointerDown={startLevelDrag(i)}
              onPointerMove={onLevelDrag(i)}
              onPointerUp={() => setDragLevelIndex(null)}
            />
          </g>
        )
      })}

      <text
        x={W - MARGIN_RIGHT}
        y={MARGIN_Y - 14}
        fontSize={12}
        fontWeight={700}
        fill="var(--gts-sell)"
        textAnchor="end"
      >
        higher Price
      </text>
      <text
        x={W - MARGIN_RIGHT}
        y={H - MARGIN_Y + 20}
        fontSize={12}
        fontWeight={700}
        fill="var(--gts-buy)"
        textAnchor="end"
      >
        Lower Price
      </text>

      <line
        x1={MARGIN_X}
        y1={toY(centerPrice)}
        x2={W - MARGIN_RIGHT}
        y2={toY(centerPrice)}
        stroke="var(--cui-secondary-color)"
        strokeWidth={1.5}
      />

      <path d={pathD} fill="none" stroke="var(--gts-wave)" strokeWidth={2} opacity={0.9} />

      {pairs.map(([buy, sell], i) => (
        <line
          key={i}
          x1={toX(buy.frac)}
          y1={toY(buy.price)}
          x2={toX(sell.frac)}
          y2={toY(sell.price)}
          stroke="var(--gts-connector)"
          strokeWidth={1}
          strokeDasharray="3,3"
          opacity={0.7}
        />
      ))}

      {markers.map((m, i) => {
        const x = toX(m.frac)
        const y = toY(m.price)
        const isBuy = m.type === 'buy'
        const color = isBuy ? 'var(--gts-buy)' : 'var(--gts-sell)'
        return (
          <g key={i}>
            <text
              x={x + (isBuy ? -8 : 8)}
              y={y + 3}
              fontSize={10}
              fontWeight={700}
              fill={color}
              textAnchor={isBuy ? 'end' : 'start'}
            >
              {isBuy ? 'Buy' : 'Sell'}
            </text>
            <circle
              cx={x}
              cy={y}
              r={4.5}
              fill={color}
              stroke="var(--cui-body-bg)"
              strokeWidth={1.5}
            />
            <circle
              className="gts-chart__marker-handle"
              cx={x}
              cy={y}
              r={dragMarkerIndex === i ? 12 : 9}
              fill="transparent"
              onPointerDown={startMarkerDrag(i)}
              onPointerMove={onMarkerDrag(i)}
              onPointerUp={() => setDragMarkerIndex(null)}
            />
          </g>
        )
      })}
    </svg>
  )
}

export default GridSimulationChart
