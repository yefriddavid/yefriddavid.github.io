export const fmtPrice = (p) => {
  if (p == null || Number.isNaN(p)) return '—'
  if (p >= 1_000_000) return `$${(p / 1_000_000).toFixed(2)}M`
  if (p >= 1_000) return `$${(p / 1_000).toFixed(2)}K`
  if (p >= 1) return `$${p.toFixed(2)}`
  return `$${p.toFixed(6)}`
}

export const fmtUSD = (n) =>
  n >= 1 ? `$${Math.round(n).toLocaleString('en-US')}` : `$${(n || 0).toFixed(2)}`

// Builds gridCount+1 evenly spaced price levels symmetric around centerPrice,
// spanning +/- rangePct.
export const computeGridLevels = ({ centerPrice, gridCount, rangePct }) => {
  const cp = Number(centerPrice)
  const gc = Math.max(1, Math.round(Number(gridCount) || 0))
  const pct = Math.max(0.1, Number(rangePct) || 0) / 100
  if (!cp || cp <= 0) return null
  const upper = cp * (1 + pct)
  const lower = cp * (1 - pct)
  const step = (upper - lower) / gc
  const levels = Array.from({ length: gc + 1 }, (_, i) => lower + i * step)
  return { levels, upper, lower, step, gridCount: gc }
}

// % increase from each level to the next one above it, bottom to top.
export const levelStepPercents = (levels) =>
  levels.slice(1).map((price, i) => ((price - levels[i]) / levels[i]) * 100)

// Illustrative price oscillation (a sine wave spanning the grid range) used to
// show where a grid bot would fire: a falling crossing through a level below
// centerPrice is a Buy, a rising crossing through a level above centerPrice is
// a Sell. This is NOT a backtest against real price history — it only
// demonstrates the mechanics of a grid for an arbitrary up/down price move.
export const buildWaveTrades = ({
  levels,
  centerPrice,
  upper,
  lower,
  cycles = 1,
  samples = 500,
  invert = false,
}) => {
  const amplitude = ((upper - lower) / 2) * (invert ? -1 : 1)
  const priceAt = (frac) => centerPrice - amplitude * Math.sin(frac * cycles * 2 * Math.PI)

  const points = Array.from({ length: samples + 1 }, (_, i) => {
    const frac = i / samples
    return { frac, price: priceAt(frac) }
  })

  const markers = []
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    levels.forEach((level) => {
      if (a.price < level && b.price >= level && level > centerPrice) {
        const t = (level - a.price) / (b.price - a.price)
        markers.push({ frac: a.frac + t * (b.frac - a.frac), price: level, type: 'sell' })
      } else if (a.price > level && b.price <= level && level < centerPrice) {
        const t = (level - a.price) / (b.price - a.price)
        markers.push({ frac: a.frac + t * (b.frac - a.frac), price: level, type: 'buy' })
      }
    })
  }
  markers.sort((m1, m2) => m1.frac - m2.frac)

  return { points, markers, pairs: pairMarkers(markers) }
}

// Pairs each buy with the chronologically next unmatched sell — purely to
// draw the round-trip connector lines from the reference diagram. Re-sorts
// by frac first since draggable markers can end up out of order.
export const pairMarkers = (markers) => {
  const sorted = [...markers].sort((a, b) => a.frac - b.frac)
  const pairs = []
  const openBuys = []
  sorted.forEach((m) => {
    if (m.type === 'buy') openBuys.push(m)
    else if (openBuys.length) pairs.push([openBuys.shift(), m])
  })
  return pairs
}
