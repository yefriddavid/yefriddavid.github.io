import React from 'react'

// Thin vertical bar instead of a checkbox icon — toggles between two grey
// shades, closer to how Excel/Sheets dims a selected cell than to a checkbox.
const AuditRowCheckbox = ({ checked, onToggle }) => (
  <div
    role="checkbox"
    aria-checked={checked}
    tabIndex={0}
    onClick={onToggle}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onToggle()
      }
    }}
    style={{
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      width: 12,
      borderRadius: 3,
      background: checked ? '#cbd5e1' : '#f1f3f5',
      cursor: 'pointer',
      transition: 'background 0.12s',
    }}
  />
)

export default AuditRowCheckbox
