import { useMemo } from 'react'

export const useGridPnl = ({ transactions, currentPrice, loanRate, hiddenTrades }) => {
  const totals = useMemo(() => {
    const now = new Date()
    let loanSum = 0
    let grossSum = 0
    transactions
      .filter((t) => !hiddenTrades.has(t.price))
      .forEach((t) => {
        const days = Math.ceil(Math.abs(now - new Date(t.fecha)) / (1000 * 60 * 60 * 24))
        loanSum += t.price * t.quantity * (loanRate / 100 / 365) * days
        grossSum += (currentPrice - t.price) * t.quantity
      })
    const investedSum = transactions
      .filter((t) => !hiddenTrades.has(t.price))
      .reduce((acc, t) => acc + t.price * t.quantity, 0)
    return { loanSum, grossSum, total: loanSum + Math.abs(grossSum), investedSum }
  }, [transactions, currentPrice, loanRate, hiddenTrades])

  return { totals }
}
