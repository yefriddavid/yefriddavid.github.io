import { useEffect, useMemo, useState } from 'react'
import { BASE_LEVEL_H } from './gridConstants'

export const useGridLevels = ({ transactions }) => {
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
  const [snakeLayout, setSnakeLayout] = useState(true)

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

  const snakeColMap = useMemo(() => {
    const sorted = [...visibleTransactions].sort((a, b) => b.price - a.price)
    const map = new Map()
    sorted.forEach((t, i) => map.set(t.price, i % 2))
    return map
  }, [visibleTransactions])

  const centerView = () => setViewTopPrice(currentPrice + 7 * step)

  return {
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
    snakeLayout,
    setSnakeLayout,
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
    snakeColMap,
    centerView,
  }
}
