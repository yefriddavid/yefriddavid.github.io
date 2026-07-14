import React from 'react'
import PropTypes from 'prop-types'
import { CChartBar } from '@coreui/react-chartjs'
import { fmtCompact } from 'src/utils/formatters'
import EmptyState from 'src/components/shared/EmptyState'

const TopRankingChart = ({ entries, color, emptyMessage, onBarClick }) => {
  if (entries.length === 0) return <EmptyState message={emptyMessage} size="sm" />

  return (
    <CChartBar
      style={{ maxHeight: 260, cursor: onBarClick ? 'pointer' : undefined }}
      data={{
        labels: entries.map(([label]) => label),
        datasets: [
          {
            label: 'Total',
            data: entries.map(([, v]) => v),
            backgroundColor: entries.map((_, i) => (i === 0 ? color : `${color}b3`)),
            borderRadius: 5,
          },
        ],
      }}
      options={{
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: 'rgba(0,0,0,0.06)' },
            ticks: { font: { size: 10 }, callback: (v) => fmtCompact(v) },
          },
          y: { grid: { display: false }, ticks: { font: { size: 11 } } },
        },
        onClick: onBarClick
          ? (_event, elements) => {
              if (elements.length > 0) onBarClick(entries[elements[0].index][0])
            }
          : undefined,
        onHover: onBarClick
          ? (event, elements) => {
              event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default'
            }
          : undefined,
      }}
    />
  )
}

TopRankingChart.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.array).isRequired,
  color: PropTypes.string.isRequired,
  emptyMessage: PropTypes.string.isRequired,
  onBarClick: PropTypes.func,
}

export default TopRankingChart
