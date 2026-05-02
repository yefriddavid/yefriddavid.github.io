import { useEffect, useState } from 'react'

function getHeaderBottom() {
  const header = document.querySelector('.header')
  if (!header) return 3 * 16 + 1 // fallback 49px
  return header.getBoundingClientRect().bottom
}

export function useStickyAuditHeader(theadRef, scrollDivRef) {
  const [stickyData, setStickyData] = useState({ show: false, top: 0, left: 0, colWidths: [] })

  useEffect(() => {
    let rafId
    let prevShow = false
    let prevLeft = 0

    const tick = () => {
      if (theadRef.current && scrollDivRef.current) {
        const headerBottom = getHeaderBottom()
        const { bottom } = theadRef.current.getBoundingClientRect()
        const { left } = scrollDivRef.current.getBoundingClientRect()
        const show = bottom <= headerBottom

        if (show !== prevShow || (show && Math.abs(left - prevLeft) > 1)) {
          prevShow = show
          prevLeft = left
          if (show) {
            const ths = Array.from(theadRef.current.querySelectorAll('th'))
            const colWidths = ths.map((th) => th.getBoundingClientRect().width)
            setStickyData({ show: true, top: headerBottom, left, colWidths })
          } else {
            setStickyData((d) => ({ ...d, show: false }))
          }
        }
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [theadRef, scrollDivRef])

  return [stickyData, setStickyData]
}
