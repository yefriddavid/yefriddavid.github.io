import { useEffect, useState } from 'react'

export const PLATFORMS = [
  'Binance',
  'Bybit',
  'Bitget',
  'OKX',
  'KuCoin',
  'Gate.io',
  'MEXC',
  'Pionex',
]

export function useIsDesktop() {
  const [desktop, setDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768,
  )
  useEffect(() => {
    const handler = () => setDesktop(window.innerWidth >= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return desktop
}

export const fmtPrice = (p) => {
  if (!p && p !== 0) return '—'
  if (p >= 1_000_000) return `$${(p / 1_000_000).toFixed(2)}M`
  if (p >= 1_000) return `$${(p / 1_000).toFixed(p % 1_000 === 0 ? 0 : 2)}K`
  return `$${Number(p).toLocaleString('en-US', { maximumFractionDigits: 6 })}`
}

export const fmtUSD = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(n ?? 0)

export const fmtDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export const calcLoanCost = (trade) => {
  const rate = Number(trade.loanRate)
  const inv = Number(trade.investment)
  if (!rate || !inv || !trade.loanStartDate) return null
  const days = Math.max(0, (Date.now() - new Date(trade.loanStartDate)) / 86400000)
  return { cost: inv * (rate / 100) * (days / 365), days: Math.floor(days), rate }
}
