import { useState, useEffect } from 'react'
import { cryptoPricesWebSocket } from 'src/services/websocketService'

export function useCryptoPrices() {
  const [prices, setPrices] = useState({})
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const unsubStatus = cryptoPricesWebSocket.onStatus(setConnected)
    const unsubData = cryptoPricesWebSocket.subscribe((msg) => {
      const { data } = msg
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
    })
    return () => {
      unsubStatus()
      unsubData()
    }
  }, [])

  return { prices, connected }
}
