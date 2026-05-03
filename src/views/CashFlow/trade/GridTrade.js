import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as actions from 'src/actions/cashflow/gridTradeActions'

const PLATFORMS = ['Binance', 'Bybit', 'Bitget', 'OKX', 'KuCoin', 'Gate.io', 'MEXC', 'Pionex']

function useIsDesktop() {
  const [desktop, setDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768,
  )
  useEffect(() => {
    const handler = () => setDesktop(window.innerWidth >= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return desktop
}

const fmtPrice = (p) => {
  if (!p && p !== 0) return '—'
  if (p >= 1_000_000) return `$${(p / 1_000_000).toFixed(2)}M`
  if (p >= 1_000) return `$${(p / 1_000).toFixed(p % 1_000 === 0 ? 0 : 2)}K`
  return `$${Number(p).toLocaleString('en-US', { maximumFractionDigits: 6 })}`
}

const fmtUSD = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(n ?? 0)

const fmtDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// ── Grid chart SVG ─────────────────────────────────────────────────────────────
function GridChart({
  centerPrice,
  upperPrice,
  lowerPrice,
  gridCount,
  investment = 0,
  compact = false,
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

  // Extra levelH to fit 3 items below each line (↑ ↓ inv-per-grid)
  const levelH = compact ? 38 : 52
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
  const labelFs = compact ? 7.5 : 9
  const priceFs = compact ? 9 : 10.5

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
          // percentages describe the gap between this level and the one below
          const hasBelow = i > 0
          const pctUp = hasBelow ? (step / levels[i - 1]) * 100 : 0
          const pctDown = hasBelow ? (step / price) * 100 : 0

          return (
            <g key={i}>
              {/* Dashed line */}
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
              {/* Price label above the line */}
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
              {/* ↑ Increment % — below the line, right side */}
              {showIncrement && hasBelow && (
                <text
                  x={lineEndX + 5}
                  y={y + 9}
                  fill="#60a5fa"
                  fontSize={8}
                  fontFamily="'Courier New', monospace"
                >
                  {'↑ '}
                  {fmtPct(pctUp)}
                </text>
              )}
              {/* ↓ Decrement % */}
              {showDecrement && hasBelow && (
                <text
                  x={lineEndX + 5}
                  y={y + 19}
                  fill="#4ade80"
                  fontSize={8}
                  fontFamily="'Courier New', monospace"
                >
                  {'↓ '}
                  {fmtPct(pctDown)}
                </text>
              )}
              {/* inv-per-grid */}
              {showInvPerGrid && perGrid > 0 && (
                <text
                  x={lineEndX + 5}
                  y={y + 29}
                  fill={color}
                  fontSize={8}
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

        {/* Center price label (left of axis) */}
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

        {/* SELL LIMITS label */}
        {midSellY !== null && (
          <g>
            <text x={4} y={midSellY - 8} fill="#f87171" fontSize={labelFs} fontWeight="700">
              ÓRDENES DE VENTA
            </text>
            <text x={4} y={midSellY + 3} fill="#f87171" fontSize={labelFs - 0.5} opacity={0.7}>
              (SELL LIMITS)
            </text>
          </g>
        )}

        {/* BUY LIMITS label */}
        {midBuyY !== null && (
          <g>
            <text x={4} y={midBuyY - 8} fill="#4ade80" fontSize={labelFs} fontWeight="700">
              ÓRDENES DE COMPRA
            </text>
            <text x={4} y={midBuyY + 3} fill="#4ade80" fontSize={labelFs - 0.5} opacity={0.7}>
              (BUY LIMITS)
            </text>
          </g>
        )}
      </svg>
    </>
  )
}

// ── Trade card ─────────────────────────────────────────────────────────────────
function TradeCard({
  trade,
  onEdit,
  onDelete,
  expanded,
  onToggle,
  desktop = false,
  isSelected = false,
  onSelect,
}) {
  const isActive = !trade.endDate
  const step = trade.gridCount > 0 ? (trade.upperPrice - trade.lowerPrice) / trade.gridCount : 0
  const investPerGrid = trade.gridCount > 0 ? trade.investment / trade.gridCount : 0

  return (
    <div
      onClick={desktop ? onSelect : undefined}
      style={{
        background: isSelected ? '#f8f9fa' : '#fff',
        borderRadius: 14,
        marginBottom: 10,
        boxShadow: isSelected ? '0 2px 12px rgba(0,0,0,0.12)' : '0 1px 6px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        border: isSelected ? '2px solid #0d1117' : '1px solid #e9ecef',
        cursor: desktop ? 'pointer' : 'default',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      <div style={{ padding: '14px 14px 12px' }}>
        {/* Top row: name/platform left, investment right */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
            {/* Badges — wrap on narrow screens */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 6,
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 17, fontWeight: 800, color: '#0d1117' }}>{trade.asset}</span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 20,
                  background: '#f1f3f5',
                  color: '#495057',
                  whiteSpace: 'nowrap',
                }}
              >
                {trade.platform}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 20,
                  background: isActive ? '#d3f9d8' : '#f1f3f5',
                  color: isActive ? '#2f9e44' : '#868e96',
                  whiteSpace: 'nowrap',
                }}
              >
                {isActive ? 'ACTIVO' : 'CERRADO'}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#868e96' }}>
              {fmtDate(trade.startDate)}
              {trade.endDate ? ` → ${fmtDate(trade.endDate)}` : ' → hoy'}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#0d1117' }}>
              {fmtUSD(trade.investment)}
            </div>
            <div style={{ fontSize: 11, color: '#868e96' }}>{trade.gridCount} grids</div>
          </div>
        </div>

        {/* Stats — 2×2 grid, fits comfortably on mobile */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 6,
            marginTop: 10,
          }}
        >
          {[
            { label: 'Precio central', value: fmtPrice(trade.centerPrice) },
            { label: 'Paso / grid', value: fmtPrice(step) },
            { label: 'Mínimo', value: fmtPrice(trade.lowerPrice) },
            { label: 'Máximo', value: fmtPrice(trade.upperPrice) },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: '#f8f9fa', borderRadius: 8, padding: '6px 8px' }}>
              <div style={{ fontSize: 9, color: '#adb5bd', fontWeight: 700, marginBottom: 2 }}>
                {label.toUpperCase()}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#343a40' }}>{value}</div>
            </div>
          ))}
        </div>

        {investPerGrid > 0 && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#868e96' }}>
            {fmtUSD(investPerGrid)} / grid
          </div>
        )}

        {trade.notes && (
          <div style={{ marginTop: 5, fontSize: 12, color: '#adb5bd', fontStyle: 'italic' }}>
            {trade.notes}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {!desktop && (
            <button
              onClick={onToggle}
              style={{
                flex: 1,
                minHeight: 44,
                padding: '10px 8px',
                borderRadius: 10,
                border: '1px solid #dee2e6',
                background: expanded ? '#0d1117' : '#fff',
                color: expanded ? '#fbbf24' : '#495057',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                touchAction: 'manipulation',
              }}
            >
              {expanded ? 'Ocultar grid' : 'Ver grid'}
            </button>
          )}
          <button
            onClick={(e) => {
              if (desktop) e.stopPropagation()
              onEdit(trade)
            }}
            style={{
              flex: desktop ? 1 : undefined,
              minHeight: 44,
              padding: '10px 16px',
              borderRadius: 10,
              border: 'none',
              background: '#eef4ff',
              color: '#1e3a5f',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            Editar
          </button>
          <button
            onClick={(e) => {
              if (desktop) e.stopPropagation()
              onDelete(trade)
            }}
            style={{
              minHeight: 44,
              padding: '10px 14px',
              borderRadius: 10,
              border: 'none',
              background: '#fff5f5',
              color: '#e03131',
              fontSize: 16,
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Expanded chart — mobile only */}
      {!desktop && expanded && (
        <div style={{ padding: '0 12px 14px' }}>
          <GridChart
            centerPrice={trade.centerPrice}
            upperPrice={trade.upperPrice}
            lowerPrice={trade.lowerPrice}
            gridCount={trade.gridCount}
            investment={trade.investment}
          />
        </div>
      )}
    </div>
  )
}

// ── Desktop detail panel ────────────────────────────────────────────────────────
function TradeDetail({ trade, onEdit, onDelete }) {
  const isActive = !trade.endDate
  const step = trade.gridCount > 0 ? (trade.upperPrice - trade.lowerPrice) / trade.gridCount : 0
  const investPerGrid = trade.gridCount > 0 ? trade.investment / trade.gridCount : 0

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: '20px 22px 24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        border: '1px solid #e9ecef',
        position: 'sticky',
        top: 76,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16,
        }}
      >
        <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 7,
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 800, color: '#0d1117' }}>{trade.asset}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 9px',
                borderRadius: 20,
                background: '#f1f3f5',
                color: '#495057',
              }}
            >
              {trade.platform}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 9px',
                borderRadius: 20,
                background: isActive ? '#d3f9d8' : '#f1f3f5',
                color: isActive ? '#2f9e44' : '#868e96',
              }}
            >
              {isActive ? 'ACTIVO' : 'CERRADO'}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#868e96' }}>
            {fmtDate(trade.startDate)}
            {trade.endDate ? ` → ${fmtDate(trade.endDate)}` : ' → hoy'}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0d1117' }}>
            {fmtUSD(trade.investment)}
          </div>
          <div style={{ fontSize: 12, color: '#868e96' }}>{trade.gridCount} grids</div>
        </div>
      </div>

      {/* Chart */}
      <GridChart
        centerPrice={trade.centerPrice}
        upperPrice={trade.upperPrice}
        lowerPrice={trade.lowerPrice}
        gridCount={trade.gridCount}
        investment={trade.investment}
      />

      {/* Stats — 3-column on desktop */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 14 }}>
        {[
          { label: 'Precio central', value: fmtPrice(trade.centerPrice) },
          { label: 'Paso / grid', value: fmtPrice(step) },
          { label: 'Inv / grid', value: fmtUSD(investPerGrid) },
          { label: 'Mínimo', value: fmtPrice(trade.lowerPrice) },
          { label: 'Máximo', value: fmtPrice(trade.upperPrice) },
          { label: 'Niveles', value: String(Number(trade.gridCount) + 1) },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: '#f8f9fa', borderRadius: 8, padding: '8px 10px' }}>
            <div style={{ fontSize: 9, color: '#adb5bd', fontWeight: 700, marginBottom: 2 }}>
              {label.toUpperCase()}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#343a40' }}>{value}</div>
          </div>
        ))}
      </div>

      {trade.notes && (
        <div style={{ marginTop: 10, fontSize: 12, color: '#adb5bd', fontStyle: 'italic' }}>
          {trade.notes}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button
          onClick={() => onEdit(trade)}
          style={{
            flex: 1,
            minHeight: 44,
            padding: '10px',
            borderRadius: 10,
            border: 'none',
            background: '#eef4ff',
            color: '#1e3a5f',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(trade)}
          style={{
            minHeight: 44,
            padding: '10px 20px',
            borderRadius: 10,
            border: 'none',
            background: '#fff5f5',
            color: '#e03131',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}

// ── Form sheet ─────────────────────────────────────────────────────────────────
function TradeSheet({ initial, saving, onSave, onClose }) {
  const isEdit = !!initial?.id
  const today = new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState({
    asset: initial?.asset ?? '',
    platform: initial?.platform ?? '',
    centerPrice: initial?.centerPrice ?? '',
    upperPrice: initial?.upperPrice ?? '',
    lowerPrice: initial?.lowerPrice ?? '',
    gridCount: initial?.gridCount ?? '',
    investment: initial?.investment ?? '',
    startDate: initial?.startDate ?? today,
    endDate: initial?.endDate ?? '',
    notes: initial?.notes ?? '',
  })
  const [showPreview, setShowPreview] = useState(false)

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const canPreview =
    Number(form.centerPrice) > 0 &&
    Number(form.upperPrice) > Number(form.lowerPrice) &&
    Number(form.lowerPrice) > 0 &&
    Number(form.gridCount) >= 1

  const handleSave = () => {
    if (!form.asset.trim() || !form.platform.trim()) return
    onSave({
      id: initial?.id ?? null,
      asset: form.asset.trim(),
      platform: form.platform.trim(),
      centerPrice: Number(form.centerPrice) || 0,
      upperPrice: Number(form.upperPrice) || 0,
      lowerPrice: Number(form.lowerPrice) || 0,
      gridCount: Number(form.gridCount) || 0,
      investment: Number(form.investment) || 0,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      notes: form.notes.trim(),
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    })
  }

  // fontSize 16 prevents iOS Safari from auto-zooming on focus
  const inputStyle = {
    width: '100%',
    border: 'none',
    borderBottom: '2px solid #dee2e6',
    outline: 'none',
    padding: '6px 0 10px',
    background: 'transparent',
    fontSize: 16,
    color: '#0d1117',
    boxSizing: 'border-box',
    WebkitAppearance: 'none',
  }
  const labelStyle = {
    fontSize: 11,
    fontWeight: 700,
    color: '#868e96',
    display: 'block',
    marginBottom: 4,
    letterSpacing: '0.05em',
  }
  const row2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }
  const btnDisabled = saving || !form.asset.trim() || !form.platform.trim()

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 560,
          background: '#fff',
          borderRadius: '20px 20px 0 0',
          // Safe area for iPhone home bar
          paddingBottom: 'max(36px, env(safe-area-inset-bottom))',
          padding: '18px 20px 36px',
          maxHeight: '94dvh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          boxSizing: 'border-box',
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            background: '#dee2e6',
            margin: '0 auto 18px',
          }}
        />
        <div style={{ fontSize: 17, fontWeight: 800, color: '#0d1117', marginBottom: 20 }}>
          {isEdit ? 'Editar grid trade' : 'Nuevo grid trade'}
        </div>

        {/* Asset + Platform */}
        <div style={row2}>
          <div>
            <label style={labelStyle}>ACTIVO *</label>
            <input
              style={inputStyle}
              type="text"
              value={form.asset}
              onChange={set('asset')}
              placeholder="BTC/USDT"
              autoComplete="off"
              enterKeyHint="next"
            />
          </div>
          <div>
            <label style={labelStyle}>PLATAFORMA *</label>
            <input
              style={inputStyle}
              type="text"
              list="platforms-list"
              value={form.platform}
              onChange={set('platform')}
              placeholder="Binance"
              autoComplete="off"
              enterKeyHint="next"
            />
            <datalist id="platforms-list">
              {PLATFORMS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Precio central */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>PRECIO CENTRAL (entrada / referencia)</label>
          <input
            style={inputStyle}
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={form.centerPrice}
            onChange={set('centerPrice')}
            placeholder="70000"
            enterKeyHint="next"
          />
        </div>

        {/* Upper + Lower */}
        <div style={row2}>
          <div>
            <label style={labelStyle}>PRECIO MÁXIMO</label>
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={form.upperPrice}
              onChange={set('upperPrice')}
              placeholder="80000"
              enterKeyHint="next"
            />
          </div>
          <div>
            <label style={labelStyle}>PRECIO MÍNIMO</label>
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={form.lowerPrice}
              onChange={set('lowerPrice')}
              placeholder="60000"
              enterKeyHint="next"
            />
          </div>
        </div>

        {/* Grid count + Investment */}
        <div style={row2}>
          <div>
            <label style={labelStyle}>N° DE GRIDS</label>
            <input
              style={inputStyle}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={form.gridCount}
              onChange={set('gridCount')}
              placeholder="10"
              enterKeyHint="next"
            />
          </div>
          <div>
            <label style={labelStyle}>INVERSIÓN (USD)</label>
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={form.investment}
              onChange={set('investment')}
              placeholder="1000"
              enterKeyHint="next"
            />
          </div>
        </div>

        {/* Live calc chip */}
        {Number(form.investment) > 0 && Number(form.gridCount) > 0 && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 10,
              padding: '9px 13px',
              marginBottom: 18,
              fontSize: 13,
              color: '#166534',
              lineHeight: 1.5,
            }}
          >
            <strong>{fmtUSD(Number(form.investment) / Number(form.gridCount))}</strong> por grid
            {' · '}
            {Number(form.gridCount) + 1} niveles
            {Number(form.upperPrice) > Number(form.lowerPrice) && Number(form.gridCount) > 0
              ? ` · paso ${fmtPrice((Number(form.upperPrice) - Number(form.lowerPrice)) / Number(form.gridCount))}`
              : ''}
          </div>
        )}

        {/* Dates */}
        <div style={row2}>
          <div>
            <label style={labelStyle}>FECHA INICIO</label>
            <input
              style={inputStyle}
              type="date"
              value={form.startDate}
              onChange={set('startDate')}
            />
          </div>
          <div>
            <label style={labelStyle}>FECHA FIN</label>
            <input style={inputStyle} type="date" value={form.endDate} onChange={set('endDate')} />
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>NOTAS</label>
          <textarea
            style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit' }}
            rows={2}
            value={form.notes}
            onChange={set('notes')}
            placeholder="Observaciones…"
          />
        </div>

        {/* Live preview toggle */}
        {canPreview && (
          <div style={{ marginBottom: 18 }}>
            <button
              onClick={() => setShowPreview((v) => !v)}
              style={{
                width: '100%',
                minHeight: 44,
                padding: '10px',
                borderRadius: 10,
                border: '1px solid #dee2e6',
                background: showPreview ? '#0d1117' : '#f8f9fa',
                color: showPreview ? '#fbbf24' : '#495057',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                touchAction: 'manipulation',
                marginBottom: showPreview ? 12 : 0,
              }}
            >
              {showPreview ? 'Ocultar vista previa' : 'Ver vista previa del grid'}
            </button>
            {showPreview && (
              <GridChart
                centerPrice={form.centerPrice}
                upperPrice={form.upperPrice}
                lowerPrice={form.lowerPrice}
                gridCount={form.gridCount}
                investment={form.investment}
              />
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              minHeight: 48,
              padding: '13px 16px',
              borderRadius: 12,
              border: '1px solid #dee2e6',
              background: '#fff',
              fontSize: 15,
              fontWeight: 600,
              color: '#868e96',
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={btnDisabled}
            style={{
              flex: 2,
              minHeight: 48,
              padding: '13px',
              borderRadius: 12,
              border: 'none',
              background: btnDisabled ? '#e9ecef' : '#0d1117',
              color: btnDisabled ? '#adb5bd' : '#fff',
              fontSize: 15,
              fontWeight: 700,
              cursor: btnDisabled ? 'not-allowed' : 'pointer',
              touchAction: 'manipulation',
            }}
          >
            {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear grid trade'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function GridTrade() {
  const dispatch = useDispatch()
  const isDesktop = useIsDesktop()
  const { trades, loading, saving } = useSelector((s) => s.gridTrade)
  const [sheet, setSheet] = useState(null)
  const [expanded, setExpanded] = useState(null) // mobile inline expand
  const [selected, setSelected] = useState(null) // desktop right-panel selection

  useEffect(() => {
    dispatch(actions.loadRequest())
  }, [dispatch])

  // Auto-select first trade on desktop when data loads
  useEffect(() => {
    if (isDesktop && trades.length > 0 && !selected) {
      setSelected(trades[0].id)
    }
  }, [isDesktop, trades, selected])

  const handleSave = (trade) => {
    dispatch(actions.saveRequest(trade))
    setSheet(null)
  }

  const handleDelete = (trade) => {
    if (window.confirm(`¿Eliminar grid trade "${trade.asset}"?`)) {
      dispatch(actions.deleteRequest({ id: trade.id }))
      if (selected === trade.id) setSelected(null)
    }
  }

  const totalInvested = trades.reduce((sum, t) => sum + (Number(t.investment) || 0), 0)
  const activeCount = trades.filter((t) => !t.endDate).length
  const selectedTrade = isDesktop ? trades.find((t) => t.id === selected) : null

  const spinner = (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <div
        style={{
          width: 32,
          height: 32,
          border: '3px solid #dee2e6',
          borderTopColor: '#0d1117',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
    </div>
  )

  const emptyState = (
    <div style={{ textAlign: 'center', padding: '56px 24px', color: '#adb5bd', fontSize: 14 }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>📈</div>
      <div style={{ fontWeight: 700, marginBottom: 6, color: '#495057' }}>
        Sin estrategias de grid
      </div>
      <div>Presiona + para registrar tu primer grid trade</div>
    </div>
  )

  const addBtn = (
    <button
      onClick={() => setSheet('new')}
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: 'none',
        background: '#0d1117',
        color: '#fff',
        fontSize: 24,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        touchAction: 'manipulation',
      }}
    >
      +
    </button>
  )

  const summaryBanner = trades.length > 0 && (
    <div
      style={{
        background: 'linear-gradient(135deg, #0d1117 0%, #1e293b 100%)',
        borderRadius: 16,
        padding: '16px 18px',
        marginBottom: 14,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.08em',
            marginBottom: 4,
          }}
        >
          TOTAL INVERTIDO
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{fmtUSD(totalInvested)}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.08em',
            marginBottom: 4,
          }}
        >
          ACTIVAS
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#4ade80' }}>{activeCount}</div>
      </div>
    </div>
  )

  const sheet_ = sheet && (
    <TradeSheet
      initial={sheet === 'new' ? null : sheet}
      saving={saving}
      onSave={handleSave}
      onClose={() => setSheet(null)}
    />
  )

  // ── Desktop two-column layout ─────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div
        style={{
          display: 'flex',
          gap: 24,
          padding: '0 28px 60px',
          maxWidth: 1400,
          margin: '0 auto',
          alignItems: 'flex-start',
        }}
      >
        {/* Left: card list */}
        <div style={{ width: 400, flexShrink: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 0 14px',
            }}
          >
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0d1117' }}>Grid Trading</div>
              <div style={{ fontSize: 13, color: '#868e96', marginTop: 2 }}>
                {trades.length} estrategia{trades.length !== 1 ? 's' : ''}
                {activeCount > 0 && ` · ${activeCount} activa${activeCount !== 1 ? 's' : ''}`}
              </div>
            </div>
            {addBtn}
          </div>
          {summaryBanner}
          {loading
            ? spinner
            : trades.length === 0
              ? emptyState
              : trades.map((trade) => (
                  <TradeCard
                    key={trade.id}
                    trade={trade}
                    desktop
                    isSelected={selected === trade.id}
                    onSelect={() => setSelected(trade.id)}
                    onEdit={setSheet}
                    onDelete={handleDelete}
                    expanded={false}
                    onToggle={() => {}}
                  />
                ))}
        </div>

        {/* Right: chart detail panel */}
        <div style={{ flex: 1, minWidth: 0, paddingTop: 18 }}>
          {selectedTrade ? (
            <TradeDetail trade={selectedTrade} onEdit={setSheet} onDelete={handleDelete} />
          ) : !loading && trades.length === 0 ? null : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '80px 24px',
                color: '#adb5bd',
                fontSize: 14,
                background: '#fff',
                borderRadius: 16,
                border: '1px dashed #dee2e6',
                marginTop: 18,
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>←</div>
              <div>Selecciona una estrategia para ver su grid</div>
            </div>
          )}
        </div>

        {sheet_}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ── Mobile single-column layout ───────────────────────────────────────────
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 12px 80px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 0 14px',
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0d1117' }}>Grid Trading</div>
          <div style={{ fontSize: 13, color: '#868e96', marginTop: 2 }}>
            {trades.length} estrategia{trades.length !== 1 ? 's' : ''}
            {activeCount > 0 && ` · ${activeCount} activa${activeCount !== 1 ? 's' : ''}`}
          </div>
        </div>
        {addBtn}
      </div>

      {summaryBanner}

      {loading
        ? spinner
        : trades.length === 0
          ? emptyState
          : trades.map((trade) => (
              <TradeCard
                key={trade.id}
                trade={trade}
                expanded={expanded === trade.id}
                onToggle={() => setExpanded((v) => (v === trade.id ? null : trade.id))}
                onEdit={setSheet}
                onDelete={handleDelete}
              />
            ))}

      {sheet_}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
