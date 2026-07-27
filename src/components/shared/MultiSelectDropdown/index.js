import React, { useEffect, useRef } from 'react'
import './MultiSelectDropdown.scss'

// Consumers treat an empty `selected` Set as "no filter / show all" — there's no
// value we can put in the Set to mean "match nothing" without a consumer-side change.
// This sentinel is a value no real option will ever equal, so `selected.has(realValue)`
// stays false for every real option while `selected.size` is non-zero (not the "all" state).
const NONE = Symbol('multi-select-none')

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

  const isAllState = selected.size === 0
  const isNoneState = selected.size === 1 && selected.has(NONE)

  const buttonLabel = isNoneState
    ? 'Ninguna seleccionada'
    : typeof label === 'function'
      ? label(selected.size)
      : label
  const isActive = selected.size > 0

  // "Todos" (empty selection) renders every option as checked. Unchecking one
  // from that implicit-all state must materialize the rest into the real
  // selection — a plain onToggle(value) would instead just select that one value.
  const handleToggle = (value) => {
    if (isAllState) {
      options.forEach((opt) => {
        if (opt.value !== value) onToggle(opt.value)
      })
    } else {
      if (selected.has(NONE)) onToggle(NONE) // clear the sentinel once a real choice is made
      onToggle(value)
    }
  }

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
            <input
              type="checkbox"
              checked={isAllState}
              onChange={() => (isAllState ? onToggle(NONE) : onClearAll())}
            />
            Todos
          </label>
          {options.map((opt) => (
            <label key={opt.value} className="multi-select__option">
              <input
                type="checkbox"
                checked={isAllState || selected.has(opt.value)}
                onChange={() => handleToggle(opt.value)}
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
