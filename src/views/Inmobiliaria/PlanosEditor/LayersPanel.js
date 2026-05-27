import React, { useState } from 'react'
import { FURNITURE_CATALOG_MAP } from 'src/constants/inmobiliaria'

const KIND_ICON = {
  wall: '▬',
  door: '⌒',
  window: '⊟',
  ruler: '↔',
  furniture: '◻',
  label: 'T',
}

const LayerItem = ({ item, isSelected, onSelect, onRename }) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(item.name)

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== item.name) onRename(item.id, trimmed)
    else setDraft(item.name)
    setEditing(false)
  }

  return (
    <div
      className={`pe-layers__item${isSelected ? ' pe-layers__item--selected' : ''}`}
      onClick={() => onSelect(item.id)}
    >
      <span className="pe-layers__item-icon">{KIND_ICON[item.kind] ?? '◻'}</span>
      {editing ? (
        <input
          className="pe-layers__item-input"
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commit()
            }
            if (e.key === 'Escape') {
              setDraft(item.name)
              setEditing(false)
            }
            e.stopPropagation()
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          className="pe-layers__item-name"
          title="Doble clic para renombrar"
          onDoubleClick={(e) => {
            e.stopPropagation()
            setDraft(item.name)
            setEditing(true)
          }}
        >
          {item.name}
        </span>
      )}
    </div>
  )
}

const LayersPanel = ({ plano, selectedIds, onSelect, onRename }) => {
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

  const buildItem = (id) => {
    const wall = wallMap[id]
    if (wall) return { id, kind: 'wall', name: wall.name ?? 'Pared' }
    const door = doorMap[id]
    if (door) return { id, kind: 'door', name: door.name ?? 'Puerta' }
    const win = winMap[id]
    if (win) return { id, kind: 'window', name: win.name ?? 'Ventana' }
    const fur = furMap[id]
    if (fur)
      return {
        id,
        kind: 'furniture',
        name: fur.name ?? FURNITURE_CATALOG_MAP[fur.type]?.label ?? fur.type,
      }
    const lbl = lblMap[id]
    if (lbl) return { id, kind: 'label', name: lbl.name ?? lbl.text ?? 'Texto' }
    const rul = rulMap[id]
    if (rul) return { id, kind: 'ruler', name: rul.name ?? 'Cota' }
    return null
  }

  // top layer first in the list
  const items = [...order].reverse().map(buildItem).filter(Boolean)

  return (
    <div className="pe-layers">
      <div className="pe-layers__header">Capas ({items.length})</div>
      <div className="pe-layers__list">
        {items.length === 0 && <div className="pe-layers__empty">Sin elementos</div>}
        {items.map((item) => (
          <LayerItem
            key={item.id}
            item={item}
            isSelected={selectedIds.includes(item.id)}
            onSelect={onSelect}
            onRename={onRename}
          />
        ))}
      </div>
    </div>
  )
}

export default LayersPanel
