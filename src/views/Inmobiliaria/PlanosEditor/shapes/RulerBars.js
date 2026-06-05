import { Shape } from 'react-konva'
import { PIXELS_PER_METER, RULER_SIZE } from 'src/constants/inmobiliaria'

const RulerBars = ({ width, height, spacingPx }) => {
  const labelStep = Math.max(PIXELS_PER_METER, spacingPx)

  return (
    <Shape
      x={-RULER_SIZE}
      y={-RULER_SIZE}
      listening={false}
      sceneFunc={(ctx) => {
        const c = ctx._context
        c.save()

        c.fillStyle = '#dde1e7'
        c.fillRect(0, 0, RULER_SIZE, RULER_SIZE)

        c.fillStyle = '#f4f5f7'
        c.fillRect(RULER_SIZE, 0, width, RULER_SIZE)
        c.fillRect(0, RULER_SIZE, RULER_SIZE, height)

        c.strokeStyle = '#bfc6d0'
        c.lineWidth = 0.5
        c.strokeRect(RULER_SIZE, 0, width, RULER_SIZE)
        c.strokeRect(0, RULER_SIZE, RULER_SIZE, height)

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

export default RulerBars
