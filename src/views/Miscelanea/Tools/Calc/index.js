import React, { useState, useEffect, useRef } from 'react'
import './Calc.scss'

const OP_LABELS = { '/': '÷', '*': '×', '-': '−', '+': '+' }
const MAX_DIGITS = 12

const BUTTONS = [
  [
    { label: 'C', action: 'clear', variant: 'fn' },
    { label: '±', action: 'sign', variant: 'fn' },
    { label: '%', action: 'percent', variant: 'fn' },
    { label: '÷', action: 'op', op: '/', variant: 'op' },
  ],
  [
    { label: '7', action: 'digit', variant: 'num' },
    { label: '8', action: 'digit', variant: 'num' },
    { label: '9', action: 'digit', variant: 'num' },
    { label: '×', action: 'op', op: '*', variant: 'op' },
  ],
  [
    { label: '4', action: 'digit', variant: 'num' },
    { label: '5', action: 'digit', variant: 'num' },
    { label: '6', action: 'digit', variant: 'num' },
    { label: '−', action: 'op', op: '-', variant: 'op' },
  ],
  [
    { label: '1', action: 'digit', variant: 'num' },
    { label: '2', action: 'digit', variant: 'num' },
    { label: '3', action: 'digit', variant: 'num' },
    { label: '+', action: 'op', op: '+', variant: 'op' },
  ],
  [
    { label: '0', action: 'digit', variant: 'num', wide: true },
    { label: '.', action: 'dot', variant: 'num' },
    { label: '=', action: 'equal', variant: 'eq' },
  ],
]

const KEY_MAP = {
  '0': { action: 'digit', label: '0' }, '1': { action: 'digit', label: '1' },
  '2': { action: 'digit', label: '2' }, '3': { action: 'digit', label: '3' },
  '4': { action: 'digit', label: '4' }, '5': { action: 'digit', label: '5' },
  '6': { action: 'digit', label: '6' }, '7': { action: 'digit', label: '7' },
  '8': { action: 'digit', label: '8' }, '9': { action: 'digit', label: '9' },
  '.': { action: 'dot' }, ',': { action: 'dot' },
  '+': { action: 'op', op: '+' }, '-': { action: 'op', op: '-' },
  '*': { action: 'op', op: '*' }, '/': { action: 'op', op: '/' },
  'Enter': { action: 'equal' }, '=': { action: 'equal' },
  'Escape': { action: 'clear' }, 'Backspace': { action: 'backspace' },
  '%': { action: 'percent' },
}

const fmt = (n) => {
  if (!isFinite(n)) return 'Error'
  if (Math.abs(n) >= 1e13 || (Math.abs(n) < 1e-9 && n !== 0)) return n.toExponential(4)
  return String(parseFloat(n.toPrecision(10)))
}

const compute = (a, op, b) => {
  switch (op) {
    case '+': return a + b
    case '-': return a - b
    case '*': return a * b
    case '/': return b === 0 ? NaN : a / b
    default: return b
  }
}

const Calc = () => {
  const [display, setDisplay] = useState('0')
  const [accumulator, setAccumulator] = useState(null)
  const [operator, setOperator] = useState(null)
  const [expression, setExpression] = useState('')
  const [replace, setReplace] = useState(false)
  const [activeKey, setActiveKey] = useState(null)

  // Keep a ref to dispatch that always closes over latest state
  const stateRef = useRef({})
  stateRef.current = { display, accumulator, operator, expression, replace }

  const press = (btn) => {
    const { display: d, accumulator: acc, operator: op, expression: expr, replace: repl } = stateRef.current

    if (btn.action === 'digit') {
      const digit = btn.label
      if (d === 'Error') { setDisplay(digit); setExpression(''); return }
      if (repl) { setDisplay(digit); setReplace(false); return }
      if (d === '0') { setDisplay(digit); return }
      if (d.replace(/[-.]/, '').length >= MAX_DIGITS) return
      setDisplay(d + digit)
      return
    }

    if (btn.action === 'dot') {
      if (d === 'Error') { setDisplay('0.'); setExpression(''); return }
      if (repl) { setDisplay('0.'); setReplace(false); return }
      if (!d.includes('.')) setDisplay(d + '.')
      return
    }

    if (btn.action === 'backspace') {
      if (d === 'Error' || repl) { setDisplay('0'); return }
      if (d.length === 1 || (d.length === 2 && d.startsWith('-'))) { setDisplay('0'); return }
      setDisplay(d.slice(0, -1))
      return
    }

    if (btn.action === 'clear') {
      setDisplay('0'); setAccumulator(null); setOperator(null); setExpression(''); setReplace(false)
      return
    }

    if (btn.action === 'sign') {
      if (d === 'Error' || d === '0') return
      setDisplay(d.startsWith('-') ? d.slice(1) : '-' + d)
      return
    }

    if (btn.action === 'percent') {
      if (d === 'Error') return
      setDisplay(fmt(parseFloat(d) / 100))
      return
    }

    if (btn.action === 'op') {
      if (d === 'Error') return
      const current = parseFloat(d)
      if (acc !== null && op && !repl) {
        const result = compute(acc, op, current)
        if (!isFinite(result)) {
          setDisplay('Error'); setExpression(''); setAccumulator(null); setOperator(null); setReplace(true)
          return
        }
        const r = fmt(result)
        setDisplay(r)
        setExpression(r + ' ' + OP_LABELS[btn.op])
        setAccumulator(result)
      } else {
        setExpression(d + ' ' + OP_LABELS[btn.op])
        setAccumulator(current)
      }
      setOperator(btn.op)
      setReplace(true)
      return
    }

    if (btn.action === 'equal') {
      if (d === 'Error' || acc === null || op === null) return
      const current = parseFloat(d)
      const result = compute(acc, op, current)
      const fullExpr = expr + ' ' + d + ' ='
      if (!isFinite(result)) {
        setDisplay('Error'); setExpression(fullExpr)
      } else {
        setDisplay(fmt(result)); setExpression(fullExpr)
      }
      setAccumulator(null); setOperator(null); setReplace(true)
    }
  }

  useEffect(() => {
    const onKey = (e) => {
      const btn = KEY_MAP[e.key]
      if (!btn) return
      e.preventDefault()
      setActiveKey(e.key)
      setTimeout(() => setActiveKey(null), 120)
      press(btn)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isKeyActive = (btn) => {
    if (!activeKey) return false
    const mapped = KEY_MAP[activeKey]
    if (!mapped) return false
    if (mapped.action !== btn.action) return false
    if (btn.action === 'op') return mapped.op === btn.op
    if (btn.action === 'digit') return mapped.label === btn.label
    return true
  }

  const fontSize = display.length > 14 ? 22 : display.length > 9 ? 32 : 48

  return (
    <div className="calc">
      <div className="calc__card">
        <div className="calc__display">
          <div className="calc__expression">{expression || ' '}</div>
          <div className="calc__value" style={{ fontSize }}>{display}</div>
        </div>
        <div className="calc__pad">
          {BUTTONS.map((row, ri) => (
            <div key={ri} className="calc__row">
              {row.map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  className={[
                    'calc__btn',
                    `calc__btn--${btn.variant}`,
                    btn.wide ? 'calc__btn--wide' : '',
                    isKeyActive(btn) ? 'calc__btn--pressed' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => press(btn)}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          ))}
        </div>
        <p className="calc__hint">También puedes usar el teclado</p>
      </div>
    </div>
  )
}

export default Calc
