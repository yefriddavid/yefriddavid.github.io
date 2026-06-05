import { useState, useEffect, useRef } from 'react'
import { cryptoPricesWebSocket } from 'src/services/websocketService'

const fmt = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)

const CryptoPriceBadge = ({ symbol }) => {
  const [price, setPrice] = useState(null)
  const [dir, setDir] = useState(null)
  const prevRef = useRef(null)
  const label = symbol.replace(/USDT$/i, '')

  useEffect(() => {
    const unsub = cryptoPricesWebSocket.subscribe((msg) => {
      if (msg.data?.s !== symbol) return
      const next = parseFloat(msg.data.c)
      if (prevRef.current !== null) setDir(next >= prevRef.current ? 'up' : 'down')
      prevRef.current = next
      setPrice(next)
    })
    return unsub
  }, [symbol])

  const color = dir === 'up' ? '#2eb85c' : dir === 'down' ? '#e55353' : '#adb5bd'
  const bg = dir === 'up' ? '#162318' : dir === 'down' ? '#231616' : '#1b1b2e'
  const border = dir === 'up' ? '#2eb85c44' : dir === 'down' ? '#e5535344' : '#444'

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 8,
        padding: '3px 10px',
        fontFamily: 'monospace',
        fontSize: 13,
        transition: 'background 0.3s, border-color 0.3s',
      }}
    >
      <span style={{ color: '#adb5bd', fontSize: 11 }}>{label}</span>
      <span style={{ color, fontWeight: 700, letterSpacing: 0.5, transition: 'color 0.3s' }}>
        {price != null ? fmt(price) : '—'}
      </span>
      {dir === 'up' && <span style={{ color: '#2eb85c', fontSize: 10 }}>▲</span>}
      {dir === 'down' && <span style={{ color: '#e55353', fontSize: 10 }}>▼</span>}
    </div>
  )
}

export default CryptoPriceBadge
