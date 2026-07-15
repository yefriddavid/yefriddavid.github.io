import React from 'react'
import PropTypes from 'prop-types'
import { CChartLine } from '@coreui/react-chartjs'
import { fmt, fmtCompact } from 'src/utils/formatters'
import { CASHFLOW_CHART_CATEGORY_COLORS as COLORS } from 'src/constants/cashFlow'
import EmptyState from 'src/components/shared/EmptyState'

const CategoryTrendChart = ({ months, categories, matrix, emptyMessage }) => {
  if (categories.length === 0) return <EmptyState message={emptyMessage} size="sm" />

  return (
    <>
      <CChartLine
        style={{ maxHeight: 280 }}
        data={{
          labels: months,
          datasets: categories.map((cat, i) => ({
            label: cat,
            data: matrix[i],
            borderColor: COLORS[i % COLORS.length],
            backgroundColor: COLORS[i % COLORS.length],
            borderWidth: 2,
            pointRadius: 3,
            tension: 0.3,
            fill: false,
          })),
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${fmt(ctx.raw)}` } },
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 } } },
            y: {
              grid: { color: 'rgba(0,0,0,0.06)' },
              ticks: { font: { size: 10 }, callback: (v) => fmtCompact(v) },
            },
          },
        }}
      />
      <div className="analysis-legend">
        {categories.map((cat, i) => (
          <div key={cat} className="analysis-legend__row">
            <span
              className="analysis-legend__dot"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            {cat}
          </div>
        ))}
      </div>
    </>
  )
}

CategoryTrendChart.propTypes = {
  months: PropTypes.arrayOf(PropTypes.string).isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  matrix: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  emptyMessage: PropTypes.string.isRequired,
}

export default CategoryTrendChart
