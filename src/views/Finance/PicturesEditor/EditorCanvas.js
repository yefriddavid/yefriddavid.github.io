import React, { useRef, useState, useCallback, useEffect, useImperativeHandle } from 'react'
import { PICTURES_RULER_SIZE, PICTURES_UNITS_MAP, PICTURES_DEFAULT_NODE } from 'src/constants/finance'

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

// ─── Shape geometry helpers ───────────────────────────────────────────────────

const polygonPoints = (cx, cy, r, sides) => {
  const pts = []
  for (let i = 0; i < sides; i++) {
    const a = (2 * Math.PI * i) / sides - Math.PI / 2
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`)
  }
  return pts.join(' ')
}

const starPoints = (cx, cy, outerR, nPoints) => {
  const innerR = outerR * 0.4
  const pts = []
  for (let i = 0; i < nPoints * 2; i++) {
    const a = (Math.PI * i) / nPoints - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`)
  }
  return pts.join(' ')
}

const trianglePoints = (x, y, w, h) =>
  `${x + w / 2},${y} ${x + w},${y + h} ${x},${y + h}`

const shapeAttrs = (n) => ({
  fill: n.fill,
  fillOpacity: n.fillOpacity ?? 1,
  stroke: n.stroke,
  strokeWidth: n.strokeWidth ?? 2,
})

// ─── Shape renderer ───────────────────────────────────────────────────────────

const ShapeElement = ({ node, selected, onMouseDown }) => {
  const { x, y, w, h, rotation, type } = node
  const cx = x + w / 2
  const cy = y + h / 2
  const r = Math.min(w, h) / 2
  const transform = rotation ? `rotate(${rotation},${cx},${cy})` : undefined
  const attrs = shapeAttrs(node)
  const base = {
    transform,
    onMouseDown,
    style: { cursor: node.locked ? 'not-allowed' : 'move' },
    className: `pic-canvas__shape${selected ? ' pic-canvas__shape--selected' : ''}${node.locked ? ' pic-canvas__shape--locked' : ''}`,
  }

  if (type === 'rect') {
    return <rect x={x} y={y} width={w} height={h} {...attrs} {...base} />
  }
  if (type === 'roundRect') {
    const safeRx = Math.max(0, Math.min(node.rx ?? 12, Math.min(w, h) / 2))
    return <rect x={x} y={y} width={w} height={h} rx={safeRx} ry={safeRx} {...attrs} {...base} />
  }
  if (type === 'elbow90') {
    const aw = Math.max(4, Math.min(node.armWidth ?? 24, Math.min(w, h) * 0.8))
    const pts = `${x},${y} ${x + aw},${y} ${x + aw},${y + h - aw} ${x + w},${y + h - aw} ${x + w},${y + h} ${x},${y + h}`
    return <polygon points={pts} {...attrs} {...base} />
  }
  if (type === 'elbowRound') {
    // Curved pipe bend: two concentric arcs sharing the same center of curvature.
    // Ri = inner bend radius (node.rx), Ro = Ri + aw.
    // Center of arcs at (x+aw+Ri, y+h-aw-Ri).
    // Vertical arm runs on the left, horizontal arm runs on the bottom.
    const aw = Math.max(4, Math.min(node.armWidth ?? 24, Math.min(w, h) * 0.8))
    const maxRi = Math.max(1, Math.min(w, h) - aw - 2)
    const Ri = Math.max(1, Math.min(node.rx ?? 12, maxRi))
    const Ro = Ri + aw
    const d = [
      `M ${x},${y}`,
      `L ${x},${y + h - aw - Ri}`,
      `A ${Ro},${Ro} 0 0,0 ${x + aw + Ri},${y + h}`,
      `L ${x + w},${y + h}`,
      `L ${x + w},${y + h - aw}`,
      `L ${x + aw + Ri},${y + h - aw}`,
      `A ${Ri},${Ri} 0 0,1 ${x + aw},${y + h - aw - Ri}`,
      `L ${x + aw},${y}`,
      'Z',
    ].join(' ')
    return <path d={d} {...attrs} {...base} />
  }
  if (type === 'circle') {
    return <ellipse cx={cx} cy={cy} rx={w / 2} ry={h / 2} {...attrs} {...base} />
  }
  if (type === 'triangle') {
    return <polygon points={trianglePoints(x, y, w, h)} {...attrs} {...base} />
  }
  if (type === 'polygon') {
    return <polygon points={polygonPoints(cx, cy, r, node.sides ?? 6)} {...attrs} {...base} />
  }
  if (type === 'star') {
    return <polygon points={starPoints(cx, cy, r, node.points ?? 5)} {...attrs} {...base} />
  }
  if (type === 'line') {
    return <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke={node.stroke} strokeWidth={node.strokeWidth ?? 2} transform={transform} onMouseDown={onMouseDown} style={base.style} className={base.className} />
  }
  if (type === 'vline') {
    return <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke={node.stroke} strokeWidth={node.strokeWidth ?? 2} transform={transform} onMouseDown={onMouseDown} style={base.style} className={base.className} />
  }
  if (type === 'arrow') {
    const hw = Math.min(14, w * 0.3)
    const hh = Math.min(10, h * 0.5 + 4)
    const ex = x + w
    const my = y + h / 2
    const headPts = `${ex},${my} ${ex - hw},${my - hh / 2} ${ex - hw},${my + hh / 2}`
    return (
      <g transform={transform} onMouseDown={onMouseDown} style={base.style} className={base.className}>
        <line x1={x} y1={my} x2={ex - hw * 0.7} y2={my} stroke={node.stroke} strokeWidth={node.strokeWidth ?? 2} />
        <polygon points={headPts} fill={node.stroke} />
      </g>
    )
  }
  if (type === 'text') {
    return (
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={node.fontSize ?? 16}
        fill={node.fontColor ?? '#000000'}
        transform={transform}
        onMouseDown={onMouseDown}
        style={base.style}
        className={base.className}
      >
        {node.text || 'Texto'}
      </text>
    )
  }
  return null
}

// ─── Selection handles ────────────────────────────────────────────────────────

const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']

const handlePos = (x, y, w, h, dir) => {
  const cx = x + w / 2, cy = y + h / 2
  const map = { nw: [x, y], n: [cx, y], ne: [x + w, y], e: [x + w, cy], se: [x + w, y + h], s: [cx, y + h], sw: [x, y + h], w: [x, cy] }
  return map[dir]
}

const SelectionHandles = ({ node, onHandleDown }) => {
  const { x, y, w, h, rotation } = node
  const cx = x + w / 2, cy = y + h / 2
  return (
    <g transform={rotation ? `rotate(${rotation},${cx},${cy})` : undefined}>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="#4a9eff" strokeWidth={1} strokeDasharray="4 3" pointerEvents="none" />
      {HANDLES.map((dir) => {
        const [hx, hy] = handlePos(x, y, w, h, dir)
        return (
          <rect
            key={dir}
            x={hx - 4}
            y={hy - 4}
            width={8}
            height={8}
            className={`pic-canvas__handle pic-canvas__handle--${dir}`}
            onMouseDown={(e) => { e.stopPropagation(); onHandleDown(e, dir) }}
          />
        )
      })}
    </g>
  )
}

// ─── Ruler ────────────────────────────────────────────────────────────────────

const Ruler = ({ length, unit, pxPerUnit, zoom, orientation, size }) => {
  const ticks = []
  const totalPx = length
  const unitPx = pxPerUnit * zoom
  const step = unitPx >= 40 ? 1 : unitPx >= 15 ? Math.ceil(2 / (unitPx / 40)) : Math.ceil(5 / (unitPx / 40))
  const stepPx = step * pxPerUnit * zoom

  for (let pos = 0; pos <= totalPx * zoom; pos += stepPx) {
    const val = Math.round((pos / (pxPerUnit * zoom)) * 10) / 10
    const isMain = val % (step * 5) < 0.01
    ticks.push({ pos, val, isMain })
  }

  if (orientation === 'horizontal') {
    return (
      <svg width={totalPx * zoom} height={size} style={{ display: 'block' }}>
        {ticks.map(({ pos, val, isMain }, i) => (
          <g key={i}>
            <line x1={pos} y1={isMain ? 0 : size / 2} x2={pos} y2={size} stroke="#555" strokeWidth={0.5} />
            {isMain && (
              <text x={pos + 2} y={size - 4} fontSize={9} fill="#777">{val}{unit}</text>
            )}
          </g>
        ))}
      </svg>
    )
  }

  return (
    <svg width={size} height={totalPx * zoom} style={{ display: 'block' }}>
      {ticks.map(({ pos, val, isMain }, i) => (
        <g key={i}>
          <line x1={isMain ? 0 : size / 2} y1={pos} x2={size} y2={pos} stroke="#555" strokeWidth={0.5} />
          {isMain && (
            <text
              x={size - 3}
              y={pos + 2}
              fontSize={9}
              fill="#777"
              transform={`rotate(-90,${size - 3},${pos + 2})`}
              textAnchor="end"
            >
              {val}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

const Grid = ({ canvasW, canvasH, gridPx }) => {
  if (!gridPx || gridPx < 3) return null
  const lines = []
  for (let x = gridPx; x < canvasW; x += gridPx) {
    lines.push(<line key={`v${x}`} x1={x} y1={0} x2={x} y2={canvasH} stroke="#e0e0e0" strokeWidth={0.4} strokeDasharray="1 3" />)
  }
  for (let y = gridPx; y < canvasH; y += gridPx) {
    lines.push(<line key={`h${y}`} x1={0} y1={y} x2={canvasW} y2={y} stroke="#e0e0e0" strokeWidth={0.4} strokeDasharray="1 3" />)
  }
  return <g className="pic-canvas__grid">{lines}</g>
}

// ─── EditorCanvas ─────────────────────────────────────────────────────────────

const EditorCanvas = React.forwardRef(({ canvas, nodes, groups, selectedIds, tool, zoom, onNodesChange, onSelect }, ref) => {
  const svgRef = useRef(null)
  const [drawing, setDrawing] = useState(null)
  const [dragging, setDragging] = useState(null)
  const [resizing, setResizing] = useState(null)
  const [selRect, setSelRect] = useState(null)

  const u = PICTURES_UNITS_MAP[canvas.unit] ?? PICTURES_UNITS_MAP.cm
  const canvasW = canvas.width * u.pxPerUnit
  const canvasH = canvas.height * u.pxPerUnit
  const gridPx = canvas.grid * u.pxPerUnit
  const RULER = PICTURES_RULER_SIZE

  const snap = useCallback(
    (v) => {
      if (!canvas.snap || !gridPx) return v
      return Math.round(v / gridPx) * gridPx
    },
    [canvas.snap, gridPx],
  )

  const svgPoint = useCallback(
    (e) => {
      const rect = svgRef.current.getBoundingClientRect()
      return {
        x: snap((e.clientX - rect.left) / zoom),
        y: snap((e.clientY - rect.top) / zoom),
      }
    },
    [zoom, snap],
  )

  const visibleNodes = nodes.filter((n) => {
    const grp = n.groupId ? groups.find((g) => g.id === n.groupId) : null
    return n.visible !== false && !(grp?.hidden)
  })

  // ── Export ──────────────────────────────────────────────────────────────────

  const exportImage = useCallback((format, filename) => {
    const svg = svgRef.current
    if (!svg) return
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svg)
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = canvasW
      c.height = canvasH
      const ctx = c.getContext('2d')
      if (format !== 'png') {
        ctx.fillStyle = canvas.bg ?? '#ffffff'
        ctx.fillRect(0, 0, canvasW, canvasH)
      }
      ctx.drawImage(img, 0, 0, canvasW, canvasH)
      URL.revokeObjectURL(url)
      const mime = format === 'png' ? 'image/png' : 'image/jpeg'
      const ext = format === 'jpeg' ? 'jpeg' : format
      const dataUrl = c.toDataURL(mime, 0.95)
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `${filename}.${ext}`
      a.click()
    }
    img.src = url
  }, [canvasW, canvasH, canvas.bg])

  const generateThumbnail = useCallback(() => new Promise((resolve) => {
    const svg = svgRef.current
    if (!svg) return resolve(null)
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svg)
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const THUMB_W = 320
      const THUMB_H = Math.round(THUMB_W * (canvasH / canvasW))
      const c = document.createElement('canvas')
      c.width = THUMB_W
      c.height = THUMB_H
      const ctx = c.getContext('2d')
      ctx.fillStyle = canvas.bg ?? '#ffffff'
      ctx.fillRect(0, 0, THUMB_W, THUMB_H)
      ctx.drawImage(img, 0, 0, THUMB_W, THUMB_H)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', 0.75))
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    img.src = url
  }), [canvasW, canvasH, canvas.bg])

  useImperativeHandle(ref, () => ({ exportImage, generateThumbnail }), [exportImage, generateThumbnail])

  // ── Mouse handlers ──────────────────────────────────────────────────────────

  const handleSvgMouseDown = (e) => {
    if (e.button !== 0) return
    const pt = svgPoint(e)

    if (tool === 'select') {
      onSelect([])
      setSelRect({ x0: pt.x, y0: pt.y, x: pt.x, y: pt.y })
      return
    }

    if (tool === 'eraser') return

    if (tool !== 'select') {
      setDrawing({ x0: pt.x, y0: pt.y, x: pt.x, y: pt.y, type: tool })
    }
  }

  const handleShapeMouseDown = useCallback(
    (e, node) => {
      if (e.button !== 0) return
      e.stopPropagation()
      if (tool === 'eraser') {
        onNodesChange(nodes.filter((n) => n.id !== node.id))
        return
      }
      if (tool !== 'select') return
      if (node.locked) return
      const pt = svgPoint(e)
      if (!e.shiftKey) onSelect([node.id])
      else onSelect(selectedIds.includes(node.id) ? selectedIds.filter((i) => i !== node.id) : [...selectedIds, node.id])
      setDragging({ nodeId: node.id, startX: pt.x, startY: pt.y, origX: node.x, origY: node.y })
    },
    [tool, nodes, selectedIds, svgPoint, onNodesChange, onSelect],
  )

  const handleHandleDown = useCallback(
    (e, dir, node) => {
      const pt = svgPoint(e)
      setResizing({ nodeId: node.id, dir, startPt: pt, orig: { x: node.x, y: node.y, w: node.w, h: node.h } })
    },
    [svgPoint],
  )

  const handleMouseMove = useCallback(
    (e) => {
      const pt = svgPoint(e)

      if (drawing) {
        setDrawing((d) => ({ ...d, x: pt.x, y: pt.y }))
      }

      if (dragging) {
        const dx = pt.x - dragging.startX
        const dy = pt.y - dragging.startY
        onNodesChange(
          nodes.map((n) =>
            n.id === dragging.nodeId ? { ...n, x: snap(dragging.origX + dx), y: snap(dragging.origY + dy) } : n,
          ),
        )
      }

      if (resizing) {
        const { dir, startPt, orig } = resizing
        const dx = pt.x - startPt.x
        const dy = pt.y - startPt.y
        let { x, y, w, h } = orig

        if (dir.includes('e')) w = Math.max(4, snap(orig.w + dx))
        if (dir.includes('s')) h = Math.max(4, snap(orig.h + dy))
        if (dir.includes('w')) { x = snap(orig.x + dx); w = Math.max(4, orig.w - dx) }
        if (dir.includes('n')) { y = snap(orig.y + dy); h = Math.max(4, orig.h - dy) }

        onNodesChange(nodes.map((n) => (n.id === resizing.nodeId ? { ...n, x, y, w, h } : n)))
      }

      if (selRect) {
        setSelRect((s) => ({ ...s, x: pt.x, y: pt.y }))
      }
    },
    [drawing, dragging, resizing, selRect, nodes, svgPoint, snap, onNodesChange],
  )

  const handleMouseUp = useCallback(
    (_e) => {
      if (drawing) {
        const rawX = Math.min(drawing.x0, drawing.x)
        const rawY = Math.min(drawing.y0, drawing.y)
        const rawW = Math.abs(drawing.x - drawing.x0)
        const rawH = Math.abs(drawing.y - drawing.y0)

        if (rawW > 4 || rawH > 4) {
          const w = rawW < 4 ? 40 : rawW
          const h = rawH < 4 ? 40 : rawH
          const newNode = {
            ...PICTURES_DEFAULT_NODE,
            id: uid(),
            type: drawing.type,
            name: `${drawing.type} ${nodes.length + 1}`,
            groupId: null,
            x: rawX,
            y: rawY,
            w,
            h,
          }
          const updated = [...nodes, newNode]
          onNodesChange(updated)
          onSelect([newNode.id])
        }
        setDrawing(null)
      }

      if (selRect) {
        const sx = Math.min(selRect.x0, selRect.x)
        const sy = Math.min(selRect.y0, selRect.y)
        const sw = Math.abs(selRect.x - selRect.x0)
        const sh = Math.abs(selRect.y - selRect.y0)
        const hit = nodes
          .filter((n) => n.x < sx + sw && n.x + n.w > sx && n.y < sy + sh && n.y + n.h > sy)
          .map((n) => n.id)
        onSelect(hit)
        setSelRect(null)
      }

      setDragging(null)
      setResizing(null)
    },
    [drawing, selRect, nodes, onNodesChange, onSelect],
  )

  // keyboard shortcuts
  useEffect(() => {
    const ARROW_KEYS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }
    const handler = (e) => {
      if (document.activeElement.tagName === 'INPUT') return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        onNodesChange(nodes.filter((n) => !selectedIds.includes(n.id)))
        onSelect([])
        return
      }
      if (ARROW_KEYS[e.key] && selectedIds.length > 0) {
        e.preventDefault()
        const [dx, dy] = ARROW_KEYS[e.key]
        onNodesChange(
          nodes.map((n) => (selectedIds.includes(n.id) ? { ...n, x: n.x + dx, y: n.y + dy } : n)),
        )
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [nodes, selectedIds, onNodesChange, onSelect])

  // preview rect while drawing
  const preview = (() => {
    if (!drawing) return null
    const x = Math.min(drawing.x0, drawing.x)
    const y = Math.min(drawing.y0, drawing.y)
    const w = Math.abs(drawing.x - drawing.x0)
    const h = Math.abs(drawing.y - drawing.y0)
    return (
      <rect
        x={x} y={y} width={w} height={h}
        fill={PICTURES_DEFAULT_NODE.fill}
        fillOpacity={0.3}
        stroke={PICTURES_DEFAULT_NODE.stroke}
        strokeWidth={1}
        strokeDasharray="4 3"
        pointerEvents="none"
      />
    )
  })()

  const selRectEl = selRect && (
    <rect
      x={Math.min(selRect.x0, selRect.x)}
      y={Math.min(selRect.y0, selRect.y)}
      width={Math.abs(selRect.x - selRect.x0)}
      height={Math.abs(selRect.y - selRect.y0)}
      className="pic-canvas__selection-rect"
    />
  )

  const cursorClass = tool === 'select' ? ' pic-canvas--select' : tool === 'eraser' ? ' pic-canvas--eraser' : ''

  const selectedNode = selectedIds.length === 1 ? nodes.find((n) => n.id === selectedIds[0]) : null

  return (
    <div className="pic-canvas-area">
      {/* rulers */}
      <div
        className="pic-ruler-wrap__corner"
        style={{ width: RULER, height: RULER, position: 'absolute', top: 0, left: 0, zIndex: 12, background: '#2b2b2b', borderRight: '1px solid #3a3a3a', borderBottom: '1px solid #3a3a3a' }}
      />
      <div style={{ position: 'absolute', top: 0, left: RULER, zIndex: 11, overflow: 'hidden' }}>
        <Ruler
          length={canvasW}
          unit={canvas.unit}
          pxPerUnit={u.pxPerUnit}
          zoom={zoom}
          orientation="horizontal"
          size={RULER}
        />
      </div>
      <div style={{ position: 'absolute', top: RULER, left: 0, zIndex: 11, overflow: 'hidden' }}>
        <Ruler
          length={canvasH}
          unit={canvas.unit}
          pxPerUnit={u.pxPerUnit}
          zoom={zoom}
          orientation="vertical"
          size={RULER}
        />
      </div>

      {/* scrollable canvas area */}
      <div className="pic-canvas-area__scroll" style={{ paddingTop: RULER, paddingLeft: RULER }}>
        <div className="pic-canvas-area__inner">
          <svg
            ref={svgRef}
            className={`pic-canvas${cursorClass}`}
            width={canvasW * zoom}
            height={canvasH * zoom}
            viewBox={`0 0 ${canvasW} ${canvasH}`}
            onMouseDown={handleSvgMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* background */}
            <rect width={canvasW} height={canvasH} fill={canvas.bg ?? '#ffffff'} />

            {/* grid */}
            <Grid canvasW={canvasW} canvasH={canvasH} gridPx={gridPx} />

            {/* shapes */}
            {visibleNodes.map((node) => (
              <ShapeElement
                key={node.id}
                node={node}
                selected={selectedIds.includes(node.id)}
                onMouseDown={(e) => handleShapeMouseDown(e, node)}
              />
            ))}

            {/* selection handles */}
            {selectedNode && !selectedNode.locked && (
              <SelectionHandles
                node={selectedNode}
                onHandleDown={(e, dir) => handleHandleDown(e, dir, selectedNode)}
              />
            )}

            {/* draw preview */}
            {preview}
            {selRectEl}
          </svg>
        </div>
      </div>
    </div>
  )
})

export default EditorCanvas
