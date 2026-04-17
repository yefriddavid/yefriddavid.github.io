// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SummaryCard from '../SummaryCard'

describe('SummaryCard', () => {
  it('renders label and value', () => {
    render(<SummaryCard label="Total" value="$ 500.000" color="#2f9e44" bg="#f0fdf4" />)
    expect(screen.getByText('Total')).toBeTruthy()
    expect(screen.getByText('$ 500.000')).toBeTruthy()
  })

  it('renders sub text when provided', () => {
    render(
      <SummaryCard label="Pagadas" value="3" color="#2f9e44" bg="#f0fdf4" sub="$ 1.200.000" />,
    )
    expect(screen.getByText('$ 1.200.000')).toBeTruthy()
  })

  it('does not render sub element when omitted', () => {
    render(<SummaryCard label="Pagadas" value="3" color="#2f9e44" bg="#f0fdf4" />)
    expect(screen.queryByText('$ 1.200.000')).toBeNull()
  })

  it('applies background color via style', () => {
    const { container } = render(
      <SummaryCard label="Test" value="0" color="#e03131" bg="#fff5f5" />,
    )
    const card = container.firstChild
    // jsdom normalises hex to rgb: #fff5f5 → rgb(255, 245, 245)
    const style = card.getAttribute('style')
    expect(style.includes('fff5f5') || style.includes('255, 245, 245')).toBe(true)
  })

  it('renders React node as value', () => {
    render(
      <SummaryCard label="Ingresos" value={<span data-testid="node-value">Cargando…</span>} color="#000" bg="#fff" />,
    )
    expect(screen.getByTestId('node-value')).toBeTruthy()
  })
})
