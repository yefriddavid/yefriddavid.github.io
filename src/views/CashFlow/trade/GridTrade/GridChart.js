import React, { useState } from 'react'

export default function GridChart({
  centerPrice,
  upperPrice,
  lowerPrice,
  gridCount,
  investment = 0,
  compact = false,
  gridType = 'long',
}) {
  const [showIncrement, setShowIncrement] = useState(true)
  const [showDecrement, setShowDecrement] = useState(true)
  const [showInvPerGrid, setShowInvPerGrid] = useState(true)
  const [useCustomStep, setUseCustomStep] = useState(false)
  const [customStep, setCustomStep] = useState(10000)

  const cp = Number(centerPrice)
  const up = Number(upperPrice)
  const lp = Number(lowerPrice)
  const gc = Number(gridCount)
  const inv = Number(investment)

  if (!cp || !up || !lp || !gc || up <= lp || gc < 1) return null

  const cs = Number(customStep)
  const step = useCustomStep && cs > 0 ? cs : (up - lp) / gc
  const levelCount = useCustomStep && cs > 0 ? Math.max(1, Math.round((up - lp) / cs)) : gc
  const levels = []
  for (let i = 0; i <= levelCount; i++) {
    levels.push(Number((lp + i * step).toPrecision(10)))
  }

  const perGrid = inv > 0 ? inv / levelCount : 0
  const fmtInv = (n) => (n >= 1 ? `$${Math.round(n)}` : `$${n.toFixed(2)}`)
  const fmtPct = (n) => `${n.toFixed(2)}%`

  const levelH = compact ? 22 : 27
  const W = compact ? 210 : 300
  const H = (levelCount + 1) * levelH + 60
  const axisX = compact ? 95 : 115
  const lineEndX = W - (compact ? 55 : 65)
  const boxX = axisX + 10

  const toY = (p) => 30 + (H - 60) - ((p - lp) / (up - lp)) * (H - 60)
  const centerY = toY(cp)

  const fmt = (p) => {
    if (p >= 1_000_000) return `$${(p / 1_000_000).toFixed(2)}M`
    if (p >= 1_000) return `$${(p / 1_000).toFixed(2)}K`
    return `$${Number(p).toFixed(4)}`
  }

  const midSellY = cp < up ? toY((cp + up) / 2) : null
  const midBuyY = cp > lp ? toY((cp + lp) / 2) : null
  const labelFs = compact ? 6 : 7
  const priceFs = compact ? 7 : 7.5

  const chkLabel = (color) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    cursor: 'pointer',
    color,
    fontSize: 12,
    fontWeight: 700,
    userSelect: 'none',
  })

  return (
    <>
      {/* ── Checkboxes ── */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginBottom: 8,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <label style={chkLabel('#60a5fa')}>
          <input
            type="checkbox"
            checked={showIncrement}
            onChange={(e) => setShowIncrement(e.target.checked)}
          />
          ↑ Incremento
        </label>
        <label style={chkLabel('#4ade80')}>
          <input
            type="checkbox"
            checked={showDecrement}
            onChange={(e) => setShowDecrement(e.target.checked)}
          />
          ↓ Decremento
        </label>
        <label style={chkLabel('#9ca3af')}>
          <input
            type="checkbox"
            checked={showInvPerGrid}
            onChange={(e) => setShowInvPerGrid(e.target.checked)}
          />
          Inv/grid
        </label>
        {/* Custom step */}
        <label style={{ ...chkLabel('#f59e0b'), marginLeft: 'auto' }}>
          <input
            type="checkbox"
            checked={useCustomStep}
            onChange={(e) => setUseCustomStep(e.target.checked)}
          />
          Paso
        </label>
        <input
          type="number"
          inputMode="numeric"
          min="1"
          step="any"
          value={customStep}
          onChange={(e) => setCustomStep(e.target.value)}
          disabled={!useCustomStep}
          style={{
            width: 88,
            fontSize: 12,
            fontWeight: 700,
            border: 'none',
            borderBottom: `2px solid ${useCustomStep ? '#f59e0b' : '#374151'}`,
            background: 'transparent',
            color: useCustomStep ? '#f59e0b' : '#6b7280',
            outline: 'none',
            padding: '2px 0',
            textAlign: 'right',
          }}
        />
      </div>

      {/* ── SVG ── */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          background: '#0d1117',
          borderRadius: compact ? 10 : 14,
        }}
      >
        {/* Vertical axis */}
        <line x1={axisX} y1={18} x2={axisX} y2={H - 18} stroke="#1e293b" strokeWidth={1.5} />
        <polygon
          points={`${axisX},${12} ${axisX - 3.5},${20} ${axisX + 3.5},${20}`}
          fill="#1e293b"
        />

        {/* Grid levels */}
        {levels.map((price, i) => {
          const y = toY(price)
          const isAbove = price > cp + step * 0.001
          const color = isAbove ? '#f87171' : '#4ade80'
          const hasBelow = i > 0
          const pctUp = hasBelow ? (step / levels[i - 1]) * 100 : 0
          const pctDown = hasBelow ? (step / price) * 100 : 0

          return (
            <g key={i}>
              <line
                x1={axisX}
                y1={y}
                x2={lineEndX}
                y2={y}
                stroke={color}
                strokeWidth={1}
                strokeDasharray="9,6"
                opacity={0.8}
              />
              <text
                x={boxX}
                y={y - 4}
                textAnchor="start"
                fill={color}
                fontSize={priceFs}
                fontFamily="'Courier New', monospace"
                fontWeight="600"
              >
                {fmt(price)}
              </text>
              {showIncrement && hasBelow && (
                <text
                  x={lineEndX + 5}
                  y={y + 7}
                  fill="#60a5fa"
                  fontSize={7}
                  fontFamily="'Courier New', monospace"
                >
                  {'↑ '}
                  {fmtPct(pctUp)}
                </text>
              )}
              {showDecrement && hasBelow && (
                <text
                  x={lineEndX + 5}
                  y={y + 14}
                  fill="#4ade80"
                  fontSize={7}
                  fontFamily="'Courier New', monospace"
                >
                  {'↓ '}
                  {fmtPct(pctDown)}
                </text>
              )}
              {showInvPerGrid && perGrid > 0 && (
                <text
                  x={lineEndX + 5}
                  y={y + 21}
                  fill={color}
                  fontSize={7}
                  fontFamily="'Courier New', monospace"
                  opacity={0.55}
                >
                  {fmtInv(perGrid)}/grid
                </text>
              )}
            </g>
          )
        })}

        {/* Center price line */}
        <line
          x1={axisX}
          y1={centerY}
          x2={lineEndX}
          y2={centerY}
          stroke="#fbbf24"
          strokeWidth={1.5}
        />

        {/* Center price label */}
        <rect
          x={axisX - 72}
          y={centerY - 9}
          width={68}
          height={18}
          rx={4}
          fill="none"
          stroke="#fbbf24"
          strokeWidth={1}
          strokeDasharray="4,3"
          opacity={0.7}
        />
        <text
          x={axisX - 38}
          y={centerY + 4}
          fill="#fbbf24"
          fontSize={priceFs}
          fontFamily="'Courier New', monospace"
          fontWeight="700"
          textAnchor="middle"
        >
          {fmt(cp)}
        </text>

        {/* Circle marker */}
        <circle cx={axisX} cy={centerY} r={7} fill="#0d1117" stroke="#fbbf24" strokeWidth={1.5} />
        <circle cx={axisX} cy={centerY} r={2.5} fill="#fbbf24" />

        {/* Upper zone label */}
        {midSellY !== null && (
          <g>
            <text x={4} y={midSellY - 8} fill="#f87171" fontSize={labelFs} fontWeight="700">
              {gridType === 'short' ? 'VENTA EN CORTO' : 'ÓRDENES DE VENTA'}
            </text>
            <text x={4} y={midSellY + 3} fill="#f87171" fontSize={labelFs - 0.5} opacity={0.7}>
              {gridType === 'short' ? '(SELL SHORT)' : '(SELL LIMITS)'}
            </text>
          </g>
        )}

        {/* Lower zone label */}
        {midBuyY !== null && (
          <g>
            <text x={4} y={midBuyY - 8} fill="#4ade80" fontSize={labelFs} fontWeight="700">
              {gridType === 'short' ? 'RECOMPRA' : 'ÓRDENES DE COMPRA'}
            </text>
            <text x={4} y={midBuyY + 3} fill="#4ade80" fontSize={labelFs - 0.5} opacity={0.7}>
              {gridType === 'short' ? '(BUY BACK)' : '(BUY LIMITS)'}
            </text>
          </g>
        )}
      </svg>
    </>
  )
}
