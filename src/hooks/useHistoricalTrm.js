import { useCallback } from 'react'
import { fetchHistoricalUsdToCopRate } from 'src/services/exchangeRateService'

export function useHistoricalTrm() {
  const fetchTrm = useCallback((date) => fetchHistoricalUsdToCopRate(date), [])
  return { fetchTrm }
}
