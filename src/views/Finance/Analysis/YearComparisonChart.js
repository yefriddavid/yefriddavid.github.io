import React from 'react'
import PropTypes from 'prop-types'
import { CChartBar } from '@coreui/react-chartjs'
import { fmt, fmtCompact } from 'src/utils/formatters'

const YearComparisonChart = ({ years, income, expense }) => {
  const net = income.map((v, i) => v - expense[i])

  return (
    <CChartBar
      style={{ maxHeight: 300 }}
      data={{
        labels: years.map(String),
        datasets: [
          {
            label: 'Ingresos',
            backgroundColor: 'rgba(47,158,68,0.75)',
            data: income,
            borderRadius: 4,
            order: 1,
          },
          {
            label: 'Egresos',
            backgroundColor: 'rgba(224,49,49,0.65)',
            data: expense,
            borderRadius: 4,
            order: 1,
          },
          {
            type: 'line',
            label: 'Neto',
            data: net,
            borderColor: 'rgba(25,113,194,0.85)',
            backgroundColor: 'rgba(25,113,194,0.85)',
            borderWidth: 2,
            pointRadius: 4,
            fill: false,
            tension: 0.3,
            order: 0,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { position: 'top', labels: { font: { size: 11 } } },
          tooltip: {
            callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${fmt(ctx.raw)}` },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 12, weight: '600' } } },
          y: {
            grid: { color: 'rgba(0,0,0,0.06)' },
            ticks: { font: { size: 10 }, callback: (v) => fmtCompact(v) },
          },
        },
      }}
    />
  )
}

YearComparisonChart.propTypes = {
  years: PropTypes.arrayOf(PropTypes.number).isRequired,
  income: PropTypes.arrayOf(PropTypes.number).isRequired,
  expense: PropTypes.arrayOf(PropTypes.number).isRequired,
}

export default YearComparisonChart
