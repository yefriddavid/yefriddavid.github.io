const isNightLabel = (label) => {
  const h = parseInt(label.split(':')[0], 10)
  return h >= 18 || h < 6
}

const nightShadingPlugin = {
  id: 'nightShading',
  beforeDraw: (chart) => {
    const { ctx, chartArea, scales, data } = chart
    if (!chartArea || !scales.x) return

    const labels = data.labels
    if (!labels?.length) return

    ctx.save()
    ctx.fillStyle = 'rgba(15, 23, 42, 0.13)'

    let nightStart = null

    const flush = (endX) => {
      if (nightStart !== null) {
        ctx.fillRect(nightStart, chartArea.top, endX - nightStart, chartArea.bottom - chartArea.top)
        nightStart = null
      }
    }

    const points = chart.getDatasetMeta(0)?.data
    if (!points?.length) return

    labels.forEach((label, i) => {
      const x = points[i]?.x ?? null
      if (x === null) return
      if (isNightLabel(label)) {
        if (nightStart === null) nightStart = i === 0 ? chartArea.left : x
      } else {
        flush(x)
      }
    })

    // close any open night segment reaching the right edge
    flush(chartArea.right)

    ctx.restore()
  },
}

export default nightShadingPlugin
