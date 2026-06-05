import { Text } from 'react-konva'
import { wallLengthM } from '../editorHelpers'

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

export default WallMeasure
