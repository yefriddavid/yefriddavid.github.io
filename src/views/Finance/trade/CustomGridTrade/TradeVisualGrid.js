import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import * as actions from 'src/actions/finance/customGridTradeActions'

const BASE_LEVEL_H = 60
const W = 1200
const AXIS_X = 15

export default function TradeVisualGrid({ transactions = [], loanRate = 3.5, onLoanRateChange }) {
  const dispatch = useDispatch()
  const [selectedPrice, setSelectedPrice] = useState(78000)
  const [currentPrice, setCurrentPrice] = useState(
    () => Number(localStorage.getItem('cgt.currentPrice')) || 77500,
  )
  const [gridStep, setGridStep] = useState(1000)
  // viewTopPrice: the price shown at the top of the visible window
  const [viewTopPrice, setViewTopPrice] = useState(
    () => Number(sessionStorage.getItem('cgt.viewTopPrice')) || 78000 + 7 * 1000,
  )
  const [visibleLevels, setVisibleLevels] = useState(15)
  const [textScale, setTextScale] = useState(1)
  const [panEnabled, setPanEnabled] = useState(true)
  const [snakeLayout, setSnakeLayout] = useState(true)
  const [hiddenTrades, setHiddenTrades] = useState(
    () => new Set(transactions.filter((t) => t.hidden).map((t) => t.price)),
  )
  const [showHiddenOnly, setShowHiddenOnly] = useState(false)
  const [priceFilter, setPriceFilter] = useState(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterInput, setFilterInput] = useState('')

  const [detailModal, setDetailModal] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [frontPrice, setFrontPrice] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    sessionStorage.setItem('cgt.viewTopPrice', viewTopPrice)
  }, [viewTopPrice])

  useEffect(() => {
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT')
      .then((r) => r.json())
      .then((data) => {
        const price = Math.round(Number(data.price))
        if (price > 0) {
          setCurrentPrice(price)
          localStorage.setItem('cgt.currentPrice', price)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setHiddenTrades(new Set(transactions.filter((t) => t.hidden).map((t) => t.price)))
  }, [transactions])

  const toggleHide = (trade) => {
    const nowHidden = !hiddenTrades.has(trade.price)
    setHiddenTrades((prev) => {
      const s = new Set(prev)
      nowHidden ? s.add(trade.price) : s.delete(trade.price)
      return s
    })
    dispatch(actions.saveRequest({ ...trade, hidden: nowHidden }))
  }

  const outerRef = useRef(null)

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      outerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const containerRef = useRef(null)
  const isPointerDown = useRef(false)
  const isDragging = useRef(false)
  const dragStartY = useRef(0)
  const dragStartViewTop = useRef(0)

  const step = Math.max(1, gridStep)
  const LEVEL_H = Math.round(BASE_LEVEL_H * textScale)
  const H = visibleLevels * LEVEL_H + 200

  const fmt = (p) => `$${(p / 1000).toFixed(2)}K`
  const fmtVal = (v) => `${v >= 0 ? '+' : ''}$${Math.abs(v).toFixed(2)}`
  const fs = (base) => base * textScale

  const toY = (p) => 100 + ((viewTopPrice - p) / step) * LEVEL_H

  // Generate visible grid levels from viewTopPrice downward, with a small buffer
  const levels = useMemo(() => {
    const topGridLevel = selectedPrice + Math.ceil((viewTopPrice - selectedPrice) / step) * step
    const result = []
    for (let i = 0; i < visibleLevels + 3; i++) {
      const price = topGridLevel - i * step
      const y = 100 + ((viewTopPrice - price) / step) * LEVEL_H
      if (y >= -60 && y <= H + 60) result.push(price)
    }
    return result
  }, [selectedPrice, viewTopPrice, step, visibleLevels, H, LEVEL_H])

  const viewBottomPrice = viewTopPrice - (visibleLevels + 1) * step
  const visibleTransactions = transactions.filter(
    (t) => t.price >= viewBottomPrice && t.price <= viewTopPrice + step,
  )

  const currentPriceY = toY(currentPrice)
  const showCurrentPrice = currentPriceY > -20 && currentPriceY < H + 20

  const sortedTransactions = useMemo(
    () =>
      [...visibleTransactions]
        .filter((t) => showHiddenOnly ? hiddenTrades.has(t.price) : !hiddenTrades.has(t.price))
        .filter((t) => priceFilter === null || t.price * t.quantity > priceFilter)
        .sort((a, b) => {
        if (a.price === frontPrice) return 1
        if (b.price === frontPrice) return -1
        return 0
      }),
    [visibleTransactions, frontPrice, priceFilter, hiddenTrades, showHiddenOnly],
  )

  const totals = useMemo(() => {
    const now = new Date()
    let loanSum = 0
    let grossSum = 0
    transactions
      .filter((t) => !hiddenTrades.has(t.price))
      .forEach((t) => {
        const days = Math.ceil(Math.abs(now - new Date(t.fecha)) / (1000 * 60 * 60 * 24))
        loanSum += t.price * t.quantity * (loanRate / 100 / 365) * days
        grossSum += (currentPrice - t.price) * t.quantity
      })
    const investedSum = transactions
      .filter((t) => !hiddenTrades.has(t.price))
      .reduce((acc, t) => acc + t.price * t.quantity, 0)
    return { loanSum, grossSum, total: loanSum + Math.abs(grossSum), investedSum }
  }, [transactions, currentPrice, loanRate, hiddenTrades])

  // Assign snake column (0 = left, 1 = right) per price, stable top-to-bottom order
  const snakeColMap = useMemo(() => {
    const sorted = [...visibleTransactions].sort((a, b) => b.price - a.price)
    const map = new Map()
    sorted.forEach((t, i) => map.set(t.price, i % 2))
    return map
  }, [visibleTransactions])

  const SNAKE_X = [210, 590] // left-col and right-col box origins (box width = 160)

  const onPointerDown = (e) => {
    if (!panEnabled) return
    isPointerDown.current = true
    isDragging.current = false
    dragStartY.current = e.clientY
    dragStartViewTop.current = viewTopPrice
  }

  const onPointerMove = (e) => {
    if (!isPointerDown.current) return
    const deltaYScreen = e.clientY - dragStartY.current
    if (!isDragging.current && Math.abs(deltaYScreen) > 5) {
      isDragging.current = true
      // Capture pointer so drag continues even when mouse leaves the div
      e.currentTarget.setPointerCapture(e.pointerId)
      if (containerRef.current) containerRef.current.style.cursor = 'grabbing'
    }
    if (!isDragging.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const scaleY = H / rect.height
    const deltaYSvg = deltaYScreen * scaleY
    // Drag down → deltaY positive → see higher prices (content follows finger)
    setViewTopPrice(dragStartViewTop.current + deltaYSvg * (step / LEVEL_H))
  }

  const stopDrag = () => {
    isPointerDown.current = false
    isDragging.current = false
    if (containerRef.current) containerRef.current.style.cursor = 'grab'
  }

  return (
    <div ref={outerRef} style={{ width: '100%', padding: '0 10px' }}>
      {/* Controls */}
      <div
        style={{
          padding: '20px',
          background: '#161b22',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            width: '100%',
            gap: '12px',
            justifyContent: 'center',
          }}
        >
          <CInputGroup style={{ flex: '1 1 180px', minWidth: 0 }}>
            <CInputGroupText
              style={{
                background: '#00ffff',
                color: '#000',
                fontWeight: 'bold',
                border: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              PRECIO ACTUAL
            </CInputGroupText>
            <CFormInput
              type="number"
              value={currentPrice}
              onChange={(e) => {
                const v = Number(e.target.value)
                setCurrentPrice(v)
                localStorage.setItem('cgt.currentPrice', v)
              }}
              style={{
                background: '#0d1117',
                color: '#00ffff',
                border: '2px solid #00ffff',
                fontWeight: 'bold',
                minWidth: 0,
              }}
            />
          </CInputGroup>
          <CInputGroup style={{ flex: '1 1 150px', minWidth: 0 }}>
            <CInputGroupText
              style={{
                background: '#fbbf24',
                color: '#000',
                fontWeight: 'bold',
                border: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              % PRÉSTAMO
            </CInputGroupText>
            <CFormInput
              type="number"
              step="0.1"
              value={loanRate}
              onChange={(e) => onLoanRateChange?.(Number(e.target.value))}
              style={{
                background: '#0d1117',
                color: '#fbbf24',
                border: '2px solid #fbbf24',
                fontWeight: 'bold',
                minWidth: 0,
              }}
            />
          </CInputGroup>
          <CInputGroup style={{ flex: '1 1 180px', minWidth: 0 }}>
            <CInputGroupText
              style={{
                background: '#a78bfa',
                color: '#000',
                fontWeight: 'bold',
                border: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              PASO GRID
            </CInputGroupText>
            <CInputGroupText
              as="button"
              onClick={() => setGridStep((v) => Math.max(1, v - 1000))}
              style={{
                background: '#1e1b4b',
                color: '#a78bfa',
                fontWeight: 'bold',
                border: '2px solid #a78bfa',
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              −
            </CInputGroupText>
            <CFormInput
              type="number"
              min="1"
              step="any"
              value={gridStep}
              onChange={(e) => setGridStep(Number(e.target.value))}
              style={{
                background: '#0d1117',
                color: '#a78bfa',
                border: '2px solid #a78bfa',
                fontWeight: 'bold',
                textAlign: 'center',
                minWidth: 0,
              }}
            />
            <CInputGroupText
              as="button"
              onClick={() => setGridStep((v) => v + 1000)}
              style={{
                background: '#1e1b4b',
                color: '#a78bfa',
                fontWeight: 'bold',
                border: '2px solid #a78bfa',
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              +
            </CInputGroupText>
          </CInputGroup>
        </div>
      </div>

      {/* Summary bar */}
      <div style={{ display: 'flex', gap: 10, padding: '10px 0 14px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          {
            label: 'TOTAL INVERTIDO',
            value: totals.investedSum,
            color: '#60a5fa',
            alwaysPositive: true,
          },
          {
            label: 'INTERESES PAGADOS',
            value: totals.loanSum,
            color: '#fbbf24',
            alwaysPositive: true,
          },
          {
            label: 'PÉRDIDA NO REALIZADA',
            value: totals.grossSum,
            color: totals.grossSum >= 0 ? '#4ade80' : '#f87171',
          },
          {
            label: 'TOTAL (INTERESES + PÉRDIDA)',
            value: totals.total,
            color: totals.total >= 0 ? '#4ade80' : '#f87171',
            alwaysPositive: true,
          },
        ].map(({ label, value, color, alwaysPositive }) => (
          <div
            key={label}
            style={{
              background: '#161b22',
              border: `1px solid ${color}33`,
              borderRadius: 10,
              padding: '8px 20px',
              textAlign: 'center',
              minWidth: 180,
            }}
          >
            <div style={{ fontSize: 9, color: '#8b949e', fontWeight: 700, letterSpacing: '0.07em', marginBottom: 4 }}>
              {label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color, fontFamily: 'monospace', letterSpacing: '-0.01em' }}>
              {!alwaysPositive && value >= 0 ? '+' : ''}{alwaysPositive ? '' : value < 0 ? '-' : ''}${Math.abs(value).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Draggable SVG grid */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1030,
            display: 'flex',
            gap: 8,
          }}
        >
          <button
            onClick={() => setTextScale((v) => Math.max(0.5, +(v - 0.25).toFixed(2)))}
            title="Texto más pequeño"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '2px solid #e2e8f0',
              background: '#0d1117',
              color: '#e2e8f0',
              fontSize: 13,
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            A−
          </button>
          <button
            onClick={() => setTextScale((v) => Math.min(3, +(v + 0.25).toFixed(2)))}
            title="Texto más grande"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '2px solid #e2e8f0',
              background: '#0d1117',
              color: '#e2e8f0',
              fontSize: 13,
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            A+
          </button>
          <button
            onClick={() => setVisibleLevels((v) => Math.min(30, v + 3))}
            title="Zoom out"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '2px solid #8b949e',
              background: '#0d1117',
              color: '#8b949e',
              fontSize: 20,
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            −
          </button>
          <button
            onClick={() => setVisibleLevels((v) => Math.max(5, v - 3))}
            title="Zoom in"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '2px solid #8b949e',
              background: '#0d1117',
              color: '#8b949e',
              fontSize: 20,
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            +
          </button>
          <button
            onClick={() => {
              setFilterInput(priceFilter !== null ? String(priceFilter) : '')
              setFilterOpen(true)
            }}
            title={priceFilter !== null ? `Filtrando > $${fmt(priceFilter)} — click para cambiar` : 'Filtrar por precio mínimo'}
            style={{
              height: 40,
              padding: '0 12px',
              borderRadius: 20,
              border: `2px solid ${priceFilter !== null ? '#f59e0b' : '#8b949e'}`,
              background: '#0d1117',
              color: priceFilter !== null ? '#f59e0b' : '#8b949e',
              fontSize: 12,
              fontWeight: 700,
              fontFamily: 'monospace',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              boxShadow: priceFilter !== null ? '0 0 8px #f59e0b55' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {priceFilter !== null ? (
              <>
                <span>&gt;</span>
                <span>{fmt(priceFilter)}</span>
                <span
                  onClick={(e) => { e.stopPropagation(); setPriceFilter(null) }}
                  style={{ marginLeft: 2, opacity: 0.7, fontSize: 13 }}
                >×</span>
              </>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M1 3h14M3 8h10M6 13h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </button>
          {/* pipe separator */}
          <div style={{ width: 1, height: 24, background: '#3b4452', alignSelf: 'center' }} />
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '2px solid #8b949e',
              background: '#0d1117',
              color: '#8b949e',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              {isFullscreen ? (
                <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              ) : (
                <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              )}
            </svg>
          </button>
          <button
            onClick={() => {
              const nowHidden = hiddenTrades.size === 0
              setHiddenTrades(nowHidden ? new Set(transactions.map((t) => t.price)) : new Set())
              transactions.forEach((t) => dispatch(actions.saveRequest({ ...t, hidden: nowHidden })))
            }}
            title={hiddenTrades.size > 0 ? 'Mostrar todos' : 'Ocultar todos'}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: `2px solid ${hiddenTrades.size > 0 ? '#4b5563' : '#a78bfa'}`,
              background: '#0d1117',
              color: hiddenTrades.size > 0 ? '#4b5563' : '#a78bfa',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: hiddenTrades.size === 0 ? '0 0 8px #a78bfa55' : 'none',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="2" />
              {hiddenTrades.size === 0 && (
                <polyline points="5,10 8,14 15,6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </button>
          <button
            onClick={() => setShowHiddenOnly((v) => !v)}
            title={showHiddenOnly ? 'Volver a trades visibles' : 'Ver solo trades ocultos'}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: `2px solid ${showHiddenOnly ? '#fb923c' : '#4b5563'}`,
              background: '#0d1117',
              color: showHiddenOnly ? '#fb923c' : '#4b5563',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: showHiddenOnly ? '0 0 8px #fb923c55' : 'none',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <line x1="3" y1="13" x2="13" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <button
            onClick={() => setSnakeLayout((v) => !v)}
            title={snakeLayout ? 'Modo vertical' : 'Modo culebrita'}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: `2px solid ${snakeLayout ? '#f59e0b' : '#8b949e'}`,
              background: '#0d1117',
              color: snakeLayout ? '#f59e0b' : '#8b949e',
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: snakeLayout ? '0 0 8px #f59e0b55' : 'none',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <polyline
                points="2,16 6,6 10,16 14,6 18,16"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={() => setPanEnabled((v) => !v)}
            title={panEnabled ? 'Bloquear navegación' : 'Activar navegación'}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: `2px solid ${panEnabled ? '#4ade80' : '#f87171'}`,
              background: '#0d1117',
              color: panEnabled ? '#4ade80' : '#f87171',
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 8px ${panEnabled ? '#4ade8055' : '#f8717155'}`,
            }}
          >
            {panEnabled ? '🔓' : '🔒'}
          </button>
          <button
            onClick={() => setViewTopPrice(currentPrice + 7 * step)}
            title="Centrar en precio actual"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '2px solid #00ffff',
              background: '#0d1117',
              color: '#00ffff',
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 8px #00ffff55',
            }}
          >
            ⊕
          </button>
        </div>
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
                <rect
                  x={W - 130}
                  y={currentPriceY - 12}
                  width={120}
                  height={24}
                  rx={12}
                  fill="#00ffff"
                />
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

                      {/* Leader line: circle → box (snake mode only) */}
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
                        <circle
                          cx={W - 160}
                          cy={y}
                          r={12}
                          fill="#161b22"
                          stroke={color}
                          strokeWidth={1}
                        />
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
                    onClick={(e) => { e.stopPropagation(); toggleHide(t) }}
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
      </div>

      {/* Price filter — inline overlay (no portal, works in fullscreen) */}
      {filterOpen && (
        <div
          onClick={() => setFilterOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: '24px 24px 20px',
              width: 360,
              boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0d1117', marginBottom: 8 }}>
              Filtrar por inversión
            </div>
            <div style={{ fontSize: 13, color: '#868e96', marginBottom: 16 }}>
              Mostrar solo trades con valor invertido{' '}
              (precio × cantidad) <strong>mayor a</strong>:
            </div>
            <div style={{ display: 'flex', marginBottom: 20 }}>
              <span style={{
                padding: '9px 12px',
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRight: 'none',
                borderRadius: '8px 0 0 8px',
                fontWeight: 700,
                fontSize: 14,
                color: '#495057',
              }}>$</span>
              <input
                type="number"
                step="any"
                autoFocus
                value={filterInput}
                onChange={(e) => setFilterInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filterInput) {
                    setPriceFilter(Number(filterInput))
                    setFilterOpen(false)
                  }
                  if (e.key === 'Escape') setFilterOpen(false)
                }}
                placeholder="ej. 500"
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  border: '1px solid #dee2e6',
                  borderRadius: '0 8px 8px 0',
                  fontSize: 15,
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              {priceFilter !== null && (
                <button
                  onClick={() => { setPriceFilter(null); setFilterOpen(false) }}
                  style={{ marginRight: 'auto', border: 'none', background: 'none', color: '#e03131', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '8px 4px' }}
                >
                  Quitar filtro
                </button>
              )}
              <button
                onClick={() => setFilterOpen(false)}
                style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #dee2e6', background: '#fff', fontSize: 14, fontWeight: 600, color: '#868e96', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                disabled={!filterInput}
                onClick={() => { setPriceFilter(Number(filterInput)); setFilterOpen(false) }}
                style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: filterInput ? '#0d1117' : '#e9ecef', color: filterInput ? '#fff' : '#adb5bd', fontSize: 14, fontWeight: 700, cursor: filterInput ? 'pointer' : 'not-allowed' }}
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail / edit modal */}
      <CModal
        visible={!!detailModal}
        onClose={() => {
          setDetailModal(null)
          setEditForm(null)
        }}
        alignment="center"
      >
        <CModalHeader>
          <CModalTitle>Detalle de Operación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {detailModal && editForm && (
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <CFormLabel
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#868e96',
                    letterSpacing: '0.05em',
                  }}
                >
                  PRECIO DE ENTRADA
                </CFormLabel>
                <CFormInput
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))}
                />
              </div>
              <div>
                <CFormLabel
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#868e96',
                    letterSpacing: '0.05em',
                  }}
                >
                  CANTIDAD
                </CFormLabel>
                <CFormInput
                  type="number"
                  step="any"
                  value={editForm.quantity}
                  onChange={(e) => setEditForm((p) => ({ ...p, quantity: e.target.value }))}
                />
              </div>
              <div>
                <CFormLabel
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#868e96',
                    letterSpacing: '0.05em',
                  }}
                >
                  FECHA DE ENTRADA
                </CFormLabel>
                <CFormInput
                  type="date"
                  value={editForm.fecha}
                  onChange={(e) => setEditForm((p) => ({ ...p, fecha: e.target.value }))}
                />
              </div>
              <div>
                <CFormLabel
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#868e96',
                    letterSpacing: '0.05em',
                  }}
                >
                  NOTAS
                </CFormLabel>
                <CFormInput
                  value={editForm.notes}
                  onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Observaciones…"
                />
              </div>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              setDetailModal(null)
              setEditForm(null)
            }}
          >
            Cancelar
          </CButton>
          <CButton
            color="primary"
            onClick={() => {
              dispatch(
                actions.saveRequest({
                  id: detailModal.id,
                  price: Number(editForm.price),
                  quantity: Number(editForm.quantity),
                  fecha: editForm.fecha,
                  notes: editForm.notes.trim(),
                }),
              )
              setDetailModal(null)
              setEditForm(null)
            }}
          >
            Guardar
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}
