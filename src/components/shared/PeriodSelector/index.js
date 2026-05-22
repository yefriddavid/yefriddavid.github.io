import React from 'react'
import PropTypes from 'prop-types'
import { CFormSelect } from '@coreui/react'
import useLocaleData from 'src/hooks/useLocaleData'

/**
 * A shared component for selecting a month and year.
 *
 * @param {Object} props
 * @param {Object} props.value - { month: number, year: number }
 * @param {Function} props.onChange - Callback with new value
 * @param {number[]} [props.years] - List of years to display
 * @param {string} [props.size='sm'] - CoreUI size
 */
const PeriodSelector = ({ value, onChange, years, size = 'sm' }) => {
  const { monthLabels } = useLocaleData()
  const currentYear = new Date().getFullYear()
  const availableYears =
    years || Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).sort((a, b) => b - a)

  const handleMonthChange = (e) => {
    onChange({ ...value, month: Number(e.target.value) })
  }

  const handleYearChange = (e) => {
    onChange({ ...value, year: Number(e.target.value) })
  }

  return (
    <div className="d-flex align-items-center gap-2">
      <CFormSelect
        size={size}
        style={{ width: 120 }}
        value={value.month}
        onChange={handleMonthChange}
      >
        {monthLabels.map((name, i) => (
          <option key={i + 1} value={i + 1}>
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </option>
        ))}
      </CFormSelect>
      <CFormSelect
        size={size}
        style={{ width: 90 }}
        value={value.year}
        onChange={handleYearChange}
      >
        {availableYears.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </CFormSelect>
    </div>
  )
}

PeriodSelector.propTypes = {
  value: PropTypes.shape({
    month: PropTypes.number.isRequired,
    year: PropTypes.number.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  years: PropTypes.arrayOf(PropTypes.number),
  size: PropTypes.string,
}

export default PeriodSelector
