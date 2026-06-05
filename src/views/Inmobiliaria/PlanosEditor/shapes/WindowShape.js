import { Group, Rect, Line, Circle, Text } from 'react-konva'
import { GRID_SIZE } from 'src/constants/inmobiliaria'
import { snap } from '../editorHelpers'

const WindowShape = ({ win, selected, draggable, onSelect, onDragEnd, onResize, onRotate, multiDrag }) => {
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
              e.target.x(Math.max(GRID_SIZE, Math.round(e.target.x() / 4) * 4))
              e.target.y(d / 2)
            }}
            onDragEnd={(e) => {
              e.cancelBubble = true
              const newW = Math.max(GRID_SIZE, Math.round(e.target.x() / 4) * 4)
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

export default WindowShape
