import React from 'react'
import { CChartLine } from '@coreui/react-chartjs'
import { CSpinner } from '@coreui/react'

const VoltageChart = ({ data, loading }) => {
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

  const labels = data.map((r) => {
    const d = new Date(r.createdAt)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  })

  const values = data.map((r) => r.value)

  return (
    <CChartLine
      style={{ height: '180px' }}
      data={{
        labels,
        datasets: [
          {
            label: 'Voltaje (V)',
            data: values,
            borderColor: '#1971c2',
            backgroundColor: 'rgba(25, 113, 194, 0.08)',
            borderWidth: 2,
            pointRadius: data.length > 60 ? 0 : 3,
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
            ticks: {
              maxTicksLimit: 12,
              maxRotation: 0,
            },
            grid: { display: false },
          },
          y: {
            min: 10,
            max: 15,
            ticks: {
              stepSize: 0.5,
              callback: (v) => `${v}V`,
            },
          },
        },
      }}
    />
  )
}

export default VoltageChart
