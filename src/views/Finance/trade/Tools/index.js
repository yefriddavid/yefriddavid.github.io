import React, { useState } from 'react'
import './Tools.scss'

const fmt = (n, dec = 2) =>
  n != null && isFinite(n)
    ? n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })
    : '—'

function GridCalculator() {
  const [capital, setCapital] = useState('')
  const [upper, setUpper] = useState('')
  const [lower, setLower] = useState('')
  const [grids, setGrids] = useState('')

  const cap = parseFloat(capital)
  const hi = parseFloat(upper)
  const lo = parseFloat(lower)
  const n = parseInt(grids)

  const valid = cap > 0 && hi > lo && lo > 0 && n > 1

  const spacing = valid ? (hi - lo) / n : null
  const spacingPct = valid ? ((hi - lo) / lo / n) * 100 : null
  const perGrid = valid ? cap / n : null
  const profitPerGrid = valid ? perGrid * (spacingPct / 100) : null
  const totalProfit = valid ? profitPerGrid * n : null
  const roi = valid ? (totalProfit / cap) * 100 : null

  const field = (label, val, setter, placeholder) => (
    <div className="trade-tools__field">
      <label className="trade-tools__label">{label}</label>
      <input
        className="trade-tools__input"
        type="number"
        placeholder={placeholder}
        value={val}
        onChange={(e) => setter(e.target.value)}
      />
    </div>
  )

  return (
    <div className="trade-tools__card">
      <p className="trade-tools__card-title">Grid Calculator</p>

      {field('Capital (USDT)', capital, setCapital, '1000')}
      {field('Upper Price ($)', upper, setUpper, '70000')}
      {field('Lower Price ($)', lower, setLower, '60000')}
      {field('Number of Grids', grids, setGrids, '10')}

      {valid && (
        <div className="trade-tools__results">
          <div className="trade-tools__result-item">
            <span className="trade-tools__result-label">Grid Spacing ($)</span>
            <span className="trade-tools__result-value">{fmt(spacing)}</span>
          </div>
          <div className="trade-tools__result-item">
            <span className="trade-tools__result-label">Spacing (%)</span>
            <span className="trade-tools__result-value">{fmt(spacingPct)}%</span>
          </div>
          <div className="trade-tools__result-item">
            <span className="trade-tools__result-label">Capital / Grid</span>
            <span className="trade-tools__result-value">${fmt(perGrid)}</span>
          </div>
          <div className="trade-tools__result-item">
            <span className="trade-tools__result-label">Profit / Grid</span>
            <span className="trade-tools__result-value">${fmt(profitPerGrid)}</span>
          </div>
          <hr className="trade-tools__divider" />
          <div className="trade-tools__result-item">
            <span className="trade-tools__result-label">Total Profit (full run)</span>
            <span className="trade-tools__result-value trade-tools__result-value--highlight">
              ${fmt(totalProfit)}
            </span>
          </div>
          <div className="trade-tools__result-item">
            <span className="trade-tools__result-label">ROI</span>
            <span className="trade-tools__result-value trade-tools__result-value--highlight">
              {fmt(roi)}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function PositionCalculator() {
  const [capital, setCapital] = useState('')
  const [entry, setEntry] = useState('')
  const [stop, setStop] = useState('')
  const [riskPct, setRiskPct] = useState('2')

  const cap = parseFloat(capital)
  const en = parseFloat(entry)
  const sl = parseFloat(stop)
  const risk = parseFloat(riskPct)

  const valid = cap > 0 && en > 0 && sl > 0 && en !== sl && risk > 0

  const riskAmount = valid ? (cap * risk) / 100 : null
  const slDistance = valid ? Math.abs(en - sl) : null
  const slPct = valid ? (slDistance / en) * 100 : null
  const units = valid ? riskAmount / slDistance : null
  const positionSize = valid ? units * en : null
  const leverage = valid ? positionSize / cap : null

  const field = (label, val, setter, placeholder) => (
    <div className="trade-tools__field">
      <label className="trade-tools__label">{label}</label>
      <input
        className="trade-tools__input"
        type="number"
        placeholder={placeholder}
        value={val}
        onChange={(e) => setter(e.target.value)}
      />
    </div>
  )

  return (
    <div className="trade-tools__card">
      <p className="trade-tools__card-title">Position Size</p>

      {field('Capital (USDT)', capital, setCapital, '10000')}
      {field('Entry Price ($)', entry, setEntry, '65000')}
      {field('Stop Loss ($)', stop, setStop, '63000')}
      {field('Risk (%)', riskPct, setRiskPct, '2')}

      {valid && (
        <div className="trade-tools__results">
          <div className="trade-tools__result-item">
            <span className="trade-tools__result-label">Risk Amount</span>
            <span className="trade-tools__result-value">${fmt(riskAmount)}</span>
          </div>
          <div className="trade-tools__result-item">
            <span className="trade-tools__result-label">SL Distance</span>
            <span className="trade-tools__result-value">{fmt(slPct)}%</span>
          </div>
          <div className="trade-tools__result-item">
            <span className="trade-tools__result-label">Units</span>
            <span className="trade-tools__result-value">{fmt(units, 6)}</span>
          </div>
          <div className="trade-tools__result-item">
            <span className="trade-tools__result-label">Implied Leverage</span>
            <span className="trade-tools__result-value">{fmt(leverage, 1)}x</span>
          </div>
          <hr className="trade-tools__divider" />
          <div className="trade-tools__result-item" style={{ gridColumn: '1 / -1' }}>
            <span className="trade-tools__result-label">Position Size</span>
            <span className="trade-tools__result-value trade-tools__result-value--highlight">
              ${fmt(positionSize)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Tools() {
  return (
    <div className="trade-tools">
      <h5 className="trade-tools__title">Trade Tools</h5>
      <div className="trade-tools__grid">
        <GridCalculator />
        <PositionCalculator />
      </div>
    </div>
  )
}
