import React from 'react'
import { fmtPrice, fmtUSD } from './gridSimulationHelpers'

const ROW_H = 46
const MARGIN_X = 92
const MARGIN_RIGHT = 78
const MARGIN_Y = 34
const W = 900

const GridSimulationChart = ({
  levels,
  upper,
  lower,
  centerPrice,
  points,
  markers,
  pairs,
  perGrid,
}) => {
  const gridCount = levels.length - 1
  const H = gridCount * ROW_H + MARGIN_Y * 2
  const plotW = W - MARGIN_X - MARGIN_RIGHT

  const toY = (price) =>
    MARGIN_Y + (H - 2 * MARGIN_Y) - ((price - lower) / (upper - lower)) * (H - 2 * MARGIN_Y)
  const toX = (frac) => MARGIN_X + frac * plotW

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.frac)},${toY(p.price)}`)
    .join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="gts-chart__svg">
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
            <text x={8} y={y - 4} fontSize={11} fontWeight={700} fill={color}>
              {fmtPrice(price)}
            </text>
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
            <circle
              cx={x}
              cy={y}
              r={4.5}
              fill={color}
              stroke="var(--cui-body-bg)"
              strokeWidth={1.5}
            />
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
          </g>
        )
      })}
    </svg>
  )
}

export default GridSimulationChart
