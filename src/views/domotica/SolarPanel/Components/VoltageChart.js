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
  const userAdjusted = React.useRef(false)

  useEffect(() => {
    if (!data?.length) return
    if (userAdjusted.current) {
      setRange((prev) => [prev[0], Math.min(prev[1], data.length - 1)])
    } else {
      setRange([0, data.length - 1])
    }
  }, [data?.length])

  const handleRangeChange = (r) => {
    userAdjusted.current = true
    setRange(r)
  }

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

  return (
    <>
      <ChartRangeSlider
        total={data.length}
        start={startIdx}
        end={endIdx}
        onChange={handleRangeChange}
        startLabel={data[startIdx] ? fmt(data[startIdx].createdAt) : ''}
        endLabel={data[endIdx] ? fmt(data[endIdx].createdAt) : ''}
      />
      <CChartLine
        plugins={[nightShadingPlugin]}
        style={{ height: '260px' }}
        data={{
          labels,
          datasets: [
            {
              label: 'Voltaje (V)',
              data: values,
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
