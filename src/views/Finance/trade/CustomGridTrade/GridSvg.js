import React from 'react'
import { W, AXIS_X } from './gridConstants'

const GridSvg = ({
  containerRef,
  panEnabled,
  onPointerDown,
  onPointerMove,
  stopDrag,
  H,
  levels,
  toY,
  selectedPrice,
  setSelectedPrice,
  visibleTransactions,
  currentPriceY,
  showCurrentPrice,
  currentPrice,
  sortedTransactions,
  frontPrice,
  setFrontPrice,
  snakeLayout,
  snakeColMap,
  SNAKE_X,
  hiddenTrades,
  toggleHide,
  setDetailModal,
  setEditForm,
  loanRate,
  fs,
  fmt,
  fmtVal,
}) => (
  <div
    ref={containerRef}
    style={{
      overflowX: 'hidden',
      cursor: panEnabled ? 'grab' : 'default',
      touchAction: 'none',
      userSelect: 'none',
    }}
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerUp={stopDrag}
    onPointerCancel={stopDrag}
  >
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{
        width: '100%',
        height: 'auto',
        background: '#0d1117',
        display: 'block',
        borderRadius: '16px',
      }}
    >
      <line x1={AXIS_X} y1={20} x2={AXIS_X} y2={H - 20} stroke="#3b82f6" strokeWidth={5} />
      <text x={AXIS_X + 25} y={50} fill="#f87171" fontSize={fs(12)} fontWeight="900">
        ZONA DE VENTA
      </text>
      <text x={AXIS_X + 25} y={H - 35} fill="#4ade80" fontSize={fs(12)} fontWeight="900">
        ZONA DE COMPRA
      </text>

      {/* Grid lines */}
      {levels.map((price, i) => {
        const y = toY(price)
        const isSelected = price === selectedPrice
        const isTransaction = visibleTransactions.some((t) => t.price === price)
        let color = '#4ade80'
        if (isSelected) color = '#fbbf24'
        else if (price > selectedPrice) color = '#f87171'

        return (
          <g key={`bg-${price}`}>
            <line
              x1={0}
              y1={y}
              x2={W}
              y2={y}
              stroke={color}
              strokeWidth={isTransaction ? 2.5 : 1}
              strokeDasharray={isTransaction ? 'none' : '12,10'}
              opacity={isTransaction ? 1 : 0.8}
            />
            <text
              x={AXIS_X + 45}
              y={y - 8}
              fill={color}
              fontSize={fs(isSelected ? 16 : 14)}
              fontWeight={isTransaction ? '900' : '700'}
              fontFamily="monospace"
            >
              {fmt(price)}
            </text>
            {!isSelected && (
              <g transform={`translate(${W - 10}, ${y})`}>
                <text
                  fill="#60a5fa"
                  fontSize={fs(9)}
                  fontWeight="700"
                  fontFamily="monospace"
                  textAnchor="end"
                  dy={-4}
                >
                  ↑ {(1.15 + (i % 10) * 0.01).toFixed(2)}%
                </text>
                <text
                  fill="#4ade80"
                  fontSize={fs(9)}
                  fontWeight="700"
                  fontFamily="monospace"
                  textAnchor="end"
                  dy={fs(11)}
                >
                  ↓ {(1.14 + (i % 10) * 0.01).toFixed(2)}%
                </text>
              </g>
            )}
          </g>
        )
      })}

      {/* Current price line */}
      {showCurrentPrice && (
        <g>
          <line
            x1={0}
            y1={currentPriceY}
            x2={W}
            y2={currentPriceY}
            stroke="#00ffff"
            strokeWidth={3}
            strokeDasharray="10,5"
            style={{ filter: 'drop-shadow(0 0 5px #00ffff)' }}
          />
          <rect x={W - 130} y={currentPriceY - 12} width={120} height={24} rx={12} fill="#00ffff" />
          <text
            x={W - 70}
            y={currentPriceY + 5}
            textAnchor="middle"
            fill="#000"
            fontSize={fs(11)}
            fontWeight="bold"
            fontFamily="monospace"
          >
            LIVE: {fmt(currentPrice)}
          </text>
        </g>
      )}

      {/* Transaction overlays */}
      {sortedTransactions.map((t) => {
        const y = toY(t.price)
        const isSelected = t.price === selectedPrice
        let color = '#4ade80'
        if (isSelected) color = '#fbbf24'
        else if (t.price > selectedPrice) color = '#f87171'

        const pnlGross = (currentPrice - t.price) * t.quantity
        const pnlGrossPct = ((currentPrice - t.price) / t.price) * 100
        const startDate = new Date(t.fecha)
        const today = new Date()
        const daysElapsed = Math.ceil(Math.abs(today - startDate) / (1000 * 60 * 60 * 24))
        const loanCost = t.price * t.quantity * (loanRate / 100 / 365) * daysElapsed
        const pnlNet = pnlGross - loanCost
        const isOnGridLevel = levels.includes(t.price)

        const col = snakeColMap.get(t.price) ?? 0
        const boxX = snakeLayout ? SNAKE_X[col] : W / 2 - 80
        const boxCenterX = boxX + 80
        const CBX = W - 105

        return (
          <g key={`tx-${t.price}`}>
            <>
              {!isOnGridLevel && (
                <line x1={0} y1={y} x2={W} y2={y} stroke={color} strokeWidth={2.5} />
              )}
              <g onClick={() => setSelectedPrice(t.price)} style={{ cursor: 'pointer' }}>
                <circle
                  cx={AXIS_X + 20}
                  cy={y}
                  r={10}
                  fill="#0d1117"
                  stroke={color}
                  strokeWidth={isSelected ? 3.5 : 2.5}
                />
                <circle cx={AXIS_X + 20} cy={y} r={isSelected ? 4.5 : 2.5} fill={color} />
              </g>

              {snakeLayout && (
                <line
                  x1={AXIS_X + 30}
                  y1={y}
                  x2={boxCenterX}
                  y2={y}
                  stroke={color}
                  strokeWidth={1}
                  strokeDasharray="4,3"
                  opacity={0.4}
                />
              )}

              {/* P&L box */}
              <g
                transform={`translate(${boxX}, ${y - 42})`}
                onMouseDown={() => setFrontPrice(t.price)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  width={160}
                  height={84}
                  rx={12}
                  fill="#161b22"
                  stroke={pnlNet >= 0 ? '#4ade80' : '#f87171'}
                  strokeWidth={t.price === frontPrice ? 3 : 1.5}
                  strokeDasharray="4,2"
                  fillOpacity={0.95}
                />
                <text
                  x={80}
                  y={14}
                  textAnchor="middle"
                  fill="#fbbf24"
                  fontSize={fs(9)}
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  INV: ${parseFloat((t.price * t.quantity).toFixed(2))}
                </text>
                <text
                  x={80}
                  y={27}
                  textAnchor="middle"
                  fill="#e2e8f0"
                  fontSize={fs(9)}
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  BRUTO: {fmtVal(pnlGross)} ({pnlGrossPct.toFixed(2)}%)
                </text>
                <text
                  x={80}
                  y={43}
                  textAnchor="middle"
                  fill={pnlNet >= 0 ? '#4ade80' : '#f87171'}
                  fontSize={fs(11)}
                  fontWeight="900"
                  fontFamily="monospace"
                >
                  NETO: {pnlNet >= 0 ? '+' : ''}
                  {((pnlNet / (t.price * t.quantity)) * 100).toFixed(2)}%
                </text>
                <text
                  x={80}
                  y={58}
                  textAnchor="middle"
                  fill={pnlNet >= 0 ? '#4ade80' : '#f87171'}
                  fontSize={fs(12)}
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {fmtVal(pnlNet)}
                </text>
                <text
                  x={80}
                  y={74}
                  textAnchor="middle"
                  fill="#8b949e"
                  fontSize={fs(9)}
                  fontFamily="monospace"
                >
                  {fmtVal(-loanCost)} ({daysElapsed}d)
                </text>
              </g>

              {/* Info button */}
              <g
                onClick={() => {
                  setDetailModal(t)
                  setEditForm({
                    price: t.price,
                    quantity: t.quantity,
                    fecha: t.fecha,
                    notes: t.notes ?? '',
                  })
                }}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={W - 160} cy={y} r={12} fill="#161b22" stroke={color} strokeWidth={1} />
                <text
                  x={W - 160}
                  y={y + 4}
                  textAnchor="middle"
                  fill={color}
                  fontSize={fs(14)}
                  fontWeight="bold"
                >
                  i
                </text>
              </g>
            </>

            {/* Visibility toggle */}
            <g
              onClick={(e) => {
                e.stopPropagation()
                toggleHide(t)
              }}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={CBX} cy={y} r={11} fill="#161b22" stroke={color} strokeWidth={1.5} />
              <polyline
                points={`${CBX - 5},${y} ${CBX - 1},${y + 4} ${CBX + 6},${y - 5}`}
                stroke={color}
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </g>
        )
      })}
    </svg>
  </div>
)

export default GridSvg
