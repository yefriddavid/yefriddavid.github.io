import React from 'react'
import PropTypes from 'prop-types'
import * as XLSX from 'xlsx'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload } from '@coreui/icons'
import { fmt } from 'src/utils/formatters'
import EmptyState from 'src/components/shared/EmptyState'
import { buildPivotAoa } from './analysisHelpers'

const PivotTable = ({ months, categories, matrix, year, type, emptyMessage }) => {
  if (categories.length === 0) return <EmptyState message={emptyMessage} size="sm" />

  const monthTotals = months.map((_, m) => matrix.reduce((s, row) => s + row[m], 0))
  const rowTotals = matrix.map((row) => row.reduce((s, v) => s + v, 0))
  const grandTotal = rowTotals.reduce((s, v) => s + v, 0)

  const handleExport = () => {
    const aoa = buildPivotAoa(categories, matrix, months)
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    ws['!cols'] = [{ wch: 22 }, ...months.map(() => ({ wch: 12 })), { wch: 14 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, `${type === 'income' ? 'Ingresos' : 'Egresos'} ${year}`)
    XLSX.writeFile(wb, `analisis_${type}_${year}.xlsx`)
  }

  return (
    <div className="analysis-pivot">
      <button type="button" className="analysis-pivot__export-btn" onClick={handleExport}>
        <CIcon icon={cilCloudDownload} className="me-1" /> Exportar a Excel
      </button>
      <div className="analysis-pivot__scroll">
        <table className="analysis-pivot__table">
          <thead>
            <tr>
              <th>Categoría</th>
              {months.map((m) => (
                <th key={m}>{m}</th>
              ))}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => (
              <tr key={cat}>
                <td className="analysis-pivot__row-label">{cat}</td>
                {matrix[i].map((v, m) => (
                  <td key={m}>{v ? fmt(v) : '—'}</td>
                ))}
                <td className="analysis-pivot__total-cell">{fmt(rowTotals[i])}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              {monthTotals.map((v, m) => (
                <td key={m}>{fmt(v)}</td>
              ))}
              <td className="analysis-pivot__total-cell">{fmt(grandTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

PivotTable.propTypes = {
  months: PropTypes.arrayOf(PropTypes.string).isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  matrix: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  year: PropTypes.number.isRequired,
  type: PropTypes.oneOf(['income', 'expense']).isRequired,
  emptyMessage: PropTypes.string.isRequired,
}

export default PivotTable
