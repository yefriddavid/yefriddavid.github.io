// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useStickyAuditHeader } from '../useStickyAuditHeader'

const HEADER_BOTTOM = 68 // simulates nav bar (49px) + breadcrumb row (~19px)

function makeTh(width) {
  return { getBoundingClientRect: () => ({ width }), style: {} }
}

function makeRefs({ theadBottom, scrollLeft, sourceThs = [makeTh(60), makeTh(120)], cloneThs }) {
  const theadRef = {
    current: {
      getBoundingClientRect: () => ({ bottom: theadBottom }),
      querySelectorAll: () => sourceThs,
    },
  }
  const scrollDivRef = {
    current: { getBoundingClientRect: () => ({ left: scrollLeft }) },
  }
  const overlayRef = { current: { style: {} } }
  const resolvedCloneThs =
    cloneThs ?? sourceThs.map((th) => makeTh(th.getBoundingClientRect().width))
  const table = { style: {} }
  const cloneTheadRef = {
    current: {
      querySelectorAll: () => resolvedCloneThs,
      closest: () => table,
    },
  }
  return { theadRef, scrollDivRef, overlayRef, cloneTheadRef, table, cloneThs: resolvedCloneThs }
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

    vi.spyOn(document, 'querySelector').mockImplementation((selector) => {
      if (selector === '.header') {
        return { getBoundingClientRect: () => ({ bottom: HEADER_BOTTOM }) }
      }
      return null
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  const flushRaf = () => {
    act(() => {
      const cbs = [...rafCallbacks]
      rafCallbacks = []
      cbs.forEach((cb) => cb())
    })
  }

  it('keeps the overlay hidden while thead has not scrolled past the header', () => {
    const { theadRef, scrollDivRef, overlayRef, cloneTheadRef } = makeRefs({
      theadBottom: 300,
      scrollLeft: 256,
    })
    renderHook(() => useStickyAuditHeader(theadRef, scrollDivRef, overlayRef, cloneTheadRef))
    flushRaf()

    expect(overlayRef.current.style.display).toBe('none')
  })

  it('shows and positions the overlay once thead bottom reaches the header bottom', () => {
    const { theadRef, scrollDivRef, overlayRef, cloneTheadRef } = makeRefs({
      theadBottom: HEADER_BOTTOM,
      scrollLeft: 256,
    })
    renderHook(() => useStickyAuditHeader(theadRef, scrollDivRef, overlayRef, cloneTheadRef))
    flushRaf()

    expect(overlayRef.current.style.display).toBe('block')
    expect(overlayRef.current.style.top).toBe(`${HEADER_BOTTOM}px`)
    expect(overlayRef.current.style.left).toBe('256px')
  })

  it('syncs clone column widths from the source thead', () => {
    const sourceThs = [makeTh(60), makeTh(120), makeTh(100)]
    const { theadRef, scrollDivRef, overlayRef, cloneTheadRef, cloneThs, table } = makeRefs({
      theadBottom: 10,
      scrollLeft: 256,
      sourceThs,
    })
    renderHook(() => useStickyAuditHeader(theadRef, scrollDivRef, overlayRef, cloneTheadRef))
    flushRaf()

    expect(cloneThs.map((th) => th.style.width)).toEqual(['60px', '120px', '100px'])
    expect(table.style.width).toBe('280px')
  })

  it('hides the overlay again once thead comes back into view', () => {
    const sourceThs = [makeTh(60)]
    const theadRef = { current: null }
    const { scrollDivRef, overlayRef, cloneTheadRef } = makeRefs({
      theadBottom: 20,
      scrollLeft: 256,
      sourceThs,
    })

    theadRef.current = {
      getBoundingClientRect: () => ({ bottom: 20 }),
      querySelectorAll: () => sourceThs,
    }

    renderHook(() => useStickyAuditHeader(theadRef, scrollDivRef, overlayRef, cloneTheadRef))
    flushRaf()
    expect(overlayRef.current.style.display).toBe('block')

    theadRef.current = {
      getBoundingClientRect: () => ({ bottom: 300 }),
      querySelectorAll: () => sourceThs,
    }
    flushRaf()
    expect(overlayRef.current.style.display).toBe('none')
  })

  it('does not throw when refs are null', () => {
    const theadRef = { current: null }
    const scrollDivRef = { current: null }
    const overlayRef = { current: null }
    const cloneTheadRef = { current: null }

    renderHook(() => useStickyAuditHeader(theadRef, scrollDivRef, overlayRef, cloneTheadRef))

    expect(() => flushRaf()).not.toThrow()
  })
})
