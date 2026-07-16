import { useState, useEffect } from 'react'
import { fetchUsdToCopRate } from 'src/services/exchangeRateService'

const REFRESH_MS = 30 * 60 * 1000

export function useUsdCopRate() {
  const [rate, setRate] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = () => {
      fetchUsdToCopRate()
        .then((r) => {
          if (!cancelled) setRate(r)
        })
        .catch(() => {})
    }
    load()
    const id = setInterval(load, REFRESH_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return { rate }
}
