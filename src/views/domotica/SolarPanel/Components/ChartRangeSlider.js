import React from 'react'

const ChartRangeSlider = ({ total, start, end, onChange, startLabel, endLabel }) => {
  if (!total || total <= 1) return null

  const max = total - 1
  const leftPct = (start / max) * 100
  const rightPct = (end / max) * 100
  const leftZ = start / max > 0.9 ? 3 : 1

  return (
    <div className="chart-range-slider">
      <div className="chart-range-slider__track-bg" />
      <div
        className="chart-range-slider__track-fill"
        style={{ left: `${leftPct}%`, width: `${rightPct - leftPct}%` }}
      />
      <input
        type="range"
        min={0}
        max={max}
        value={start}
        style={{ zIndex: leftZ }}
        onChange={(e) => onChange([Math.min(+e.target.value, end - 1), end])}
      />
      <input
        type="range"
        min={0}
        max={max}
        value={end}
        style={{ zIndex: leftZ === 3 ? 1 : 2 }}
        onChange={(e) => onChange([start, Math.max(+e.target.value, start + 1)])}
      />
      <div className="chart-range-slider__labels">
        <span>{startLabel}</span>
        <span>{endLabel}</span>
      </div>
    </div>
  )
}

export default ChartRangeSlider
