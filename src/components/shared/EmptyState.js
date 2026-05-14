import React from 'react'
import PropTypes from 'prop-types'
import './EmptyState.scss'

/**
 * A shared component for displaying an empty state message with an icon.
 *
 * @param {Object} props
 * @param {string} props.message - The message to display
 * @param {string} [props.icon='📭'] - Emoji or icon to display
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Component size
 */
const EmptyState = ({ message, icon = '📭', size = 'md' }) => (
  <div className={`app-empty-state app-empty-state--${size}`}>
    <span className="app-empty-state__icon">{icon}</span>
    <p className="app-empty-state__message">{message}</p>
  </div>
)

EmptyState.propTypes = {
  message: PropTypes.string.isRequired,
  icon: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
}

export default EmptyState
