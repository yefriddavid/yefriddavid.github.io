import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import Spinner from 'src/components/shared/Spinner'
import * as actions from 'src/actions/inmobiliaria/planosActions'
import {
  EMPTY_PLANO,
  GRID_SIZE,
  PIXELS_PER_METER,
  FURNITURE_CATALOG_MAP,
} from 'src/constants/inmobiliaria'
import { snap, uid, isFurnitureTool, isPlanoTool, autoName } from './editorHelpers'
import Toolbar from './Toolbar'
import EditorCanvas from './EditorCanvas'
import LayersPanel from './LayersPanel'
import EditorTopbar from './EditorTopbar'
import './PlanosEditor.scss'

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
  const [stagePos, setStagePos] = useState({ x: 20, y: 20 })
  const [gridSpacingPx, setGridSpacingPx] = useState(40)
  const [gridVisible, setGridVisible] = useState(true)
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
        groups: current.groups ?? [],
        hiddenIds: current.hiddenIds ?? [],
      })
    }
  }, [current])

  useEffect(() => { planoRef.current = plano }, [plano])

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

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedIds.length > 0) {
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
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const undo = useCallback(() => {
    const history = historyRef.current
    if (history.length === 0) return
    historyRef.current = history.slice(0, -1)
    setPlano(history[history.length - 1])
    setSelectedIds([])
  }, [])

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
      groups: (p.groups ?? [])
        .map((g) => ({ ...g, itemIds: g.itemIds.filter((id) => id !== eid) }))
        .filter((g) => g.itemIds.length > 0),
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
      groups: (p.groups ?? [])
        .map((g) => ({ ...g, itemIds: g.itemIds.filter((id) => !idSet.has(id)) }))
        .filter((g) => g.itemIds.length > 0),
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
      windows: p.windows.map((w) => w.id === eid ? { ...w, rotation: (w.rotation + deg) % 360 } : w),
      furniture: p.furniture.map((f) => f.id === eid ? { ...f, rotation: (f.rotation + deg) % 360 } : f),
      labels: p.labels.map((l) => l.id === eid ? { ...l, rotation: ((l.rotation ?? 0) + deg) % 360 } : l),
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
        d.id === eid ? { ...d, width: Math.max(GRID_SIZE, updates.width ?? d.width) } : d,
      ),
      windows: p.windows.map((w) =>
        w.id === eid ? { ...w, width: Math.max(GRID_SIZE, updates.width ?? w.width) } : w,
      ),
      furniture: p.furniture.map((f) =>
        f.id === eid
          ? { ...f, width: Math.max(GRID_SIZE, updates.width ?? f.width), height: Math.max(GRID_SIZE, updates.height ?? f.height) }
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
        return { ...w, x2: snap(w.x1 + (ddx / len) * newPx), y2: snap(w.y1 + (ddy / len) * newPx) }
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

  const handleDoorWidthChange = useCallback((did, meters) => {
    pushHistory()
    setPlano((p) => ({
      ...p,
      doors: p.doors.map((d) =>
        d.id === did ? { ...d, width: Math.max(GRID_SIZE, Math.round(meters * PIXELS_PER_METER)) } : d,
      ),
    }))
  }, [])

  const handleWindowWidthChange = useCallback((wid, meters) => {
    pushHistory()
    setPlano((p) => ({
      ...p,
      windows: p.windows.map((w) =>
        w.id === wid ? { ...w, width: Math.max(GRID_SIZE, Math.round(meters * PIXELS_PER_METER)) } : w,
      ),
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
        return { ...r, x2: Math.round(r.x1 + (ddx / len) * newPx), y2: Math.round(r.y1 + (ddy / len) * newPx) }
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
      (p.walls.find((w) => w.id === eid) && { kind: 'wall', data: p.walls.find((w) => w.id === eid) }) ||
      (p.doors.find((d) => d.id === eid) && { kind: 'door', data: p.doors.find((d) => d.id === eid) }) ||
      (p.windows.find((w) => w.id === eid) && { kind: 'window', data: p.windows.find((w) => w.id === eid) }) ||
      (p.furniture.find((f) => f.id === eid) && { kind: 'furniture', data: p.furniture.find((f) => f.id === eid) }) ||
      (p.labels.find((l) => l.id === eid) && { kind: 'label', data: p.labels.find((l) => l.id === eid) }) ||
      ((p.rulers ?? []).find((r) => r.id === eid) && { kind: 'ruler', data: (p.rulers ?? []).find((r) => r.id === eid) })
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
          return { ...p, walls: [...p.walls, { ...item.data, id: newId, x1: item.data.x1 + off, y1: item.data.y1 + off, x2: item.data.x2 + off, y2: item.data.y2 + off }], zOrder: zo }
        case 'door':
          return { ...p, doors: [...p.doors, { ...item.data, id: newId, x: item.data.x + off, y: item.data.y + off }], zOrder: zo }
        case 'window':
          return { ...p, windows: [...p.windows, { ...item.data, id: newId, x: item.data.x + off, y: item.data.y + off }], zOrder: zo }
        case 'furniture':
          return { ...p, furniture: [...p.furniture, { ...item.data, id: newId, x: item.data.x + off, y: item.data.y + off }], zOrder: zo }
        case 'label':
          return { ...p, labels: [...p.labels, { ...item.data, id: newId, x: item.data.x + off, y: item.data.y + off }], zOrder: zo }
        case 'ruler':
          return { ...p, rulers: [...(p.rulers ?? []), { ...item.data, id: newId, x1: item.data.x1 + off, y1: item.data.y1 + off, x2: item.data.x2 + off, y2: item.data.y2 + off }], zOrder: zo }
        default:
          return p
      }
    })
    setSelectedIds([newId])
  }, [])

  const nudgeSelected = useCallback((eid, dx, dy) => {
    setPlano((p) => ({
      ...p,
      walls: p.walls.map((w) => w.id === eid ? { ...w, x1: w.x1 + dx, y1: w.y1 + dy, x2: w.x2 + dx, y2: w.y2 + dy } : w),
      doors: p.doors.map((d) => (d.id === eid ? { ...d, x: d.x + dx, y: d.y + dy } : d)),
      windows: p.windows.map((w) => (w.id === eid ? { ...w, x: w.x + dx, y: w.y + dy } : w)),
      furniture: p.furniture.map((f) => (f.id === eid ? { ...f, x: f.x + dx, y: f.y + dy } : f)),
      labels: p.labels.map((l) => (l.id === eid ? { ...l, x: l.x + dx, y: l.y + dy } : l)),
      rulers: (p.rulers ?? []).map((r) => r.id === eid ? { ...r, x1: r.x1 + dx, y1: r.y1 + dy, x2: r.x2 + dx, y2: r.y2 + dy } : r),
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

  const handleMouseMove = useCallback((e) => { setMousePos(getStagePointer(e)) }, [getStagePointer])

  const handleStageClick = useCallback(
    (e) => {
      if (e.target !== e.target.getStage()) return
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
              walls: [...p.walls, { id: newId, name, x1: drawStart.x, y1: drawStart.y, x2: pos.x, y2: pos.y }],
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
              rulers: [...(p.rulers ?? []), { id: newId, name, x1: drawStart.x, y1: drawStart.y, x2: pos.x, y2: pos.y }],
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
          doors: [...p.doors, { id: newId, name, x: pos.x, y: pos.y, width: Math.round(0.9 * PIXELS_PER_METER), rotation: 0 }],
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
          windows: [...p.windows, { id: newId, name, x: pos.x, y: pos.y, width: GRID_SIZE * 3, rotation: 0 }],
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
          labels: [...p.labels, { id: newId, name, text: text.trim(), x: pos.x, y: pos.y, fontSize: 14 }],
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
          furniture: [...p.furniture, { id: newId, name, type: tool, x: pos.x, y: pos.y, width: def.w, height: def.h, rotation: 0 }],
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

  // ── groups ─────────────────────────────────────────────────────────────────
  const handleCreateGroup = useCallback((ids) => {
    const name = window.prompt('Nombre del grupo:', 'Grupo')
    if (!name?.trim()) return
    pushHistory()
    const newId = uid()
    const idSet = new Set(ids)
    setPlano((p) => ({
      ...p,
      groups: [
        ...(p.groups ?? []).map((g) => ({ ...g, itemIds: g.itemIds.filter((id) => !idSet.has(id)) })).filter((g) => g.itemIds.length > 0),
        { id: newId, name: name.trim(), itemIds: [...ids] },
      ],
    }))
  }, [])

  const handleRenameGroup = useCallback((gid, name) => {
    setPlano((p) => ({
      ...p,
      groups: (p.groups ?? []).map((g) => (g.id === gid ? { ...g, name } : g)),
    }))
  }, [])

  const handleUngroup = useCallback((gid) => {
    pushHistory()
    setPlano((p) => ({ ...p, groups: (p.groups ?? []).filter((g) => g.id !== gid) }))
  }, [])

  const handleToggleVisibility = useCallback((eid) => {
    setPlano((p) => {
      const hidden = new Set(p.hiddenIds ?? [])
      if (hidden.has(eid)) hidden.delete(eid)
      else hidden.add(eid)
      return { ...p, hiddenIds: [...hidden] }
    })
  }, [])

  const handleToggleGroupVisibility = useCallback((gid) => {
    setPlano((p) => {
      const group = (p.groups ?? []).find((g) => g.id === gid)
      if (!group) return p
      const hidden = new Set(p.hiddenIds ?? [])
      const allHidden = group.itemIds.every((id) => hidden.has(id))
      if (allHidden) group.itemIds.forEach((id) => hidden.delete(id))
      else group.itemIds.forEach((id) => hidden.add(id))
      return { ...p, hiddenIds: [...hidden] }
    })
  }, [])

  const handleGroupSelect = useCallback((gid) => {
    const group = (planoRef.current.groups ?? []).find((g) => g.id === gid)
    if (group) setSelectedIds([...group.itemIds])
  }, [])

  const handleCloneGroup = useCallback((gid) => {
    pushHistory()
    const group = (planoRef.current.groups ?? []).find((g) => g.id === gid)
    if (!group) return
    const OFF = GRID_SIZE * 2
    const idMap = {}
    group.itemIds.forEach((id) => { idMap[id] = uid() })
    setPlano((p) => {
      const newWalls = group.itemIds.map((id) => p.walls.find((w) => w.id === id)).filter(Boolean)
        .map((w) => ({ ...w, id: idMap[w.id], x1: w.x1 + OFF, y1: w.y1 + OFF, x2: w.x2 + OFF, y2: w.y2 + OFF }))
      const newDoors = group.itemIds.map((id) => p.doors.find((d) => d.id === id)).filter(Boolean)
        .map((d) => ({ ...d, id: idMap[d.id], x: d.x + OFF, y: d.y + OFF }))
      const newWindows = group.itemIds.map((id) => p.windows.find((w) => w.id === id)).filter(Boolean)
        .map((w) => ({ ...w, id: idMap[w.id], x: w.x + OFF, y: w.y + OFF }))
      const newFurniture = group.itemIds.map((id) => p.furniture.find((f) => f.id === id)).filter(Boolean)
        .map((f) => ({ ...f, id: idMap[f.id], x: f.x + OFF, y: f.y + OFF }))
      const newLabels = group.itemIds.map((id) => p.labels.find((l) => l.id === id)).filter(Boolean)
        .map((l) => ({ ...l, id: idMap[l.id], x: l.x + OFF, y: l.y + OFF }))
      const newRulers = group.itemIds.map((id) => (p.rulers ?? []).find((r) => r.id === id)).filter(Boolean)
        .map((r) => ({ ...r, id: idMap[r.id], x1: r.x1 + OFF, y1: r.y1 + OFF, x2: r.x2 + OFF, y2: r.y2 + OFF }))
      const newIds = Object.values(idMap)
      return {
        ...p,
        walls: [...p.walls, ...newWalls],
        doors: [...p.doors, ...newDoors],
        windows: [...p.windows, ...newWindows],
        furniture: [...p.furniture, ...newFurniture],
        labels: [...p.labels, ...newLabels],
        rulers: [...(p.rulers ?? []), ...newRulers],
        zOrder: [...(p.zOrder ?? []), ...newIds],
        groups: [...(p.groups ?? []), { id: uid(), name: group.name + ' (copia)', itemIds: newIds }],
      }
    })
    setSelectedIds(Object.values(idMap))
  }, [])

  const handleMoveToGroup = useCallback((itemId, groupId) => {
    pushHistory()
    setPlano((p) => {
      let groups = (p.groups ?? []).map((g) => ({ ...g, itemIds: g.itemIds.filter((id) => id !== itemId) }))
      groups = groups.map((g) => g.id === groupId ? { ...g, itemIds: [...g.itemIds, itemId] } : g)
      groups = groups.filter((g) => g.id === groupId || g.itemIds.length > 0)
      return { ...p, groups }
    })
  }, [])

  const handleRemoveFromGroup = useCallback((itemId) => {
    pushHistory()
    setPlano((p) => ({
      ...p,
      groups: (p.groups ?? [])
        .map((g) => ({ ...g, itemIds: g.itemIds.filter((id) => id !== itemId) }))
        .filter((g) => g.itemIds.length > 0),
    }))
  }, [])

  // ── save ───────────────────────────────────────────────────────────────────
  const handleSave = () => {
    const { name, walls, doors, windows, furniture, labels, rulers, zOrder, groups, hiddenIds } = plano
    if (isNew) {
      dispatch(actions.createRequest({ name, walls, doors, windows, furniture, labels, rulers, zOrder, groups, hiddenIds }))
    } else {
      dispatch(actions.updateRequest({ id, data: { name, walls, doors, windows, furniture, labels, rulers, zOrder, groups, hiddenIds } }))
    }
  }

  if (!isNew && loading) return <Spinner mode="page" />

  const selectedId = selectedIds.length === 1 ? selectedIds[0] : null
  const selectedLabel = plano.labels.find((l) => l.id === selectedId) ?? null
  const selectedWall = plano.walls.find((w) => w.id === selectedId) ?? null
  const selectedRuler = (plano.rulers ?? []).find((r) => r.id === selectedId) ?? null
  const selectedDoor = plano.doors.find((d) => d.id === selectedId) ?? null
  const selectedWindow = plano.windows.find((w) => w.id === selectedId) ?? null
  const selectedIsFlippable =
    !!selectedId &&
    !selectedWall &&
    !selectedLabel &&
    (plano.doors.some((d) => d.id === selectedId) ||
      plano.windows.some((w) => w.id === selectedId) ||
      plano.furniture.some((f) => f.id === selectedId))
  const wallLengthNum = selectedWall
    ? parseFloat((Math.sqrt((selectedWall.x2 - selectedWall.x1) ** 2 + (selectedWall.y2 - selectedWall.y1) ** 2) / PIXELS_PER_METER).toFixed(2))
    : 0
  const rulerLengthNum = selectedRuler
    ? parseFloat((Math.sqrt((selectedRuler.x2 - selectedRuler.x1) ** 2 + (selectedRuler.y2 - selectedRuler.y1) ** 2) / PIXELS_PER_METER).toFixed(2))
    : 0
  const doorWidthNum = selectedDoor ? parseFloat((selectedDoor.width / PIXELS_PER_METER).toFixed(2)) : 0
  const windowWidthNum = selectedWindow ? parseFloat((selectedWindow.width / PIXELS_PER_METER).toFixed(2)) : 0

  return (
    <div className="pe-editor">
      <EditorTopbar
        planName={plano.name}
        onNameChange={(name) => setPlano((p) => ({ ...p, name }))}
        onBack={() => navigate('/inmobiliaria/planos')}
        gridVisible={gridVisible}
        onToggleGrid={() => setGridVisible((v) => !v)}
        gridSpacingPx={gridSpacingPx}
        onGridSpacingChange={setGridSpacingPx}
        selectedWall={selectedWall}
        wallLengthNum={wallLengthNum}
        onWallLengthChange={handleWallLengthChange}
        onSnapWall={handleSnapWall}
        selectedLabel={selectedLabel}
        selectedId={selectedId}
        onLabelUpdate={handleLabelUpdate}
        selectedDoor={selectedDoor}
        doorWidthNum={doorWidthNum}
        onDoorWidthChange={handleDoorWidthChange}
        selectedWindow={selectedWindow}
        windowWidthNum={windowWidthNum}
        onWindowWidthChange={handleWindowWidthChange}
        selectedRuler={selectedRuler}
        rulerLengthNum={rulerLengthNum}
        onRulerLengthChange={handleRulerLengthChange}
        onSnapRuler={handleSnapRuler}
        onBringToFront={handleBringToFront}
        onSendToBack={handleSendToBack}
        selectedIds={selectedIds}
        onEraseMultiple={eraseMultiple}
        selectedIsFlippable={selectedIsFlippable}
        onFlipElement={handleFlipElement}
        onRotate={rotateSelected}
        editorRef={editorRef}
        saving={saving}
        onSave={handleSave}
      />

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
          hiddenIds={plano.hiddenIds}
        />
        <LayersPanel
          plano={plano}
          selectedIds={selectedIds}
          onSelect={(id) => handleElementSelect(id, false)}
          onRename={handleRenameElement}
          onGroupCreate={handleCreateGroup}
          onGroupRename={handleRenameGroup}
          onUngroup={handleUngroup}
          onCloneGroup={handleCloneGroup}
          onGroupSelect={handleGroupSelect}
          onToggleVisibility={handleToggleVisibility}
          onToggleGroupVisibility={handleToggleGroupVisibility}
          onMoveToGroup={handleMoveToGroup}
          onRemoveFromGroup={handleRemoveFromGroup}
        />
      </div>
    </div>
  )
}

export default PlanosEditor
