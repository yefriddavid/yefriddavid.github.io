import React, { useState, useEffect, useRef, useCallback, Component } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import Spinner from 'src/components/shared/Spinner'
import * as actions from 'src/actions/finance/scenes3dActions'
import { SCENES3D_DEFAULT_SCENE, SCENES3D_DEFAULT_OBJECT } from 'src/constants/finance'
import Toolbar3D from './Toolbar3D'
import EditorScene from './EditorScene'
import ObjectsPanel from './ObjectsPanel'
import './Scenes3DEditor.scss'

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

class WebGLErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(e) { return { error: e } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: '#aaa', background: '#1a1a2e' }}>
          <span style={{ fontSize: 32 }}>🖥️</span>
          <strong style={{ color: '#ff8888' }}>WebGL no disponible</strong>
          <span style={{ fontSize: 12, textAlign: 'center', maxWidth: 320, lineHeight: 1.6 }}>
            El browser no pudo inicializar WebGL. En Chrome, activa la aceleración gráfica en{' '}
            <code style={{ background: '#2a2a3e', padding: '1px 5px', borderRadius: 3 }}>chrome://settings/system</code>
            {' '}y reinicia.
          </span>
          <span style={{ fontSize: 11, color: '#666' }}>{this.state.error?.message}</span>
        </div>
      )
    }
    return this.props.children
  }
}

const EMPTY_SCENE = {
  name: 'Nueva escena',
  scene: { ...SCENES3D_DEFAULT_SCENE },
  objects: [],
}

const Scenes3DEditor = () => {
  const { id } = useParams()
  const isNew = id === 'new'
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { current, loading, saving } = useSelector((s) => s.financeScenes3d)

  const [name, setName] = useState(EMPTY_SCENE.name)
  const [sceneConfig, setSceneConfig] = useState(EMPTY_SCENE.scene)
  const [objects, setObjects] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [selectedMeshRef, setSelectedMeshRef] = useState(null)
  const [transformMode, setTransformMode] = useState('translate')
  const [dirty, setDirty] = useState(false)

  const sceneRef = useRef(null)

  useEffect(() => {
    if (isNew) {
      dispatch(actions.clearScene())
      setName(EMPTY_SCENE.name)
      setSceneConfig({ ...EMPTY_SCENE.scene })
      setObjects([])
      setSelectedId(null)
      setDirty(false)
    } else {
      dispatch(actions.loadRequest({ id }))
    }
  }, [id, isNew, dispatch])

  useEffect(() => {
    if (isNew && current?.id) {
      navigate(`/finance/scenes3d/${current.id}`, { replace: true })
    }
  }, [isNew, current, navigate])

  useEffect(() => {
    if (!isNew && current && current.id === id) {
      setName(current.name ?? 'Sin nombre')
      setSceneConfig({ ...SCENES3D_DEFAULT_SCENE, ...(current.scene ?? {}) })
      setObjects(current.objects ?? [])
      setSelectedId(null)
      setDirty(false)
    }
  }, [current, id, isNew])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (document.activeElement.tagName === 'INPUT') return
      if (e.key === 'w' || e.key === 'W') setTransformMode('translate')
      if (e.key === 'e' || e.key === 'E') setTransformMode('rotate')
      if (e.key === 'r' || e.key === 'R') setTransformMode('scale')
      if (e.key === 'Escape') { setSelectedId(null); setSelectedMeshRef(null) }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        handleObjectsChange(objects.filter((o) => o.id !== selectedId))
        setSelectedId(null)
        setSelectedMeshRef(null)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedId, objects])

  const handleObjectsChange = useCallback((updated) => {
    setObjects(updated)
    setDirty(true)
  }, [])

  const handleAddObject = (type) => {
    const count = objects.filter((o) => o.type === type).length
    const newObj = {
      ...SCENES3D_DEFAULT_OBJECT,
      id: uid(),
      type,
      name: `${type} ${count + 1}`,
      position: [
        Math.round((Math.random() * 4 - 2) * 10) / 10,
        0.5,
        Math.round((Math.random() * 4 - 2) * 10) / 10,
      ],
    }
    handleObjectsChange([...objects, newObj])
    setSelectedId(newObj.id)
    setSelectedMeshRef(null)
  }

  const handleSelect = (objId, meshRef) => {
    setSelectedId(objId)
    setSelectedMeshRef(meshRef)
  }

  const handleDeselect = () => {
    setSelectedId(null)
    setSelectedMeshRef(null)
  }

  const handleTransformEnd = (objId, transform) => {
    handleObjectsChange(objects.map((o) => (o.id === objId ? { ...o, ...transform } : o)))
  }

  const handleObjectPropertyChange = (updated) => {
    handleObjectsChange(objects.map((o) => (o.id === updated.id ? updated : o)))
    // sync the mesh if selected
    if (selectedMeshRef?.current) {
      selectedMeshRef.current.position.set(...updated.position)
      selectedMeshRef.current.rotation.set(...updated.rotation)
      selectedMeshRef.current.scale.set(...updated.scale)
    }
  }

  const handleSave = () => {
    const payload = { name, scene: sceneConfig, objects }
    if (isNew) {
      dispatch(actions.createRequest(payload))
    } else {
      dispatch(actions.updateRequest({ id, data: payload }))
    }
    setDirty(false)
  }

  const handleBack = () => {
    if (dirty && !window.confirm('Hay cambios sin guardar. ¿Salir de todas formas?')) return
    navigate('/finance/scenes3d')
  }

  const selectedObj = selectedId ? objects.find((o) => o.id === selectedId) ?? null : null

  if (!isNew && loading) return <Spinner mode="page" />

  return (
    <div className="s3d-editor">
      {/* Header */}
      <div className="s3d-editor__header">
        <button className="s3d-editor__btn" onClick={handleBack} title="Volver">← Volver</button>
        <div className="s3d-editor__sep" />

        <input
          className="s3d-editor__name"
          value={name}
          onChange={(e) => { setName(e.target.value); setDirty(true) }}
        />
        <div className="s3d-editor__sep" />

        {/* Scene config */}
        <div className="s3d-editor__scene-config">
          <span>Fondo</span>
          <input
            type="color"
            value={sceneConfig.bg ?? '#1a1a2e'}
            style={{ width: 30, height: 22, padding: 1, border: '1px solid #555', borderRadius: 3, cursor: 'pointer', background: 'transparent' }}
            onChange={(e) => setSceneConfig((c) => ({ ...c, bg: e.target.value }))}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <input
              type="checkbox"
              checked={sceneConfig.grid ?? true}
              onChange={(e) => setSceneConfig((c) => ({ ...c, grid: e.target.checked }))}
            />
            Grid
          </label>
          <span>Luz amb.</span>
          <input
            type="number" min={0} max={3} step={0.1}
            style={{ width: 50, background: '#333', border: '1px solid #555', borderRadius: 3, color: '#e8e8e8', fontSize: 12, padding: '2px 5px' }}
            value={sceneConfig.ambientIntensity ?? 0.5}
            onChange={(e) => setSceneConfig((c) => ({ ...c, ambientIntensity: parseFloat(e.target.value) || 0 }))}
          />
        </div>

        <div className="s3d-editor__sep" />

        <div className="s3d-editor__actions">
          {dirty && <span style={{ color: '#f0a030', fontSize: 11 }}>● sin guardar</span>}
          <button className="s3d-editor__btn" onClick={() => sceneRef.current?.exportPNG(name || 'scene')} title="Exportar PNG">
            ↓ PNG
          </button>
          <button
            className="s3d-editor__btn s3d-editor__btn--primary"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? '…' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="s3d-editor__body">
        <Toolbar3D
          transformMode={transformMode}
          onTransformModeChange={setTransformMode}
          onAddObject={handleAddObject}
          selectedObj={selectedObj}
          onObjectChange={handleObjectPropertyChange}
        />

        <div className="s3d-editor__canvas-wrap">
          <WebGLErrorBoundary>
          <EditorScene
            ref={sceneRef}
            sceneConfig={sceneConfig}
            objects={objects}
            selectedId={selectedId}
            selectedMeshRef={selectedMeshRef}
            transformMode={transformMode}
            onSelect={handleSelect}
            onDeselect={handleDeselect}
            onTransformEnd={handleTransformEnd}
          />
          </WebGLErrorBoundary>
        </div>

        <ObjectsPanel
          objects={objects}
          selectedId={selectedId}
          onObjectsChange={handleObjectsChange}
          onSelect={(objId) => {
            setSelectedId(objId)
            setSelectedMeshRef(null)
          }}
        />
      </div>
    </div>
  )
}

export default Scenes3DEditor
