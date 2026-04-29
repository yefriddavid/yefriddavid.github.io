import React, { useState, useEffect } from 'react'
import { CChartLine } from '@coreui/react-chartjs'
import { CSpinner } from '@coreui/react'
import ChartRangeSlider from './ChartRangeSlider'

const fmt = (iso) => {
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

const CurrentChart = ({ data, loading }) => {
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
    return <div className="solar-panel__chart-empty">Sin datos de corriente para hoy.</div>
  }

  const [startIdx, endIdx] = range
  const slice = data.slice(startIdx, endIdx + 1)
  const labels = slice.map((r) => fmt(r.createdAt))
  const values = slice.map((r) => r.value != null ? parseFloat(r.value.toFixed(2)) : null)

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
        style={{ height: '180px' }}
        data={{
          labels,
          datasets: [
            {
              label: 'Corriente (A)',
              data: values,
              borderColor: '#7c3aed',
              backgroundColor: 'rgba(124, 58, 237, 0.08)',
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
                label: (ctx) => ` ${ctx.parsed.y.toFixed(2)} A`,
              },
            },
          },
          scales: {
            x: {
              ticks: { maxTicksLimit: 12, maxRotation: 0 },
              grid: { display: false },
            },
            y: {
              ticks: { callback: (v) => `${parseFloat(v.toFixed(2))}A` },
            },
          },
        }}
      />
    </>
  )
}

export default CurrentChart
