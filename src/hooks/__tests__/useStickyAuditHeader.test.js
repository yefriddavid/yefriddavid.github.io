// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useStickyAuditHeader } from '../useStickyAuditHeader'

const APP_HEADER_H = 3 * 16 + 1 // 49px

function makeTh(width) {
  return { getBoundingClientRect: () => ({ width }) }
}

function makeRefs({ theadBottom, scrollLeft, ths = [makeTh(60), makeTh(120)] }) {
  const theadRef = {
    current: {
      getBoundingClientRect: () => ({ bottom: theadBottom }),
      querySelectorAll: () => ths,
    },
  }
  const scrollDivRef = {
    current: {
      getBoundingClientRect: () => ({ left: scrollLeft }),
    },
  }
  return { theadRef, scrollDivRef }
}

describe('useStickyAuditHeader', () => {
  let rafCallbacks = []

  beforeEach(() => {
    rafCallbacks = []
    vi.stubGlobal('requestAnimationFrame', (cb) => {
      rafCallbacks.push(cb)
      return rafCallbacks.length
    })
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const flushRaf = () => {
    act(() => {
      const cbs = [...rafCallbacks]
      rafCallbacks = []
      cbs.forEach((cb) => cb())
    })
  }

  it('starts hidden', () => {
    const { theadRef, scrollDivRef } = makeRefs({ theadBottom: 300, scrollLeft: 256 })
    const { result } = renderHook(() => useStickyAuditHeader(theadRef, scrollDivRef))
    expect(result.current[0].show).toBe(false)
  })

  it('shows sticky header when thead bottom scrolls at or below app header height', () => {
    const { theadRef, scrollDivRef } = makeRefs({ theadBottom: APP_HEADER_H, scrollLeft: 256 })
    const { result } = renderHook(() => useStickyAuditHeader(theadRef, scrollDivRef))

    flushRaf()

    expect(result.current[0].show).toBe(true)
  })

  it('captures left position from scrollDivRef', () => {
    const { theadRef, scrollDivRef } = makeRefs({ theadBottom: 20, scrollLeft: 256 })
    const { result } = renderHook(() => useStickyAuditHeader(theadRef, scrollDivRef))

    flushRaf()

    expect(result.current[0].left).toBe(256)
  })

  it('captures column widths from thead th elements', () => {
    const ths = [makeTh(60), makeTh(120), makeTh(100)]
    const { theadRef, scrollDivRef } = makeRefs({ theadBottom: 10, scrollLeft: 256, ths })
    const { result } = renderHook(() => useStickyAuditHeader(theadRef, scrollDivRef))

    flushRaf()

    expect(result.current[0].colWidths).toEqual([60, 120, 100])
  })

  it('hides sticky header when thead comes back into view', () => {
    const ths = [makeTh(60)]
    const theadRef = { current: null }
    const scrollDivRef = { current: { getBoundingClientRect: () => ({ left: 256 }) } }

    // Start scrolled past header
    theadRef.current = {
      getBoundingClientRect: () => ({ bottom: 20 }),
      querySelectorAll: () => ths,
    }

    const { result } = renderHook(() => useStickyAuditHeader(theadRef, scrollDivRef))
    flushRaf()
    expect(result.current[0].show).toBe(true)

    // Scroll back up — thead visible again
    theadRef.current = {
      getBoundingClientRect: () => ({ bottom: 300 }),
      querySelectorAll: () => ths,
    }
    flushRaf()
    expect(result.current[0].show).toBe(false)
  })

  it('does not show when thead bottom is above the threshold (bottom > APP_HEADER_H)', () => {
    const { theadRef, scrollDivRef } = makeRefs({ theadBottom: APP_HEADER_H + 1, scrollLeft: 256 })
    const { result } = renderHook(() => useStickyAuditHeader(theadRef, scrollDivRef))

    flushRaf()

    expect(result.current[0].show).toBe(false)
  })

  it('does not update state when refs are null', () => {
    const theadRef = { current: null }
    const scrollDivRef = { current: null }
    const { result } = renderHook(() => useStickyAuditHeader(theadRef, scrollDivRef))

    flushRaf()

    expect(result.current[0].show).toBe(false)
  })
})
