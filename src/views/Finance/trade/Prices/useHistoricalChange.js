import { useState, useEffect } from 'react'
import { fetchOpenPrices, getStartTime } from 'src/services/cryptoKlinesService'

export function useHistoricalChange(symbols, interval, customDate, currentPrices) {
  const [openPrices, setOpenPrices] = useState({})
  const [loading, setLoading]       = useState(false)

  useEffect(() => {
    if (interval === '24h') { setOpenPrices({}); return }
    const startTime = getStartTime(interval, customDate)
    if (!startTime) return

    let cancelled = false
    setLoading(true)
    fetchOpenPrices(symbols, startTime)
      .then((map) => { if (!cancelled) setOpenPrices(map) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [interval, customDate, symbols.join(',')])

  const changes = {}
  symbols.forEach((symbol) => {
    if (interval === '24h') {
      changes[symbol] = currentPrices[symbol]?.change ?? null
    } else {
      const open    = openPrices[symbol]
      const current = currentPrices[symbol]?.price
      changes[symbol] = open && current ? ((current - open) / open) * 100 : null
    }
  })

  return { changes, loading }
}
