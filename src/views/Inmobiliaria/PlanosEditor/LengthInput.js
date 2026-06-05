import { useState, useEffect, useRef } from 'react'

const LengthInput = ({ value, min = 0.5, onCommit }) => {
  const [display, setDisplay] = useState(String(value))
  const draftRef = useRef(String(value))
  const focusedRef = useRef(false)
  const committedRef = useRef(false)

  useEffect(() => {
    if (!focusedRef.current) {
      const s = String(value)
      draftRef.current = s
      setDisplay(s)
    }
  }, [value])

  const commit = () => {
    const v = parseFloat(draftRef.current)
    if (!isNaN(v) && v >= min) {
      onCommit(v)
    } else {
      const s = String(value)
      draftRef.current = s
      setDisplay(s)
    }
  }

  return (
    <input
      type="number"
      className="form-control form-control-sm"
      style={{ width: 90 }}
      min={min}
      step="any"
      value={display}
      onChange={(e) => {
        draftRef.current = e.target.value
        setDisplay(e.target.value)
      }}
      onFocus={() => {
        focusedRef.current = true
        committedRef.current = false
      }}
      onBlur={() => {
        focusedRef.current = false
        if (committedRef.current) {
          committedRef.current = false
          return
        }
        commit()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          committedRef.current = true
          commit()
          e.target.blur()
        }
        if (e.key === 'Escape') {
          committedRef.current = true
          const s = String(value)
          draftRef.current = s
          setDisplay(s)
          e.target.blur()
        }
        e.stopPropagation()
      }}
    />
  )
}

export default LengthInput
