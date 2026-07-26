import { useCallback } from 'react'
import { fetchHistoricalCryptoPrice } from 'src/services/binanceKlinesService'

export function useHistoricalCryptoPrice() {
  const fetchPrice = useCallback((symbol, date) => fetchHistoricalCryptoPrice(symbol, date), [])
  return { fetchPrice }
}
