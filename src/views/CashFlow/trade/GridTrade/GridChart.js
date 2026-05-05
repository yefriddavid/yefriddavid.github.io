import React, { useState, useRef, useEffect } from 'react'

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
  const [gridOnly, setGridOnly] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [btcPrice, setBtcPrice] = useState(0)
  const [frontLabel, setFrontLabel] = useState('live') // 'center' | 'live'
  const containerRef = useRef(null)

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  useEffect(() => {
    const fetchPrice = () =>
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT')
        .then((r) => r.json())
        .then((data) => {
          const price = Math.round(Number(data.price))
          if (price > 0) setBtcPrice(price)
        })
        .catch(() => {})

    fetchPrice()
    const id = setInterval(fetchPrice, 30000)
    return () => clearInterval(id)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const cp = Number(centerPrice)
  const up = Number(upperPrice)
  const lp = Number(lowerPrice)
  const gc = Number(gridCount)
  const inv = Number(investment)

  if (!cp || !up || !lp || !gc || up <= lp || gc < 1) return null

  const cs = Number(customStep)
  const step = useCustomStep && cs > 0 ? cs : (up - lp) / gc

  // Build levels symmetrically from centerPrice: gc/2 above, gc/2 below
  const halfBelow = Math.floor(gc / 2)
  const halfAbove = gc - halfBelow
  const levels = []
  if (useCustomStep && cs > 0) {
    const stepsAbove = Math.max(1, Math.round((up - cp) / cs))
    const stepsBelow = Math.max(1, Math.round((cp - lp) / cs))
    for (let i = -stepsBelow; i <= stepsAbove; i++) {
      levels.push(Number((cp + i * cs).toPrecision(10)))
    }
  } else {
    for (let i = -halfBelow; i <= halfAbove; i++) {
      levels.push(Number((cp + i * step).toPrecision(10)))
    }
  }

  // perGrid always based on gc (trade-defined grid count), not level count
  const perGrid = inv > 0 ? inv / gc : 0
  const initialInvestment = inv > 0 ? inv / 2 : 0
  const fmtInv = (n) => (n >= 1 ? `$${Math.round(n)}` : `$${n.toFixed(2)}`)
  const fmtPct = (n) => `${n.toFixed(2)}%`

  const levelH = compact ? 22 : 27
  const W = compact ? 210 : 300
  const H = levels.length * levelH + 60
  const axisX = compact ? 95 : 115
  const lineEndX = W - (compact ? 55 : 65)
  const boxX = axisX + 10

  const priceMin = levels[0]
  const priceMax = levels[levels.length - 1]
  const toY = (p) => 30 + (H - 60) - ((p - priceMin) / (priceMax - priceMin)) * (H - 60)
  const centerY = toY(cp)

  const fmt = (p) => {
    if (p >= 1_000_000) return `$${(p / 1_000_000).toFixed(2)}M`
    if (p >= 1_000) return `$${(p / 1_000).toFixed(2)}K`
    return `$${Number(p).toFixed(4)}`
  }

  const midSellY = cp < priceMax ? toY((cp + priceMax) / 2) : null
  const midBuyY = cp > priceMin ? toY((cp + priceMin) / 2) : null
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

  const iconBtn = (title, onClick, active, children) => (
    <button
      title={title}
      onClick={onClick}
      style={{
        background: active ? 'rgba(251,191,36,0.18)' : 'rgba(255,255,255,0.07)',
        border: `1px solid ${active ? '#fbbf24' : 'rgba(255,255,255,0.15)'}`,
        color: active ? '#fbbf24' : '#9ca3af',
        borderRadius: 7,
        width: 30,
        height: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: 14,
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  )

  // buy zone fill: from bottom level to centerPrice
  const buyZoneTopY = toY(cp)
  const buyZoneBottomY = toY(priceMin)

  return (
    <div
      ref={containerRef}
      style={{
        background: isFullscreen ? '#0d1117' : 'transparent',
        ...(isFullscreen && {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          padding: 24,
          boxSizing: 'border-box',
        }),
      }}
    >
      {/* ── Toolbar ── */}
      {!gridOnly && (
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
      )}

      {/* ── Action buttons row ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 6, justifyContent: 'flex-end' }}>
        {iconBtn(gridOnly ? 'Mostrar controles' : 'Solo grid', () => setGridOnly((v) => !v), gridOnly, '⊞')}
        {iconBtn(isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa', toggleFullscreen, isFullscreen, isFullscreen ? '✕' : '⤢')}
      </div>

      {/* ── SVG ── */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{
          width: isFullscreen ? 'auto' : '100%',
          height: isFullscreen ? 'calc(100vh - 120px)' : 'auto',
          display: 'block',
          background: '#0d1117',
          borderRadius: compact ? 10 : 14,
        }}
      >
        {/* Buy zone fill */}
        {initialInvestment > 0 && (
          <rect
            x={axisX}
            y={buyZoneTopY}
            width={lineEndX - axisX}
            height={Math.max(0, buyZoneBottomY - buyZoneTopY)}
            fill="#4ade80"
            opacity={0.04}
          />
        )}

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
          const midY = hasBelow ? (y + toY(levels[i - 1])) / 2 : y

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
              {hasBelow && (
                <g transform={`translate(${lineEndX}, ${y})`}>
                  {showIncrement && (
                    <text
                      fill="#60a5fa"
                      fontSize={8}
                      fontWeight="700"
                      fontFamily="'Courier New', monospace"
                      textAnchor="end"
                      dy={-3}
                    >
                      {'↑ '}
                      {fmtPct(pctUp)}
                    </text>
                  )}
                  {showDecrement && (
                    <text
                      fill="#4ade80"
                      fontSize={8}
                      fontWeight="700"
                      fontFamily="'Courier New', monospace"
                      textAnchor="end"
                      dy={8}
                    >
                      {'↓ '}
                      {fmtPct(pctDown)}
                    </text>
                  )}
                </g>
              )}
              {showInvPerGrid && perGrid > 0 && hasBelow && (
                <text
                  x={lineEndX + 5}
                  y={midY + 3}
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

        {/* Center price + live BTC — render the clicked one last so it appears on top */}
        {(() => {
          const liveY = btcPrice > 0 && btcPrice >= priceMin && btcPrice <= priceMax ? toY(btcPrice) : null

          const centerLabel = (
            <g key="center" style={{ cursor: 'pointer' }} onClick={() => setFrontLabel('center')}>
              <rect
                x={axisX - 72}
                y={centerY - 9}
                width={68}
                height={18}
                rx={4}
                fill="#0d1117"
                stroke="#fbbf24"
                strokeWidth={1}
                strokeDasharray="4,3"
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
              <circle cx={axisX} cy={centerY} r={7} fill="#0d1117" stroke="#fbbf24" strokeWidth={1.5} />
              <circle cx={axisX} cy={centerY} r={2.5} fill="#fbbf24" />
              {initialInvestment > 0 && (
                <g>
                  <rect
                    x={axisX + 12}
                    y={centerY + 4}
                    width={74}
                    height={22}
                    rx={5}
                    fill="#052e16"
                    stroke="#4ade80"
                    strokeWidth={1}
                    opacity={0.92}
                  />
                  <text
                    x={axisX + 49}
                    y={centerY + 13}
                    fill="#86efac"
                    fontSize={5.5}
                    fontFamily="'Courier New', monospace"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    INV. INICIAL (÷2)
                  </text>
                  <text
                    x={axisX + 49}
                    y={centerY + 22}
                    fill="#4ade80"
                    fontSize={7}
                    fontFamily="'Courier New', monospace"
                    fontWeight="800"
                    textAnchor="middle"
                  >
                    {fmtInv(initialInvestment)}
                  </text>
                </g>
              )}
            </g>
          )

          const liveLabel = liveY !== null ? (
            <g key="live" style={{ cursor: 'pointer' }} onClick={() => setFrontLabel('live')}>
              <line
                x1={axisX}
                y1={liveY}
                x2={lineEndX}
                y2={liveY}
                stroke="#00ffff"
                strokeWidth={1.5}
                strokeDasharray="5,3"
                opacity={0.9}
              />
              <rect
                x={axisX - 72}
                y={liveY - 9}
                width={68}
                height={18}
                rx={4}
                fill="#0d1117"
                stroke="#00ffff"
                strokeWidth={1}
              />
              <text
                x={axisX - 38}
                y={liveY + 4}
                fill="#00ffff"
                fontSize={priceFs}
                fontFamily="'Courier New', monospace"
                fontWeight="700"
                textAnchor="middle"
              >
                {fmt(btcPrice)}
              </text>
              <circle cx={axisX} cy={liveY} r={4} fill="#0d1117" stroke="#00ffff" strokeWidth={1.5} />
              <circle cx={axisX} cy={liveY} r={1.5} fill="#00ffff" />
            </g>
          ) : null

          return frontLabel === 'center'
            ? <>{liveLabel}{centerLabel}</>
            : <>{centerLabel}{liveLabel}</>
        })()}

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
    </div>
  )
}
