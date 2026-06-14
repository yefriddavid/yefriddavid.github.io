// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import LoginSpinner from '../index'

const renderSpinner = (step = 0) => render(<LoginSpinner step={step} />)

const countFilledSegments = (container) =>
  container.querySelectorAll('path[fill="white"]').length

const countSolidArcs = (container) =>
  container.querySelectorAll('.login-spinner__ring circle[stroke-dasharray="28.27 84.82"]').length

describe('LoginSpinner', () => {
  describe('SVG structure', () => {
    it('renders an svg element', () => {
      const { container } = renderSpinner()
      expect(container.querySelector('svg')).toBeTruthy()
    })

    it('has width and height of 22', () => {
      const { container } = renderSpinner()
      const svg = container.querySelector('svg')
      expect(svg.getAttribute('width')).toBe('22')
      expect(svg.getAttribute('height')).toBe('22')
    })

    it('has viewBox 0 0 40 40', () => {
      const { container } = renderSpinner()
      const svg = container.querySelector('svg')
      expect(svg.getAttribute('viewBox')).toBe('0 0 40 40')
    })

    it('renders the spinning ring group with correct class', () => {
      const { container } = renderSpinner()
      expect(container.querySelector('.login-spinner__ring')).toBeTruthy()
    })

    it('renders 4 empty background segments', () => {
      const { container } = renderSpinner()
      const emptySegments = container.querySelectorAll('path[fill="rgba(255,255,255,0.12)"]')
      expect(emptySegments).toHaveLength(4)
    })

    it('renders 4 divider lines', () => {
      const { container } = renderSpinner()
      expect(container.querySelectorAll('line')).toHaveLength(4)
    })

    it('renders the outer ring background circle', () => {
      const { container } = renderSpinner()
      const circles = container.querySelectorAll('circle')
      const bg = Array.from(circles).find(
        (c) => c.getAttribute('stroke') === 'rgba(255,255,255,0.15)',
      )
      expect(bg).toBeTruthy()
    })
  })

  describe('step=0 (no progress)', () => {
    it('renders no filled inner segments', () => {
      const { container } = renderSpinner(0)
      expect(countFilledSegments(container)).toBe(0)
    })

    it('renders the dashed ring at step 0 (spinner visible before any step)', () => {
      const { container } = renderSpinner(0)
      const ring = container.querySelector('.login-spinner__ring')
      const dashedCircle = ring.querySelector('circle[stroke-dasharray="5 3"]')
      expect(dashedCircle).toBeTruthy()
    })

    it('renders no solid filled outer ring arcs at step 0', () => {
      const { container } = renderSpinner(0)
      const solidArcs = container.querySelectorAll('.login-spinner__ring circle[stroke-dasharray="28.27 84.82"]')
      expect(solidArcs).toHaveLength(0)
    })
  })

  describe('step=1 (main auth done)', () => {
    it('renders 1 filled inner segment', () => {
      const { container } = renderSpinner(1)
      expect(countFilledSegments(container)).toBe(1)
    })

    it('renders 1 solid outer ring arc', () => {
      const { container } = renderSpinner(1)
      expect(countSolidArcs(container)).toBe(1)
    })

    it('still renders the dashed ring', () => {
      const { container } = renderSpinner(1)
      expect(container.querySelector('.login-spinner__ring circle[stroke-dasharray="5 3"]')).toBeTruthy()
    })
  })

  describe('step=2 (taxi auth done)', () => {
    it('renders 2 filled inner segments', () => {
      const { container } = renderSpinner(2)
      expect(countFilledSegments(container)).toBe(2)
    })

    it('renders 2 solid outer ring arcs', () => {
      const { container } = renderSpinner(2)
      expect(countSolidArcs(container)).toBe(2)
    })
  })

  describe('step=3 (domotica auth done)', () => {
    it('renders 3 filled inner segments', () => {
      const { container } = renderSpinner(3)
      expect(countFilledSegments(container)).toBe(3)
    })

    it('renders 3 solid outer ring arcs', () => {
      const { container } = renderSpinner(3)
      expect(countSolidArcs(container)).toBe(3)
    })
  })

  describe('step=4 (session created — complete)', () => {
    it('renders 4 filled inner segments', () => {
      const { container } = renderSpinner(4)
      expect(countFilledSegments(container)).toBe(4)
    })

    it('renders 4 solid outer ring arcs', () => {
      const { container } = renderSpinner(4)
      expect(countSolidArcs(container)).toBe(4)
    })
  })

  describe('default prop', () => {
    it('defaults step to 0 when no prop is passed', () => {
      const { container } = render(<LoginSpinner />)
      expect(countFilledSegments(container)).toBe(0)
    })
  })

  describe('outer ring arc dasharray', () => {
    it('each solid arc has the correct strokeDasharray for a quarter circle', () => {
      const { container } = renderSpinner(4)
      const arcs = container.querySelectorAll('.login-spinner__ring circle[stroke-dasharray="28.27 84.82"]')
      expect(arcs).toHaveLength(4)
      arcs.forEach((arc) => {
        expect(arc.getAttribute('stroke-dasharray')).toBe('28.27 84.82')
      })
    })

    it('arcs have correct sequential strokeDashoffset values', () => {
      const { container } = renderSpinner(4)
      const arcs = Array.from(
        container.querySelectorAll('.login-spinner__ring circle[stroke-dasharray="28.27 84.82"]'),
      )
      const offsets = arcs.map((a) => a.getAttribute('stroke-dashoffset'))
      expect(offsets).toEqual(['0', '-28.27', '-56.55', '-84.82'])
    })
  })
})
