const KLINES_BASE = 'https://api.binance.com/api/v3/klines'

// Daily candle close price for a symbol on a given date (UTC) — used as the
// historical price reference since Binance has no per-trade lookup by date.
export const fetchHistoricalCryptoPrice = async (symbol, date) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Fecha inválida')
  const startTime = new Date(`${date}T00:00:00.000Z`).getTime()
  const endTime = startTime + 24 * 60 * 60 * 1000
  const res = await fetch(
    `${KLINES_BASE}?symbol=${symbol}&interval=1d&startTime=${startTime}&endTime=${endTime}&limit=1`,
  )
  if (!res.ok) throw new Error(`Precio histórico error: ${res.status}`)
  const [candle] = await res.json()
  return candle ? Number(candle[4]) : null
}
