import { Group, Rect, Line, Arc, Circle, Shape, Text } from 'react-konva'
import { GRID_SIZE, FURNITURE_CATALOG_MAP } from 'src/constants/inmobiliaria'
import { snap } from '../editorHelpers'

const S = '#1a1a1a'
const SW = 1.5

const renderFurnitureInner = (type, w, h) => {
  switch (type) {
    case 'bed_single':
      return (
        <>
          <Rect x={0} y={0} width={w} height={h} fill="white" stroke={S} strokeWidth={SW} />
          <Rect x={0} y={0} width={w} height={h * 0.15} fill="#555" />
          <Rect x={w * 0.1} y={h * 0.2} width={w * 0.8} height={h * 0.22} fill="white" stroke={S} strokeWidth={1} />
        </>
      )
    case 'bed_double':
      return (
        <>
          <Rect x={0} y={0} width={w} height={h} fill="white" stroke={S} strokeWidth={SW} />
          <Rect x={0} y={0} width={w} height={h * 0.15} fill="#555" />
          <Rect x={w * 0.05} y={h * 0.2} width={w * 0.42} height={h * 0.22} fill="white" stroke={S} strokeWidth={1} />
          <Rect x={w * 0.53} y={h * 0.2} width={w * 0.42} height={h * 0.22} fill="white" stroke={S} strokeWidth={1} />
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
          <Rect x={0} y={0} width={w} height={h * 0.35} fill="white" stroke={S} strokeWidth={SW} />
          <Shape
            sceneFunc={(ctx) => {
              const c = ctx._context
              c.save()
              c.strokeStyle = S
              c.lineWidth = SW
              c.fillStyle = 'white'
              c.beginPath()
              c.ellipse(w / 2, h * 0.35 + (h * 0.65) / 2, w / 2, (h * 0.65) / 2, 0, 0, 2 * Math.PI)
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
          <Rect x={4} y={h * 0.08} width={w - 8} height={h - h * 0.16} fill="#f0f4ff" stroke={S} strokeWidth={1} cornerRadius={6} />
          <Circle x={w * 0.5} y={h * 0.85} radius={4} fill={S} />
        </>
      )
    case 'shower':
      return (
        <>
          <Rect x={0} y={0} width={w} height={h} fill="white" stroke={S} strokeWidth={SW} />
          <Arc x={0} y={h} innerRadius={0} outerRadius={w} angle={90} rotation={-90} fill="#e8f0ff" stroke={S} strokeWidth={1} />
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
          <Rect x={w * 0.05} y={h * 0.1} width={w * 0.42} height={h * 0.8} fill="#f0f4ff" stroke={S} strokeWidth={1} />
          <Rect x={w * 0.53} y={h * 0.1} width={w * 0.42} height={h * 0.8} fill="#f0f4ff" stroke={S} strokeWidth={1} />
        </>
      )
    case 'stove':
      return (
        <>
          <Rect x={0} y={0} width={w} height={h} fill="white" stroke={S} strokeWidth={SW} />
          {[[0.25, 0.3], [0.75, 0.3], [0.25, 0.75], [0.75, 0.75]].map(([cx, cy], i) => (
            <Circle key={i} x={w * cx} y={h * cy} radius={w * 0.12} fill="none" stroke={S} strokeWidth={1.2} />
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
          <Rect x={0} y={h * 0.35} width={w * 0.15} height={h * 0.65} fill="#ddd" stroke={S} strokeWidth={1} />
          <Rect x={w * 0.85} y={h * 0.35} width={w * 0.15} height={h * 0.65} fill="#ddd" stroke={S} strokeWidth={1} />
        </>
      )
    case 'armchair':
      return (
        <>
          <Rect x={0} y={0} width={w} height={h} fill="white" stroke={S} strokeWidth={SW} />
          <Rect x={0} y={0} width={w} height={h * 0.3} fill="#ddd" stroke={S} strokeWidth={1} />
          <Rect x={0} y={h * 0.3} width={w * 0.18} height={h * 0.7} fill="#ddd" stroke={S} strokeWidth={1} />
          <Rect x={w * 0.82} y={h * 0.3} width={w * 0.18} height={h * 0.7} fill="#ddd" stroke={S} strokeWidth={1} />
        </>
      )
    case 'table_coffee':
      return (
        <>
          <Rect x={0} y={0} width={w} height={h} fill="white" stroke={S} strokeWidth={SW} />
          <Rect x={w * 0.1} y={h * 0.1} width={w * 0.8} height={h * 0.8} fill="none" stroke={S} strokeWidth={0.7} />
        </>
      )
    case 'tv_unit':
      return (
        <>
          <Rect x={0} y={0} width={w} height={h} fill="#eee" stroke={S} strokeWidth={SW} />
          <Rect x={w * 0.1} y={h * 0.15} width={w * 0.8} height={h * 0.7} fill="white" stroke={S} strokeWidth={1} />
          <Line points={[w * 0.5, h * 0.15, w * 0.5, h * 0.85]} stroke={S} strokeWidth={0.5} />
        </>
      )
    case 'table_dining':
      return (
        <>
          <Rect x={0} y={0} width={w} height={h} fill="white" stroke={S} strokeWidth={SW} />
          {[0.2, 0.5, 0.8].map((cx, i) => (
            <Circle key={`t${i}`} x={w * cx} y={-10} radius={8} fill="white" stroke={S} strokeWidth={1} />
          ))}
          {[0.2, 0.5, 0.8].map((cx, i) => (
            <Circle key={`b${i}`} x={w * cx} y={h + 10} radius={8} fill="white" stroke={S} strokeWidth={1} />
          ))}
          {[0.2, 0.8].map((cy, i) => (
            <Circle key={`l${i}`} x={-10} y={h * cy} radius={8} fill="white" stroke={S} strokeWidth={1} />
          ))}
          {[0.2, 0.8].map((cy, i) => (
            <Circle key={`r${i}`} x={w + 10} y={h * cy} radius={8} fill="white" stroke={S} strokeWidth={1} />
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
          <Rect x={w * 0.62} y={h * 0.1} width={w * 0.33} height={h * 0.8} fill="#f5f5f5" stroke={S} strokeWidth={0.5} />
        </>
      )
    case 'patio':
      return (
        <>
          <Rect x={0} y={0} width={w} height={h} fill="#c8e6c9" stroke="#388e3c" strokeWidth={SW} dash={[6, 3]} />
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
          <Rect x={0} y={0} width={w} height={h} fill="#a5d6a7" stroke="#2e7d32" strokeWidth={SW} dash={[6, 3]} />
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
          <Rect x={0} y={0} width={w} height={h} fill="#f0e4d0" stroke="#8d6e63" strokeWidth={SW} />
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
                c.beginPath(); c.moveTo(col, 0); c.lineTo(col, h); c.stroke()
              }
              for (let row = tileH; row < h; row += tileH) {
                c.beginPath(); c.moveTo(0, row); c.lineTo(w, row); c.stroke()
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
          <Rect x={0} y={0} width={w} height={h} fill="#dce8f5" stroke="#5c8db8" strokeWidth={SW} />
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
                c.beginPath(); c.moveTo(col, h - railH - 2); c.lineTo(col, h - 2); c.stroke()
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
          <Rect x={0} y={0} width={w} height={h} fill="#e0e0e0" stroke="#757575" strokeWidth={SW} />
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
                c.beginPath(); c.moveTo(col, 0); c.lineTo(col, h); c.stroke()
              }
              c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.stroke()
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
          <Rect x={0} y={0} width={w} height={h} fill="#ede0c8" stroke="#795548" strokeWidth={SW} />
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
                c.beginPath(); c.moveTo(col, 0); c.lineTo(col, h); c.stroke()
              }
              c.setLineDash([4, 4])
              c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.stroke()
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
          <Rect x={0} y={0} width={w} height={h} fill="#eeeeee" stroke="#546e7a" strokeWidth={SW} />
          <Shape
            sceneFunc={(ctx) => {
              const c = ctx._context
              c.save()
              c.strokeStyle = '#90a4ae'
              c.lineWidth = 1
              c.setLineDash([6, 4])
              c.beginPath(); c.moveTo(w / 2, h * 0.05); c.lineTo(w / 2, h * 0.95); c.stroke()
              c.setLineDash([])
              c.lineWidth = 1.5
              c.beginPath(); c.moveTo(w * 0.1, h * 0.08); c.lineTo(w * 0.9, h * 0.08); c.stroke()
              c.beginPath(); c.moveTo(w * 0.1, h * 0.92); c.lineTo(w * 0.9, h * 0.92); c.stroke()
              c.restore()
            }}
            width={w}
            height={h}
            listening={false}
          />
        </>
      )
    case 'stairs_straight': {
      const stepCount = Math.max(4, Math.round(h / 12))
      const stepH = h / stepCount
      return (
        <>
          <Rect x={0} y={0} width={w} height={h} fill="white" stroke={S} strokeWidth={SW} />
          {Array.from({ length: stepCount - 1 }, (_, i) => (
            <Line key={i} points={[0, (i + 1) * stepH, w, (i + 1) * stepH]} stroke={S} strokeWidth={0.8} />
          ))}
          <Line points={[w / 2, h * 0.15, w / 2, h * 0.85]} stroke="#888" strokeWidth={1} listening={false} />
          <Line points={[w / 2 - 5, h * 0.25, w / 2, h * 0.15, w / 2 + 5, h * 0.25]} stroke="#888" strokeWidth={1} listening={false} />
        </>
      )
    }
    case 'stairs_l': {
      const armW = w / 2
      const armH = h / 2
      const stepsV = Math.max(3, Math.round(armH / 12))
      const stepsH = Math.max(3, Math.round(armW / 12))
      return (
        <Shape
          sceneFunc={(ctx) => {
            const c = ctx._context
            c.save()
            c.beginPath()
            c.moveTo(0, 0); c.lineTo(w, 0); c.lineTo(w, armH)
            c.lineTo(armW, armH); c.lineTo(armW, h); c.lineTo(0, h)
            c.closePath()
            c.fillStyle = 'white'; c.fill()
            c.strokeStyle = S; c.lineWidth = SW; c.stroke()
            c.lineWidth = 0.8
            for (let i = 1; i < stepsV; i++) {
              const y = i * (armH / stepsV)
              c.beginPath(); c.moveTo(0, y); c.lineTo(armW, y); c.stroke()
            }
            for (let i = 1; i < stepsH; i++) {
              const x = armW + i * (armW / stepsH)
              c.beginPath(); c.moveTo(x, 0); c.lineTo(x, armH); c.stroke()
            }
            c.restore()
          }}
          width={w}
          height={h}
        />
      )
    }
    case 'stairs_spiral': {
      const cx = w / 2
      const cy = h / 2
      const outerR = Math.min(w, h) / 2 - 1
      const innerR = outerR * 0.22
      const steps = 12
      return (
        <Shape
          sceneFunc={(ctx) => {
            const c = ctx._context
            c.save()
            c.beginPath(); c.arc(cx, cy, outerR, 0, 2 * Math.PI)
            c.fillStyle = 'white'; c.fill()
            c.strokeStyle = S; c.lineWidth = SW; c.stroke()
            c.lineWidth = 0.8
            for (let i = 0; i < steps; i++) {
              const angle = (i / steps) * 2 * Math.PI
              c.beginPath()
              c.moveTo(cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle))
              c.lineTo(cx + outerR * Math.cos(angle), cy + outerR * Math.sin(angle))
              c.stroke()
            }
            c.beginPath(); c.arc(cx, cy, innerR, 0, 2 * Math.PI)
            c.fillStyle = '#e5e7eb'; c.fill()
            c.strokeStyle = S; c.lineWidth = 1; c.stroke()
            c.restore()
          }}
          width={w}
          height={h}
        />
      )
    }
    default:
      return <Rect x={0} y={0} width={w} height={h} fill="#f0f0f0" stroke={S} strokeWidth={SW} />
  }
}

const FurnitureShape = ({ item, selected, draggable, onSelect, onDragEnd, onResize, onRotate, multiDrag }) => {
  const { id, type, x, y, width: w, height: h, rotation } = item
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
      {renderFurnitureInner(type, w, h)}
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

export default FurnitureShape
