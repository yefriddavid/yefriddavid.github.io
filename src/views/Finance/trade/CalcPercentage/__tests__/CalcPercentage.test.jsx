// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CalcPercentage from '../index'

const getInput = (label) =>
  screen.getByText(label).closest('.cp-card').querySelector('input')

const typeInto = (label, value) => {
  const input = getInput(label)
  fireEvent.change(input, { target: { value } })
  return input
}

describe('CalcPercentage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('computes a simple increase from Valor Inicial + Valor Final', () => {
    render(<CalcPercentage />)
    typeInto('Valor inicial', '100')
    typeInto('Valor final', '150')

    expect(getInput('Porcentaje').value).toBe('50')
    expect(getInput('Cambio').value).toBe('50')
  })

  // Regression: percentages >= 1000 used to render as e.g. "6.000" via
  // toLocaleString('es-CO', ...) fed straight into <input type="number">,
  // which reads '.' as a decimal point, silently showing 6 instead of 6000.
  it('does not misread a percent >= 1000 as a decimal (thousands-separator bug)', () => {
    render(<CalcPercentage />)
    typeInto('Valor inicial', '1000')
    typeInto('Valor final', '61000')

    expect(getInput('Porcentaje').value).toBe('6000')
    expect(getInput('Cambio').value).toBe('60000')
  })

  it('computes a percent that requires decimal rounding without going blank', () => {
    render(<CalcPercentage />)
    // 51000 / 10000 * 100 = 510 exactly, but floating point division can leave
    // a residual fraction (e.g. 509.99999999999994) — toLocaleString(',00')
    // formatting used to leak into the input value and get rejected as blank.
    typeInto('Valor inicial', '10000')
    typeInto('Valor final', '61000')

    expect(getInput('Porcentaje').value).toBe('510')
    expect(getInput('Cambio').value).toBe('51000')
  })

  it('recomputes Cambio from Valor Final + Valor Inicial without freezing at 0', () => {
    render(<CalcPercentage />)
    // Editing Initial after Final was the original repro: Cambio used to stay
    // undefined (blank) because it was bundled behind an `initial !== 0` guard
    // that only the Porcentaje math actually needed.
    typeInto('Valor inicial', '100')
    typeInto('Valor final', '150')
    typeInto('Valor inicial', '0')

    expect(getInput('Cambio').value).toBe('150')
    expect(getInput('Porcentaje').value).toBe('')
  })

  it('clears stale derived fields instead of keeping old computed values', () => {
    render(<CalcPercentage />)
    typeInto('Valor inicial', '100')
    typeInto('Porcentaje', '10')
    expect(getInput('Cambio').value).toBe('10')
    expect(getInput('Valor final').value).toBe('110')

    typeInto('Porcentaje', '')

    expect(getInput('Cambio').value).toBe('')
    expect(getInput('Valor final').value).toBe('')
  })

  it('computes correctly in Descuento (decrease) mode', () => {
    render(<CalcPercentage />)
    fireEvent.click(screen.getByText('▼ Descuento'))
    typeInto('Valor inicial', '200')
    typeInto('Porcentaje', '25')

    expect(getInput('Cambio').value).toBe('50')
    expect(getInput('Valor final').value).toBe('150')
  })

  it('persists values to localStorage and restores them on remount', () => {
    const { unmount } = render(<CalcPercentage />)
    typeInto('Valor inicial', '100')
    typeInto('Porcentaje', '10')
    unmount()

    render(<CalcPercentage />)
    expect(getInput('Valor inicial').value).toBe('100')
    expect(getInput('Porcentaje').value).toBe('10')
    expect(getInput('Cambio').value).toBe('10')
    expect(getInput('Valor final').value).toBe('110')
  })
})
