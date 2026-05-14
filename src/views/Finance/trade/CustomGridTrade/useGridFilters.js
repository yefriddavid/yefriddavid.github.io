import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import * as actions from 'src/actions/finance/customGridTradeActions'

export const useGridFilters = ({ transactions, visibleTransactions }) => {
  const dispatch = useDispatch()

  const [hiddenTrades, setHiddenTrades] = useState(
    () => new Set(transactions.filter((t) => t.hidden).map((t) => t.price)),
  )
  const [showHiddenOnly, setShowHiddenOnly] = useState(false)
  const [priceFilter, setPriceFilter] = useState(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterInput, setFilterInput] = useState('')
  const [frontPrice, setFrontPrice] = useState(null)

  useEffect(() => {
    setHiddenTrades(new Set(transactions.filter((t) => t.hidden).map((t) => t.price)))
  }, [transactions])

  const sortedTransactions = useMemo(
    () =>
      [...visibleTransactions]
        .filter((t) => (showHiddenOnly ? hiddenTrades.has(t.price) : !hiddenTrades.has(t.price)))
        .filter((t) => priceFilter === null || t.price * t.quantity > priceFilter)
        .sort((a, b) => {
          if (a.price === frontPrice) return 1
          if (b.price === frontPrice) return -1
          return 0
        }),
    [visibleTransactions, frontPrice, priceFilter, hiddenTrades, showHiddenOnly],
  )

  const toggleHide = (trade) => {
    const nowHidden = !hiddenTrades.has(trade.price)
    setHiddenTrades((prev) => {
      const s = new Set(prev)
      nowHidden ? s.add(trade.price) : s.delete(trade.price)
      return s
    })
    dispatch(actions.saveRequest({ ...trade, hidden: nowHidden }))
  }

  const toggleHideAll = () => {
    const nowHidden = hiddenTrades.size === 0
    setHiddenTrades(nowHidden ? new Set(transactions.map((t) => t.price)) : new Set())
    transactions.forEach((t) => dispatch(actions.saveRequest({ ...t, hidden: nowHidden })))
  }

  const openFilterDialog = () => {
    setFilterInput(priceFilter !== null ? String(priceFilter) : '')
    setFilterOpen(true)
  }

  return {
    hiddenTrades,
    setHiddenTrades,
    showHiddenOnly,
    setShowHiddenOnly,
    priceFilter,
    setPriceFilter,
    filterOpen,
    setFilterOpen,
    filterInput,
    setFilterInput,
    frontPrice,
    setFrontPrice,
    sortedTransactions,
    toggleHide,
    toggleHideAll,
    openFilterDialog,
  }
}
