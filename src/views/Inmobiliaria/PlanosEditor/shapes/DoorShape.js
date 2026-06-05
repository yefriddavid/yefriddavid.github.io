import { Group, Rect, Line, Arc, Circle, Text } from 'react-konva'
import { GRID_SIZE } from 'src/constants/inmobiliaria'
import { snap } from '../editorHelpers'

const DoorShape = ({ door, selected, draggable, onSelect, onDragEnd, onResize, onRotate, multiDrag }) => {
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
              e.target.x(Math.max(GRID_SIZE, Math.round(e.target.x() / 4) * 4))
              e.target.y(0)
            }}
            onDragEnd={(e) => {
              e.cancelBubble = true
              const newW = Math.max(GRID_SIZE, Math.round(e.target.x() / 4) * 4)
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

export default DoorShape
