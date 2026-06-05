import { Shape } from 'react-konva'

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

export default GridShape
