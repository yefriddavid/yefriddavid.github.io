import React, { useRef, useCallback, useState, useEffect, useImperativeHandle } from 'react'
import { Stage, Layer, Rect, Line, Circle, Text, Group } from 'react-konva'
import { GRID_SIZE, FURNITURE_CATALOG_MAP, CANVAS_W, CANVAS_H, RULER_SIZE, PIXELS_PER_METER } from 'src/constants/inmobiliaria'
import { snap, wallLengthM, isFurnitureTool } from './editorHelpers'
import GridShape from './shapes/GridShape'
import RulerBars from './shapes/RulerBars'
import WallElement from './shapes/WallElement'
import DoorShape from './shapes/DoorShape'
import WindowShape from './shapes/WindowShape'
import FurnitureShape from './shapes/FurnitureShape'
import RulerElement from './shapes/RulerElement'

const RULER_COLOR = '#e03131'

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
      hiddenIds,
    },
    ref,
  ) => {
    const hiddenSet = hiddenIds instanceof Set ? hiddenIds : new Set(hiddenIds ?? [])
    const stageRef = useRef(null)
    const containerRef = useRef(null)
    const [stageSize, setStageSize] = useState({ width: 900, height: 600 })
    const isSelectMode = tool === 'select'
    const isEraserMode = tool === 'eraser'

    const selectedIdsRef = useRef(selectedIds)
    const planoRef = useRef(plano)
    useEffect(() => { selectedIdsRef.current = selectedIds }, [selectedIds])
    useEffect(() => { planoRef.current = plano }, [plano])

    // ── multi-drag (imperative, no state re-renders during drag) ─────────────
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
        if (node && o) { node.x(o.x + dx); node.y(o.y + dy) }
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
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        const expand = (x, y) => {
          if (x < minX) minX = x
          if (y < minY) minY = y
          if (x > maxX) maxX = x
          if (y > maxY) maxY = y
        }
        p.walls.forEach((w) => { expand(w.x1, w.y1); expand(w.x2, w.y2) })
        p.doors.forEach((d) => { expand(d.x, d.y); expand(d.x + (d.width ?? 80), d.y + (d.height ?? 80)) })
        p.windows.forEach((w) => { expand(w.x, w.y); expand(w.x + (w.width ?? 80), w.y + (w.height ?? 20)) })
        p.furniture.forEach((f) => {
          const hw = (f.width ?? 80) / 2
          const hh = (f.height ?? 80) / 2
          expand(f.x - hw, f.y - hh)
          expand(f.x + hw, f.y + hh)
        })
        p.labels.forEach((l) => { expand(l.x, l.y); expand(l.x + 120, l.y + 20) })
        ;(p.rulers ?? []).forEach((r) => { expand(r.x1, r.y1); expand(r.x2, r.y2) })

        let clipX, clipY, clipW, clipH
        if (!isFinite(minX)) {
          clipX = 0; clipY = 0; clipW = CANVAS_W; clipH = CANVAS_H
        } else {
          clipX = Math.max(0, minX - PADDING)
          clipY = Math.max(0, minY - PADDING)
          clipW = Math.min(CANVAS_W, maxX + PADDING) - clipX
          clipH = Math.min(CANVAS_H, maxY + PADDING) - clipY
        }

        const prevX = stage.x(), prevY = stage.y()
        const prevSX = stage.scaleX(), prevSY = stage.scaleY()
        const prevW = stage.width(), prevH = stage.height()
        stage.x(0); stage.y(0); stage.scaleX(1); stage.scaleY(1)
        stage.width(CANVAS_W); stage.height(CANVAS_H); stage.draw()
        const dataURL = stage.toDataURL({ x: clipX, y: clipY, width: clipW, height: clipH, pixelRatio: 3, mimeType: 'image/png' })
        stage.x(prevX); stage.y(prevY); stage.scaleX(prevSX); stage.scaleY(prevSY)
        stage.width(prevW); stage.height(prevH); stage.draw()
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
            <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill="white" stroke="#aaa" strokeWidth={1} listening={false} />
            <GridShape width={CANVAS_W} height={CANVAS_H} spacingPx={gridSpacingPx} visible={gridVisible} />

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
                if (hiddenSet.has(id)) return null
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
                      rotation={lbl.rotation ?? 0}
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

            {/* drawing preview — wall tool */}
            {tool === 'wall' && drawStart && (
              <>
                <Circle x={drawStart.x} y={drawStart.y} radius={5} fill="#0066ff" />
                <Line
                  points={[drawStart.x, drawStart.y, mousePos.x, mousePos.y]}
                  stroke="#0066ff"
                  strokeWidth={4}
                  lineCap="square"
                  opacity={0.5}
                  listening={false}
                />
                <Text
                  x={(drawStart.x + mousePos.x) / 2 + 8}
                  y={(drawStart.y + mousePos.y) / 2 - 16}
                  text={wallLengthM({ x1: drawStart.x, y1: drawStart.y, x2: mousePos.x, y2: mousePos.y })}
                  fontSize={12}
                  fill="#0066ff"
                  fontStyle="bold"
                  listening={false}
                />
              </>
            )}

            {/* drawing preview — ruler tool */}
            {tool === 'ruler' && drawStart && (
              <>
                <Circle x={drawStart.x} y={drawStart.y} radius={5} fill={RULER_COLOR} opacity={0.7} />
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
                  text={wallLengthM({ x1: drawStart.x, y1: drawStart.y, x2: mousePos.x, y2: mousePos.y })}
                  fontSize={12}
                  fill={RULER_COLOR}
                  fontStyle="bold"
                  listening={false}
                />
              </>
            )}

            {/* placement preview — furniture/door/window */}
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

            <RulerBars width={CANVAS_W} height={CANVAS_H} spacingPx={gridSpacingPx} />
          </Layer>
        </Stage>
      </div>
    )
  },
)

export default EditorCanvas
