import React, { useState } from 'react'

const SHAPE_ICONS = {
  rect: '▬', circle: '○', triangle: '△', polygon: '⬡',
  star: '★', line: '╱', arrow: '→', text: 'T', group: '▤',
}

const NodeRow = ({ node, selected, indented, onSelect, onToggleVisible, onToggleLock, onRename, onZOrder }) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(node.name)

  const commitRename = () => {
    setEditing(false)
    if (draft.trim()) onRename(node.id, draft.trim())
    else setDraft(node.name)
  }

  return (
    <div
      className={`pic-node-row${selected ? ' pic-node-row--selected' : ''}`}
      onClick={() => onSelect(node.id)}
    >
      {indented && <span className="pic-node-row__indent" />}
      <span className="pic-node-row__icon">{SHAPE_ICONS[node.type] ?? '◇'}</span>
      <span className="pic-node-row__name">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditing(false) }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span onDoubleClick={(e) => { e.stopPropagation(); setEditing(true) }}>{node.name}</span>
        )}
      </span>
      <span className="pic-node-row__controls">
        {selected && (
          <>
            <button className="pic-node-row__ctrl" title="Al frente"      onClick={(e) => { e.stopPropagation(); onZOrder(node.id, 'front')    }}>⤒</button>
            <button className="pic-node-row__ctrl" title="Subir un nivel" onClick={(e) => { e.stopPropagation(); onZOrder(node.id, 'forward')  }}>↑</button>
            <button className="pic-node-row__ctrl" title="Bajar un nivel" onClick={(e) => { e.stopPropagation(); onZOrder(node.id, 'backward') }}>↓</button>
            <button className="pic-node-row__ctrl" title="Al fondo"       onClick={(e) => { e.stopPropagation(); onZOrder(node.id, 'back')     }}>⤓</button>
          </>
        )}
        <button
          className={`pic-node-row__ctrl${node.visible === false ? ' pic-node-row__ctrl--muted' : ''}`}
          title="Visibilidad"
          onClick={(e) => { e.stopPropagation(); onToggleVisible(node.id) }}
        >
          {node.visible === false ? '🚫' : '👁'}
        </button>
        <button
          className={`pic-node-row__ctrl${node.locked ? ' pic-node-row__ctrl--active' : ''}`}
          title="Bloquear"
          onClick={(e) => { e.stopPropagation(); onToggleLock(node.id) }}
        >
          {node.locked ? '🔒' : '🔓'}
        </button>
      </span>
    </div>
  )
}

const GroupRow = ({ group, expanded, selected, onToggle, onSelect, onRename }) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(group.name)

  const commitRename = () => {
    setEditing(false)
    if (draft.trim()) onRename(group.id, draft.trim())
    else setDraft(group.name)
  }

  return (
    <div
      className={`pic-node-row${selected ? ' pic-node-row--selected' : ''}`}
      onClick={() => onSelect(group.id)}
    >
      <span className="pic-node-row__expand" onClick={(e) => { e.stopPropagation(); onToggle(group.id) }}>
        {expanded ? '▾' : '▸'}
      </span>
      <span className="pic-node-row__icon">{SHAPE_ICONS.group}</span>
      <span className="pic-node-row__name">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditing(false) }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span onDoubleClick={(e) => { e.stopPropagation(); setEditing(true) }}>{group.name}</span>
        )}
      </span>
    </div>
  )
}

const NodesPanel = ({ nodes, groups, selectedIds, onNodesChange, onGroupsChange, onSelect }) => {
  const [expandedGroups, setExpandedGroups] = useState({})

  const toggleExpand = (id) =>
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }))

  const toggleVisible = (id) =>
    onNodesChange(nodes.map((n) => (n.id === id ? { ...n, visible: n.visible === false ? true : false } : n)))

  const toggleLock = (id) =>
    onNodesChange(nodes.map((n) => (n.id === id ? { ...n, locked: !n.locked } : n)))

  const renameNode = (id, name) =>
    onNodesChange(nodes.map((n) => (n.id === id ? { ...n, name } : n)))

  const renameGroup = (id, name) =>
    onGroupsChange(groups.map((g) => (g.id === id ? { ...g, name } : g)))

  const selectNode = (id) => onSelect([id])

  const zOrder = (id, direction) => {
    const idx = nodes.findIndex((n) => n.id === id)
    if (idx === -1) return
    const arr = [...nodes]
    const [item] = arr.splice(idx, 1)
    if (direction === 'front')    arr.push(item)
    if (direction === 'back')     arr.unshift(item)
    if (direction === 'forward')  arr.splice(Math.min(idx + 1, arr.length), 0, item)
    if (direction === 'backward') arr.splice(Math.max(idx - 1, 0), 0, item)
    onNodesChange(arr)
  }

  const ungroupedNodes = [...nodes].reverse().filter((n) => !n.groupId)

  return (
    <div className="pic-nodes">
      <div className="pic-nodes__header">
        <span className="pic-nodes__title">Nodos y grupos</span>
        <div className="pic-nodes__actions">
          <span style={{ fontSize: 11, color: '#666' }}>{nodes.length} nodos</span>
        </div>
      </div>

      <div className="pic-nodes__list">
        {nodes.length === 0 && (
          <div className="pic-nodes__empty">Sin figuras todavía.</div>
        )}

        {/* Groups */}
        {groups.map((group) => {
          const groupNodes = [...nodes].reverse().filter((n) => n.groupId === group.id)
          const expanded = expandedGroups[group.id] !== false
          return (
            <React.Fragment key={group.id}>
              <GroupRow
                group={group}
                expanded={expanded}
                selected={selectedIds.includes(group.id)}
                onToggle={toggleExpand}
                onSelect={selectNode}
                onRename={renameGroup}
              />
              {expanded &&
                groupNodes.map((node) => (
                  <NodeRow
                    key={node.id}
                    node={node}
                    selected={selectedIds.includes(node.id)}
                    indented
                    onSelect={selectNode}
                    onToggleVisible={toggleVisible}
                    onToggleLock={toggleLock}
                    onRename={renameNode}
                    onZOrder={zOrder}
                  />
                ))}
            </React.Fragment>
          )
        })}

        {/* Ungrouped nodes */}
        {ungroupedNodes.map((node) => (
          <NodeRow
            key={node.id}
            node={node}
            selected={selectedIds.includes(node.id)}
            indented={false}
            onSelect={selectNode}
            onToggleVisible={toggleVisible}
            onToggleLock={toggleLock}
            onRename={renameNode}
            onZOrder={zOrder}
          />
        ))}
      </div>
    </div>
  )
}

export default NodesPanel
