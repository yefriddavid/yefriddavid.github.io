import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import Spinner from 'src/components/shared/Spinner'
import * as actions from 'src/actions/finance/picturesActions'
import { PICTURES_DEFAULT_CANVAS, PICTURES_UNITS, PICTURES_UNITS_MAP } from 'src/constants/finance'
import { prefStorage } from 'src/utils/storage'
import Toolbar from './Toolbar'
import EditorCanvas from './EditorCanvas'
import NodesPanel from './NodesPanel'
import DesignChat from './DesignChat'
import './PicturesEditor.scss'

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

const EMPTY_PICTURE = {
  name: 'Nuevo cuadro',
  canvas: { ...PICTURES_DEFAULT_CANVAS },
  nodes: [],
  groups: [],
}

// Controlled number input that commits on Enter/blur
const NumInput = ({ value, min, max, step, onChange, style }) => {
  const [draft, setDraft] = useState(String(value))
  const ref = useRef(false)

  useEffect(() => {
    if (!ref.current) setDraft(String(value))
  }, [value])

  const commit = () => {
    ref.current = false
    const v = parseFloat(draft)
    if (!isNaN(v) && v >= (min ?? 0)) onChange(v)
    else setDraft(String(value))
  }

  return (
    <input
      type="number"
      value={draft}
      min={min}
      max={max}
      step={step ?? 'any'}
      style={style}
      onChange={(e) => { ref.current = true; setDraft(e.target.value) }}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') commit() }}
    />
  )
}

const PicturesEditor = () => {
  const { id } = useParams()
  const isNew = id === 'new'
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { current, loading, saving } = useSelector((s) => s.financePictures)

  const [name, setName] = useState(EMPTY_PICTURE.name)
  const [canvas, setCanvas] = useState(EMPTY_PICTURE.canvas)
  const [nodes, setNodes] = useState([])
  const [groups, setGroups] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [tool, setTool] = useState('select')
  const [zoom, setZoom] = useState(() => prefStorage.getPicturesZoom())
  const [dirty, setDirty] = useState(false)
  const [exportFmt, setExportFmt] = useState('png')
  const [chatOpen, setChatOpen] = useState(false)
  const clipboardRef = useRef([])
  const canvasRef = useRef(null)

  // history for undo/redo
  const historyRef = useRef([[]])
  const histIdxRef = useRef(0)

  const pushHistory = useCallback((snapshot) => {
    const h = historyRef.current.slice(0, histIdxRef.current + 1)
    h.push(snapshot)
    if (h.length > 50) h.shift()
    historyRef.current = h
    histIdxRef.current = h.length - 1
  }, [])

  // load existing or init new
  useEffect(() => {
    if (isNew) {
      dispatch(actions.clearPicture())
      setName(EMPTY_PICTURE.name)
      setCanvas({ ...EMPTY_PICTURE.canvas })
      setNodes([])
      setGroups([])
      historyRef.current = [[]]
      histIdxRef.current = 0
      setDirty(false)
    } else {
      dispatch(actions.loadRequest({ id }))
    }
  }, [id, isNew, dispatch])

  // After a successful create, current.id is the new Firestore ID.
  // Navigate to it so subsequent saves use updateRequest with a real ID.
  useEffect(() => {
    if (isNew && current?.id) {
      navigate(`/finance/pictures/${current.id}`, { replace: true })
    }
  }, [isNew, current, navigate])

  useEffect(() => {
    if (!isNew && current && current.id === id) {
      setName(current.name ?? 'Sin nombre')
      setCanvas({ ...PICTURES_DEFAULT_CANVAS, ...(current.canvas ?? {}) })
      setNodes(current.nodes ?? [])
      setGroups(current.groups ?? [])
      historyRef.current = [current.nodes ?? []]
      histIdxRef.current = 0
      setDirty(false)
    }
  }, [current, id, isNew])

  // keyboard: undo, redo, ctrl+s
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (histIdxRef.current > 0) {
          histIdxRef.current -= 1
          setNodes(historyRef.current[histIdxRef.current])
          setDirty(true)
        }
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        if (histIdxRef.current < historyRef.current.length - 1) {
          histIdxRef.current += 1
          setNodes(historyRef.current[histIdxRef.current])
          setDirty(true)
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      // copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (document.activeElement.tagName === 'INPUT') return
        const selected = nodes.filter((n) => selectedIds.includes(n.id))
        if (selected.length) clipboardRef.current = selected
      }
      // paste
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (document.activeElement.tagName === 'INPUT') return
        if (!clipboardRef.current.length) return
        e.preventDefault()
        const offset = 20
        const pasted = clipboardRef.current.map((n) => ({
          ...n,
          id: uid(),
          x: n.x + offset,
          y: n.y + offset,
          groupId: null,
        }))
        const updated = [...nodes, ...pasted]
        handleNodesChange(updated)
        setSelectedIds(pasted.map((n) => n.id))
      }
      // duplicate (Ctrl+D)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        if (document.activeElement.tagName === 'INPUT') return
        e.preventDefault()
        const selected = nodes.filter((n) => selectedIds.includes(n.id))
        if (!selected.length) return
        const offset = 20
        const dupes = selected.map((n) => ({
          ...n,
          id: uid(),
          x: n.x + offset,
          y: n.y + offset,
          groupId: null,
        }))
        const updated = [...nodes, ...dupes]
        handleNodesChange(updated)
        setSelectedIds(dupes.map((n) => n.id))
      }
      // group/ungroup
      if ((e.ctrlKey || e.metaKey) && e.key === 'g' && !e.shiftKey) {
        e.preventDefault()
        handleGroup()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'g' && e.shiftKey) {
        e.preventDefault()
        handleUngroup()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const handleNodesChange = useCallback(
    (updated) => {
      setNodes(updated)
      setDirty(true)
      pushHistory(updated)
    },
    [pushHistory],
  )

  const handleNodePropertyChange = useCallback(
    (updated) => {
      const next = nodes.map((n) => (n.id === updated.id ? updated : n))
      handleNodesChange(next)
    },
    [nodes, handleNodesChange],
  )

  const handleGroupsChange = useCallback((updated) => {
    setGroups(updated)
    setDirty(true)
  }, [])

  const handleGroup = () => {
    if (selectedIds.length < 2) return
    const newGroup = { id: uid(), name: `Grupo ${groups.length + 1}`, collapsed: false }
    const updated = nodes.map((n) =>
      selectedIds.includes(n.id) ? { ...n, groupId: newGroup.id } : n,
    )
    setGroups([...groups, newGroup])
    handleNodesChange(updated)
  }

  const handleUngroup = () => {
    const ids = new Set(selectedIds)
    const groupIds = new Set(
      nodes.filter((n) => ids.has(n.id) && n.groupId).map((n) => n.groupId),
    )
    if (groupIds.size === 0) return
    const updated = nodes.map((n) => (groupIds.has(n.groupId) ? { ...n, groupId: null } : n))
    setGroups(groups.filter((g) => !groupIds.has(g.id)))
    handleNodesChange(updated)
  }

  const handleRotateCanvas = () => {
    const u = PICTURES_UNITS_MAP[canvas.unit] ?? PICTURES_UNITS_MAP.cm
    const canvasH_px = canvas.height * u.pxPerUnit
    const rotatedNodes = nodes.map((n) => ({
      ...n,
      x: canvasH_px - n.y - n.h,
      y: n.x,
      w: n.h,
      h: n.w,
      rotation: (n.rotation + 90) % 360,
    }))
    setCanvas((c) => ({ ...c, width: c.height, height: c.width }))
    handleNodesChange(rotatedNodes)
  }

  const buildPayload = () => ({
    name,
    canvas,
    nodes,
    groups,
  })

  const handleSave = async () => {
    const thumbnail = await canvasRef.current?.generateThumbnail() ?? null
    const payload = { ...buildPayload(), thumbnail }
    if (isNew) {
      dispatch(actions.createRequest(payload))
    } else {
      dispatch(actions.updateRequest({ id, data: payload }))
    }
    setDirty(false)
  }

  const handleExport = () => {
    canvasRef.current?.exportImage(exportFmt, name || 'picture')
  }

  const handleBack = () => {
    if (dirty && !window.confirm('Hay cambios sin guardar. ¿Salir de todas formas?')) return
    navigate('/finance/pictures')
  }

  const selectedNode =
    selectedIds.length === 1 ? nodes.find((n) => n.id === selectedIds[0]) ?? null : null

  if (!isNew && loading) return <Spinner mode="page" />

  return (
    <div className="pic-editor">
      {/* Header */}
      <div className="pic-editor__header">
        <button className="pic-editor__btn" onClick={handleBack} title="Volver">← Volver</button>
        <div className="pic-editor__header-sep" />

        <input
          className="pic-editor__name"
          value={name}
          onChange={(e) => { setName(e.target.value); setDirty(true) }}
        />
        <div className="pic-editor__header-sep" />

        {/* canvas config */}
        <div className="pic-editor__canvas-config">
          <span>W</span>
          <NumInput
            value={canvas.width}
            min={0.5}
            step={0.5}
            style={{ width: 60 }}
            onChange={(v) => setCanvas((c) => ({ ...c, width: v }))}
          />
          <span>×</span>
          <NumInput
            value={canvas.height}
            min={0.5}
            step={0.5}
            style={{ width: 60 }}
            onChange={(v) => setCanvas((c) => ({ ...c, height: v }))}
          />
          <button
            className="pic-editor__btn"
            title="Rotar 90°"
            onClick={handleRotateCanvas}
          >
            ↻ 90°
          </button>
          <select
            value={canvas.unit}
            onChange={(e) => setCanvas((c) => ({ ...c, unit: e.target.value }))}
          >
            {PICTURES_UNITS.map((u) => (
              <option key={u.key} value={u.key}>{u.label}</option>
            ))}
          </select>
          <span>Grid</span>
          <NumInput
            value={canvas.grid}
            min={0}
            step={0.5}
            style={{ width: 50 }}
            onChange={(v) => setCanvas((c) => ({ ...c, grid: v }))}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <input
              type="checkbox"
              checked={canvas.snap ?? true}
              onChange={(e) => setCanvas((c) => ({ ...c, snap: e.target.checked }))}
            />
            Snap
          </label>
          <span>Fondo</span>
          <input
            type="color"
            value={canvas.bg ?? '#ffffff'}
            style={{ width: 30, height: 22, padding: 1, border: '1px solid #555', borderRadius: 3, cursor: 'pointer', background: 'transparent' }}
            onChange={(e) => setCanvas((c) => ({ ...c, bg: e.target.value }))}
          />
        </div>

        <div className="pic-editor__header-actions">
          <span style={{ fontSize: 11, color: '#666' }}>
            {nodes.length} fig · zoom{' '}
          </span>
          <select
            style={{ background: '#333', border: '1px solid #555', borderRadius: 3, color: '#e8e8e8', fontSize: 12, padding: '2px 5px' }}
            value={zoom}
            onChange={(e) => { const v = parseFloat(e.target.value); setZoom(v); prefStorage.setPicturesZoom(v) }}
          >
            {[0.25, 0.5, 0.75, 1, 1.5, 2, 3].map((z) => (
              <option key={z} value={z}>{Math.round(z * 100)}%</option>
            ))}
          </select>
          {dirty && <span style={{ color: '#f0a030', fontSize: 11 }}>● sin guardar</span>}
          <select
            style={{ background: '#333', border: '1px solid #555', borderRadius: 3, color: '#e8e8e8', fontSize: 12, padding: '2px 5px' }}
            value={exportFmt}
            onChange={(e) => setExportFmt(e.target.value)}
          >
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
            <option value="jpeg">JPEG</option>
          </select>
          <button className="pic-editor__btn" onClick={handleExport} title="Exportar imagen">
            ↓ Exportar
          </button>
          <button
            className={`pic-editor__btn${chatOpen ? ' pic-editor__btn--primary' : ''}`}
            onClick={() => setChatOpen((v) => !v)}
            title={import.meta.env.VITE_ANTHROPIC_API_KEY ? 'Asistente de diseño' : 'API key no configurada'}
            disabled={!import.meta.env.VITE_ANTHROPIC_API_KEY}
          >
            ✦ Chat
          </button>
          <button
            className="pic-editor__btn pic-editor__btn--primary"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? '…' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="pic-editor__body">
        <Toolbar
          tool={tool}
          onToolChange={setTool}
          selectedNode={selectedNode}
          onNodeChange={handleNodePropertyChange}
          canvas={canvas}
        />

        <EditorCanvas
          ref={canvasRef}
          canvas={canvas}
          nodes={nodes}
          groups={groups}
          selectedIds={selectedIds}
          tool={tool}
          zoom={zoom}
          onNodesChange={handleNodesChange}
          onSelect={setSelectedIds}
        />

        <NodesPanel
          nodes={nodes}
          groups={groups}
          selectedIds={selectedIds}
          onNodesChange={handleNodesChange}
          onGroupsChange={handleGroupsChange}
          onSelect={setSelectedIds}
        />

        {chatOpen && (
          <DesignChat
            canvas={canvas}
            nodes={nodes}
            onNodesChange={handleNodesChange}
            onClose={() => setChatOpen(false)}
          />
        )}
      </div>
    </div>
  )
}

export default PicturesEditor
