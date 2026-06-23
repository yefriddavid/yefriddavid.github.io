import { useEffect } from 'react'

function getHeaderBottom() {
  const header = document.querySelector('.header')
  if (!header) return 3 * 16 + 1 // fallback 49px
  return header.getBoundingClientRect().bottom
}

// Mutates the sticky-header-clone DOM directly inside the rAF loop, instead of
// going through React state. A state-driven toggle lags one paint behind the
// browser's (synchronous) native scroll, which let a sliver of the real,
// already-scrolled content flash above/below the clone for a frame. Writing
// to the DOM here happens in the same frame the browser measures and paints,
// so the clone never has a chance to be stale.
export function useStickyAuditHeader(theadRef, scrollDivRef, overlayRef, cloneTheadRef) {
  useEffect(() => {
    let rafId

    const tick = () => {
      if (theadRef.current && scrollDivRef.current && overlayRef.current && cloneTheadRef.current) {
        const headerBottom = getHeaderBottom()
        const { bottom } = theadRef.current.getBoundingClientRect()
        const { left } = scrollDivRef.current.getBoundingClientRect()
        const show = bottom <= headerBottom

        const overlay = overlayRef.current
        overlay.style.display = show ? 'block' : 'none'

        if (show) {
          overlay.style.top = `${headerBottom}px`
          overlay.style.left = `${left}px`

          const sourceThs = theadRef.current.querySelectorAll('th')
          const cloneThs = cloneTheadRef.current.querySelectorAll('th')
          let totalWidth = 0
          sourceThs.forEach((th, i) => {
            const width = th.getBoundingClientRect().width
            totalWidth += width
            if (cloneThs[i]) cloneThs[i].style.width = `${width}px`
          })
          const cloneTable = cloneTheadRef.current.closest('table')
          if (cloneTable) cloneTable.style.width = `${totalWidth}px`
        }
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [theadRef, scrollDivRef, overlayRef, cloneTheadRef])
}
