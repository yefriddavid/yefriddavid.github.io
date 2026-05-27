import React, { useRef, useCallback, useState, useEffect, useImperativeHandle } from 'react'
import { Stage, Layer, Line, Rect, Text, Arc, Group, Circle, Shape } from 'react-konva'
import {
  GRID_SIZE,
  WALL_THICKNESS,
  PIXELS_PER_METER,
  CANVAS_W,
  CANVAS_H,
  RULER_SIZE,
  FURNITURE_CATALOG_MAP,
} from 'src/constants/inmobiliaria'

// ── helpers ───────────────────────────────────────────────────────────────────

const snap = (v) => Math.round(v / GRID_SIZE) * GRID_SIZE

const wallLengthM = (w) => {
  const px = Math.sqrt((w.x2 - w.x1) ** 2 + (w.y2 - w.y1) ** 2)
  return (px / PIXELS_PER_METER).toFixed(1) + 'm'
}

const isFurnitureTool = (tool) => !!FURNITURE_CATALOG_MAP[tool]

// ── Grid ──────────────────────────────────────────────────────────────────────

const GridShape = ({ width, height, spacingPx, visible }) => {
  if (!visible) return null
  return (
    <Shape
      width={width}
      height={height}
      listening={false}
      sceneFunc={(ctx) => {
        const c = ctx._context
        const major = spacingPx * 5
        c.save()
        c.beginPath()
        c.rect(0, 0, width, height)
        c.clip()
        c.strokeStyle = '#dde1e7'
        c.lineWidth = 0.5
        c.beginPath()
        for (let x = 0; x <= width; x += spacingPx) {
          c.moveTo(x, 0)
          c.lineTo(x, height)
        }
        for (let y = 0; y <= height; y += spacingPx) {
          c.moveTo(0, y)
          c.lineTo(width, y)
        }
        c.stroke()
        c.strokeStyle = '#bfc5ce'
        c.lineWidth = 1
        c.beginPath()
        for (let x = 0; x <= width; x += major) {
          c.moveTo(x, 0)
          c.lineTo(x, height)
        }
        for (let y = 0; y <= height; y += major) {
          c.moveTo(0, y)
          c.lineTo(width, y)
        }
        c.stroke()
        c.restore()
      }}
    />
  )
}

// ── Ruler bars ────────────────────────────────────────────────────────────────

const RulerBars = ({ width, height, spacingPx }) => {
  // label every 1m minimum; if grid spacing > 1m, match the grid
  const labelStep = Math.max(PIXELS_PER_METER, spacingPx)

  return (
    <Shape
      x={-RULER_SIZE}
      y={-RULER_SIZE}
      listening={false}
      sceneFunc={(ctx) => {
        const c = ctx._context
        c.save()

        // corner square
        c.fillStyle = '#dde1e7'
        c.fillRect(0, 0, RULER_SIZE, RULER_SIZE)

        // horizontal ruler background
        c.fillStyle = '#f4f5f7'
        c.fillRect(RULER_SIZE, 0, width, RULER_SIZE)

        // vertical ruler background
        c.fillRect(0, RULER_SIZE, RULER_SIZE, height)

        // borders
        c.strokeStyle = '#bfc6d0'
        c.lineWidth = 0.5
        c.strokeRect(RULER_SIZE, 0, width, RULER_SIZE)
        c.strokeRect(0, RULER_SIZE, RULER_SIZE, height)

        // ── horizontal minor ticks ─────────────────────────────────
        if (spacingPx < labelStep) {
          c.strokeStyle = '#c8d2dc'
          c.lineWidth = 0.5
          c.beginPath()
          for (let x = spacingPx; x < width; x += spacingPx) {
            if (x % labelStep === 0) continue
            c.moveTo(RULER_SIZE + x, RULER_SIZE - 5)
            c.lineTo(RULER_SIZE + x, RULER_SIZE)
          }
          c.stroke()
        }

        // ── horizontal major ticks + labels ───────────────────────
        c.strokeStyle = '#7a8a9a'
        c.lineWidth = 1
        c.fillStyle = '#505a68'
        c.font = '9px sans-serif'
        c.textAlign = 'center'
        c.textBaseline = 'top'
        for (let x = labelStep; x <= width; x += labelStep) {
          const m = x / PIXELS_PER_METER
          c.beginPath()
          c.moveTo(RULER_SIZE + x, RULER_SIZE - 9)
          c.lineTo(RULER_SIZE + x, RULER_SIZE)
          c.stroke()
          c.fillText(`${m}m`, RULER_SIZE + x, 2)
        }

        // ── vertical minor ticks ───────────────────────────────────
        if (spacingPx < labelStep) {
          c.strokeStyle = '#c8d2dc'
          c.lineWidth = 0.5
          c.beginPath()
          for (let y = spacingPx; y < height; y += spacingPx) {
            if (y % labelStep === 0) continue
            c.moveTo(RULER_SIZE - 5, RULER_SIZE + y)
            c.lineTo(RULER_SIZE, RULER_SIZE + y)
          }
          c.stroke()
        }

        // ── vertical major ticks + labels (rotated) ───────────────
        c.strokeStyle = '#7a8a9a'
        c.lineWidth = 1
        for (let y = labelStep; y <= height; y += labelStep) {
          const m = y / PIXELS_PER_METER
          c.beginPath()
          c.moveTo(RULER_SIZE - 9, RULER_SIZE + y)
          c.lineTo(RULER_SIZE, RULER_SIZE + y)
          c.stroke()
          c.save()
          c.translate(RULER_SIZE / 2, RULER_SIZE + y)
          c.rotate(-Math.PI / 2)
          c.textAlign = 'center'
          c.textBaseline = 'middle'
          c.fillStyle = '#505a68'
          c.font = '9px sans-serif'
          c.fillText(`${m}m`, 0, 0)
          c.restore()
        }

        c.restore()
      }}
    />
  )
}

// ── Wall measurement label ─────────────────────────────────────────────────────

const WallMeasure = ({ wall, selected, isSelectMode, onMoveLabel }) => {
  const mx = (wall.x1 + wall.x2) / 2
  const my = (wall.y1 + wall.y2) / 2
  const dx = wall.x2 - wall.x1
  const dy = wall.y2 - wall.y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const defaultTx = mx + nx * 14
  const defaultTy = my + ny * 14
  const tx = defaultTx + (wall.labelDx ?? 0)
  const ty = defaultTy + (wall.labelDy ?? 0)
  const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI)
  const label = wallLengthM(wall)
  const draggable = selected && isSelectMode
  return (
    <Text
      x={tx}
      y={ty}
      text={label}
      fontSize={10}
      fill={selected ? '#0066ff' : '#555'}
      fontStyle={selected ? 'bold' : 'normal'}
      rotation={angleDeg}
      offsetY={5}
      draggable={draggable}
      listening={draggable}
      onClick={(e) => {
        e.cancelBubble = true
      }}
      onDragEnd={(e) => {
        const newDx = e.target.x() - defaultTx
        const newDy = e.target.y() - defaultTy
        e.target.x(tx)
        e.target.y(ty)
        onMoveLabel(wall.id, newDx, newDy)
      }}
    />
  )
}

// ── Door shape ────────────────────────────────────────────────────────────────

const DoorShape = ({
  door,
  selected,
  draggable,
  onSelect,
  onDragEnd,
  onResize,
  onRotate,
  multiDrag,
}) => {
  const { id, x, y, width: w, rotation } = door
  return (
    <Group
      id={'el-' + id}
      x={x}
      y={y}
      rotation={rotation}
      scaleX={door.scaleX ?? 1}
      scaleY={door.scaleY ?? 1}
      draggable={draggable}
      onClick={(e) => {
        e.cancelBubble = true
        onSelect(id, e.evt.ctrlKey || e.evt.metaKey)
      }}
      onDragStart={() => multiDrag?.start(id)}
      onDragMove={(e) => {
        const nx = snap(e.target.x())
        const ny = snap(e.target.y())
        e.target.x(nx)
        e.target.y(ny)
        multiDrag?.move(id, nx, ny)
      }}
      onDragEnd={(e) => {
        const pos = { x: snap(e.target.x()), y: snap(e.target.y()) }
        if (!multiDrag?.end(id, pos)) onDragEnd(id, pos)
      }}
    >
      {/* invisible hit area covering the full 90° swing quadrant */}
      <Rect x={0} y={0} width={w} height={w} fill="rgba(0,0,0,0.001)" stroke={null} />
      <Line points={[0, 0, w, 0]} stroke="#1a1a1a" strokeWidth={2} hitStrokeWidth={12} />
      <Arc
        x={0}
        y={0}
        innerRadius={0}
        outerRadius={w}
        angle={90}
        rotation={0}
        fill="rgba(180, 210, 255, 0.25)"
        stroke="#555"
        strokeWidth={1}
        dash={[4, 3]}
      />
      {selected && (
        <Rect
          x={-4}
          y={-4}
          width={w + 8}
          height={w + 8}
          stroke="#0066ff"
          strokeWidth={1.5}
          dash={[4, 3]}
          fill="transparent"
        />
      )}
      {selected && draggable && (
        <>
          <Circle
            x={w}
            y={0}
            radius={6}
            fill="#f97316"
            stroke="white"
            strokeWidth={1.5}
            draggable
            onClick={(e) => {
              e.cancelBubble = true
            }}
            onDragMove={(e) => {
              e.cancelBubble = true
              e.target.x(Math.max(GRID_SIZE * 2, snap(e.target.x())))
              e.target.y(0)
            }}
            onDragEnd={(e) => {
              e.cancelBubble = true
              const newW = Math.max(GRID_SIZE * 2, snap(e.target.x()))
              e.target.x(w)
              e.target.y(0)
              onResize(id, { width: newW })
            }}
          />
          <Circle
            x={w / 2}
            y={-16}
            radius={8}
            fill="#9333ea"
            stroke="white"
            strokeWidth={1.5}
            onClick={(e) => {
              e.cancelBubble = true
              onRotate(id)
            }}
          />
          <Text x={w / 2 - 4} y={-21} text="↻" fontSize={10} fill="white" listening={false} />
        </>
      )}
    </Group>
  )
}

// ── Window shape ───────────────────────────────────────────────────────────────

const WindowShape = ({
  win,
  selected,
  draggable,
  onSelect,
  onDragEnd,
  onResize,
  onRotate,
  multiDrag,
}) => {
  const { id, x, y, width: w, rotation } = win
  const d = 8
  return (
    <Group
      id={'el-' + id}
      x={x}
      y={y}
      rotation={rotation}
      offsetY={d / 2}
      scaleX={win.scaleX ?? 1}
      scaleY={win.scaleY ?? 1}
      draggable={draggable}
      onClick={(e) => {
        e.cancelBubble = true
        onSelect(id, e.evt.ctrlKey || e.evt.metaKey)
      }}
      onDragStart={() => multiDrag?.start(id)}
      onDragMove={(e) => {
        const nx = snap(e.target.x())
        const ny = snap(e.target.y())
        e.target.x(nx)
        e.target.y(ny)
        multiDrag?.move(id, nx, ny)
      }}
      onDragEnd={(e) => {
        const pos = { x: snap(e.target.x()), y: snap(e.target.y()) }
        if (!multiDrag?.end(id, pos)) onDragEnd(id, pos)
      }}
    >
      <Rect
        x={0}
        y={0}
        width={w}
        height={d}
        fill="white"
        stroke="#1a1a1a"
        strokeWidth={1.5}
        hitStrokeWidth={16}
      />
      <Line points={[0, d / 2, w, d / 2]} stroke="#555" strokeWidth={0.5} />
      {selected && (
        <Rect
          x={-3}
          y={-3}
          width={w + 6}
          height={d + 6}
          stroke="#0066ff"
          strokeWidth={1.5}
          dash={[4, 3]}
          fill="transparent"
        />
      )}
      {selected && draggable && (
        <>
          <Circle
            x={w}
            y={d / 2}
            radius={6}
            fill="#f97316"
            stroke="white"
            strokeWidth={1.5}
            draggable
            onClick={(e) => {
              e.cancelBubble = true
            }}
            onDragMove={(e) => {
              e.cancelBubble = true
              e.target.x(Math.max(GRID_SIZE * 2, snap(e.target.x())))
              e.target.y(d / 2)
            }}
            onDragEnd={(e) => {
              e.cancelBubble = true
              const newW = Math.max(GRID_SIZE * 2, snap(e.target.x()))
              e.target.x(w)
              e.target.y(d / 2)
              onResize(id, { width: newW })
            }}
          />
          <Circle
            x={w / 2}
            y={-16}
            radius={8}
            fill="#9333ea"
            stroke="white"
            strokeWidth={1.5}
            onClick={(e) => {
              e.cancelBubble = true
              onRotate(id)
            }}
          />
          <Text x={w / 2 - 4} y={-21} text="↻" fontSize={10} fill="white" listening={false} />
        </>
      )}
    </Group>
  )
}

// ── Furniture shapes ───────────────────────────────────────────────────────────

const FurnitureShape = ({
  item,
  selected,
  draggable,
  onSelect,
  onDragEnd,
  onResize,
  onRotate,
  multiDrag,
}) => {
  const { id, type, x, y, width: w, height: h, rotation } = item
  const S = '#1a1a1a'
  const SW = 1.5

  const renderInner = () => {
    switch (type) {
      case 'bed_single':
        return (
          <>
            <Rect x={0} y={0} width={w} height={h} fill="white" stroke={S} strokeWidth={SW} />
            <Rect x={0} y={0} width={w} height={h * 0.15} fill="#555" />
            <Rect
              x={w * 0.1}
              y={h * 0.2}
              width={w * 0.8}
              height={h * 0.22}
              fill="white"
              stroke={S}
              strokeWidth={1}
            />
          </>
        )
      case 'bed_double':
        return (
          <>
            <Rect x={0} y={0} width={w} height={h} fill="white" stroke={S} strokeWidth={SW} />
            <Rect x={0} y={0} width={w} height={h * 0.15} fill="#555" />
            <Rect
              x={w * 0.05}
              y={h * 0.2}
              width={w * 0.42}
              height={h * 0.22}
              fill="white"
              stroke={S}
              strokeWidth={1}
            />
            <Rect
              x={w * 0.53}
              y={h * 0.2}
              width={w * 0.42}
              height={h * 0.22}
              fill="white"
              stroke={S}
              strokeWidth={1}
            />
          </>
        )
      case 'wardrobe':
        return (
          <>
            <Rect x={0} y={0} width={w} height={h} fill="#f5f5f5" stroke={S} strokeWidth={SW} />
            <Line points={[w / 2, 0, w / 2, h]} stroke={S} strokeWidth={1} />
            <Line points={[w * 0.1, h * 0.5, w * 0.9, h * 0.5]} stroke={S} strokeWidth={0.5} />
          </>
        )
      case 'toilet':
        return (
          <>
            <Rect
              x={0}
              y={0}
              width={w}
              height={h * 0.35}
              fill="white"
              stroke={S}
              strokeWidth={SW}
            />
            <Shape
              sceneFunc={(ctx) => {
                const c = ctx._context
                c.save()
                c.strokeStyle = S
                c.lineWidth = SW
                c.fillStyle = 'white'
                c.beginPath()
                c.ellipse(
                  w / 2,
                  h * 0.35 + (h * 0.65) / 2,
                  w / 2,
                  (h * 0.65) / 2,
                  0,
                  0,
                  2 * Math.PI,
                )
                c.fill()
                c.stroke()
                c.restore()
              }}
              width={w}
              height={h}
              listening={false}
            />
          </>
        )
      case 'bathtub':
        return (
          <>
            <Rect x={0} y={0} width={w} height={h} fill="white" stroke={S} strokeWidth={SW} />
            <Rect
              x={4}
              y={h * 0.08}
              width={w - 8}
              height={h - h * 0.16}
              fill="#f0f4ff"
              stroke={S}
              strokeWidth={1}
              cornerRadius={6}
            />
            <Circle x={w * 0.5} y={h * 0.85} radius={4} fill={S} />
          </>
        )
      case 'shower':
        return (
          <>
            <Rect x={0} y={0} width={w} height={h} fill="white" stroke={S} strokeWidth={SW} />
            <Arc
              x={0}
              y={h}
              innerRadius={0}
              outerRadius={w}
              angle={90}
              rotation={-90}
              fill="#e8f0ff"
              stroke={S}
              strokeWidth={1}
            />
            <Circle x={w * 0.3} y={h * 0.3} radius={5} fill="none" stroke={S} strokeWidth={1} />
          </>
        )
      case 'sink_bath':
        return (
          <>
            <Rect x={0} y={0} width={w} height={h} fill="white" stroke={S} strokeWidth={SW} />
            <Shape
              sceneFunc={(ctx) => {
                const c = ctx._context
                c.save()
                c.strokeStyle = S
                c.lineWidth = 1
                c.fillStyle = '#f0f4ff'
                c.beginPath()
                c.ellipse(w / 2, h / 2, w * 0.35, h * 0.35, 0, 0, 2 * Math.PI)
                c.fill()
                c.stroke()
                c.restore()
              }}
              width={w}
              height={h}
              listening={false}
            />
          </>
        )
      case 'sink_kitchen':
        return (
          <>
            <Rect x={0} y={0} width={w} height={h} fill="white" stroke={S} strokeWidth={SW} />
            <Rect
              x={w * 0.05}
              y={h * 0.1}
              width={w * 0.42}
              height={h * 0.8}
              fill="#f0f4ff"
              stroke={S}
              strokeWidth={1}
            />
            <Rect
              x={w * 0.53}
              y={h * 0.1}
              width={w * 0.42}
              height={h * 0.8}
              fill="#f0f4ff"
              stroke={S}
              strokeWidth={1}
            />
          </>
        )
      case 'stove':
        return (
          <>
            <Rect x={0} y={0} width={w} height={h} fill="white" stroke={S} strokeWidth={SW} />
            {[
              [0.25, 0.3],
              [0.75, 0.3],
              [0.25, 0.75],
              [0.75, 0.75],
            ].map(([cx, cy], i) => (
              <Circle
                key={i}
                x={w * cx}
                y={h * cy}
                radius={w * 0.12}
                fill="none"
                stroke={S}
                strokeWidth={1.2}
              />
            ))}
          </>
        )
      case 'fridge':
        return (
          <>
            <Rect x={0} y={0} width={w} height={h} fill="white" stroke={S} strokeWidth={SW} />
            <Line points={[0, h * 0.35, w, h * 0.35]} stroke={S} strokeWidth={1} />
            <Circle x={w * 0.8} y={h * 0.18} radius={3} fill={S} />
          </>
        )
      case 'sofa':
        return (
          <>
            <Rect x={0} y={0} width={w} height={h} fill="white" stroke={S} strokeWidth={SW} />
            <Rect x={0} y={0} width={w} height={h * 0.35} fill="#ddd" stroke={S} strokeWidth={1} />
            <Rect
              x={0}
              y={h * 0.35}
              width={w * 0.15}
              height={h * 0.65}
              fill="#ddd"
              stroke={S}
              strokeWidth={1}
            />
            <Rect
              x={w * 0.85}
              y={h * 0.35}
              width={w * 0.15}
              height={h * 0.65}
              fill="#ddd"
              stroke={S}
              strokeWidth={1}
            />
          </>
        )
      case 'armchair':
        return (
          <>
            <Rect x={0} y={0} width={w} height={h} fill="white" stroke={S} strokeWidth={SW} />
            <Rect x={0} y={0} width={w} height={h * 0.3} fill="#ddd" stroke={S} strokeWidth={1} />
            <Rect
              x={0}
              y={h * 0.3}
              width={w * 0.18}
              height={h * 0.7}
              fill="#ddd"
              stroke={S}
              strokeWidth={1}
            />
            <Rect
              x={w * 0.82}
              y={h * 0.3}
              width={w * 0.18}
              height={h * 0.7}
              fill="#ddd"
              stroke={S}
              strokeWidth={1}
            />
          </>
        )
      case 'table_coffee':
        return (
          <>
            <Rect x={0} y={0} width={w} height={h} fill="white" stroke={S} strokeWidth={SW} />
            <Rect
              x={w * 0.1}
              y={h * 0.1}
              width={w * 0.8}
              height={h * 0.8}
              fill="none"
              stroke={S}
              strokeWidth={0.7}
            />
          </>
        )
      case 'tv_unit':
        return (
          <>
            <Rect x={0} y={0} width={w} height={h} fill="#eee" stroke={S} strokeWidth={SW} />
            <Rect
              x={w * 0.1}
              y={h * 0.15}
              width={w * 0.8}
              height={h * 0.7}
              fill="white"
              stroke={S}
              strokeWidth={1}
            />
            <Line points={[w * 0.5, h * 0.15, w * 0.5, h * 0.85]} stroke={S} strokeWidth={0.5} />
          </>
        )
      case 'table_dining':
        return (
          <>
            <Rect x={0} y={0} width={w} height={h} fill="white" stroke={S} strokeWidth={SW} />
            {[0.2, 0.5, 0.8].map((cx, i) => (
              <Circle
                key={`t${i}`}
                x={w * cx}
                y={-10}
                radius={8}
                fill="white"
                stroke={S}
                strokeWidth={1}
              />
            ))}
            {[0.2, 0.5, 0.8].map((cx, i) => (
              <Circle
                key={`b${i}`}
                x={w * cx}
                y={h + 10}
                radius={8}
                fill="white"
                stroke={S}
                strokeWidth={1}
              />
            ))}
            {[0.2, 0.8].map((cy, i) => (
              <Circle
                key={`l${i}`}
                x={-10}
                y={h * cy}
                radius={8}
                fill="white"
                stroke={S}
                strokeWidth={1}
              />
            ))}
            {[0.2, 0.8].map((cy, i) => (
              <Circle
                key={`r${i}`}
                x={w + 10}
                y={h * cy}
                radius={8}
                fill="white"
                stroke={S}
                strokeWidth={1}
              />
            ))}
          </>
        )
      case 'chair':
        return (
          <>
            <Rect x={0} y={0} width={w} height={h} fill="white" stroke={S} strokeWidth={SW} />
            <Rect x={0} y={0} width={w} height={h * 0.28} fill="#ddd" stroke={S} strokeWidth={1} />
          </>
        )
      case 'desk':
        return (
          <>
            <Rect x={0} y={0} width={w} height={h} fill="white" stroke={S} strokeWidth={SW} />
            <Line points={[w * 0.6, 0, w * 0.6, h]} stroke={S} strokeWidth={1} />
            <Rect
              x={w * 0.62}
              y={h * 0.1}
              width={w * 0.33}
              height={h * 0.8}
              fill="#f5f5f5"
              stroke={S}
              strokeWidth={0.5}
            />
          </>
        )
      case 'patio':
        return (
          <>
            <Rect
              x={0}
              y={0}
              width={w}
              height={h}
              fill="#c8e6c9"
              stroke="#388e3c"
              strokeWidth={SW}
              dash={[6, 3]}
            />
            <Shape
              sceneFunc={(ctx) => {
                const c = ctx._context
                c.save()
                c.beginPath()
                c.rect(0, 0, w, h)
                c.clip()
                c.strokeStyle = '#81c784'
                c.lineWidth = 0.8
                c.beginPath()
                const step = 18
                for (let i = -h; i < w + h; i += step) {
                  c.moveTo(i, 0)
                  c.lineTo(i + h, h)
                }
                c.stroke()
                c.restore()
              }}
              width={w}
              height={h}
              listening={false}
            />
          </>
        )
      case 'jardin':
        return (
          <>
            <Rect
              x={0}
              y={0}
              width={w}
              height={h}
              fill="#a5d6a7"
              stroke="#2e7d32"
              strokeWidth={SW}
              dash={[6, 3]}
            />
            <Shape
              sceneFunc={(ctx) => {
                const c = ctx._context
                c.save()
                c.beginPath()
                c.rect(0, 0, w, h)
                c.clip()
                c.fillStyle = '#4caf50'
                const spacing = 28
                for (let row = spacing / 2; row < h; row += spacing) {
                  for (let col = spacing / 2; col < w; col += spacing) {
                    c.beginPath()
                    c.arc(col, row, 5, 0, 2 * Math.PI)
                    c.fill()
                  }
                }
                c.restore()
              }}
              width={w}
              height={h}
              listening={false}
            />
          </>
        )
      case 'terraza':
        return (
          <>
            <Rect
              x={0}
              y={0}
              width={w}
              height={h}
              fill="#f0e4d0"
              stroke="#8d6e63"
              strokeWidth={SW}
            />
            <Shape
              sceneFunc={(ctx) => {
                const c = ctx._context
                c.save()
                c.beginPath()
                c.rect(0, 0, w, h)
                c.clip()
                c.strokeStyle = '#bcaaa4'
                c.lineWidth = 0.8
                const tileW = 40
                const tileH = 40
                for (let col = tileW; col < w; col += tileW) {
                  c.beginPath()
                  c.moveTo(col, 0)
                  c.lineTo(col, h)
                  c.stroke()
                }
                for (let row = tileH; row < h; row += tileH) {
                  c.beginPath()
                  c.moveTo(0, row)
                  c.lineTo(w, row)
                  c.stroke()
                }
                c.restore()
              }}
              width={w}
              height={h}
              listening={false}
            />
          </>
        )
      case 'balcon':
        return (
          <>
            <Rect
              x={0}
              y={0}
              width={w}
              height={h}
              fill="#dce8f5"
              stroke="#5c8db8"
              strokeWidth={SW}
            />
            <Shape
              sceneFunc={(ctx) => {
                const c = ctx._context
                c.save()
                c.strokeStyle = '#5c8db8'
                c.lineWidth = 1.2
                const railH = 10
                c.beginPath()
                c.rect(2, h - railH - 2, w - 4, railH)
                c.stroke()
                const postSpacing = 16
                for (let col = postSpacing; col < w - postSpacing / 2; col += postSpacing) {
                  c.beginPath()
                  c.moveTo(col, h - railH - 2)
                  c.lineTo(col, h - 2)
                  c.stroke()
                }
                c.restore()
              }}
              width={w}
              height={h}
              listening={false}
            />
          </>
        )
      case 'acera':
        return (
          <>
            <Rect
              x={0}
              y={0}
              width={w}
              height={h}
              fill="#e0e0e0"
              stroke="#757575"
              strokeWidth={SW}
            />
            <Shape
              sceneFunc={(ctx) => {
                const c = ctx._context
                c.save()
                c.beginPath()
                c.rect(0, 0, w, h)
                c.clip()
                c.strokeStyle = '#bdbdbd'
                c.lineWidth = 0.8
                const tileW = 40
                for (let col = tileW; col < w; col += tileW) {
                  c.beginPath()
                  c.moveTo(col, 0)
                  c.lineTo(col, h)
                  c.stroke()
                }
                c.beginPath()
                c.moveTo(0, h / 2)
                c.lineTo(w, h / 2)
                c.stroke()
                c.restore()
              }}
              width={w}
              height={h}
              listening={false}
            />
          </>
        )
      case 'frente':
        return (
          <>
            <Rect
              x={0}
              y={0}
              width={w}
              height={h}
              fill="#ede0c8"
              stroke="#795548"
              strokeWidth={SW}
            />
            <Shape
              sceneFunc={(ctx) => {
                const c = ctx._context
                c.save()
                c.beginPath()
                c.rect(0, 0, w, h)
                c.clip()
                c.strokeStyle = '#bcaaa4'
                c.lineWidth = 0.8
                const tileW = 40
                for (let col = tileW; col < w; col += tileW) {
                  c.beginPath()
                  c.moveTo(col, 0)
                  c.lineTo(col, h)
                  c.stroke()
                }
                c.setLineDash([4, 4])
                c.beginPath()
                c.moveTo(0, h / 2)
                c.lineTo(w, h / 2)
                c.stroke()
                c.setLineDash([])
                c.restore()
              }}
              width={w}
              height={h}
              listening={false}
            />
          </>
        )
      case 'garaje':
        return (
          <>
            <Rect
              x={0}
              y={0}
              width={w}
              height={h}
              fill="#eeeeee"
              stroke="#546e7a"
              strokeWidth={SW}
            />
            <Shape
              sceneFunc={(ctx) => {
                const c = ctx._context
                c.save()
                c.strokeStyle = '#90a4ae'
                c.lineWidth = 1
                c.setLineDash([6, 4])
                c.beginPath()
                c.moveTo(w / 2, h * 0.05)
                c.lineTo(w / 2, h * 0.95)
                c.stroke()
                c.setLineDash([])
                c.lineWidth = 1.5
                c.beginPath()
                c.moveTo(w * 0.1, h * 0.08)
                c.lineTo(w * 0.9, h * 0.08)
                c.stroke()
                c.beginPath()
                c.moveTo(w * 0.1, h * 0.92)
                c.lineTo(w * 0.9, h * 0.92)
                c.stroke()
                c.restore()
              }}
              width={w}
              height={h}
              listening={false}
            />
          </>
        )
      default:
        return <Rect x={0} y={0} width={w} height={h} fill="#f0f0f0" stroke={S} strokeWidth={SW} />
    }
  }

  const def = FURNITURE_CATALOG_MAP[type]
  const labelText = def?.label ?? type

  return (
    <Group
      id={'el-' + id}
      x={x}
      y={y}
      rotation={rotation}
      offsetX={w / 2}
      offsetY={h / 2}
      scaleX={item.scaleX ?? 1}
      scaleY={item.scaleY ?? 1}
      draggable={draggable}
      onClick={(e) => {
        e.cancelBubble = true
        onSelect(id, e.evt.ctrlKey || e.evt.metaKey)
      }}
      onDragStart={() => multiDrag?.start(id)}
      onDragMove={(e) => {
        const nx = snap(e.target.x() + w / 2) - w / 2
        const ny = snap(e.target.y() + h / 2) - h / 2
        e.target.x(nx)
        e.target.y(ny)
        multiDrag?.move(id, nx, ny)
      }}
      onDragEnd={(e) => {
        const pos = { x: snap(e.target.x() + w / 2), y: snap(e.target.y() + h / 2) }
        if (!multiDrag?.end(id, pos)) onDragEnd(id, pos)
      }}
    >
      {renderInner()}
      <Text
        x={0}
        y={h / 2 - 5}
        width={w}
        text={labelText}
        fontSize={9}
        fill="#777"
        align="center"
        listening={false}
      />
      {selected && (
        <Rect
          x={-4}
          y={-4}
          width={w + 8}
          height={h + 8}
          stroke="#0066ff"
          strokeWidth={1.5}
          dash={[4, 3]}
          fill="transparent"
        />
      )}
      {selected && draggable && (
        <>
          <Circle
            x={w}
            y={h}
            radius={6}
            fill="#f97316"
            stroke="white"
            strokeWidth={1.5}
            draggable
            onClick={(e) => {
              e.cancelBubble = true
            }}
            onDragMove={(e) => {
              e.cancelBubble = true
              e.target.x(Math.max(GRID_SIZE, snap(e.target.x())))
              e.target.y(Math.max(GRID_SIZE, snap(e.target.y())))
            }}
            onDragEnd={(e) => {
              e.cancelBubble = true
              const newW = Math.max(GRID_SIZE, snap(e.target.x()))
              const newH = Math.max(GRID_SIZE, snap(e.target.y()))
              e.target.x(w)
              e.target.y(h)
              onResize(id, { width: newW, height: newH })
            }}
          />
          <Circle
            x={w / 2}
            y={-16}
            radius={8}
            fill="#9333ea"
            stroke="white"
            strokeWidth={1.5}
            onClick={(e) => {
              e.cancelBubble = true
              onRotate(id)
            }}
          />
          <Text x={w / 2 - 4} y={-21} text="↻" fontSize={10} fill="white" listening={false} />
        </>
      )}
    </Group>
  )
}

// ── Ruler element ─────────────────────────────────────────────────────────────

const RULER_COLOR = '#e03131'
const RULER_COLOR_SEL = '#0066ff'
const TICK_HALF = 10
const LABEL_OFFSET = 16

const RulerElement = ({
  ruler,
  selectedIds,
  isSelectMode,
  onSelect,
  onMoveRuler,
  onResizeRuler,
}) => {
  const isSelected = selectedIds.includes(ruler.id)
  const { id, x1, y1, x2, y2 } = ruler
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 2) return null

  const ux = dx / len
  const uy = dy / len
  // normal points "left" of direction; in screen coords that's "above" for a left-to-right line
  const nx = -uy
  const ny = ux

  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const distM = len / PIXELS_PER_METER
  const label =
    distM % 1 === 0 ? distM.toFixed(0) + ' m' : distM.toFixed(2).replace(/0+$/, '') + ' m'

  let angleDeg = Math.atan2(dy, dx) * (180 / Math.PI)
  if (angleDeg > 90 || angleDeg < -90) angleDeg += 180

  const color = isSelected ? RULER_COLOR_SEL : RULER_COLOR

  return (
    <Group id={'el-' + id}>
      {/* main dimension line */}
      <Line
        points={[x1, y1, x2, y2]}
        stroke={color}
        strokeWidth={isSelected ? 2 : 1.5}
        hitStrokeWidth={18}
        draggable={isSelectMode}
        onClick={(e) => {
          e.cancelBubble = true
          onSelect(id, e.evt.ctrlKey || e.evt.metaKey)
        }}
        onDragEnd={(e) => {
          const rawDx = e.target.x()
          const rawDy = e.target.y()
          const snappedDx = snap(x1 + rawDx) - x1
          const snappedDy = snap(y1 + rawDy) - y1
          e.target.x(0)
          e.target.y(0)
          onMoveRuler(id, snappedDx, snappedDy)
        }}
      />
      {/* perpendicular tick at start */}
      <Line
        points={[
          x1 + nx * TICK_HALF,
          y1 + ny * TICK_HALF,
          x1 - nx * TICK_HALF,
          y1 - ny * TICK_HALF,
        ]}
        stroke={color}
        strokeWidth={2}
        listening={false}
      />
      {/* perpendicular tick at end */}
      <Line
        points={[
          x2 + nx * TICK_HALF,
          y2 + ny * TICK_HALF,
          x2 - nx * TICK_HALF,
          y2 - ny * TICK_HALF,
        ]}
        stroke={color}
        strokeWidth={2}
        listening={false}
      />
      {/* measurement label — offset to the "above" side of the line */}
      <Text
        x={mx - nx * LABEL_OFFSET}
        y={my - ny * LABEL_OFFSET}
        text={label}
        fontSize={12}
        fontStyle="bold"
        fill={color}
        rotation={angleDeg}
        align="center"
        width={90}
        offsetX={45}
        offsetY={6}
        listening={false}
      />
      {/* endpoint handles when selected */}
      {isSelected && isSelectMode && (
        <>
          <Circle
            x={x1}
            y={y1}
            radius={6}
            fill="white"
            stroke={color}
            strokeWidth={2}
            draggable
            onClick={(e) => {
              e.cancelBubble = true
            }}
            onDragMove={(e) => {
              e.target.x(snap(e.target.x()))
              e.target.y(snap(e.target.y()))
            }}
            onDragEnd={(e) => {
              const ex = snap(e.target.x())
              const ey = snap(e.target.y())
              e.target.x(x1)
              e.target.y(y1)
              onResizeRuler(id, 'start', ex, ey)
            }}
          />
          <Circle
            x={x2}
            y={y2}
            radius={6}
            fill="white"
            stroke={color}
            strokeWidth={2}
            draggable
            onClick={(e) => {
              e.cancelBubble = true
            }}
            onDragMove={(e) => {
              e.target.x(snap(e.target.x()))
              e.target.y(snap(e.target.y()))
            }}
            onDragEnd={(e) => {
              const ex = snap(e.target.x())
              const ey = snap(e.target.y())
              e.target.x(x2)
              e.target.y(y2)
              onResizeRuler(id, 'end', ex, ey)
            }}
          />
        </>
      )}
    </Group>
  )
}

// ── Wall element (extracted so it can participate in unified z-order) ─────────

const WallElement = ({
  wall,
  selectedIds,
  isSelectMode,
  onSelect,
  onMoveWall,
  onResizeWall,
  onMoveLabelOffset,
}) => {
  const isSelected = selectedIds.includes(wall.id)
  return (
    <Group>
      <Line
        points={[wall.x1, wall.y1, wall.x2, wall.y2]}
        stroke={isSelected ? '#0066ff' : '#1a1a1a'}
        strokeWidth={isSelected ? WALL_THICKNESS + 2 : WALL_THICKNESS}
        lineCap="square"
        hitStrokeWidth={WALL_THICKNESS + 16}
        draggable={isSelectMode}
        onClick={(e) => {
          e.cancelBubble = true
          onSelect(wall.id, e.evt.ctrlKey || e.evt.metaKey)
        }}
        onDragEnd={(e) => {
          const rawDx = e.target.x()
          const rawDy = e.target.y()
          const snappedDx = snap(wall.x1 + rawDx) - wall.x1
          const snappedDy = snap(wall.y1 + rawDy) - wall.y1
          e.target.x(0)
          e.target.y(0)
          onMoveWall(wall.id, snappedDx, snappedDy)
        }}
      />
      <WallMeasure
        wall={wall}
        selected={isSelected}
        isSelectMode={isSelectMode}
        onMoveLabel={onMoveLabelOffset}
      />
      {isSelected && isSelectMode && (
        <>
          <Circle
            x={wall.x1}
            y={wall.y1}
            radius={6}
            fill="white"
            stroke="#0066ff"
            strokeWidth={2}
            draggable
            onClick={(e) => {
              e.cancelBubble = true
            }}
            onDragMove={(e) => {
              e.target.x(snap(e.target.x()))
              e.target.y(snap(e.target.y()))
            }}
            onDragEnd={(e) => {
              const nx = snap(e.target.x())
              const ny = snap(e.target.y())
              e.target.x(wall.x1)
              e.target.y(wall.y1)
              onResizeWall(wall.id, 'start', nx, ny)
            }}
          />
          <Circle
            x={wall.x2}
            y={wall.y2}
            radius={6}
            fill="white"
            stroke="#0066ff"
            strokeWidth={2}
            draggable
            onClick={(e) => {
              e.cancelBubble = true
            }}
            onDragMove={(e) => {
              e.target.x(snap(e.target.x()))
              e.target.y(snap(e.target.y()))
            }}
            onDragEnd={(e) => {
              const nx = snap(e.target.x())
              const ny = snap(e.target.y())
              e.target.x(wall.x2)
              e.target.y(wall.y2)
              onResizeWall(wall.id, 'end', nx, ny)
            }}
          />
        </>
      )}
    </Group>
  )
}

// ── Main canvas ────────────────────────────────────────────────────────────────

const EditorCanvas = React.forwardRef(
  (
    {
      plano,
      tool,
      selectedIds = [],
      drawStart,
      mousePos,
      stageScale,
      stagePos,
      onStageMouseMove,
      onStageClick,
      onStageWheel,
      onStageDragEnd,
      onSelect,
      onDragEnd,
      onBatchDragEnd,
      onMoveWall,
      onResizeWall,
      onMoveRuler,
      onResizeRuler,
      onResizeElement,
      onRotateElement,
      onMoveLabelOffset,
      gridSpacingPx = GRID_SIZE,
      gridVisible = true,
    },
    ref,
  ) => {
    const stageRef = useRef(null)
    const containerRef = useRef(null)
    const [stageSize, setStageSize] = useState({ width: 900, height: 600 })
    const isSelectMode = tool === 'select'
    const isEraserMode = tool === 'eraser'

    // keep refs in sync to avoid stale closures inside drag callbacks
    const selectedIdsRef = useRef(selectedIds)
    const planoRef = useRef(plano)
    useEffect(() => {
      selectedIdsRef.current = selectedIds
    }, [selectedIds])
    useEffect(() => {
      planoRef.current = plano
    }, [plano])

    // ── multi-drag (imperative, no state re-renders during drag) ─────────────────
    const multiDragRef = useRef({ active: false, origins: {}, activeId: null })

    const multiDragStart = useCallback((activeId) => {
      const ids = selectedIdsRef.current
      if (ids.length <= 1) return
      const stage = stageRef.current
      const origins = {}
      ids.forEach((sid) => {
        const node = stage.findOne('#el-' + sid)
        if (node) origins[sid] = { x: node.x(), y: node.y() }
      })
      multiDragRef.current = { active: true, activeId, origins }
    }, [])

    const multiDragMove = useCallback((activeId, nx, ny) => {
      const dr = multiDragRef.current
      if (!dr.active || dr.activeId !== activeId) return
      const origin = dr.origins[activeId]
      if (!origin) return
      const dx = nx - origin.x
      const dy = ny - origin.y
      const stage = stageRef.current
      selectedIdsRef.current.forEach((sid) => {
        if (sid === activeId) return
        const node = stage.findOne('#el-' + sid)
        const o = dr.origins[sid]
        if (node && o) {
          node.x(o.x + dx)
          node.y(o.y + dy)
        }
      })
    }, [])

    const multiDragEnd = useCallback(
      (activeId, activeStoredPos) => {
        const dr = multiDragRef.current
        const ids = selectedIdsRef.current
        if (!dr.active || dr.activeId !== activeId || ids.length <= 1) {
          multiDragRef.current.active = false
          return false
        }
        multiDragRef.current.active = false
        const stage = stageRef.current
        const updates = { [activeId]: activeStoredPos }
        ids.forEach((sid) => {
          if (sid === activeId) return
          const node = stage.findOne('#el-' + sid)
          if (!node) return
          const fItem = planoRef.current.furniture.find((f) => f.id === sid)
          if (fItem) {
            updates[sid] = {
              x: snap(node.x() + fItem.width / 2),
              y: snap(node.y() + fItem.height / 2),
            }
          } else {
            updates[sid] = { x: snap(node.x()), y: snap(node.y()) }
          }
        })
        onBatchDragEnd(updates)
        return true
      },
      [onBatchDragEnd],
    )

    const multiDrag = { start: multiDragStart, move: multiDragMove, end: multiDragEnd }

    useImperativeHandle(ref, () => {
      const buildDataURL = () => {
        const stage = stageRef.current
        if (!stage) return null

        const p = planoRef.current
        const PADDING = 60
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity
        const expand = (x, y) => {
          if (x < minX) minX = x
          if (y < minY) minY = y
          if (x > maxX) maxX = x
          if (y > maxY) maxY = y
        }
        p.walls.forEach((w) => {
          expand(w.x1, w.y1)
          expand(w.x2, w.y2)
        })
        p.doors.forEach((d) => {
          expand(d.x, d.y)
          expand(d.x + (d.width ?? 80), d.y + (d.height ?? 80))
        })
        p.windows.forEach((w) => {
          expand(w.x, w.y)
          expand(w.x + (w.width ?? 80), w.y + (w.height ?? 20))
        })
        p.furniture.forEach((f) => {
          const hw = (f.width ?? 80) / 2
          const hh = (f.height ?? 80) / 2
          expand(f.x - hw, f.y - hh)
          expand(f.x + hw, f.y + hh)
        })
        p.labels.forEach((l) => {
          expand(l.x, l.y)
          expand(l.x + 120, l.y + 20)
        })
        ;(p.rulers ?? []).forEach((r) => {
          expand(r.x1, r.y1)
          expand(r.x2, r.y2)
        })

        let clipX, clipY, clipW, clipH
        if (!isFinite(minX)) {
          clipX = 0
          clipY = 0
          clipW = CANVAS_W
          clipH = CANVAS_H
        } else {
          clipX = Math.max(0, minX - PADDING)
          clipY = Math.max(0, minY - PADDING)
          clipW = Math.min(CANVAS_W, maxX + PADDING) - clipX
          clipH = Math.min(CANVAS_H, maxY + PADDING) - clipY
        }

        const prevX = stage.x()
        const prevY = stage.y()
        const prevSX = stage.scaleX()
        const prevSY = stage.scaleY()
        const prevW = stage.width()
        const prevH = stage.height()
        stage.x(0)
        stage.y(0)
        stage.scaleX(1)
        stage.scaleY(1)
        stage.width(CANVAS_W)
        stage.height(CANVAS_H)
        stage.draw()
        const dataURL = stage.toDataURL({
          x: clipX,
          y: clipY,
          width: clipW,
          height: clipH,
          pixelRatio: 3,
          mimeType: 'image/png',
        })
        stage.x(prevX)
        stage.y(prevY)
        stage.scaleX(prevSX)
        stage.scaleY(prevSY)
        stage.width(prevW)
        stage.height(prevH)
        stage.draw()

        return { dataURL, clipW, clipH }
      }

      return {
        exportPdf: (planName) => {
          const result = buildDataURL()
          if (!result) return
          const { dataURL, clipW, clipH } = result
          const isLandscape = clipW >= clipH
          const scaleLabel = `Escala aprox. 1:${Math.round(clipW / PIXELS_PER_METER)}`
          const win = window.open('', '_blank')
          if (!win) return
          win.document.write(`<!DOCTYPE html>
<html><head>
  <title>${planName || 'Plano'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: white; font-family: sans-serif; }
    .pe-print__header { display: flex; justify-content: space-between; align-items: baseline; padding: 0 0 6px; border-bottom: 1px solid #ccc; margin-bottom: 8px; }
    .pe-print__title { font-size: 15px; font-weight: bold; color: #111; }
    .pe-print__scale { font-size: 11px; color: #666; }
    img { display: block; width: 100%; height: auto; }
    @media print {
      @page { size: ${isLandscape ? 'landscape' : 'portrait'}; margin: 10mm; }
      .pe-print__header { padding: 0 0 4px; margin-bottom: 6px; }
      img { width: 100%; height: auto; page-break-inside: avoid; }
    }
  </style>
</head><body>
  <div class="pe-print__header">
    <span class="pe-print__title">${planName || 'Plano'}</span>
    <span class="pe-print__scale">${scaleLabel}</span>
  </div>
  <img src="${dataURL}" />
  <script>window.addEventListener('load',function(){setTimeout(function(){window.print()},200)});<\/script>
</body></html>`)
          win.document.close()
        },

        downloadPng: (planName) => {
          const result = buildDataURL()
          if (!result) return
          const { dataURL } = result
          const a = document.createElement('a')
          a.href = dataURL
          a.download = `${planName || 'plano'}.png`
          a.click()
        },
      }
    })

    useEffect(() => {
      const el = containerRef.current
      if (!el) return
      const update = () => {
        const w = el.offsetWidth
        const h = el.offsetHeight
        if (w > 0 && h > 0) setStageSize({ width: w, height: h })
      }
      const obs = new ResizeObserver(update)
      obs.observe(el)
      update()
      return () => obs.disconnect()
    }, [])

    const handleElementSelect = useCallback(
      (id, isCtrl = false) => {
        if (isEraserMode) {
          onSelect('__erase__' + id)
        } else {
          onSelect(id, isCtrl)
        }
      },
      [isEraserMode, onSelect],
    )

    return (
      <div ref={containerRef} className="pe-canvas-container">
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePos.x}
          y={stagePos.y}
          draggable={isSelectMode}
          onMouseMove={onStageMouseMove}
          onClick={onStageClick}
          onWheel={onStageWheel}
          onDragEnd={onStageDragEnd}
          style={{ cursor: tool === 'select' ? 'default' : 'crosshair' }}
        >
          <Layer>
            {/* canvas background */}
            <Rect
              x={0}
              y={0}
              width={CANVAS_W}
              height={CANVAS_H}
              fill="white"
              stroke="#aaa"
              strokeWidth={1}
              listening={false}
            />
            {/* grid — on top of white bg, below all elements */}
            <GridShape
              width={CANVAS_W}
              height={CANVAS_H}
              spacingPx={gridSpacingPx}
              visible={gridVisible}
            />

            {/* all elements rendered in z-order; elements not in zOrder fall back to default category order */}
            {(() => {
              const wallMap = Object.fromEntries(plano.walls.map((w) => [w.id, w]))
              const doorMap = Object.fromEntries(plano.doors.map((d) => [d.id, d]))
              const winMap = Object.fromEntries(plano.windows.map((w) => [w.id, w]))
              const furMap = Object.fromEntries(plano.furniture.map((f) => [f.id, f]))
              const lblMap = Object.fromEntries(plano.labels.map((l) => [l.id, l]))
              const rulMap = Object.fromEntries((plano.rulers ?? []).map((r) => [r.id, r]))
              const zoSet = new Set(plano.zOrder ?? [])
              const legacy = [
                ...plano.walls.map((w) => w.id),
                ...plano.doors.map((d) => d.id),
                ...plano.windows.map((w) => w.id),
                ...plano.furniture.map((f) => f.id),
                ...plano.labels.map((l) => l.id),
                ...(plano.rulers ?? []).map((r) => r.id),
              ].filter((id) => !zoSet.has(id))
              const order = [...legacy, ...(plano.zOrder ?? [])]

              return order.map((id) => {
                const wall = wallMap[id]
                if (wall)
                  return (
                    <WallElement
                      key={id}
                      wall={wall}
                      selectedIds={selectedIds}
                      isSelectMode={isSelectMode}
                      onSelect={handleElementSelect}
                      onMoveWall={onMoveWall}
                      onResizeWall={onResizeWall}
                      onMoveLabelOffset={onMoveLabelOffset}
                    />
                  )
                const door = doorMap[id]
                if (door)
                  return (
                    <DoorShape
                      key={id}
                      door={door}
                      selected={selectedIds.includes(id)}
                      draggable={isSelectMode}
                      onSelect={handleElementSelect}
                      onDragEnd={onDragEnd}
                      onResize={onResizeElement}
                      onRotate={onRotateElement}
                      multiDrag={multiDrag}
                    />
                  )
                const win = winMap[id]
                if (win)
                  return (
                    <WindowShape
                      key={id}
                      win={win}
                      selected={selectedIds.includes(id)}
                      draggable={isSelectMode}
                      onSelect={handleElementSelect}
                      onDragEnd={onDragEnd}
                      onResize={onResizeElement}
                      onRotate={onRotateElement}
                      multiDrag={multiDrag}
                    />
                  )
                const item = furMap[id]
                if (item)
                  return (
                    <FurnitureShape
                      key={id}
                      item={item}
                      selected={selectedIds.includes(id)}
                      draggable={isSelectMode}
                      onSelect={handleElementSelect}
                      onDragEnd={onDragEnd}
                      onResize={onResizeElement}
                      onRotate={onRotateElement}
                      multiDrag={multiDrag}
                    />
                  )
                const lbl = lblMap[id]
                if (lbl)
                  return (
                    <Group
                      key={id}
                      id={'el-' + id}
                      x={lbl.x}
                      y={lbl.y}
                      draggable={isSelectMode}
                      onClick={(e) => {
                        e.cancelBubble = true
                        handleElementSelect(id, e.evt.ctrlKey || e.evt.metaKey)
                      }}
                      onDragStart={() => multiDrag.start(id)}
                      onDragMove={(e) => {
                        const nx = snap(e.target.x())
                        const ny = snap(e.target.y())
                        e.target.x(nx)
                        e.target.y(ny)
                        multiDrag.move(id, nx, ny)
                      }}
                      onDragEnd={(e) => {
                        const pos = { x: snap(e.target.x()), y: snap(e.target.y()) }
                        if (!multiDrag.end(id, pos)) onDragEnd(id, pos)
                      }}
                    >
                      <Text
                        text={lbl.text}
                        fontSize={lbl.fontSize ?? 14}
                        fill={selectedIds.includes(id) ? '#0066ff' : '#333'}
                        fontStyle="bold"
                      />
                    </Group>
                  )
                const rul = rulMap[id]
                if (rul)
                  return (
                    <RulerElement
                      key={id}
                      ruler={rul}
                      selectedIds={selectedIds}
                      isSelectMode={isSelectMode}
                      onSelect={handleElementSelect}
                      onMoveRuler={onMoveRuler}
                      onResizeRuler={onResizeRuler}
                    />
                  )
                return null
              })
            })()}

            {/* drawing preview (wall tool) */}
            {tool === 'wall' && drawStart && (
              <>
                <Circle x={drawStart.x} y={drawStart.y} radius={5} fill="#0066ff" />
                <Line
                  points={[drawStart.x, drawStart.y, mousePos.x, mousePos.y]}
                  stroke="#0066ff"
                  strokeWidth={WALL_THICKNESS}
                  lineCap="square"
                  opacity={0.5}
                  listening={false}
                />
                <Text
                  x={(drawStart.x + mousePos.x) / 2 + 8}
                  y={(drawStart.y + mousePos.y) / 2 - 16}
                  text={wallLengthM({
                    x1: drawStart.x,
                    y1: drawStart.y,
                    x2: mousePos.x,
                    y2: mousePos.y,
                  })}
                  fontSize={12}
                  fill="#0066ff"
                  fontStyle="bold"
                  listening={false}
                />
              </>
            )}

            {/* drawing preview (ruler tool) */}
            {tool === 'ruler' && drawStart && (
              <>
                <Circle
                  x={drawStart.x}
                  y={drawStart.y}
                  radius={5}
                  fill={RULER_COLOR}
                  opacity={0.7}
                />
                <Line
                  points={[drawStart.x, drawStart.y, mousePos.x, mousePos.y]}
                  stroke={RULER_COLOR}
                  strokeWidth={1.5}
                  opacity={0.6}
                  listening={false}
                />
                <Text
                  x={(drawStart.x + mousePos.x) / 2 + 8}
                  y={(drawStart.y + mousePos.y) / 2 - 16}
                  text={wallLengthM({
                    x1: drawStart.x,
                    y1: drawStart.y,
                    x2: mousePos.x,
                    y2: mousePos.y,
                  })}
                  fontSize={12}
                  fill={RULER_COLOR}
                  fontStyle="bold"
                  listening={false}
                />
              </>
            )}

            {/* placement preview for furniture/door/window */}
            {isFurnitureTool(tool) &&
              (() => {
                const def = FURNITURE_CATALOG_MAP[tool]
                if (!def) return null
                return (
                  <Rect
                    x={mousePos.x - def.w / 2}
                    y={mousePos.y - def.h / 2}
                    width={def.w}
                    height={def.h}
                    fill="rgba(0,102,255,0.12)"
                    stroke="#0066ff"
                    strokeWidth={1}
                    dash={[4, 3]}
                    listening={false}
                  />
                )
              })()}

            {/* ruler bars — drawn last so they sit on top, in negative-coord space */}
            <RulerBars width={CANVAS_W} height={CANVAS_H} spacingPx={gridSpacingPx} />
          </Layer>
        </Stage>
      </div>
    )
  },
)

export default EditorCanvas
