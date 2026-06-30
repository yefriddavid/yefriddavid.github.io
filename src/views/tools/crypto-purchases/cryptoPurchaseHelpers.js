import { fmtUSD } from 'src/utils/formatters'

export { fmtUSD }

export const today = () => new Date().toISOString().split('T')[0]

export const symbolLabel = (symbol) => symbol.replace(/USDT$/i, '')

// purchase: { quantity, purchasePrice }, currentPrice: live price from useCryptoPrices (USD) or null
export const computePurchaseMetrics = (purchase, currentPrice) => {
  const quantity = Number(purchase.quantity) || 0
  const purchasePrice = Number(purchase.purchasePrice) || 0
  const investedUSD = quantity * purchasePrice
  const hasLivePrice = currentPrice != null
  const currentValueUSD = hasLivePrice ? quantity * currentPrice : null
  const gainLossUSD = hasLivePrice ? currentValueUSD - investedUSD : null
  const gainLossPct = hasLivePrice && investedUSD > 0 ? (gainLossUSD / investedUSD) * 100 : null
  return { investedUSD, currentValueUSD, gainLossUSD, gainLossPct }
}
