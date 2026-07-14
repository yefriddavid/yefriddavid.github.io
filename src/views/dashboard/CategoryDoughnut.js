import React from 'react'
import PropTypes from 'prop-types'
import { CChartDoughnut } from '@coreui/react-chartjs'
import { fmt } from 'src/utils/formatters'
import { CASHFLOW_CHART_CATEGORY_COLORS as COLORS } from 'src/constants/cashFlow'
import EmptyState from 'src/components/shared/EmptyState'

const CategoryDoughnut = ({ data, emptyMessage }) => {
  if (data.length === 0) return <EmptyState message={emptyMessage} size="sm" />

  return (
    <>
      <CChartDoughnut
        style={{ maxHeight: 200 }}
        data={{
          labels: data.map((c) => c.label),
          datasets: [
            {
              data: data.map((c) => c.value),
              backgroundColor: COLORS,
              borderWidth: 2,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 8 } },
            tooltip: { callbacks: { label: (ctx) => ` ${fmt(ctx.raw)}` } },
          },
          cutout: '62%',
        }}
      />
      <div className="category-legend">
        {data.map((c, i) => (
          <div key={c.label} className="category-legend__row">
            <span>
              <span
                className="category-legend__dot"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              {c.label}
            </span>
            <strong>{fmt(c.value)}</strong>
          </div>
        ))}
      </div>
    </>
  )
}

CategoryDoughnut.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string.isRequired, value: PropTypes.number.isRequired }),
  ).isRequired,
  emptyMessage: PropTypes.string.isRequired,
}

export default CategoryDoughnut
