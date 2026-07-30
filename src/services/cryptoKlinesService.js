const BASE = 'https://api.binance.com/api/v3/klines'

const intervalMs = {
  '1W': 7 * 24 * 60 * 60 * 1000,
  '1M': 30 * 24 * 60 * 60 * 1000,
  '1Y': 365 * 24 * 60 * 60 * 1000,
}

export const getStartTime = (interval, customDate) => {
  if (interval === 'custom') return customDate ? new Date(customDate).getTime() : null
  return intervalMs[interval] ? Date.now() - intervalMs[interval] : null
}

// Daily/weekly/monthly OHLC series between startTime and endTime (ms).
// Paginates via the candle's own close time since a single call caps at 1000 rows.
export const fetchPriceSeries = async (symbol, interval, startTime, endTime) => {
  const series = []
  let cursor = startTime
  while (cursor < endTime) {
    const url = `${BASE}?symbol=${symbol}&interval=${interval}&startTime=${cursor}&endTime=${endTime}&limit=1000`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Binance klines error: ${res.status}`)
    const candles = await res.json()
    if (!candles.length) break
    candles.forEach(([openTime, open, high, low, close]) => {
      series.push({
        time: openTime,
        open: parseFloat(open),
        high: parseFloat(high),
        low: parseFloat(low),
        close: parseFloat(close),
      })
    })
    if (candles.length < 1000) break
    cursor = candles[candles.length - 1][0] + 1
  }
  return series
}

export const fetchOpenPrices = async (symbols, startTime) => {
  const results = await Promise.all(
    symbols.map(async (symbol) => {
      const url = `${BASE}?symbol=${symbol}&interval=1d&startTime=${startTime}&limit=1`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Binance klines error: ${res.status}`)
      const data = await res.json()
      return { symbol, openPrice: parseFloat(data[0][1]) }
    }),
  )
  return Object.fromEntries(results.map(({ symbol, openPrice }) => [symbol, openPrice]))
}
