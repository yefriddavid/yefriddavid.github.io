import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { CButton, CFormInput } from '@coreui/react'
import Spinner from 'src/components/shared/Spinner'
import * as actions from 'src/actions/inmobiliaria/planosActions'
import {
  EMPTY_PLANO,
  GRID_SIZE,
  PIXELS_PER_METER,
  FURNITURE_CATALOG_MAP,
  PLANO_TOOLS,
  GRID_PRESETS,
  RULER_SIZE,
} from 'src/constants/inmobiliaria'
import Toolbar from './Toolbar'
import EditorCanvas from './EditorCanvas'
import LayersPanel from './LayersPanel'
import './PlanosEditor.scss'

const snap = (v) => Math.round(v / GRID_SIZE) * GRID_SIZE
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2)
const isFurnitureTool = (tool) => !!FURNITURE_CATALOG_MAP[tool]
const isPlanoTool = (tool) => PLANO_TOOLS.some((t) => t.key === tool)

// Controlled numeric input — commits on Enter or blur
// draftRef holds the latest typed value so onBlur never reads a stale closure
const LengthInput = ({ value, min = 0.5, onCommit }) => {
  const [display, setDisplay] = useState(String(value))
  const draftRef = useRef(String(value)) // always current, even before re-render
  const focusedRef = useRef(false)
  const committedRef = useRef(false) // prevents double-commit when Enter triggers blur

  useEffect(() => {
    if (!focusedRef.current) {
      const s = String(value)
      draftRef.current = s
      setDisplay(s)
    }
  }, [value])

  const commit = () => {
    const v = parseFloat(draftRef.current)
    if (!isNaN(v) && v >= min) {
      onCommit(v)
    } else {
      const s = String(value)
      draftRef.current = s
      setDisplay(s)
    }
  }

  return (
    <input
      type="number"
      className="form-control form-control-sm"
      style={{ width: 90 }}
      min={min}
      step="any"
      value={display}
      onChange={(e) => {
        draftRef.current = e.target.value
        setDisplay(e.target.value)
      }}
      onFocus={() => {
        focusedRef.current = true
        committedRef.current = false
      }}
      onBlur={() => {
        focusedRef.current = false
        if (committedRef.current) {
          committedRef.current = false
          return
        }
        commit()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          committedRef.current = true
          commit()
          e.target.blur()
        }
        if (e.key === 'Escape') {
          committedRef.current = true
          const s = String(value)
          draftRef.current = s
          setDisplay(s)
          e.target.blur()
        }
        e.stopPropagation()
      }}
    />
  )
}

const autoName = (p, kind, subtype = null) => {
  switch (kind) {
    case 'wall':
      return `Pared ${p.walls.length + 1}`
    case 'door':
      return `Puerta ${p.doors.length + 1}`
    case 'window':
      return `Ventana ${p.windows.length + 1}`
    case 'ruler':
      return `Cota ${(p.rulers ?? []).length + 1}`
    case 'label':
      return `Texto ${p.labels.length + 1}`
    case 'furniture': {
      const def = FURNITURE_CATALOG_MAP[subtype]
      const count = p.furniture.filter((f) => f.type === subtype).length + 1
      return `${def?.label ?? subtype} ${count}`
    }
    default:
      return 'Elemento'
  }
}

const PlanosEditor = () => {
  const { id } = useParams()
  const isNew = !id
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { current, loading, saving } = useSelector((s) => s.inmobiliariaPlanos)

  // ── editor state ──────────────────────────────────────────────────────────
  const [plano, setPlano] = useState(EMPTY_PLANO)
  const [tool, setTool] = useState('select')
  const [selectedIds, setSelectedIds] = useState([])
  const [drawStart, setDrawStart] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [stageScale, setStageScale] = useState(1)
  const [stagePos, setStagePos] = useState({ x: RULER_SIZE + 4, y: RULER_SIZE + 4 })
  const [gridSpacingPx, setGridSpacingPx] = useState(40) // default: 1 m
  const [gridVisible, setGridVisible] = useState(true)
  // refs for access inside keyboard handlers without closure issues
  const createdIdRef = useRef(null)
  const planoRef = useRef(plano)
  const clipboardRef = useRef(null)
  const pasteCountRef = useRef(0)
  const editorRef = useRef(null)
  const historyRef = useRef([])

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
        rulers: current.rulers ?? [],
        zOrder: current.zOrder ?? [],
      })
    }
  }, [current])

  // keep planoRef in sync so keyboard handlers always read latest state
  useEffect(() => {
    planoRef.current = plano
  }, [plano])

  // ── navigate after create ──────────────────────────────────────────────────
  useEffect(() => {
    if (isNew && current?.id && current.id !== createdIdRef.current) {
      createdIdRef.current = current.id
      navigate(`/inmobiliaria/planos/${current.id}`, { replace: true })
    }
  }, [current?.id, isNew, navigate])

  // ── keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT') return

      if (e.key === 'Escape') {
        setDrawStart(null)
        if (!isPlanoTool(tool)) setTool('select')
        setSelectedIds([])
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        eraseMultiple(selectedIds)
      }

      if (e.key === 'r' || e.key === 'R') {
        const sid = selectedIds.length === 1 ? selectedIds[0] : null
        if (sid) rotateSelected(sid)
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        const sid = selectedIds.length === 1 ? selectedIds[0] : null
        if (sid) copySelected(sid)
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault()
        pasteFromClipboard()
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        const sid = selectedIds.length === 1 ? selectedIds[0] : null
        if (sid) {
          e.preventDefault()
          copySelected(sid)
          pasteFromClipboard()
        }
      }

      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) &&
        selectedIds.length > 0
      ) {
        e.preventDefault()
        const step = e.shiftKey ? GRID_SIZE : 1
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0
        selectedIds.forEach((sid) => nudgeSelected(sid, dx, dy))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds, tool])

  // ── undo history ──────────────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pushHistory = useCallback(() => {
    historyRef.current = [...historyRef.current.slice(-49), planoRef.current]
  }, []) // only accesses stable refs — intentionally empty deps

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const undo = useCallback(() => {
    const history = historyRef.current
    if (history.length === 0) return
    historyRef.current = history.slice(0, -1)
    setPlano(history[history.length - 1])
    setSelectedIds([])
  }, []) // only accesses stable refs — intentionally empty deps

  // ── helpers ────────────────────────────────────────────────────────────────
  const eraseById = useCallback((eid) => {
    pushHistory()
    setPlano((p) => ({
      ...p,
      walls: p.walls.filter((w) => w.id !== eid),
      doors: p.doors.filter((d) => d.id !== eid),
      windows: p.windows.filter((w) => w.id !== eid),
      furniture: p.furniture.filter((f) => f.id !== eid),
      labels: p.labels.filter((l) => l.id !== eid),
      rulers: (p.rulers ?? []).filter((r) => r.id !== eid),
      zOrder: (p.zOrder ?? []).filter((zid) => zid !== eid),
    }))
    setSelectedIds((prev) => prev.filter((x) => x !== eid))
  }, [])

  const eraseMultiple = useCallback((ids) => {
    pushHistory()
    const idSet = new Set(ids)
    setPlano((p) => ({
      ...p,
      walls: p.walls.filter((w) => !idSet.has(w.id)),
      doors: p.doors.filter((d) => !idSet.has(d.id)),
      windows: p.windows.filter((w) => !idSet.has(w.id)),
      furniture: p.furniture.filter((f) => !idSet.has(f.id)),
      labels: p.labels.filter((l) => !idSet.has(l.id)),
      rulers: (p.rulers ?? []).filter((r) => !idSet.has(r.id)),
      zOrder: (p.zOrder ?? []).filter((zid) => !idSet.has(zid)),
    }))
    setSelectedIds([])
  }, [])

  const handleFlipElement = useCallback((eid, axis) => {
    pushHistory()
    setPlano((p) => ({
      ...p,
      doors: p.doors.map((d) => (d.id === eid ? { ...d, [axis]: (d[axis] ?? 1) * -1 } : d)),
      windows: p.windows.map((w) => (w.id === eid ? { ...w, [axis]: (w[axis] ?? 1) * -1 } : w)),
      furniture: p.furniture.map((f) => (f.id === eid ? { ...f, [axis]: (f[axis] ?? 1) * -1 } : f)),
    }))
  }, [])

  const rotateSelected = useCallback((eid, deg = 90) => {
    pushHistory()
    setPlano((p) => ({
      ...p,
      doors: p.doors.map((d) => (d.id === eid ? { ...d, rotation: (d.rotation + deg) % 360 } : d)),
      windows: p.windows.map((w) =>
        w.id === eid ? { ...w, rotation: (w.rotation + deg) % 360 } : w,
      ),
      furniture: p.furniture.map((f) =>
        f.id === eid ? { ...f, rotation: (f.rotation + deg) % 360 } : f,
      ),
    }))
  }, [])

  const handleMoveWall = useCallback((wid, dx, dy) => {
    pushHistory()
    setPlano((p) => ({
      ...p,
      walls: p.walls.map((w) =>
        w.id === wid ? { ...w, x1: w.x1 + dx, y1: w.y1 + dy, x2: w.x2 + dx, y2: w.y2 + dy } : w,
      ),
    }))
  }, [])

  const handleLabelUpdate = useCallback((lid, updates) => {
    pushHistory()
    setPlano((p) => ({
      ...p,
      labels: p.labels.map((l) => (l.id === lid ? { ...l, ...updates } : l)),
    }))
  }, [])

  const handleResizeElement = useCallback((eid, updates) => {
    pushHistory()
    setPlano((p) => ({
      ...p,
      doors: p.doors.map((d) =>
        d.id === eid ? { ...d, width: Math.max(GRID_SIZE * 2, updates.width ?? d.width) } : d,
      ),
      windows: p.windows.map((w) =>
        w.id === eid ? { ...w, width: Math.max(GRID_SIZE * 2, updates.width ?? w.width) } : w,
      ),
      furniture: p.furniture.map((f) =>
        f.id === eid
          ? {
              ...f,
              width: Math.max(GRID_SIZE, updates.width ?? f.width),
              height: Math.max(GRID_SIZE, updates.height ?? f.height),
            }
          : f,
      ),
    }))
  }, [])

  const handleSnapWall = useCallback((wid, axis) => {
    pushHistory()
    setPlano((p) => ({
      ...p,
      walls: p.walls.map((w) => {
        if (w.id !== wid) return w
        return axis === 'h' ? { ...w, y2: w.y1 } : { ...w, x2: w.x1 }
      }),
    }))
  }, [])

  const handleSnapRuler = useCallback((rid, axis) => {
    pushHistory()
    setPlano((p) => ({
      ...p,
      rulers: (p.rulers ?? []).map((r) => {
        if (r.id !== rid) return r
        return axis === 'h' ? { ...r, y2: r.y1 } : { ...r, x2: r.x1 }
      }),
    }))
  }, [])

  const handleWallLengthChange = useCallback((wid, meters) => {
    pushHistory()
    setPlano((p) => ({
      ...p,
      walls: p.walls.map((w) => {
        if (w.id !== wid) return w
        const ddx = w.x2 - w.x1
        const ddy = w.y2 - w.y1
        const len = Math.sqrt(ddx * ddx + ddy * ddy) || 1
        const newPx = meters * PIXELS_PER_METER
        return {
          ...w,
          x2: snap(w.x1 + (ddx / len) * newPx),
          y2: snap(w.y1 + (ddy / len) * newPx),
        }
      }),
    }))
  }, [])

  const handleMoveLabelOffset = useCallback((wid, dx, dy) => {
    pushHistory()
    setPlano((p) => ({
      ...p,
      walls: p.walls.map((w) => (w.id === wid ? { ...w, labelDx: dx, labelDy: dy } : w)),
    }))
  }, [])

  const handleResizeWall = useCallback((wid, endpoint, nx, ny) => {
    pushHistory()
    setPlano((p) => ({
      ...p,
      walls: p.walls.map((w) => {
        if (w.id !== wid) return w
        return endpoint === 'start' ? { ...w, x1: nx, y1: ny } : { ...w, x2: nx, y2: ny }
      }),
    }))
  }, [])

  const handleRulerLengthChange = useCallback((rid, meters) => {
    pushHistory()
    setPlano((p) => ({
      ...p,
      rulers: (p.rulers ?? []).map((r) => {
        if (r.id !== rid) return r
        const ddx = r.x2 - r.x1
        const ddy = r.y2 - r.y1
        const len = Math.sqrt(ddx * ddx + ddy * ddy) || 1
        const newPx = meters * PIXELS_PER_METER
        return {
          ...r,
          x2: Math.round(r.x1 + (ddx / len) * newPx),
          y2: Math.round(r.y1 + (ddy / len) * newPx),
        }
      }),
    }))
  }, [])

  const handleMoveRuler = useCallback((rid, dx, dy) => {
    pushHistory()
    setPlano((p) => ({
      ...p,
      rulers: (p.rulers ?? []).map((r) =>
        r.id === rid ? { ...r, x1: r.x1 + dx, y1: r.y1 + dy, x2: r.x2 + dx, y2: r.y2 + dy } : r,
      ),
    }))
  }, [])

  const handleResizeRuler = useCallback((rid, endpoint, nx, ny) => {
    pushHistory()
    setPlano((p) => ({
      ...p,
      rulers: (p.rulers ?? []).map((r) => {
        if (r.id !== rid) return r
        return endpoint === 'start' ? { ...r, x1: nx, y1: ny } : { ...r, x2: nx, y2: ny }
      }),
    }))
  }, [])

  const handleBringToFront = useCallback((eid) => {
    pushHistory()
    setPlano((p) => {
      const zo = (p.zOrder ?? []).filter((id) => id !== eid)
      return { ...p, zOrder: [...zo, eid] }
    })
  }, [])

  const handleSendToBack = useCallback((eid) => {
    pushHistory()
    setPlano((p) => {
      const zo = (p.zOrder ?? []).filter((id) => id !== eid)
      return { ...p, zOrder: [eid, ...zo] }
    })
  }, [])

  const copySelected = useCallback((eid) => {
    const p = planoRef.current
    const found =
      (p.walls.find((w) => w.id === eid) && {
        kind: 'wall',
        data: p.walls.find((w) => w.id === eid),
      }) ||
      (p.doors.find((d) => d.id === eid) && {
        kind: 'door',
        data: p.doors.find((d) => d.id === eid),
      }) ||
      (p.windows.find((w) => w.id === eid) && {
        kind: 'window',
        data: p.windows.find((w) => w.id === eid),
      }) ||
      (p.furniture.find((f) => f.id === eid) && {
        kind: 'furniture',
        data: p.furniture.find((f) => f.id === eid),
      }) ||
      (p.labels.find((l) => l.id === eid) && {
        kind: 'label',
        data: p.labels.find((l) => l.id === eid),
      }) ||
      ((p.rulers ?? []).find((r) => r.id === eid) && {
        kind: 'ruler',
        data: (p.rulers ?? []).find((r) => r.id === eid),
      })
    if (found) {
      clipboardRef.current = found
      pasteCountRef.current = 0
    }
  }, [])

  const pasteFromClipboard = useCallback(() => {
    const item = clipboardRef.current
    if (!item) return
    pushHistory()
    pasteCountRef.current += 1
    const off = GRID_SIZE * 2 * pasteCountRef.current
    const newId = uid()
    setPlano((p) => {
      const zo = [...(p.zOrder ?? []), newId]
      switch (item.kind) {
        case 'wall':
          return {
            ...p,
            walls: [
              ...p.walls,
              {
                ...item.data,
                id: newId,
                x1: item.data.x1 + off,
                y1: item.data.y1 + off,
                x2: item.data.x2 + off,
                y2: item.data.y2 + off,
              },
            ],
            zOrder: zo,
          }
        case 'door':
          return {
            ...p,
            doors: [
              ...p.doors,
              { ...item.data, id: newId, x: item.data.x + off, y: item.data.y + off },
            ],
            zOrder: zo,
          }
        case 'window':
          return {
            ...p,
            windows: [
              ...p.windows,
              { ...item.data, id: newId, x: item.data.x + off, y: item.data.y + off },
            ],
            zOrder: zo,
          }
        case 'furniture':
          return {
            ...p,
            furniture: [
              ...p.furniture,
              { ...item.data, id: newId, x: item.data.x + off, y: item.data.y + off },
            ],
            zOrder: zo,
          }
        case 'label':
          return {
            ...p,
            labels: [
              ...p.labels,
              { ...item.data, id: newId, x: item.data.x + off, y: item.data.y + off },
            ],
            zOrder: zo,
          }
        case 'ruler':
          return {
            ...p,
            rulers: [
              ...(p.rulers ?? []),
              {
                ...item.data,
                id: newId,
                x1: item.data.x1 + off,
                y1: item.data.y1 + off,
                x2: item.data.x2 + off,
                y2: item.data.y2 + off,
              },
            ],
            zOrder: zo,
          }
        default:
          return p
      }
    })
    setSelectedIds([newId])
  }, [])

  const nudgeSelected = useCallback((eid, dx, dy) => {
    setPlano((p) => ({
      ...p,
      walls: p.walls.map((w) =>
        w.id === eid ? { ...w, x1: w.x1 + dx, y1: w.y1 + dy, x2: w.x2 + dx, y2: w.y2 + dy } : w,
      ),
      doors: p.doors.map((d) => (d.id === eid ? { ...d, x: d.x + dx, y: d.y + dy } : d)),
      windows: p.windows.map((w) => (w.id === eid ? { ...w, x: w.x + dx, y: w.y + dy } : w)),
      furniture: p.furniture.map((f) => (f.id === eid ? { ...f, x: f.x + dx, y: f.y + dy } : f)),
      labels: p.labels.map((l) => (l.id === eid ? { ...l, x: l.x + dx, y: l.y + dy } : l)),
      rulers: (p.rulers ?? []).map((r) =>
        r.id === eid ? { ...r, x1: r.x1 + dx, y1: r.y1 + dy, x2: r.x2 + dx, y2: r.y2 + dy } : r,
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
            pushHistory()
            const newId = uid()
            const name = autoName(planoRef.current, 'wall')
            setPlano((p) => ({
              ...p,
              walls: [
                ...p.walls,
                { id: newId, name, x1: drawStart.x, y1: drawStart.y, x2: pos.x, y2: pos.y },
              ],
              zOrder: [...(p.zOrder ?? []), newId],
            }))
          }
          setDrawStart(pos)
        }
        return
      }

      if (tool === 'ruler') {
        if (!drawStart) {
          setDrawStart(pos)
        } else {
          const dx = pos.x - drawStart.x
          const dy = pos.y - drawStart.y
          if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
            pushHistory()
            const newId = uid()
            const name = autoName(planoRef.current, 'ruler')
            setPlano((p) => ({
              ...p,
              rulers: [
                ...(p.rulers ?? []),
                { id: newId, name, x1: drawStart.x, y1: drawStart.y, x2: pos.x, y2: pos.y },
              ],
              zOrder: [...(p.zOrder ?? []), newId],
            }))
          }
          setDrawStart(null)
        }
        return
      }

      if (tool === 'door') {
        pushHistory()
        const newId = uid()
        const name = autoName(planoRef.current, 'door')
        setPlano((p) => ({
          ...p,
          doors: [
            ...p.doors,
            { id: newId, name, x: pos.x, y: pos.y, width: GRID_SIZE * 4, rotation: 0 },
          ],
          zOrder: [...(p.zOrder ?? []), newId],
        }))
        return
      }

      if (tool === 'window') {
        pushHistory()
        const newId = uid()
        const name = autoName(planoRef.current, 'window')
        setPlano((p) => ({
          ...p,
          windows: [
            ...p.windows,
            { id: newId, name, x: pos.x, y: pos.y, width: GRID_SIZE * 3, rotation: 0 },
          ],
          zOrder: [...(p.zOrder ?? []), newId],
        }))
        return
      }

      if (tool === 'label') {
        const text = window.prompt('Nombre de la habitación:')
        if (!text?.trim()) return
        pushHistory()
        const newId = uid()
        const name = autoName(planoRef.current, 'label')
        setPlano((p) => ({
          ...p,
          labels: [
            ...p.labels,
            { id: newId, name, text: text.trim(), x: pos.x, y: pos.y, fontSize: 14 },
          ],
          zOrder: [...(p.zOrder ?? []), newId],
        }))
        return
      }

      if (isFurnitureTool(tool)) {
        pushHistory()
        const newId = uid()
        const def = FURNITURE_CATALOG_MAP[tool]
        const name = autoName(planoRef.current, 'furniture', tool)
        setPlano((p) => ({
          ...p,
          furniture: [
            ...p.furniture,
            {
              id: newId,
              name,
              type: tool,
              x: pos.x,
              y: pos.y,
              width: def.w,
              height: def.h,
              rotation: 0,
            },
          ],
          zOrder: [...(p.zOrder ?? []), newId],
        }))
        return
      }

      if (tool === 'select') {
        setSelectedIds([])
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
    if (e.target !== e.target.getStage()) return
    setStagePos({ x: e.target.x(), y: e.target.y() })
  }, [])

  const handleElementSelect = useCallback(
    (idOrEraseCmd, isCtrl = false) => {
      if (typeof idOrEraseCmd === 'string' && idOrEraseCmd.startsWith('__erase__')) {
        eraseById(idOrEraseCmd.replace('__erase__', ''))
      } else {
        setSelectedIds((prev) => {
          if (!isCtrl) return [idOrEraseCmd]
          return prev.includes(idOrEraseCmd)
            ? prev.filter((x) => x !== idOrEraseCmd)
            : [...prev, idOrEraseCmd]
        })
      }
    },
    [eraseById],
  )

  const handleDragEnd = useCallback((eid, newPos) => {
    pushHistory()
    setPlano((p) => ({
      ...p,
      doors: p.doors.map((d) => (d.id === eid ? { ...d, ...newPos } : d)),
      windows: p.windows.map((w) => (w.id === eid ? { ...w, ...newPos } : w)),
      furniture: p.furniture.map((f) => (f.id === eid ? { ...f, ...newPos } : f)),
      labels: p.labels.map((l) => (l.id === eid ? { ...l, ...newPos } : l)),
    }))
  }, [])

  const handleBatchDragEnd = useCallback((updates) => {
    pushHistory()
    setPlano((p) => ({
      ...p,
      doors: p.doors.map((d) => (updates[d.id] ? { ...d, ...updates[d.id] } : d)),
      windows: p.windows.map((w) => (updates[w.id] ? { ...w, ...updates[w.id] } : w)),
      furniture: p.furniture.map((f) => (updates[f.id] ? { ...f, ...updates[f.id] } : f)),
      labels: p.labels.map((l) => (updates[l.id] ? { ...l, ...updates[l.id] } : l)),
    }))
  }, [])

  const handleRenameElement = useCallback((eid, newName) => {
    setPlano((p) => ({
      ...p,
      walls: p.walls.map((w) => (w.id === eid ? { ...w, name: newName } : w)),
      doors: p.doors.map((d) => (d.id === eid ? { ...d, name: newName } : d)),
      windows: p.windows.map((w) => (w.id === eid ? { ...w, name: newName } : w)),
      furniture: p.furniture.map((f) => (f.id === eid ? { ...f, name: newName } : f)),
      labels: p.labels.map((l) => (l.id === eid ? { ...l, name: newName } : l)),
    }))
  }, [])

  // ── save ───────────────────────────────────────────────────────────────────
  const handleSave = () => {
    const { name, walls, doors, windows, furniture, labels, rulers, zOrder } = plano
    if (isNew) {
      dispatch(
        actions.createRequest({ name, walls, doors, windows, furniture, labels, rulers, zOrder }),
      )
    } else {
      dispatch(
        actions.updateRequest({
          id,
          data: { name, walls, doors, windows, furniture, labels, rulers, zOrder },
        }),
      )
    }
  }

  if (!isNew && loading) return <Spinner mode="page" />

  const selectedId = selectedIds.length === 1 ? selectedIds[0] : null
  const selectedLabel = plano.labels.find((l) => l.id === selectedId) ?? null
  const selectedWall = plano.walls.find((w) => w.id === selectedId) ?? null
  const selectedRuler = (plano.rulers ?? []).find((r) => r.id === selectedId) ?? null
  const selectedIsFlippable =
    !!selectedId &&
    !selectedWall &&
    !selectedLabel &&
    (plano.doors.some((d) => d.id === selectedId) ||
      plano.windows.some((w) => w.id === selectedId) ||
      plano.furniture.some((f) => f.id === selectedId))
  const wallLengthNum = selectedWall
    ? parseFloat(
        (
          Math.sqrt(
            (selectedWall.x2 - selectedWall.x1) ** 2 + (selectedWall.y2 - selectedWall.y1) ** 2,
          ) / PIXELS_PER_METER
        ).toFixed(2),
      )
    : 0
  const rulerLengthNum = selectedRuler
    ? parseFloat(
        (
          Math.sqrt(
            (selectedRuler.x2 - selectedRuler.x1) ** 2 + (selectedRuler.y2 - selectedRuler.y1) ** 2,
          ) / PIXELS_PER_METER
        ).toFixed(2),
      )
    : 0

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
          <span>Snap: 0.5 m</span>
          <span className="pe-editor__topbar-sep" />
          <button
            className={`pe-editor__grid-btn${gridVisible ? '' : ' pe-editor__grid-btn--off'}`}
            title={gridVisible ? 'Ocultar cuadrícula' : 'Mostrar cuadrícula'}
            onClick={() => setGridVisible((v) => !v)}
          >
            ⊞
          </button>
          <select
            className="form-select form-select-sm pe-editor__grid-select"
            value={gridSpacingPx}
            onChange={(e) => setGridSpacingPx(Number(e.target.value))}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {GRID_PRESETS.map((p) => (
              <option key={p.px} value={p.px}>
                {p.label}
              </option>
            ))}
          </select>
          {selectedWall && (
            <>
              <span style={{ fontSize: 12, color: '#555', whiteSpace: 'nowrap' }}>Largo:</span>
              <LengthInput
                key={selectedWall.id}
                value={wallLengthNum}
                onCommit={(v) => handleWallLengthChange(selectedWall.id, v)}
              />
              <span style={{ fontSize: 12, color: '#555' }}>m</span>
              <CButton
                size="sm"
                variant="outline"
                color="secondary"
                title="Alinear horizontal"
                onClick={() => handleSnapWall(selectedWall.id, 'h')}
              >
                ↔
              </CButton>
              <CButton
                size="sm"
                variant="outline"
                color="secondary"
                title="Alinear vertical"
                onClick={() => handleSnapWall(selectedWall.id, 'v')}
              >
                ↕
              </CButton>
            </>
          )}
          {selectedLabel && (
            <>
              <CFormInput
                size="sm"
                style={{ width: 180 }}
                value={selectedLabel.text}
                onChange={(e) => handleLabelUpdate(selectedId, { text: e.target.value })}
                placeholder="Texto"
              />
              <select
                className="form-select form-select-sm"
                style={{ width: 85 }}
                value={selectedLabel.fontSize ?? 14}
                onChange={(e) =>
                  handleLabelUpdate(selectedId, { fontSize: Number(e.target.value) })
                }
              >
                {[10, 12, 14, 16, 20, 24, 32, 40, 48].map((s) => (
                  <option key={s} value={s}>
                    {s}px
                  </option>
                ))}
              </select>
            </>
          )}
          {selectedRuler && (
            <>
              <span style={{ fontSize: 12, color: '#555', whiteSpace: 'nowrap' }}>Cota:</span>
              <LengthInput
                key={selectedRuler.id}
                value={rulerLengthNum}
                onCommit={(v) => handleRulerLengthChange(selectedRuler.id, v)}
              />
              <span style={{ fontSize: 12, color: '#555' }}>m</span>
              <CButton
                size="sm"
                variant="outline"
                color="secondary"
                title="Alinear horizontal"
                onClick={() => handleSnapRuler(selectedRuler.id, 'h')}
              >
                ↔
              </CButton>
              <CButton
                size="sm"
                variant="outline"
                color="secondary"
                title="Alinear vertical"
                onClick={() => handleSnapRuler(selectedRuler.id, 'v')}
              >
                ↕
              </CButton>
            </>
          )}
          {selectedId && (
            <>
              <CButton
                color="secondary"
                variant="outline"
                size="sm"
                title="Traer al frente"
                onClick={() => handleBringToFront(selectedId)}
              >
                ▲ Frente
              </CButton>
              <CButton
                color="secondary"
                variant="outline"
                size="sm"
                title="Enviar al fondo"
                onClick={() => handleSendToBack(selectedId)}
              >
                ▼ Fondo
              </CButton>
            </>
          )}
          {selectedIds.length > 0 && (
            <CButton
              color="danger"
              variant="ghost"
              size="sm"
              onClick={() => eraseMultiple(selectedIds)}
            >
              🗑 {selectedIds.length > 1 ? `Borrar ${selectedIds.length}` : 'Borrar'}
            </CButton>
          )}
          {selectedIsFlippable && (
            <>
              <CButton
                color="secondary"
                variant="outline"
                size="sm"
                title="Voltear horizontalmente (espejo izq-der)"
                onClick={() => handleFlipElement(selectedId, 'scaleX')}
              >
                ↔ Voltear
              </CButton>
              <CButton
                color="secondary"
                variant="outline"
                size="sm"
                title="Voltear verticalmente (espejo arriba-abajo)"
                onClick={() => handleFlipElement(selectedId, 'scaleY')}
              >
                ↕ Voltear
              </CButton>
              <CButton
                color="secondary"
                variant="outline"
                size="sm"
                title="Rotar 90°"
                onClick={() => rotateSelected(selectedId, 90)}
              >
                ↻ 90°
              </CButton>
            </>
          )}
        </div>

        <CButton
          color="secondary"
          variant="outline"
          size="sm"
          onClick={() => editorRef.current?.exportPdf(plano.name)}
        >
          🖨 PDF
        </CButton>
        <CButton
          color="secondary"
          variant="outline"
          size="sm"
          onClick={() => editorRef.current?.downloadPng(plano.name)}
        >
          🖼 PNG
        </CButton>
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
            setSelectedIds([])
          }}
        />
        <EditorCanvas
          ref={editorRef}
          plano={plano}
          tool={tool}
          drawStart={drawStart}
          mousePos={mousePos}
          stageScale={stageScale}
          stagePos={stagePos}
          onStageMouseMove={handleMouseMove}
          onStageClick={handleStageClick}
          onStageWheel={handleWheel}
          onStageDragEnd={handleStageDragEnd}
          selectedIds={selectedIds}
          onSelect={handleElementSelect}
          onDragEnd={handleDragEnd}
          onBatchDragEnd={handleBatchDragEnd}
          onMoveWall={handleMoveWall}
          onResizeWall={handleResizeWall}
          onMoveRuler={handleMoveRuler}
          onResizeRuler={handleResizeRuler}
          onResizeElement={handleResizeElement}
          onRotateElement={rotateSelected}
          onMoveLabelOffset={handleMoveLabelOffset}
          gridSpacingPx={gridSpacingPx}
          gridVisible={gridVisible}
        />
        <LayersPanel
          plano={plano}
          selectedIds={selectedIds}
          onSelect={(id) => handleElementSelect(id, false)}
          onRename={handleRenameElement}
        />
      </div>
    </div>
  )
}

export default PlanosEditor
