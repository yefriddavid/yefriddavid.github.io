import { Group, Line, Circle } from 'react-konva'
import { WALL_THICKNESS } from 'src/constants/inmobiliaria'
import { snap } from '../editorHelpers'
import WallMeasure from './WallMeasure'

const WallElement = ({ wall, selectedIds, isSelectMode, onSelect, onMoveWall, onResizeWall, onMoveLabelOffset }) => {
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
            onClick={(e) => { e.cancelBubble = true }}
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
            onClick={(e) => { e.cancelBubble = true }}
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

export default WallElement
