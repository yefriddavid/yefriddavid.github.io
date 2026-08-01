// Detects "bounces": rallies of at least minPercent% from a local price low
// to the next local high, before price drops again. Uses candle low/high
// (not just close) so wicks count toward the swing extremes.
export function detectBounces(series, minPercent) {
  if (!series?.length || !(minPercent > 0)) return []

  const results = []
  let troughIdx = 0
  let peakIdx = 0

  const tryFinalize = () => {
    const trough = series[troughIdx]
    const peak = series[peakIdx]
    const percent = ((peak.high - trough.low) / trough.low) * 100
    if (peakIdx > troughIdx && percent >= minPercent) {
      results.push({
        lowIndex: troughIdx,
        lowTime: trough.time,
        lowPrice: trough.low,
        highIndex: peakIdx,
        highTime: peak.time,
        highPrice: peak.high,
        percent,
      })
    }
  }

  for (let i = 1; i < series.length; i++) {
    const c = series[i]
    if (c.low < series[troughIdx].low) {
      tryFinalize()
      troughIdx = i
      peakIdx = i
      continue
    }
    if (c.high > series[peakIdx].high) peakIdx = i
  }
  tryFinalize()

  return results
}
