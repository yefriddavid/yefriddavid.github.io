import { useEffect, useState } from 'react'

const APP_HEADER_H = 3 * 16 + 1 // calc(3rem + 1px)

export function useStickyAuditHeader(theadRef, scrollDivRef) {
  const [stickyData, setStickyData] = useState({ show: false, left: 0, colWidths: [] })

  useEffect(() => {
    let rafId
    let prevShow = false
    let prevLeft = 0

    const tick = () => {
      if (theadRef.current && scrollDivRef.current) {
        const { bottom } = theadRef.current.getBoundingClientRect()
        const { left } = scrollDivRef.current.getBoundingClientRect()
        const show = bottom <= APP_HEADER_H

        if (show !== prevShow || (show && Math.abs(left - prevLeft) > 1)) {
          prevShow = show
          prevLeft = left
          if (show) {
            const ths = Array.from(theadRef.current.querySelectorAll('th'))
            const colWidths = ths.map((th) => th.getBoundingClientRect().width)
            setStickyData({ show: true, left, colWidths })
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
