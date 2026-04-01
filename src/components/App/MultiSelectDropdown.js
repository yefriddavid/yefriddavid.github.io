import React, { useEffect, useRef } from 'react'

/**
 * Reusable multi-select dropdown with checkboxes.
 *
 * Props:
 *   label        - button label (string or fn(size) => string)
 *   options      - array of { value, label }
 *   selected     - Set of selected values
 *   onToggle     - fn(value) called when an option is toggled
 *   onClearAll   - fn() called when "Todos" is clicked
 *   acceptLabel  - text for the accept button (default 'Aceptar')
 *   maxHeight    - dropdown max height (default 260)
 */
const MultiSelectDropdown = ({
  label,
  options,
  selected,
  onToggle,
  onClearAll,
  acceptLabel = 'Aceptar',
  maxHeight = 260,
}) => {
  const [open, setOpen] = React.useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const buttonLabel = typeof label === 'function' ? label(selected.size) : label
  const isActive = selected.size > 0

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          fontSize: 12,
          minWidth: 80,
          padding: '4px 10px',
          borderRadius: 6,
          border: '1px solid var(--cui-secondary)',
          background: isActive ? '#e8f0fb' : '#fff',
          color: isActive ? '#1e3a5f' : 'var(--cui-secondary)',
          cursor: 'pointer',
          fontWeight: isActive ? 600 : 400,
        }}
      >
        {buttonLabel} ▾
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 1050,
            background: '#fff',
            border: '1px solid var(--cui-border-color)',
            borderRadius: 8,
            padding: '8px 12px',
            minWidth: 180,
            maxHeight,
            overflowY: 'auto',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              cursor: 'pointer',
              paddingBottom: 6,
              borderBottom: '1px solid var(--cui-border-color)',
              marginBottom: 6,
            }}
          >
            <input
              type="checkbox"
              checked={selected.size === 0}
              onChange={onClearAll}
            />
            Todos
          </label>
          {options.map((opt) => (
            <label
              key={opt.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                cursor: 'pointer',
                padding: '3px 0',
              }}
            >
              <input
                type="checkbox"
                checked={selected.has(opt.value)}
                onChange={() => onToggle(opt.value)}
              />
              {opt.label}
            </label>
          ))}
          <div
            style={{
              paddingTop: 8,
              marginTop: 6,
              borderTop: '1px solid var(--cui-border-color)',
              textAlign: 'right',
            }}
          >
            <button
              onClick={() => setOpen(false)}
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '3px 12px',
                borderRadius: 4,
                border: '1px solid #1e3a5f',
                background: '#1e3a5f',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              {acceptLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MultiSelectDropdown
