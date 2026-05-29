import React, { useState } from 'react'
import { SCENES3D_OBJECT_TYPES } from 'src/constants/finance'

const TYPE_ICONS = Object.fromEntries(SCENES3D_OBJECT_TYPES.map((t) => [t.key, t.icon]))

const ObjectRow = ({ obj, selected, onSelect, onToggleVisible, onToggleLock, onRename, onDelete }) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(obj.name)

  const commitRename = () => {
    setEditing(false)
    if (draft.trim()) onRename(obj.id, draft.trim())
    else setDraft(obj.name)
  }

  return (
    <div
      className={`s3d-obj-row${selected ? ' s3d-obj-row--selected' : ''}`}
      onClick={() => onSelect(obj.id)}
    >
      <span className="s3d-obj-row__icon">{TYPE_ICONS[obj.type] ?? '◇'}</span>
      <span className="s3d-obj-row__name">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename()
              if (e.key === 'Escape') setEditing(false)
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span onDoubleClick={(e) => { e.stopPropagation(); setEditing(true) }}>{obj.name}</span>
        )}
      </span>
      <span className="s3d-obj-row__controls">
        <button
          className={`s3d-obj-row__ctrl${obj.visible === false ? ' s3d-obj-row__ctrl--muted' : ''}`}
          title="Visibilidad"
          onClick={(e) => { e.stopPropagation(); onToggleVisible(obj.id) }}
        >
          {obj.visible === false ? '🚫' : '👁'}
        </button>
        <button
          className={`s3d-obj-row__ctrl${obj.locked ? ' s3d-obj-row__ctrl--active' : ''}`}
          title="Bloquear"
          onClick={(e) => { e.stopPropagation(); onToggleLock(obj.id) }}
        >
          {obj.locked ? '🔒' : '🔓'}
        </button>
        <button
          className="s3d-obj-row__ctrl s3d-obj-row__ctrl--danger"
          title="Eliminar"
          onClick={(e) => { e.stopPropagation(); onDelete(obj.id) }}
        >
          ✕
        </button>
      </span>
    </div>
  )
}

const ObjectsPanel = ({ objects, selectedId, onObjectsChange, onSelect }) => {
  const toggleVisible = (id) =>
    onObjectsChange(objects.map((o) => (o.id === id ? { ...o, visible: o.visible === false ? true : false } : o)))

  const toggleLock = (id) =>
    onObjectsChange(objects.map((o) => (o.id === id ? { ...o, locked: !o.locked } : o)))

  const renameObj = (id, name) =>
    onObjectsChange(objects.map((o) => (o.id === id ? { ...o, name } : o)))

  const deleteObj = (id) => {
    if (window.confirm('¿Eliminar objeto?')) {
      onObjectsChange(objects.filter((o) => o.id !== id))
    }
  }

  return (
    <div className="s3d-objects">
      <div className="s3d-objects__header">
        <span className="s3d-objects__title">Objetos</span>
        <span style={{ fontSize: 11, color: '#666' }}>{objects.length}</span>
      </div>
      <div className="s3d-objects__list">
        {objects.length === 0 && (
          <div className="s3d-objects__empty">Sin objetos todavía.<br />Añade una primitiva desde el panel.</div>
        )}
        {[...objects].reverse().map((obj) => (
          <ObjectRow
            key={obj.id}
            obj={obj}
            selected={selectedId === obj.id}
            onSelect={onSelect}
            onToggleVisible={toggleVisible}
            onToggleLock={toggleLock}
            onRename={renameObj}
            onDelete={deleteObj}
          />
        ))}
      </div>
    </div>
  )
}

export default ObjectsPanel
