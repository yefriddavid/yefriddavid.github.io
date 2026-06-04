import { useState, useEffect, useRef } from 'react'

const STREAM_URL = 'wss://stream.binance.com:9443/stream?streams=btcusdt@ticker/ethusdt@ticker'

export function useCryptoPrices() {
  const [prices, setPrices] = useState({})
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)
  const reconnectRef = useRef(null)
  const unmountedRef = useRef(false)

  useEffect(() => {
    const connect = () => {
      if (unmountedRef.current) return
      const ws = new WebSocket(STREAM_URL)
      wsRef.current = ws

      ws.onopen = () => {
        if (!unmountedRef.current) setConnected(true)
      }

      ws.onmessage = (event) => {
        if (unmountedRef.current) return
        const { data } = JSON.parse(event.data)
        setPrices((prev) => ({
          ...prev,
          [data.s]: {
            price: parseFloat(data.c),
            change: parseFloat(data.P),
            high: parseFloat(data.h),
            low: parseFloat(data.l),
            volume: parseFloat(data.v),
          },
        }))
      }

      ws.onclose = () => {
        if (unmountedRef.current) return
        setConnected(false)
        reconnectRef.current = setTimeout(connect, 3000)
      }

      ws.onerror = () => ws.close()
    }

    connect()

    return () => {
      unmountedRef.current = true
      clearTimeout(reconnectRef.current)
      if (wsRef.current) {
        wsRef.current.onclose = null
        wsRef.current.close()
      }
    }
  }, [])

  return { prices, connected }
}
