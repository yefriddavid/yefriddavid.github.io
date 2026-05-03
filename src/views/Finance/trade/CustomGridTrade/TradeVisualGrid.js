import React, { useState, useMemo } from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton, CFormInput, CInputGroup, CInputGroupText } from '@coreui/react'

export default function TradeVisualGrid() {
  const [selectedPrice, setSelectedPrice] = useState(78000)
  const [currentPrice, setCurrentPrice] = useState(77500)
  const [loanRate, setLoanRate] = useState(3.5)
  const [lowerBound, setLowerBound] = useState(70000)
  const [upperBound, setUpperBound] = useState(90000)
  const [detailModal, setDetailModal] = useState(null)
  const [frontPrice, setFrontPrice] = useState(null) // Tracks which transaction oval is in front

  const transactions = [
    { price: 78000, fecha: '2024-04-15 10:00', quantity: 0.5 },
    { price: 79000, fecha: '2024-04-20 09:30', quantity: 0.2 },
    { price: 76000, fecha: '2024-05-01 08:15', quantity: 0.8 },
  ]

  const levels = useMemo(() => {
    const step = 1000
    const dynamicLevels = [selectedPrice]
    let up = selectedPrice + step
    while (up <= upperBound) {
      dynamicLevels.unshift(up)
      up += step
    }
    let down = selectedPrice - step
    while (down >= lowerBound) {
      dynamicLevels.push(down)
      down -= step
    }
    return dynamicLevels
  }, [selectedPrice, lowerBound, upperBound])

  const W = 1200
  const H = Math.max(600, levels.length * 60 + 150)
  const axisX = 15
  const lineStartX = 0
  const lineEndX = W

  const fmt = (p) => `$${(p / 1000).toFixed(2)}K`
  const fmtVal = (v) => `${v >= 0 ? '+' : ''}$${Math.abs(v).toFixed(2)}`

  const toY = (p) => {
    const min = Math.min(...levels)
    const max = Math.max(...levels)
    const range = Math.max(max, currentPrice) - Math.min(min, currentPrice) || 1
    return 100 + (H - 200) - ((p - min) / range) * (H - 200)
  }

  const currentPriceY = toY(currentPrice)

  // Sort transactions so the frontPrice one is rendered last (z-index)
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      if (a.price === frontPrice) return 1
      if (b.price === frontPrice) return -1
      return 0
    })
  }, [transactions, frontPrice])

  return (
    <div style={{ width: '100%', padding: '0 10px' }}>
      <div style={{ padding: '20px', background: '#161b22', borderRadius: '12px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
        <div style={{ display: 'flex', width: '100%', maxWidth: '800px', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
           <CInputGroup style={{ maxWidth: '300px' }}>
            <CInputGroupText style={{ background: '#00ffff', color: '#000', fontWeight: 'bold', border: 'none' }}>PRECIO ACTUAL</CInputGroupText>
            <CFormInput type="number" value={currentPrice} onChange={(e) => setCurrentPrice(Number(e.target.value))} style={{ background: '#0d1117', color: '#00ffff', border: '2px solid #00ffff', fontWeight: 'bold' }} />
          </CInputGroup>
          <CInputGroup style={{ maxWidth: '250px' }}>
            <CInputGroupText style={{ background: '#fbbf24', color: '#000', fontWeight: 'bold', border: 'none' }}>% PRÉSTAMO</CInputGroupText>
            <CFormInput type="number" step="0.1" value={loanRate} onChange={(e) => setLoanRate(Number(e.target.value))} style={{ background: '#0d1117', color: '#fbbf24', border: '2px solid #fbbf24', fontWeight: 'bold' }} />
          </CInputGroup>
        </div>

        <div style={{ display: 'flex', width: '100%', maxWidth: '800px', gap: '20px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: '#8b949e', fontFamily: 'monospace' }}>INF: {fmt(lowerBound)}</div>
            <input type="range" min="40000" max={selectedPrice - 1000} step="1000" value={lowerBound} onChange={(e) => setLowerBound(Number(e.target.value))} style={{ width: '100%', accentColor: '#4ade80' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#fbbf24', fontWeight: '800', fontSize: '12px' }}>{fmt(selectedPrice)}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: '#8b949e', fontFamily: 'monospace', textAlign: 'right' }}>SUP: {fmt(upperBound)}</div>
            <input type="range" min={selectedPrice + 1000} max="120000" step="1000" value={upperBound} onChange={(e) => setUpperBound(Number(e.target.value))} style={{ width: '100%', accentColor: '#f87171' }} />
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'hidden' }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 'auto', background: '#0d1117', display: 'block', borderRadius: '16px' }}>
          <line x1={axisX} y1={20} x2={axisX} y2={H - 20} stroke="#3b82f6" strokeWidth={5} />
          <text x={axisX + 25} y={50} fill="#f87171" fontSize={12} fontWeight="900">ZONA DE VENTA</text>
          <text x={axisX + 25} y={H - 35} fill="#4ade80" fontSize={12} fontWeight="900">ZONA DE COMPRA</text>

          {/* Grid Background & Non-transaction lines */}
          {levels.map((price, i) => {
            const y = toY(price)
            const isSelected = price === selectedPrice
            const isTransaction = transactions.some(t => t.price === price)
            let color = '#4ade80'
            if (isSelected) color = '#fbbf24'
            else if (price > selectedPrice) color = '#f87171'

            return (
              <g key={`bg-${price}`}>
                <line x1={lineStartX} y1={y} x2={lineEndX} y2={y} stroke={color} strokeWidth={isTransaction ? 2.5 : 1} strokeDasharray={isTransaction ? 'none' : '12,10'} opacity={isTransaction ? 1 : 0.8} />
                <text x={axisX + 45} y={y - 8} fill={color} fontSize={isSelected ? 16 : 14} fontWeight={isTransaction ? '900' : '700'} fontFamily="monospace">{fmt(price)}</text>
                {!isSelected && (
                  <g transform={`translate(${W - 60}, ${y + 15})`}>
                    <text fill="#60a5fa" fontSize={10} fontWeight="700" fontFamily="monospace" textAnchor="end">↑ 1.{(15 + (i % 10)).toFixed(2)}%</text>
                    <text x={-65} fill="#4ade80" fontSize={10} fontWeight="700" fontFamily="monospace" textAnchor="end">↓ 1.{(14 + (i % 10).toFixed(2))}%</text>
                  </g>
                )}
              </g>
            )
          })}

          {/* Current Price Line (Rendered above background) */}
          <g>
            <line x1={lineStartX} y1={currentPriceY} x2={lineEndX} y2={currentPriceY} stroke="#00ffff" strokeWidth={3} strokeDasharray="10,5" style={{ filter: 'drop-shadow(0 0 5px #00ffff)' }} />
            <rect x={lineEndX - 130} y={currentPriceY - 12} width={120} height={24} rx={12} fill="#00ffff" />
            <text x={lineEndX - 70} y={currentPriceY + 5} textAnchor="middle" fill="#000" fontSize={11} fontWeight="bold" fontFamily="monospace">LIVE: {fmt(currentPrice)}</text>
          </g>

          {/* Transaction Ovals and Interactive Elements (Rendered last for top visibility) */}
          {sortedTransactions.map((t) => {
            if (!levels.includes(t.price)) return null
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
            const loanCost = (t.price * t.quantity) * ((loanRate / 100) / 365) * daysElapsed
            const pnlNet = pnlGross - loanCost

            return (
              <g key={`tx-${t.price}`} onMouseDown={() => setFrontPrice(t.price)} style={{ cursor: 'pointer' }}>
                <g onClick={() => setSelectedPrice(t.price)}>
                  <circle cx={axisX + 20} cy={y} r={10} fill="#0d1117" stroke={color} strokeWidth={isSelected ? 3.5 : 2.5} />
                  <circle cx={axisX + 20} cy={y} r={isSelected ? 4.5 : 2.5} fill={color} />
                </g>
                
                {/* COMPACT P&L OVAL */}
                <g transform={`translate(${W / 2 - 80}, ${y - 35})`}>
                  <rect 
                    width={160} height={70} rx={12} 
                    fill="#161b22" stroke={pnlNet >= 0 ? '#4ade80' : '#f87171'} 
                    strokeWidth={t.price === frontPrice ? 3 : 1.5} 
                    strokeDasharray="4,2" 
                    fillOpacity={0.95}
                  />
                  <text x={80} y={15} textAnchor="middle" fill="#e2e8f0" fontSize={9} fontWeight="bold" fontFamily="monospace">BRUTO: {fmtVal(pnlGross)} ({pnlGrossPct.toFixed(2)}%)</text>
                  <text x={80} y={32} textAnchor="middle" fill={pnlNet >= 0 ? '#4ade80' : '#f87171'} fontSize={11} fontWeight="900" fontFamily="monospace">NETO: {pnlNet >= 0 ? '+' : ''}{((pnlNet / (t.price * t.quantity)) * 100).toFixed(2)}%</text>
                  <text x={80} y={48} textAnchor="middle" fill={pnlNet >= 0 ? '#4ade80' : '#f87171'} fontSize={12} fontWeight="bold" fontFamily="monospace">{fmtVal(pnlNet)}</text>
                  <text x={80} y={62} textAnchor="middle" fill="#8b949e" fontSize={9} fontFamily="monospace">{fmtVal(-loanCost)} ({daysElapsed}d)</text>
                </g>

                <g onClick={() => setDetailModal(t)}>
                  <circle cx={lineEndX - 160} cy={y} r={12} fill="#161b22" stroke={color} strokeWidth={1} />
                  <text x={lineEndX - 160} y={y + 4} textAnchor="middle" fill={color} fontSize={14} fontWeight="bold">i</text>
                </g>
              </g>
            )
          })}
        </svg>
      </div>

      <CModal visible={!!detailModal} onClose={() => setDetailModal(null)} alignment="center">
        <CModalHeader><CModalTitle>Detalle de Operación</CModalTitle></CModalHeader>
        <CModalBody>
          {detailModal && (
            <div style={{ display: 'grid', gap: '15px' }}>
              <div><strong style={{ color: '#8b949e', fontSize: '12px' }}>PRECIO:</strong><div style={{ fontSize: '18px', fontWeight: 'bold' }}>{fmt(detailModal.price)}</div></div>
              <div><strong style={{ color: '#8b949e', fontSize: '12px' }}>FECHA DE ENTRADA:</strong><div style={{ fontSize: '16px' }}>{detailModal.fecha}</div></div>
              <div><strong style={{ color: '#8b949e', fontSize: '12px' }}>CANTIDAD:</strong><div style={{ fontSize: '16px', fontWeight: 'bold' }}>{detailModal.quantity} units</div></div>
            </div>
          )}
        </CModalBody>
        <CModalFooter><CButton color="secondary" onClick={() => setDetailModal(null)}>Cerrar</CButton></CModalFooter>
      </CModal>
    </div>
  )
}
