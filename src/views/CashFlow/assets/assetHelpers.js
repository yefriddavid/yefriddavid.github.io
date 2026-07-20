import { fmt, fmtNum as baseFmtNum } from 'src/utils/formatters'

export { fmt }

export const uid = () => crypto.randomUUID()
export const now = () => new Date().toISOString()

export const fmtNum = (n, decimals = 6) => (n != null && n !== '' ? baseFmtNum(n, decimals) : '—')

const manualRate = (value) => {
  const rate = Number(value)
  return value !== '' && value != null && !Number.isNaN(rate) ? rate : null
}

// Live unit price (COP) for a crypto asset — null when the asset isn't linked
// to a live symbol, or prices/rate haven't loaded yet.
// Fixed assets with symbol 'usd'/'gold' use the manual rate from Settings
// instead — null (pass-through to the asset's own unitPrice) when empty.
export const getLiveUnitPrice = (asset, prices, usdCopRate, manualUsdRate, manualGoldRate) => {
  if (asset.type === 'fixed' && asset.liveSymbol === 'usd') return manualRate(manualUsdRate)
  if (asset.type === 'fixed' && asset.liveSymbol === 'gold') return manualRate(manualGoldRate)
  if (asset.type !== 'crypto' || !asset.liveSymbol) return null
  const priceUSD = prices[asset.liveSymbol]?.price
  if (priceUSD == null || usdCopRate == null) return null
  return priceUSD * usdCopRate
}

// Overrides unitPrice with the live-computed value for crypto assets that
// have a liveSymbol and a resolvable price, and for fixed/usd or fixed/gold
// assets that have a manual rate set in Settings; other assets pass through as-is.
export const applyLivePricing = (assets, prices, usdCopRate, manualUsdRate, manualGoldRate) =>
  assets.map((a) => {
    const liveUnitPrice = getLiveUnitPrice(a, prices, usdCopRate, manualUsdRate, manualGoldRate)
    return liveUnitPrice != null ? { ...a, unitPrice: liveUnitPrice } : a
  })
