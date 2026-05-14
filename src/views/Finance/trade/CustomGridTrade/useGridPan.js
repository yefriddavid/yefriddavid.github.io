import { useRef, useState } from 'react'

export const useGridPan = ({ viewTopPrice, setViewTopPrice, H, step, LEVEL_H }) => {
  const [panEnabled, setPanEnabled] = useState(true)
  const containerRef = useRef(null)
  const isPointerDown = useRef(false)
  const isDragging = useRef(false)
  const dragStartY = useRef(0)
  const dragStartViewTop = useRef(0)

  const onPointerDown = (e) => {
    if (!panEnabled) return
    isPointerDown.current = true
    isDragging.current = false
    dragStartY.current = e.clientY
    dragStartViewTop.current = viewTopPrice
  }

  const onPointerMove = (e) => {
    if (!isPointerDown.current) return
    const deltaYScreen = e.clientY - dragStartY.current
    if (!isDragging.current && Math.abs(deltaYScreen) > 5) {
      isDragging.current = true
      e.currentTarget.setPointerCapture(e.pointerId)
      if (containerRef.current) containerRef.current.style.cursor = 'grabbing'
    }
    if (!isDragging.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const scaleY = H / rect.height
    const deltaYSvg = deltaYScreen * scaleY
    setViewTopPrice(dragStartViewTop.current + deltaYSvg * (step / LEVEL_H))
  }

  const stopDrag = () => {
    isPointerDown.current = false
    isDragging.current = false
    if (containerRef.current) containerRef.current.style.cursor = 'grab'
  }

  return {
    panEnabled,
    setPanEnabled,
    containerRef,
    onPointerDown,
    onPointerMove,
    stopDrag,
  }
}
