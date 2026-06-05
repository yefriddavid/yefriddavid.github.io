import { Group, Line, Circle, Text } from 'react-konva'
import { PIXELS_PER_METER } from 'src/constants/inmobiliaria'
import { snap } from '../editorHelpers'

const RULER_COLOR = '#e03131'
const RULER_COLOR_SEL = '#0066ff'
const TICK_HALF = 10
const LABEL_OFFSET = 16

const RulerElement = ({ ruler, selectedIds, isSelectMode, onSelect, onMoveRuler, onResizeRuler }) => {
  const isSelected = selectedIds.includes(ruler.id)
  const { id, x1, y1, x2, y2 } = ruler
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 2) return null

  const ux = dx / len
  const uy = dy / len
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
      <Line
        points={[x1 + nx * TICK_HALF, y1 + ny * TICK_HALF, x1 - nx * TICK_HALF, y1 - ny * TICK_HALF]}
        stroke={color}
        strokeWidth={2}
        listening={false}
      />
      <Line
        points={[x2 + nx * TICK_HALF, y2 + ny * TICK_HALF, x2 - nx * TICK_HALF, y2 - ny * TICK_HALF]}
        stroke={color}
        strokeWidth={2}
        listening={false}
      />
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
            onClick={(e) => { e.cancelBubble = true }}
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
            onClick={(e) => { e.cancelBubble = true }}
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

export default RulerElement
