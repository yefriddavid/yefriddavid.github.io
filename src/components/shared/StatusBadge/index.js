import React from 'react'
import PropTypes from 'prop-types'

/**
 * A shared badge component for displaying status (Active/Inactive, etc.)
 *
 * @param {Object} props
 * @param {boolean} [props.active] - Whether the status is active
 * @param {any} [props.value] - Alternative to active (will be truthy-checked)
 * @param {Object} [props.labels] - Custom labels for true/false states { true: '...', false: '...' }
 * @param {Object} [props.colors] - Custom colors { true: { bg, text, border }, false: { ... } }
 * @param {Function} [props.onClick] - When provided, the badge becomes clickable (e.g. toggle active state)
 */
const StatusBadge = ({ active, value, labels, colors, onClick }) => {
  const isActive = active !== undefined ? active : !!value

  const defaultLabels = { true: 'Activo', false: 'Inactivo' }
  const displayLabel = labels
    ? labels[isActive] || labels[String(isActive)]
    : defaultLabels[isActive]

  const defaultColors = {
    true: { bg: '#f0fdf4', text: '#2f9e44', border: '#86efac' },
    false: { bg: '#fff5f5', text: '#e03131', border: '#fca5a5' },
  }

  const colorSet = colors ? colors[isActive] || colors[String(isActive)] : defaultColors[isActive]

  return (
    <span
      onClick={onClick}
      style={{
        fontSize: 'var(--fs-base)',
        fontWeight: 700,
        borderRadius: 4,
        padding: '0px 8px',
        background: colorSet.bg,
        color: colorSet.text,
        border: `1px solid ${colorSet.border}`,
        whiteSpace: 'nowrap',
        display: 'inline-block',
        cursor: onClick ? 'pointer' : undefined,
        userSelect: onClick ? 'none' : undefined,
      }}
    >
      {displayLabel}
    </span>
  )
}

StatusBadge.propTypes = {
  active: PropTypes.bool,
  value: PropTypes.any,
  labels: PropTypes.object,
  colors: PropTypes.object,
  onClick: PropTypes.func,
}

export default StatusBadge
