import React, { useState, useEffect } from 'react'
import { CChartLine } from '@coreui/react-chartjs'
import { CSpinner } from '@coreui/react'
import ChartRangeSlider from './ChartRangeSlider'
import nightShadingPlugin from './nightShadingPlugin'

const fmt = (iso) => {
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

const VoltageChart = ({ data, loading }) => {
  const [range, setRange] = useState([0, 0])

  useEffect(() => {
    if (data?.length) setRange([0, data.length - 1])
  }, [data?.length])

  if (loading && (!data || data.length === 0)) {
    return (
      <div className="solar-panel__chart-loading">
        <CSpinner size="sm" className="me-2" />
        Cargando historial…
      </div>
    )
  }

  if (!data || data.length === 0) {
    return <div className="solar-panel__chart-empty">Sin datos de voltaje para hoy.</div>
  }

  const [startIdx, endIdx] = range
  const slice = data.slice(startIdx, endIdx + 1)
  const labels = slice.map((r) => fmt(r.createdAt))
  const values = slice.map((r) => r.value)

  const trailingLabels = []
  const trailingValues = []
  if (slice.length >= 2) {
    const avgInterval =
      (new Date(slice[slice.length - 1].createdAt) - new Date(slice[0].createdAt)) / (slice.length - 1)
    const last = new Date(slice[slice.length - 1].createdAt)
    const steps = Math.max(3, Math.round((2 * 60 * 60 * 1000) / avgInterval))
    for (let i = 1; i <= steps; i++) {
      trailingLabels.push(fmt(new Date(last.getTime() + avgInterval * i).toISOString()))
      trailingValues.push(null)
    }
  }

  return (
    <>
      <ChartRangeSlider
        total={data.length}
        start={startIdx}
        end={endIdx}
        onChange={setRange}
        startLabel={data[startIdx] ? fmt(data[startIdx].createdAt) : ''}
        endLabel={data[endIdx] ? fmt(data[endIdx].createdAt) : ''}
      />
      <CChartLine
        plugins={[nightShadingPlugin]}
        style={{ height: '260px' }}
        data={{
          labels: [...labels, ...trailingLabels],
          datasets: [
            {
              label: 'Voltaje (V)',
              data: [...values, ...trailingValues],
              borderColor: '#1971c2',
              backgroundColor: 'rgba(25, 113, 194, 0.08)',
              borderWidth: 2,
              pointRadius: slice.length > 60 ? 0 : 3,
              pointHoverRadius: 4,
              tension: 0.3,
              fill: true,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.parsed.y.toFixed(2)} V`,
              },
            },
          },
          scales: {
            x: {
              ticks: { maxTicksLimit: 12, maxRotation: 0 },
              grid: { display: false },
            },
            y: {
              min: 10,
              max: 15,
              ticks: { stepSize: 0.5, callback: (v) => `${v}V` },
            },
          },
        }}
      />
    </>
  )
}

export default VoltageChart
