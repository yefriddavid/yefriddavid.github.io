import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { CButton, CFormInput } from '@coreui/react'
import Spinner from 'src/components/shared/Spinner'
import * as actions from 'src/actions/inmobiliaria/planosActions'
import {
  EMPTY_PLANO,
  GRID_SIZE,
  FURNITURE_CATALOG_MAP,
  PLANO_TOOLS,
} from 'src/constants/inmobiliaria'
import Toolbar from './Toolbar'
import EditorCanvas from './EditorCanvas'
import './PlanosEditor.scss'

const snap = (v) => Math.round(v / GRID_SIZE) * GRID_SIZE
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2)
const isFurnitureTool = (tool) => !!FURNITURE_CATALOG_MAP[tool]
const isPlanoTool = (tool) => PLANO_TOOLS.some((t) => t.key === tool)

const PlanosEditor = () => {
  const { id } = useParams()
  const isNew = !id
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { current, loading, saving } = useSelector((s) => s.inmobiliariaPlanos)

  // ── editor state ──────────────────────────────────────────────────────────
  const [plano, setPlano] = useState(EMPTY_PLANO)
  const [tool, setTool] = useState('select')
  const [selectedId, setSelectedId] = useState(null)
  const [drawStart, setDrawStart] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [stageScale, setStageScale] = useState(1)
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 })
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 })
  const containerRef = useRef(null)

  // ── load plano ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isNew) dispatch(actions.loadRequest({ id }))
    return () => dispatch(actions.clearPlano())
  }, [dispatch, id, isNew])

  useEffect(() => {
    if (current) {
      setPlano({
        ...EMPTY_PLANO,
        ...current,
        walls: current.walls ?? [],
        doors: current.doors ?? [],
        windows: current.windows ?? [],
        furniture: current.furniture ?? [],
        labels: current.labels ?? [],
      })
    }
  }, [current])

  // ── resize observer ────────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(() => {
      setStageSize({ width: el.offsetWidth, height: el.offsetHeight })
    })
    obs.observe(el)
    setStageSize({ width: el.offsetWidth, height: el.offsetHeight })
    return () => obs.disconnect()
  }, [])

  // ── keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT') return

      if (e.key === 'Escape') {
        setDrawStart(null)
        if (!isPlanoTool(tool)) setTool('select')
        setSelectedId(null)
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        eraseById(selectedId)
      }

      if (e.key === 'r' || e.key === 'R') {
        if (selectedId) rotateSelected(selectedId)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, tool])

  // ── helpers ────────────────────────────────────────────────────────────────
  const eraseById = useCallback((eid) => {
    setPlano((p) => ({
      ...p,
      walls: p.walls.filter((w) => w.id !== eid),
      doors: p.doors.filter((d) => d.id !== eid),
      windows: p.windows.filter((w) => w.id !== eid),
      furniture: p.furniture.filter((f) => f.id !== eid),
      labels: p.labels.filter((l) => l.id !== eid),
    }))
    setSelectedId(null)
  }, [])

  const rotateSelected = useCallback((eid) => {
    setPlano((p) => ({
      ...p,
      doors: p.doors.map((d) => (d.id === eid ? { ...d, rotation: (d.rotation + 90) % 360 } : d)),
      windows: p.windows.map((w) =>
        w.id === eid ? { ...w, rotation: (w.rotation + 90) % 360 } : w,
      ),
      furniture: p.furniture.map((f) =>
        f.id === eid ? { ...f, rotation: (f.rotation + 90) % 360 } : f,
      ),
    }))
  }, [])

  // ── stage interaction ──────────────────────────────────────────────────────
  const getStagePointer = useCallback(
    (e) => {
      const stage = e.target.getStage()
      const pos = stage.getPointerPosition()
      return {
        x: snap((pos.x - stagePos.x) / stageScale),
        y: snap((pos.y - stagePos.y) / stageScale),
      }
    },
    [stagePos, stageScale],
  )

  const handleMouseMove = useCallback(
    (e) => {
      setMousePos(getStagePointer(e))
    },
    [getStagePointer],
  )

  const handleStageClick = useCallback(
    (e) => {
      if (e.target !== e.target.getStage()) return // clicked an element, not background
      const pos = getStagePointer(e)

      if (tool === 'wall') {
        if (!drawStart) {
          setDrawStart(pos)
        } else {
          const dx = pos.x - drawStart.x
          const dy = pos.y - drawStart.y
          if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
            setPlano((p) => ({
              ...p,
              walls: [
                ...p.walls,
                { id: uid(), x1: drawStart.x, y1: drawStart.y, x2: pos.x, y2: pos.y },
              ],
            }))
          }
          setDrawStart(pos)
        }
        return
      }

      if (tool === 'door') {
        setPlano((p) => ({
          ...p,
          doors: [...p.doors, { id: uid(), x: pos.x, y: pos.y, width: GRID_SIZE * 4, rotation: 0 }],
        }))
        return
      }

      if (tool === 'window') {
        setPlano((p) => ({
          ...p,
          windows: [
            ...p.windows,
            { id: uid(), x: pos.x, y: pos.y, width: GRID_SIZE * 3, rotation: 0 },
          ],
        }))
        return
      }

      if (tool === 'label') {
        const text = window.prompt('Nombre de la habitación:')
        if (!text?.trim()) return
        setPlano((p) => ({
          ...p,
          labels: [...p.labels, { id: uid(), text: text.trim(), x: pos.x, y: pos.y }],
        }))
        return
      }

      if (isFurnitureTool(tool)) {
        const def = FURNITURE_CATALOG_MAP[tool]
        setPlano((p) => ({
          ...p,
          furniture: [
            ...p.furniture,
            { id: uid(), type: tool, x: pos.x, y: pos.y, width: def.w, height: def.h, rotation: 0 },
          ],
        }))
        return
      }

      if (tool === 'select') {
        setSelectedId(null)
      }
    },
    [tool, drawStart, getStagePointer],
  )

  const handleWheel = useCallback((e) => {
    e.evt.preventDefault()
    const stage = e.target.getStage()
    const oldScale = stage.scaleX()
    const pointer = stage.getPointerPosition()
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    }
    const factor = e.evt.deltaY < 0 ? 1.1 : 0.9
    const newScale = Math.min(Math.max(oldScale * factor, 0.15), 4)
    setStageScale(newScale)
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    })
  }, [])

  const handleStageDragEnd = useCallback((e) => {
    setStagePos({ x: e.target.x(), y: e.target.y() })
  }, [])

  const handleElementSelect = useCallback(
    (idOrEraseCmd) => {
      if (typeof idOrEraseCmd === 'string' && idOrEraseCmd.startsWith('__erase__')) {
        eraseById(idOrEraseCmd.replace('__erase__', ''))
      } else {
        setSelectedId(idOrEraseCmd)
      }
    },
    [eraseById],
  )

  const handleDragEnd = useCallback((eid, newPos) => {
    setPlano((p) => ({
      ...p,
      doors: p.doors.map((d) => (d.id === eid ? { ...d, ...newPos } : d)),
      windows: p.windows.map((w) => (w.id === eid ? { ...w, ...newPos } : w)),
      furniture: p.furniture.map((f) => (f.id === eid ? { ...f, ...newPos } : f)),
      labels: p.labels.map((l) => (l.id === eid ? { ...l, ...newPos } : l)),
    }))
  }, [])

  // ── save ───────────────────────────────────────────────────────────────────
  const handleSave = () => {
    const { name, walls, doors, windows, furniture, labels } = plano
    if (isNew) {
      dispatch(actions.createRequest({ navigate, name, walls, doors, windows, furniture, labels }))
    } else {
      dispatch(
        actions.updateRequest({ id, data: { name, walls, doors, windows, furniture, labels } }),
      )
    }
  }

  if (!isNew && loading) return <Spinner mode="page" />

  return (
    <div className="pe-editor">
      <div className="pe-editor__topbar">
        <CButton
          color="secondary"
          variant="outline"
          size="sm"
          onClick={() => navigate('/inmobiliaria/planos')}
        >
          ← Volver
        </CButton>

        <CFormInput
          className="pe-editor__name-input"
          value={plano.name}
          onChange={(e) => setPlano((p) => ({ ...p, name: e.target.value }))}
          placeholder="Nombre del plano"
          size="sm"
        />

        <div className="pe-editor__topbar-info">
          <span>Escala: 1 celda = 0.5 m</span>
          {selectedId && (
            <CButton
              color="danger"
              variant="ghost"
              size="sm"
              onClick={() => {
                eraseById(selectedId)
              }}
            >
              🗑 Borrar seleccionado
            </CButton>
          )}
          {selectedId && (
            <CButton
              color="secondary"
              variant="outline"
              size="sm"
              onClick={() => rotateSelected(selectedId)}
            >
              ↻ Rotar
            </CButton>
          )}
        </div>

        <CButton color="primary" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? <Spinner size="sm" /> : '💾 Guardar'}
        </CButton>
      </div>

      <div className="pe-editor__body">
        <Toolbar
          tool={tool}
          onToolChange={(t) => {
            setTool(t)
            setDrawStart(null)
            setSelectedId(null)
          }}
        />
        <EditorCanvas
          plano={plano}
          tool={tool}
          selectedId={selectedId}
          drawStart={drawStart}
          mousePos={mousePos}
          stageScale={stageScale}
          stagePos={stagePos}
          stageSize={stageSize}
          containerRef={containerRef}
          onStageMouseMove={handleMouseMove}
          onStageClick={handleStageClick}
          onStageWheel={handleWheel}
          onStageDragEnd={handleStageDragEnd}
          onSelect={handleElementSelect}
          onDragEnd={handleDragEnd}
        />
      </div>
    </div>
  )
}

export default PlanosEditor
