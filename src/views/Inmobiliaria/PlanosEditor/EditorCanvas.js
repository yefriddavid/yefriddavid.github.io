import React, { useRef, useCallback, useState, useEffect } from 'react'
import { Stage, Layer, Line, Rect, Text, Arc, Group, Circle, Shape } from 'react-konva'
import {
  GRID_SIZE,
  WALL_THICKNESS,
  PIXELS_PER_METER,
  CANVAS_W,
  CANVAS_H,
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

const GridLayer = ({ width, height }) => (
  <Layer listening={false}>
    <Shape
      width={width}
      height={height}
      listening={false}
      sceneFunc={(ctx) => {
        const c = ctx._context
        c.save()
        c.strokeStyle = '#e8eaed'
        c.lineWidth = 0.5
        c.beginPath()
        for (let x = 0; x <= width; x += GRID_SIZE) {
          c.moveTo(x, 0)
          c.lineTo(x, height)
        }
        for (let y = 0; y <= height; y += GRID_SIZE) {
          c.moveTo(0, y)
          c.lineTo(width, y)
        }
        c.stroke()
        c.strokeStyle = '#cfd3d9'
        c.lineWidth = 1
        c.beginPath()
        const major = GRID_SIZE * 5
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
  </Layer>
)

// ── Wall measurement label ─────────────────────────────────────────────────────

const WallMeasure = ({ wall }) => {
  const mx = (wall.x1 + wall.x2) / 2
  const my = (wall.y1 + wall.y2) / 2
  const dx = wall.x2 - wall.x1
  const dy = wall.y2 - wall.y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  // perpendicular offset (12px away from wall, to the left)
  const nx = -dy / len
  const ny = dx / len
  const tx = mx + nx * 14
  const ty = my + ny * 14
  const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI)
  const label = wallLengthM(wall)
  return (
    <Text
      x={tx}
      y={ty}
      text={label}
      fontSize={10}
      fill="#555"
      rotation={angleDeg}
      offsetY={5}
      listening={false}
    />
  )
}

// ── Door shape ────────────────────────────────────────────────────────────────

const DoorShape = ({ door, selected, draggable, onSelect, onDragEnd }) => {
  const { id, x, y, width: w, rotation } = door
  return (
    <Group
      x={x}
      y={y}
      rotation={rotation}
      draggable={draggable}
      onClick={(e) => {
        e.cancelBubble = true
        onSelect(id)
      }}
      onDragEnd={(e) => {
        onDragEnd(id, { x: snap(e.target.x()), y: snap(e.target.y()) })
      }}
    >
      <Line points={[0, 0, w, 0]} stroke="#1a1a1a" strokeWidth={2} />
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
    </Group>
  )
}

// ── Window shape ───────────────────────────────────────────────────────────────

const WindowShape = ({ win, selected, draggable, onSelect, onDragEnd }) => {
  const { id, x, y, width: w, rotation } = win
  const d = 8
  return (
    <Group
      x={x}
      y={y}
      rotation={rotation}
      offsetY={d / 2}
      draggable={draggable}
      onClick={(e) => {
        e.cancelBubble = true
        onSelect(id)
      }}
      onDragEnd={(e) => {
        onDragEnd(id, { x: snap(e.target.x()), y: snap(e.target.y()) })
      }}
    >
      <Rect x={0} y={0} width={w} height={d} fill="white" stroke="#1a1a1a" strokeWidth={1.5} />
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
    </Group>
  )
}

// ── Furniture shapes ───────────────────────────────────────────────────────────

const FurnitureShape = ({ item, selected, draggable, onSelect, onDragEnd }) => {
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
      default:
        return <Rect x={0} y={0} width={w} height={h} fill="#f0f0f0" stroke={S} strokeWidth={SW} />
    }
  }

  const def = FURNITURE_CATALOG_MAP[type]
  const labelText = def?.label ?? type

  return (
    <Group
      x={x}
      y={y}
      rotation={rotation}
      offsetX={w / 2}
      offsetY={h / 2}
      draggable={draggable}
      onClick={(e) => {
        e.cancelBubble = true
        onSelect(id)
      }}
      onDragEnd={(e) => {
        onDragEnd(id, { x: snap(e.target.x() + w / 2), y: snap(e.target.y() + h / 2) })
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
    </Group>
  )
}

// ── Main canvas ────────────────────────────────────────────────────────────────

const EditorCanvas = ({
  plano,
  tool,
  selectedId,
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
}) => {
  const stageRef = useRef(null)
  const containerRef = useRef(null)
  const [stageSize, setStageSize] = useState({ width: 900, height: 600 })
  const isSelectMode = tool === 'select'
  const isEraserMode = tool === 'eraser'

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
    (id) => {
      if (isEraserMode) {
        onSelect('__erase__' + id)
      } else {
        onSelect(id)
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
        <GridLayer width={CANVAS_W} height={CANVAS_H} />

        <Layer>
          {/* canvas border */}
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

          {/* walls */}
          {plano.walls.map((wall) => (
            <React.Fragment key={wall.id}>
              <Line
                points={[wall.x1, wall.y1, wall.x2, wall.y2]}
                stroke={selectedId === wall.id ? '#0066ff' : '#1a1a1a'}
                strokeWidth={selectedId === wall.id ? WALL_THICKNESS + 2 : WALL_THICKNESS}
                lineCap="square"
                hitStrokeWidth={WALL_THICKNESS + 16}
                onClick={(e) => {
                  e.cancelBubble = true
                  handleElementSelect(wall.id)
                }}
              />
              <WallMeasure wall={wall} />
            </React.Fragment>
          ))}

          {/* doors */}
          {plano.doors.map((door) => (
            <DoorShape
              key={door.id}
              door={door}
              selected={selectedId === door.id}
              draggable={isSelectMode}
              onSelect={handleElementSelect}
              onDragEnd={onDragEnd}
            />
          ))}

          {/* windows */}
          {plano.windows.map((win) => (
            <WindowShape
              key={win.id}
              win={win}
              selected={selectedId === win.id}
              draggable={isSelectMode}
              onSelect={handleElementSelect}
              onDragEnd={onDragEnd}
            />
          ))}

          {/* furniture */}
          {plano.furniture.map((item) => (
            <FurnitureShape
              key={item.id}
              item={item}
              selected={selectedId === item.id}
              draggable={isSelectMode}
              onSelect={handleElementSelect}
              onDragEnd={onDragEnd}
            />
          ))}

          {/* labels */}
          {plano.labels.map((lbl) => (
            <Group
              key={lbl.id}
              x={lbl.x}
              y={lbl.y}
              draggable={isSelectMode}
              onClick={(e) => {
                e.cancelBubble = true
                handleElementSelect(lbl.id)
              }}
              onDragEnd={(e) => onDragEnd(lbl.id, { x: snap(e.target.x()), y: snap(e.target.y()) })}
            >
              <Text
                text={lbl.text}
                fontSize={14}
                fill={selectedId === lbl.id ? '#0066ff' : '#333'}
                fontStyle="bold"
              />
            </Group>
          ))}

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
        </Layer>
      </Stage>
    </div>
  )
}

export default EditorCanvas
