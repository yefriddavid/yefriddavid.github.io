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
 */
const StatusBadge = ({ active, value, labels, colors }) => {
  const isActive = active !== undefined ? active : !!value

  const defaultLabels = { true: 'Activo', false: 'Inactivo' }
  const displayLabel = labels
    ? labels[isActive] || labels[String(isActive)]
    : defaultLabels[isActive]

  const defaultColors = {
    true: { bg: '#d3f9d8', text: '#2f9e44', border: '#8ce99a' },
    false: { bg: '#ffe3e3', text: '#c92a2a', border: '#ffa8a8' },
  }

  const colorSet = colors
    ? colors[isActive] || colors[String(isActive)]
    : defaultColors[isActive]

  return (
    <span
      style={{
        fontSize: 'var(--fs-2xs)',
        fontWeight: 700,
        borderRadius: 20,
        padding: '2px 10px',
        background: colorSet.bg,
        color: colorSet.text,
        border: `1px solid ${colorSet.border}`,
        whiteSpace: 'nowrap',
        display: 'inline-block',
        textTransform: 'uppercase',
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
}

export default StatusBadge
