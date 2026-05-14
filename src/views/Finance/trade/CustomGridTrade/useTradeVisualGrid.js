import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import * as actions from 'src/actions/finance/customGridTradeActions'
import { BASE_LEVEL_H, SNAKE_X } from './gridConstants'

export const useTradeVisualGrid = ({ transactions, loanRate }) => {
  const dispatch = useDispatch()

  const [selectedPrice, setSelectedPrice] = useState(78000)
  const [currentPrice, setCurrentPrice] = useState(
    () => Number(localStorage.getItem('cgt.currentPrice')) || 77500,
  )
  const [gridStep, setGridStep] = useState(1000)
  const [viewTopPrice, setViewTopPrice] = useState(
    () => Number(sessionStorage.getItem('cgt.viewTopPrice')) || 78000 + 7 * 1000,
  )
  const [visibleLevels, setVisibleLevels] = useState(15)
  const [textScale, setTextScale] = useState(1)
  const [panEnabled, setPanEnabled] = useState(true)
  const [snakeLayout, setSnakeLayout] = useState(true)
  const [hiddenTrades, setHiddenTrades] = useState(
    () => new Set(transactions.filter((t) => t.hidden).map((t) => t.price)),
  )
  const [showHiddenOnly, setShowHiddenOnly] = useState(false)
  const [priceFilter, setPriceFilter] = useState(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterInput, setFilterInput] = useState('')
  const [detailModal, setDetailModal] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [frontPrice, setFrontPrice] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const outerRef = useRef(null)
  const containerRef = useRef(null)
  const isPointerDown = useRef(false)
  const isDragging = useRef(false)
  const dragStartY = useRef(0)
  const dragStartViewTop = useRef(0)

  useEffect(() => {
    sessionStorage.setItem('cgt.viewTopPrice', viewTopPrice)
  }, [viewTopPrice])

  useEffect(() => {
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT')
      .then((r) => r.json())
      .then((data) => {
        const price = Math.round(Number(data.price))
        if (price > 0) {
          setCurrentPrice(price)
          localStorage.setItem('cgt.currentPrice', price)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setHiddenTrades(new Set(transactions.filter((t) => t.hidden).map((t) => t.price)))
  }, [transactions])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const step = Math.max(1, gridStep)
  const LEVEL_H = Math.round(BASE_LEVEL_H * textScale)
  const H = visibleLevels * LEVEL_H + 200

  const fmt = (p) => `$${(p / 1000).toFixed(2)}K`
  const fmtVal = (v) => `${v >= 0 ? '+' : ''}$${Math.abs(v).toFixed(2)}`
  const fs = (base) => base * textScale

  const toY = (p) => 100 + ((viewTopPrice - p) / step) * LEVEL_H

  const levels = useMemo(() => {
    const topGridLevel = selectedPrice + Math.ceil((viewTopPrice - selectedPrice) / step) * step
    const result = []
    for (let i = 0; i < visibleLevels + 3; i++) {
      const price = topGridLevel - i * step
      const y = 100 + ((viewTopPrice - price) / step) * LEVEL_H
      if (y >= -60 && y <= H + 60) result.push(price)
    }
    return result
  }, [selectedPrice, viewTopPrice, step, visibleLevels, H, LEVEL_H])

  const viewBottomPrice = viewTopPrice - (visibleLevels + 1) * step
  const visibleTransactions = transactions.filter(
    (t) => t.price >= viewBottomPrice && t.price <= viewTopPrice + step,
  )

  const currentPriceY = toY(currentPrice)
  const showCurrentPrice = currentPriceY > -20 && currentPriceY < H + 20

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

  const snakeColMap = useMemo(() => {
    const sorted = [...visibleTransactions].sort((a, b) => b.price - a.price)
    const map = new Map()
    sorted.forEach((t, i) => map.set(t.price, i % 2))
    return map
  }, [visibleTransactions])

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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) outerRef.current?.requestFullscreen()
    else document.exitFullscreen()
  }

  const centerView = () => setViewTopPrice(currentPrice + 7 * step)

  const openFilterDialog = () => {
    setFilterInput(priceFilter !== null ? String(priceFilter) : '')
    setFilterOpen(true)
  }

  const closeDetailModal = () => {
    setDetailModal(null)
    setEditForm(null)
  }

  const saveDetailModal = () => {
    dispatch(
      actions.saveRequest({
        id: detailModal.id,
        price: Number(editForm.price),
        quantity: Number(editForm.quantity),
        fecha: editForm.fecha,
        notes: editForm.notes.trim(),
      }),
    )
    closeDetailModal()
  }

  const onPointerDown = (e) => {
    if (!panEnabled) return
    isPointerDown.current = true
    isDragging.current = false
    dragStartY.current = e.clientY
    dragStartViewTop.current = viewTopPrice
  }

  const onPointerMove = (e) => {
    if (!isPointerDown.current) return
    const deltaYScreen = e.clientY - dragStartY.current
    if (!isDragging.current && Math.abs(deltaYScreen) > 5) {
      isDragging.current = true
      e.currentTarget.setPointerCapture(e.pointerId)
      if (containerRef.current) containerRef.current.style.cursor = 'grabbing'
    }
    if (!isDragging.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const scaleY = H / rect.height
    const deltaYSvg = deltaYScreen * scaleY
    setViewTopPrice(dragStartViewTop.current + deltaYSvg * (step / LEVEL_H))
  }

  const stopDrag = () => {
    isPointerDown.current = false
    isDragging.current = false
    if (containerRef.current) containerRef.current.style.cursor = 'grab'
  }

  return {
    // state
    selectedPrice,
    setSelectedPrice,
    currentPrice,
    setCurrentPrice,
    gridStep,
    setGridStep,
    viewTopPrice,
    setViewTopPrice,
    visibleLevels,
    setVisibleLevels,
    textScale,
    setTextScale,
    panEnabled,
    setPanEnabled,
    snakeLayout,
    setSnakeLayout,
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
    detailModal,
    setDetailModal,
    editForm,
    setEditForm,
    frontPrice,
    setFrontPrice,
    isFullscreen,
    // refs
    outerRef,
    containerRef,
    // computed
    step,
    LEVEL_H,
    H,
    fmt,
    fmtVal,
    fs,
    toY,
    levels,
    visibleTransactions,
    currentPriceY,
    showCurrentPrice,
    sortedTransactions,
    totals,
    snakeColMap,
    SNAKE_X,
    // handlers
    toggleHide,
    toggleHideAll,
    toggleFullscreen,
    centerView,
    openFilterDialog,
    closeDetailModal,
    saveDetailModal,
    onPointerDown,
    onPointerMove,
    stopDrag,
  }
}
