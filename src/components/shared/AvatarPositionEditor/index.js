import React, { useEffect, useRef, useState } from 'react'
import { CButton } from '@coreui/react'
import './AvatarPositionEditor.scss'

const VIEW = 220
const OUTPUT = 256

const clamp = (val, max) => Math.min(max, Math.max(-max, val))

const AvatarPositionEditor = ({ file, onCancel, onConfirm }) => {
  const [img, setImg] = useState(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      setImg(image)
      setOffset({ x: 0, y: 0 })
    }
    image.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  const baseScale = img ? Math.max(VIEW / img.width, VIEW / img.height) : 1
  const dispW = img ? img.width * baseScale : VIEW
  const dispH = img ? img.height * baseScale : VIEW
  const maxOffsetX = Math.max(0, (dispW - VIEW) / 2)
  const maxOffsetY = Math.max(0, (dispH - VIEW) / 2)

  const startDrag = (e) => {
    dragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
    e.preventDefault()
  }
  const onMove = (e) => {
    if (!dragging.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    lastPos.current = { x: e.clientX, y: e.clientY }
    setOffset((p) => ({
      x: clamp(p.x + dx, maxOffsetX),
      y: clamp(p.y + dy, maxOffsetY),
    }))
  }
  const stopDrag = () => {
    dragging.current = false
  }

  const handleConfirm = () => {
    const outScale = OUTPUT / VIEW
    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT
    canvas.height = OUTPUT
    canvas
      .getContext('2d')
      .drawImage(
        img,
        ((VIEW - dispW) / 2 + offset.x) * outScale,
        ((VIEW - dispH) / 2 + offset.y) * outScale,
        dispW * outScale,
        dispH * outScale,
      )
    onConfirm(canvas.toDataURL('image/jpeg', 0.85))
  }

  return (
    <div className="avatar-position-editor" onClick={onCancel}>
      <div className="avatar-position-editor__panel" onClick={(e) => e.stopPropagation()}>
        <div className="avatar-position-editor__title">Ajustar foto</div>
        <div className="avatar-position-editor__hint">Arrastra la foto para ubicarla</div>
        <div
          className="avatar-position-editor__viewport"
          style={{ width: VIEW, height: VIEW }}
          onMouseMove={onMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
        >
          {img && (
            <img
              src={img.src}
              alt=""
              draggable={false}
              className="avatar-position-editor__image"
              style={{
                left: (VIEW - dispW) / 2 + offset.x,
                top: (VIEW - dispH) / 2 + offset.y,
                width: dispW,
                height: dispH,
              }}
              onMouseDown={startDrag}
            />
          )}
        </div>
        <div className="avatar-position-editor__actions">
          <CButton size="sm" color="secondary" variant="outline" onClick={onCancel}>
            Cancelar
          </CButton>
          <CButton size="sm" color="primary" onClick={handleConfirm} disabled={!img}>
            Guardar
          </CButton>
        </div>
      </div>
    </div>
  )
}

export default AvatarPositionEditor
