import React, { useEffect, useRef } from 'react'
import './MultiSelectDropdown.scss'

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
    <div ref={ref} className="multi-select">
      <button
        className={`multi-select__toggle${isActive ? ' multi-select__toggle--active' : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        {buttonLabel} ▾
      </button>
      {open && (
        <div className="multi-select__dropdown" style={{ maxHeight }}>
          <label className="multi-select__option multi-select__option--all">
            <input type="checkbox" checked={selected.size === 0} onChange={onClearAll} />
            Todos
          </label>
          {options.map((opt) => (
            <label key={opt.value} className="multi-select__option">
              <input
                type="checkbox"
                checked={selected.has(opt.value)}
                onChange={() => onToggle(opt.value)}
              />
              {opt.label}
            </label>
          ))}
          <div className="multi-select__footer">
            <button className="multi-select__accept" onClick={() => setOpen(false)}>
              {acceptLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MultiSelectDropdown
