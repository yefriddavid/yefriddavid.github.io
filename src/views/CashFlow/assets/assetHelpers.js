import { fmt, fmtNum as baseFmtNum } from 'src/utils/formatters'

export { fmt }

export const uid = () => crypto.randomUUID()
export const now = () => new Date().toISOString()

export const fmtNum = (n, decimals = 6) => (n != null && n !== '' ? baseFmtNum(n, decimals) : '—')

// Live unit price (COP) for a crypto asset — null when the asset isn't linked
// to a live symbol, or prices/rate haven't loaded yet.
export const getLiveUnitPrice = (asset, prices, usdCopRate) => {
  if (asset.type !== 'crypto' || !asset.liveSymbol) return null
  const priceUSD = prices[asset.liveSymbol]?.price
  if (priceUSD == null || usdCopRate == null) return null
  return priceUSD * usdCopRate
}

// Overrides unitPrice with the live-computed value for crypto assets that
// have a liveSymbol and a resolvable price; other assets pass through as-is.
export const applyLivePricing = (assets, prices, usdCopRate) =>
  assets.map((a) => {
    const liveUnitPrice = getLiveUnitPrice(a, prices, usdCopRate)
    return liveUnitPrice != null ? { ...a, unitPrice: liveUnitPrice } : a
  })
