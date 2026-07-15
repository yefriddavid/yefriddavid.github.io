import React, { useState, useRef, useCallback } from 'react'
import Spinner from 'src/components/shared/Spinner'
import { TRADE_PRICE_ASSETS as ASSETS } from 'src/constants/finance'
import { useCryptoPrices } from './useCryptoPrices'
import { useHistoricalChange } from './useHistoricalChange'
import './Prices.scss'

const SYMBOLS = ASSETS.map((a) => a.symbol)

const INTERVALS = [
  { value: '24h', label: '24h' },
  { value: '1W', label: '1S' },
  { value: '1M', label: '1M' },
  { value: '1Y', label: '1A' },
  { value: 'custom', label: 'Fecha' },
]

const fmt = (n, decimals = 2) =>
  n?.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }) ?? '—'

const fmtVol = (n) => {
  if (!n) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`
  return fmt(n)
}

const fmtChange = (val) => (val == null ? '—' : `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`)

export default function Prices() {
  const [selected, setSelected] = useState('BTCUSDT')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [interval, setInterval] = useState('24h')
  const [customDate, setCustomDate] = useState('')
  const { prices, connected } = useCryptoPrices()
  const { changes, loading: histLoading } = useHistoricalChange(
    SYMBOLS,
    interval,
    customDate,
    prices,
  )
  const cardRef = useRef(null)

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      cardRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  React.useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  const asset = ASSETS.find((a) => a.symbol === selected)
  const data = prices[selected]
  const change = changes[selected]
  const isPositive = change == null ? true : change >= 0

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="crypto-prices">
      <div className="crypto-prices__header">
        <h5 className="crypto-prices__title">Crypto Prices</h5>

        <select
          className="crypto-prices__select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {ASSETS.map((a) => (
            <option key={a.symbol} value={a.symbol}>
              {a.label} ({a.ticker})
            </option>
          ))}
        </select>

        <div className="crypto-prices__interval-row">
          <select
            className="crypto-prices__select crypto-prices__select--sm"
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
          >
            {INTERVALS.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>

          {interval === 'custom' && (
            <input
              type="date"
              className="crypto-prices__date-input"
              value={customDate}
              max={today}
              onChange={(e) => setCustomDate(e.target.value)}
            />
          )}

          {histLoading && <Spinner size="sm" />}
        </div>

        <span
          className={`crypto-prices__dot crypto-prices__dot--${connected ? 'live' : 'offline'}`}
          title={connected ? 'Live' : 'Reconnecting…'}
        />
        <span className="crypto-prices__status">{connected ? 'Live' : 'Reconnecting…'}</span>
      </div>

      {data ? (
        <div className="crypto-prices__card" ref={cardRef}>
          <button
            className="crypto-prices__fullscreen-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.6" />
              <line
                x1="12.5"
                y1="12.5"
                x2="18"
                y2="18"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <line
                x1="8.5"
                y1="6"
                x2="8.5"
                y2="11"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <line
                x1="6"
                y1="8.5"
                x2="11"
                y2="8.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div className="crypto-prices__symbol">{asset?.ticker} / USDT</div>
          <div className="crypto-prices__price">${fmt(data.price, asset?.decimals ?? 2)}</div>
          <div
            className={`crypto-prices__change crypto-prices__change--${isPositive ? 'positive' : 'negative'}`}
          >
            {change == null ? (
              <Spinner size="sm" />
            ) : (
              <>
                {isPositive ? '▲' : '▼'} {fmtChange(change)}{' '}
                <span style={{ fontWeight: 400, opacity: 0.7 }}>
                  {interval === 'custom' ? customDate : interval}
                </span>
              </>
            )}
          </div>

          <div className="crypto-prices__stats">
            <div className="crypto-prices__stat-item">
              <span className="crypto-prices__stat-label">24h High</span>
              <span className="crypto-prices__stat-value">
                ${fmt(data.high, asset?.decimals ?? 2)}
              </span>
            </div>
            <div className="crypto-prices__stat-item">
              <span className="crypto-prices__stat-label">24h Low</span>
              <span className="crypto-prices__stat-value">
                ${fmt(data.low, asset?.decimals ?? 2)}
              </span>
            </div>
            <div className="crypto-prices__stat-item">
              <span className="crypto-prices__stat-label">Volume 24h</span>
              <span className="crypto-prices__stat-value">
                {fmtVol(data.volume)} {asset?.ticker}
              </span>
            </div>
            <div className="crypto-prices__stat-item">
              <span className="crypto-prices__stat-label">Range</span>
              <span className="crypto-prices__stat-value">
                {data.high && data.low
                  ? `${(((data.high - data.low) / data.low) * 100).toFixed(2)}%`
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="crypto-prices__loading">
          <Spinner size="sm" />
          Connecting to market data…
        </div>
      )}

      <div className="crypto-prices__mini-list">
        {ASSETS.map((a) => {
          const d = prices[a.symbol]
          const chg = changes[a.symbol]
          const pos = chg == null ? true : chg >= 0
          return (
            <div
              key={a.symbol}
              className={`crypto-prices__mini-card${selected === a.symbol ? ' crypto-prices__mini-card--active' : ''}`}
              onClick={() => setSelected(a.symbol)}
            >
              <div className="crypto-prices__mini-symbol">{a.ticker} / USDT</div>
              <div className="crypto-prices__mini-price">
                {d ? `$${fmt(d.price, a.decimals ?? 2)}` : '—'}
              </div>
              {d && (
                <div
                  className={`crypto-prices__mini-change crypto-prices__mini-change--${pos ? 'positive' : 'negative'}`}
                >
                  {chg == null ? '…' : fmtChange(chg)}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
