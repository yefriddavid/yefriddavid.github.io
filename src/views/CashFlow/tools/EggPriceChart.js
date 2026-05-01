import React from 'react'
import { CChartLine } from '@coreui/react-chartjs'

const X_POINTS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

const EggPriceChart = () => {
  return (
    <div
      style={{
        marginTop: 24,
        padding: '16px 20px',
        border: '1px solid var(--cui-border-color)',
        borderRadius: 10,
        background: 'var(--cui-body-bg)',
      }}
    >
      <div
        style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--cui-body-color)' }}
      >
        Precio del huevo — 10K a 100K
      </div>
      <CChartLine
        style={{ height: 260 }}
        data={{
          labels: X_POINTS.map((v) => `${v}K`),
          datasets: [
            {
              label: 'Precio huevo',
              data: X_POINTS,
              borderColor: '#1971c2',
              backgroundColor: 'rgba(25, 113, 194, 0.08)',
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              tension: 0,
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
                label: (ctx) => ` $${ctx.parsed.y}K`,
              },
            },
          },
          scales: {
            x: {
              title: { display: true, text: 'Precio del huevo (COP)', font: { size: 11 } },
              grid: { display: false },
            },
            y: {
              min: 10,
              max: 100,
              title: { display: true, text: 'Valor (K)', font: { size: 11 } },
              ticks: { callback: (v) => `${v}K` },
            },
          },
        }}
      />
    </div>
  )
}

export default EggPriceChart
