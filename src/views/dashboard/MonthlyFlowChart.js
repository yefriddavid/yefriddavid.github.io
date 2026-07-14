import React from 'react'
import PropTypes from 'prop-types'
import { CChartBar } from '@coreui/react-chartjs'
import { fmtCompact } from 'src/utils/formatters'

const MonthlyFlowChart = ({ labels, income, expense, onMonthClick }) => {
  const net = income.map((v, i) => v - expense[i])

  return (
    <CChartBar
      style={{ maxHeight: 300, cursor: onMonthClick ? 'pointer' : undefined }}
      data={{
        labels,
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
            borderColor: 'rgba(25,113,194,0.8)',
            borderWidth: 1.5,
            borderDash: [6, 4],
            pointRadius: 0,
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
            callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${fmtCompact(ctx.raw)}` },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: {
            grid: { color: 'rgba(0,0,0,0.06)' },
            ticks: { font: { size: 10 }, callback: (v) => fmtCompact(v) },
          },
        },
        onClick: onMonthClick
          ? (_event, elements) => {
              if (elements.length > 0) onMonthClick(elements[0].index)
            }
          : undefined,
        onHover: onMonthClick
          ? (event, elements) => {
              event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default'
            }
          : undefined,
      }}
    />
  )
}

MonthlyFlowChart.propTypes = {
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  income: PropTypes.arrayOf(PropTypes.number).isRequired,
  expense: PropTypes.arrayOf(PropTypes.number).isRequired,
  onMonthClick: PropTypes.func,
}

export default MonthlyFlowChart
