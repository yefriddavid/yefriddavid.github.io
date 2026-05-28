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

const EyeOpen = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeClosed = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

const EyeBtn = ({ visible, onToggle }) => (
  <button
    className={`pe-layers__eye${!visible ? ' pe-layers__eye--off' : ''}`}
    title={visible ? 'Ocultar' : 'Mostrar'}
    onClick={(e) => {
      e.stopPropagation()
      onToggle()
    }}
  >
    {visible ? <EyeOpen /> : <EyeClosed />}
  </button>
)

const LayerItem = ({
  item,
  isSelected,
  isHidden,
  onSelect,
  onRename,
  onToggleVisibility,
  indent = false,
}) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(item.name)
  const [dragging, setDragging] = useState(false)

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== item.name) onRename(item.id, trimmed)
    else setDraft(item.name)
    setEditing(false)
  }

  return (
    <div
      className={[
        'pe-layers__item',
        isSelected ? 'pe-layers__item--selected' : '',
        indent ? 'pe-layers__item--indent' : '',
        isHidden ? 'pe-layers__item--hidden' : '',
        dragging ? 'pe-layers__item--dragging' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', item.id)
        e.dataTransfer.effectAllowed = 'move'
        setDragging(true)
      }}
      onDragEnd={() => setDragging(false)}
      onClick={() => onSelect(item.id)}
    >
      <span className="pe-layers__drag-handle" title="Arrastrar">⠿</span>
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
      <EyeBtn visible={!isHidden} onToggle={() => onToggleVisibility(item.id)} />
    </div>
  )
}

const GroupItem = ({
  group,
  items,
  selectedIds,
  hiddenSet,
  onGroupSelect,
  onGroupRename,
  onUngroup,
  onCloneGroup,
  onToggleGroupVisibility,
  onSelectItem,
  onRenameItem,
  onToggleItemVisibility,
  onMoveToGroup,
}) => {
  const [open, setOpen] = useState(true)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(group.name)
  const [dragOver, setDragOver] = useState(false)

  const allSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id))
  const allHidden = items.length > 0 && items.every((item) => hiddenSet.has(item.id))

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== group.name) onGroupRename(group.id, trimmed)
    else setDraft(group.name)
    setEditing(false)
  }

  return (
    <div className={`pe-layers__group${allHidden ? ' pe-layers__group--hidden' : ''}`}>
      <div
        className={[
          'pe-layers__group-header',
          allSelected ? 'pe-layers__group-header--selected' : '',
          dragOver ? 'pe-layers__group-header--drag-over' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => onGroupSelect(group.id)}
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'
        }}
        onDragEnter={(e) => {
          e.preventDefault()
          if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(true)
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          const itemId = e.dataTransfer.getData('text/plain')
          if (itemId) onMoveToGroup(itemId, group.id)
        }}
      >
        <button
          className="pe-layers__group-toggle"
          title={open ? 'Contraer' : 'Expandir'}
          onClick={(e) => {
            e.stopPropagation()
            setOpen((v) => !v)
          }}
        >
          {open ? '▾' : '▸'}
        </button>
        <span className="pe-layers__group-icon">▣</span>
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
                setDraft(group.name)
                setEditing(false)
              }
              e.stopPropagation()
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className="pe-layers__group-name"
            title="Doble clic para renombrar"
            onDoubleClick={(e) => {
              e.stopPropagation()
              setDraft(group.name)
              setEditing(true)
            }}
          >
            {group.name}
          </span>
        )}
        <span className="pe-layers__group-count">{items.length}</span>
        <EyeBtn visible={!allHidden} onToggle={() => onToggleGroupVisibility(group.id)} />
        <button
          className="pe-layers__group-clone"
          title="Clonar grupo"
          onClick={(e) => {
            e.stopPropagation()
            onCloneGroup(group.id)
          }}
        >
          ⧉
        </button>
        <button
          className="pe-layers__group-del"
          title="Desagrupar"
          onClick={(e) => {
            e.stopPropagation()
            onUngroup(group.id)
          }}
        >
          ✕
        </button>
      </div>
      {open && items.length > 0 && (
        <div className="pe-layers__group-body">
          {items.map((item) => (
            <LayerItem
              key={item.id}
              item={item}
              isSelected={selectedIds.includes(item.id)}
              isHidden={hiddenSet.has(item.id)}
              onSelect={onSelectItem}
              onRename={onRenameItem}
              onToggleVisibility={onToggleItemVisibility}
              indent
            />
          ))}
        </div>
      )}
    </div>
  )
}

const LayersPanel = ({
  plano,
  selectedIds,
  onSelect,
  onRename,
  onGroupCreate,
  onGroupRename,
  onUngroup,
  onCloneGroup,
  onGroupSelect,
  onToggleVisibility,
  onToggleGroupVisibility,
  onMoveToGroup,
  onRemoveFromGroup,
}) => {
  const [ungroupedDragOver, setUngroupedDragOver] = useState(false)

  const wallMap = Object.fromEntries(plano.walls.map((w) => [w.id, w]))
  const doorMap = Object.fromEntries(plano.doors.map((d) => [d.id, d]))
  const winMap = Object.fromEntries(plano.windows.map((w) => [w.id, w]))
  const furMap = Object.fromEntries(plano.furniture.map((f) => [f.id, f]))
  const lblMap = Object.fromEntries(plano.labels.map((l) => [l.id, l]))
  const rulMap = Object.fromEntries((plano.rulers ?? []).map((r) => [r.id, r]))

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

  const hiddenSet = new Set(plano.hiddenIds ?? [])
  const groups = plano.groups ?? []
  const groupedIds = new Set(groups.flatMap((g) => g.itemIds))

  const zoSet = new Set(plano.zOrder ?? [])
  const legacy = [
    ...plano.walls.map((w) => w.id),
    ...plano.doors.map((d) => d.id),
    ...plano.windows.map((w) => w.id),
    ...plano.furniture.map((f) => f.id),
    ...plano.labels.map((l) => l.id),
    ...(plano.rulers ?? []).map((r) => r.id),
  ].filter((id) => !zoSet.has(id))

  const ungroupedItems = [...legacy, ...(plano.zOrder ?? [])]
    .reverse()
    .filter((id) => !groupedIds.has(id))
    .map(buildItem)
    .filter(Boolean)

  const totalCount = ungroupedItems.length + groups.reduce((s, g) => s + g.itemIds.length, 0)

  return (
    <div className="pe-layers">
      <div className="pe-layers__header">
        <span>Nodos ({totalCount})</span>
        {selectedIds.length > 1 && (
          <button
            className="pe-layers__group-create"
            title={`Agrupar ${selectedIds.length} elementos seleccionados`}
            onClick={() => onGroupCreate(selectedIds)}
          >
            ▣ Agrupar
          </button>
        )}
      </div>
      <div className="pe-layers__list">
        {totalCount === 0 && <div className="pe-layers__empty">Sin elementos</div>}

        {groups.map((group) => (
          <GroupItem
            key={group.id}
            group={group}
            items={group.itemIds.map(buildItem).filter(Boolean)}
            selectedIds={selectedIds}
            hiddenSet={hiddenSet}
            onGroupSelect={onGroupSelect}
            onGroupRename={onGroupRename}
            onUngroup={onUngroup}
            onCloneGroup={onCloneGroup}
            onToggleGroupVisibility={onToggleGroupVisibility}
            onSelectItem={onSelect}
            onRenameItem={onRename}
            onToggleItemVisibility={onToggleVisibility}
            onMoveToGroup={onMoveToGroup}
          />
        ))}

        {/* ungrouped drop zone */}
        <div
          className={`pe-layers__ungrouped${ungroupedDragOver ? ' pe-layers__ungrouped--drag-over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'move'
          }}
          onDragEnter={(e) => {
            e.preventDefault()
            if (!e.currentTarget.contains(e.relatedTarget)) setUngroupedDragOver(true)
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setUngroupedDragOver(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            setUngroupedDragOver(false)
            const itemId = e.dataTransfer.getData('text/plain')
            if (itemId) onRemoveFromGroup(itemId)
          }}
        >
          {ungroupedItems.length === 0 && groups.length > 0 && (
            <div className="pe-layers__drop-hint">Soltar aquí para desagrupar</div>
          )}
          {ungroupedItems.map((item) => (
            <LayerItem
              key={item.id}
              item={item}
              isSelected={selectedIds.includes(item.id)}
              isHidden={hiddenSet.has(item.id)}
              onSelect={onSelect}
              onRename={onRename}
              onToggleVisibility={onToggleVisibility}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default LayersPanel
