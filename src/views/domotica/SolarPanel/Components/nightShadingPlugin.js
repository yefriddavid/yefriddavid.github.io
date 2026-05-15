const hourOf = (label) => parseInt(label.split(':')[0], 10)

const isNightLabel = (label) => {
  const h = hourOf(label)
  return h >= 18 || h < 6
}

const nightShadingPlugin = {
  id: 'nightShading',
  beforeDraw: (chart) => {
    const { ctx, chartArea, data } = chart
    if (!chartArea) return

    const labels = data.labels
    if (!labels?.length) return

    const points = chart.getDatasetMeta(0)?.data
    if (!points?.length) return

    ctx.save()

    // --- night shading ---
    ctx.fillStyle = 'rgba(15, 23, 42, 0.13)'
    let nightStart = null

    const flush = (endX) => {
      if (nightStart !== null) {
        ctx.fillRect(nightStart, chartArea.top, endX - nightStart, chartArea.bottom - chartArea.top)
        nightStart = null
      }
    }

    labels.forEach((label, i) => {
      const x = points[i]?.x ?? null
      if (x === null) return
      if (isNightLabel(label)) {
        if (nightStart === null) nightStart = i === 0 ? chartArea.left : x
      } else {
        flush(x)
      }
    })
    flush(chartArea.right)

    // --- hour tick lines ---
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.25)'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])

    ctx.font = '10px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'

    const MIN_LABEL_GAP = 38
    let prevHour = null
    let lastLabelX = -Infinity

    labels.forEach((label, i) => {
      const h = hourOf(label)
      if (prevHour !== null && h !== prevHour) {
        const x = points[i]?.x ?? null
        if (x !== null) {
          ctx.beginPath()
          ctx.moveTo(x, chartArea.top)
          ctx.lineTo(x, chartArea.bottom)
          ctx.stroke()

          if (x - lastLabelX >= MIN_LABEL_GAP) {
            ctx.fillStyle = 'rgba(100, 116, 139, 0.7)'
            ctx.fillText(`${String(h).padStart(2, '0')}:00`, x, chartArea.top + 4)
            lastLabelX = x
          }
        }
      }
      prevHour = h
    })

    ctx.restore()
  },
}

export default nightShadingPlugin
