import { fmtUSD, fmt } from 'src/utils/formatters'
import { CRYPTO_PURCHASE_PLATFORMS, CRYPTO_PURCHASE_TYPES } from 'src/constants/finance'

export { fmtUSD, fmt }

export const today = () => new Date().toISOString().split('T')[0]

export const symbolLabel = (symbol) => symbol.replace(/USDT$/i, '')

export const fmtQty = (n, symbol) => `${(n ?? 0).toFixed(8)} ${symbolLabel(symbol)}`

export const platformLabel = (platform) =>
  CRYPTO_PURCHASE_PLATFORMS.find((p) => p.value === platform)?.label ?? platform

export const typeLabel = (type) =>
  CRYPTO_PURCHASE_TYPES.find((t) => t.value === type)?.label ?? type

export const isSale = (purchase) => purchase.type === 'sell'

// A manual balance adjustment: a 'sell' record with no real market price, used
// to reconcile the tracked net quantity against the real exchange balance when
// coins left the account outside of a trade (withdrawal, Convert, transfer to
// a savings/earn product, etc.) — anything the trades API can't see.
export const isAdjustment = (purchase) => isSale(purchase) && !!purchase.isAdjustment

// purchase: { type, quantity, purchasePrice }, currentPrice: live price from useCryptoPrices (USD) or null
// For 'sell' records there's no FIFO cost-basis matching yet, so only proceeds are known —
// investedUSD/gainLoss don't apply and are returned as null.
export const computePurchaseMetrics = (purchase, currentPrice) => {
  const quantity = Number(purchase.quantity) || 0
  const price = Number(purchase.purchasePrice) || 0
  if (isSale(purchase)) {
    return {
      investedUSD: null,
      currentValueUSD: null,
      gainLossUSD: null,
      gainLossPct: null,
      proceedsUSD: quantity * price,
    }
  }
  const investedUSD = quantity * price
  const hasLivePrice = currentPrice != null
  const currentValueUSD = hasLivePrice ? quantity * currentPrice : null
  const gainLossUSD = hasLivePrice ? currentValueUSD - investedUSD : null
  const gainLossPct = hasLivePrice && investedUSD > 0 ? (gainLossUSD / investedUSD) * 100 : null
  return { investedUSD, currentValueUSD, gainLossUSD, gainLossPct, proceedsUSD: null }
}
