import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import EditableTable from 'src/components/shared/EditableTable'
import * as a from 'src/actions/finance/calcListActions'
import { push as notify } from 'src/reducers/notificationsSlice'
import { fmtUsd } from '../tradeUtils'
import { CALC_LIST_CATEGORIES, CALC_LIST_CLASSIFICATIONS } from 'src/constants/finance'
import usePeerSync from 'src/hooks/usePeerSync'
import SyncModal from './SyncModal'
import './CalcList.scss'

const COLUMNS = [
  { key: 'index', label: '#', type: 'readonly', width: 28, noMinWidth: true },
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'category',       label: 'Category',       type: 'select', options: CALC_LIST_CATEGORIES,    width: 110 },
  { key: 'classification', label: 'Classification', type: 'select', options: CALC_LIST_CLASSIFICATIONS, width: 120 },
  { key: 'quantity', label: 'Qty', type: 'number', width: 90 },
  { key: 'value', label: 'Value', type: 'number', width: 160 },
  {
    key: 'total',
    label: 'Total',
    type: 'calc',
    width: 130,
    calc: (row) => (row.quantity || 0) * (row.value || 0),
    format: fmtUsd,
  },
]

function groupBy(rows, key, defs) {
  return defs.map((def) => {
    const matched = rows.filter((r) => (r[key] || defs[0].value) === def.value)
    return { ...def, rows: matched, total: matched.reduce((s, r) => s + r.total, 0) }
  }).filter((g) => g.total > 0).sort((a, b) => b.total - a.total)
}

function DetailRow({ r, showList }) {
  const clf = CALC_LIST_CLASSIFICATIONS.find((c) => c.value === r.classification)
  return (
    <tr>
      <td className="calc-list__cat-modal-num calc-list__cat-modal-num--muted">{r.index ?? '—'}</td>
      {showList && <td className="calc-list__cat-modal-list">{r.listName}</td>}
      <td>
        {r.description || <span className="calc-list__cat-modal-empty-cell">—</span>}
        {r.note && <span className="calc-list__cat-modal-note">{r.note}</span>}
      </td>
      <td className="calc-list__cat-modal-list">{clf?.label ?? '—'}</td>
      <td className="calc-list__cat-modal-num">{fmtUsd(r.value || 0)}</td>
      <td className="calc-list__cat-modal-num calc-list__cat-modal-num--bold">{fmtUsd(r.total)}</td>
    </tr>
  )
}

function DetailTab({ rows, grouped }) {
  if (!rows.length) return <div className="calc-list__cat-modal-empty">Sin filas.</div>

  const groups = rows.reduce((acc, r) => {
    const g = acc.find((x) => x.listName === r.listName)
    if (g) g.rows.push(r)
    else acc.push({ listName: r.listName, listBudget: r.listBudget, rows: [r], total: 0 })
    return acc
  }, [])
  groups.forEach((g) => { g.total = g.rows.reduce((s, r) => s + r.total, 0) })

  return (
    <table className="calc-list__cat-modal-table">
      <thead>
        <tr>
          <th>#</th>
          {!grouped && <th>Lista</th>}
          <th>Descripción</th>
          <th>Clasificación</th>
          <th>Valor</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {grouped
          ? groups.map((g) => (
              <React.Fragment key={g.listName}>
                <tr className="calc-list__cat-modal-group-header">
                  <td colSpan={4}>
                    {g.listName}
                    {g.listBudget ? <span className="calc-list__cat-modal-group-budget">({fmtUsd(g.listBudget)})</span> : null}
                  </td>
                  <td className="calc-list__cat-modal-num calc-list__cat-modal-num--bold">{fmtUsd(g.total)}</td>
                </tr>
                {g.rows.map((r) => <DetailRow key={r.id} r={r} />)}
              </React.Fragment>
            ))
          : groups.flatMap((g) => g.rows).map((r) => <DetailRow key={r.id} r={r} showList />)
        }
      </tbody>
    </table>
  )
}

function NoteModal({ row, onClose, onSave }) {
  const [draft, setDraft] = useState(row.note ?? '')

  return (
    <div className="calc-list__note-modal-overlay" onClick={onClose}>
      <div className="calc-list__note-modal" onClick={(e) => e.stopPropagation()}>
        <div className="calc-list__note-modal-header">
          <span className="calc-list__note-modal-title">Nota</span>
          {row.description && (
            <span className="calc-list__note-modal-desc">{row.description}</span>
          )}
          <button className="calc-list__cat-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="calc-list__note-modal-body">
          <textarea
            className="calc-list__note-modal-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
            placeholder="Escribí una nota…"
            autoFocus
            rows={4}
          />
        </div>
        <div className="calc-list__note-modal-footer">
          <button className="calc-list__note-modal-cancel" onClick={onClose}>Cancelar</button>
          <button className="calc-list__note-modal-save" onClick={() => onSave(draft.trim())}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

function GroupTab({ groups: groupsData, grandTotal }) {
  const [openValue, setOpenValue] = useState(null)

  if (!groupsData.length) return <div className="calc-list__cat-modal-empty">Sin datos.</div>
  return (
    <table className="calc-list__cat-modal-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Total</th>
          <th>%</th>
        </tr>
      </thead>
      <tbody>
        {groupsData.map((g) => (
          <React.Fragment key={g.value}>
            <tr
              className="calc-list__cat-modal-group-row"
              onClick={() => setOpenValue(openValue === g.value ? null : g.value)}
            >
              <td>
                <span className={`calc-list__cat-modal-chevron${openValue === g.value ? ' calc-list__cat-modal-chevron--open' : ''}`}>›</span>
                {g.label}
              </td>
              <td className="calc-list__cat-modal-num calc-list__cat-modal-num--bold">{fmtUsd(g.total)}</td>
              <td className="calc-list__cat-modal-num calc-list__cat-modal-num--muted">
                {grandTotal ? `${((g.total / grandTotal) * 100).toFixed(1)}%` : '—'}
              </td>
            </tr>
            {openValue === g.value && g.rows.map((r) => (
              <tr key={r.id} className="calc-list__cat-modal-detail-row">
                <td className="calc-list__cat-modal-detail-desc">
                  <span className="calc-list__cat-modal-detail-indent" />
                  {r.listName} — {r.description || <span className="calc-list__cat-modal-empty-cell">—</span>}
                </td>
                <td className="calc-list__cat-modal-num">{fmtUsd(r.total)}</td>
                <td className="calc-list__cat-modal-num calc-list__cat-modal-num--muted">
                  {g.total ? `${((r.total / g.total) * 100).toFixed(1)}%` : '—'}
                </td>
              </tr>
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  )
}

const MODAL_TABS = ['Detallado', 'Por clasificación']

function CategoryModal({ cat, lists, onClose }) {
  const [tab, setTab] = useState(0)
  const [grouped, setGrouped] = useState(true)

  const rows = lists.flatMap((l) =>
    l.rows
      .filter((r) => (r.category || CALC_LIST_CATEGORIES[0].value) === cat.value)
      .map((r) => ({ ...r, listName: l.name, listBudget: l.budget ?? null, total: (r.quantity || 0) * (r.value || 0) }))
  ).sort((a, b) => (a.index ?? Infinity) - (b.index ?? Infinity))
  const grandTotal = rows.reduce((s, r) => s + r.total, 0)
  const byClassification = groupBy(rows, 'classification', CALC_LIST_CLASSIFICATIONS)

  return (
    <div className="calc-list__cat-modal-overlay" onClick={onClose}>
      <div className="calc-list__cat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="calc-list__cat-modal-header">
          <span className="calc-list__cat-modal-title">{cat.label}</span>
          <span className="calc-list__cat-modal-total">{fmtUsd(grandTotal)}</span>
          <button className="calc-list__cat-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="calc-list__cat-modal-tabs">
          {MODAL_TABS.map((t, i) => (
            <button
              key={t}
              className={`calc-list__cat-modal-tab${tab === i ? ' calc-list__cat-modal-tab--active' : ''}`}
              onClick={() => setTab(i)}
            >{t}</button>
          ))}
          {tab === 0 && (
            <label className="calc-list__cat-modal-group-toggle">
              <input
                type="checkbox"
                checked={grouped}
                onChange={(e) => setGrouped(e.target.checked)}
              />
              Agrupar
            </label>
          )}
        </div>
        <div className="calc-list__cat-modal-body">
          {tab === 0 && <DetailTab rows={rows} grouped={grouped} />}
          {tab === 1 && <GroupTab groups={byClassification} grandTotal={grandTotal} />}
        </div>
      </div>
    </div>
  )
}

function Summary({ lists, orderedIds }) {
  const rows = lists.map((l) => ({
    id: l.id,
    name: l.name,
    total: l.rows.reduce((s, r) => s + (r.quantity || 0) * (r.value || 0), 0),
    budget: l.budget ?? null,
    items: l.rows.length,
  }))

  const grandTotal = rows.reduce((s, r) => s + r.total, 0)
  const totalBudget = rows.reduce((s, r) => s + (r.budget || 0), 0)
  const budgeted = rows.filter((r) => r.budget)
  const delta = budgeted.length
    ? budgeted.reduce((s, r) => s + r.total - r.budget, 0)
    : null

  const ordered = orderedIds.map((id) => rows.find((r) => r.id === id)).filter(Boolean)

  const byCategory = CALC_LIST_CATEGORIES.map((cat) => ({
    ...cat,
    total: lists.reduce((s, l) =>
      s + l.rows
        .filter((r) => (r.category || CALC_LIST_CATEGORIES[0].value) === cat.value)
        .reduce((rs, r) => rs + (r.quantity || 0) * (r.value || 0), 0)
    , 0),
  }))

  const [modalCat, setModalCat] = useState(null)

  if (!lists.length) return null

  return (
    <div className="calc-list__summary">
      {modalCat && <CategoryModal cat={modalCat} lists={lists} onClose={() => setModalCat(null)} />}
      <div className="calc-list__summary-stats">
        <div className="calc-list__stat">
          <span className="calc-list__stat-label">Listas</span>
          <span className="calc-list__stat-value">{lists.length}</span>
        </div>
        <div className="calc-list__stat">
          <span className="calc-list__stat-label">Total</span>
          <span className="calc-list__stat-value">{totalBudget ? fmtUsd(totalBudget) : '—'}</span>
        </div>
        <div className="calc-list__stat">
          <span className="calc-list__stat-label">Total general</span>
          <span className="calc-list__stat-value calc-list__stat-value--primary">{fmtUsd(grandTotal)}</span>
        </div>
        {delta !== null && (
          <div className="calc-list__stat">
            <span className="calc-list__stat-label">vs Presupuesto</span>
            <span className={`calc-list__stat-value calc-list__stat-value--${delta > 0 ? 'danger' : 'success'}`}>
              {delta > 0 ? '+' : ''}{fmtUsd(delta)}
            </span>
          </div>
        )}
      </div>

      <div className="calc-list__category-totals">
        {byCategory.filter((cat) => cat.total > 0).map((cat) => (
          <div key={cat.value} className="calc-list__category-total calc-list__category-total--clickable" onClick={() => setModalCat(cat)}>
            <span className="calc-list__category-total-label">{cat.label}</span>
            <span className="calc-list__category-total-value">{fmtUsd(cat.total)}</span>
          </div>
        ))}
      </div>

      <div className="calc-list__breakdown">
        {ordered.map((r) => {
          const pct = r.budget ? Math.min(r.total / r.budget, 1) * 100 : null
          const over = r.budget && r.total > r.budget
          return (
            <div key={r.id} className="calc-list__breakdown-row">
              <span className="calc-list__breakdown-name">{r.name}</span>
              <div className="calc-list__breakdown-bar-wrap">
                {pct !== null && (
                  <div
                    className={`calc-list__breakdown-bar calc-list__breakdown-bar--${over ? 'danger' : 'success'}`}
                    style={{ width: `${pct}%` }}
                  />
                )}
              </div>
              <span className="calc-list__breakdown-total">{fmtUsd(r.total)}</span>
              {r.budget ? (
                <span className="calc-list__breakdown-budget">/ {fmtUsd(r.budget)}</span>
              ) : (
                <span className="calc-list__breakdown-budget calc-list__breakdown-budget--empty">—</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GroupTabBar({ group, active, dragging, dragOver, onSelect, onDelete, onClone, onRename, onDragStart, onDragOver, onDrop, onDragEnd }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)

  const startEdit = (e) => {
    e.stopPropagation()
    setDraft(group.name)
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const commit = () => {
    const name = draft.trim()
    if (name && name !== group.name) onRename(group.id, name)
    setEditing(false)
  }

  return (
    <div
      className={[
        'calc-list__group',
        active ? 'calc-list__group--active' : '',
        dragging ? 'calc-list__group--dragging' : '',
        dragOver ? 'calc-list__group--drag-over' : '',
      ].filter(Boolean).join(' ')}
      draggable={!editing}
      onDragStart={() => onDragStart(group.id)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(group.id) }}
      onDrop={(e) => { e.preventDefault(); onDrop(group.id) }}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(group.id)}
      onDoubleClick={startEdit}
      title="Doble click para renombrar, arrastrar para reordenar"
    >
      {editing ? (
        <input
          ref={inputRef}
          className="calc-list__group-name-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="calc-list__group-name">{group.name}</span>
      )}
      <button
        className="calc-list__group-clone"
        onClick={(e) => { e.stopPropagation(); onClone(group.id) }}
        title="Clonar grupo"
      >⧉</button>
      <button
        className="calc-list__group-delete"
        onClick={(e) => { e.stopPropagation(); onDelete(group.id) }}
        title="Eliminar grupo"
      >×</button>
    </div>
  )
}

function Tab({ list, active, dragging, dragOver, onSelect, onDelete, onRename, onDragStart, onDragOver, onDrop, onDragEnd }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)

  const startEdit = (e) => {
    e.stopPropagation()
    setDraft(list.name)
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const commit = () => {
    const name = draft.trim()
    if (name && name !== list.name) onRename(list.id, name)
    setEditing(false)
  }

  return (
    <div
      className={[
        'calc-list__tab',
        active ? 'calc-list__tab--active' : '',
        dragging ? 'calc-list__tab--dragging' : '',
        dragOver ? 'calc-list__tab--drag-over' : '',
      ].filter(Boolean).join(' ')}
      draggable={!editing}
      onDragStart={() => onDragStart(list.id)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(list.id) }}
      onDrop={(e) => { e.preventDefault(); onDrop(list.id) }}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(list.id)}
      onDoubleClick={startEdit}
      title="Doble click para renombrar, arrastrar para reordenar"
    >
      {editing ? (
        <input
          ref={inputRef}
          className="calc-list__tab-name-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="calc-list__tab-name">{list.name}</span>
      )}
      <button
        className="calc-list__tab-delete"
        onClick={(e) => { e.stopPropagation(); onDelete(list.id) }}
        title="Eliminar lista"
      >×</button>
    </div>
  )
}

export default function CalcList() {
  const dispatch = useDispatch()
  const groups       = useSelector((s) => s.calcList.groups)
  const activeGroupId = useSelector((s) => s.calcList.activeGroupId)
  const activeListId  = useSelector((s) => s.calcList.activeListId)
  const activeGroup = groups.find((g) => g.id === activeGroupId)
  const activeList  = activeGroup?.items.find((l) => l.id === activeListId)

  const [syncOpen, setSyncOpen] = useState(false)
  const [noteRow, setNoteRow]   = useState(null)
  const importInputRef = useRef(null)

  const [dragGroupId, setDragGroupId]         = useState(null)
  const [dragOverGroupId, setDragOverGroupId] = useState(null)
  const [dragTabId, setDragTabId]             = useState(null)
  const [dragOverTabId, setDragOverTabId]     = useState(null)

  const [orderedGroupIds, setOrderedGroupIds] = useState(() => groups.map((g) => g.id))
  const [orderedListIds, setOrderedListIds]   = useState(() => {
    const items = activeGroup?.items ?? []
    return [...items].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)).map((l) => l.id)
  })

  const { myId, status, error, connectTo } = usePeerSync()

  useEffect(() => { dispatch(a.loadRequest()) }, [dispatch])

  useEffect(() => {
    setOrderedGroupIds((prev) => {
      const current = groups.map((g) => g.id)
      return [
        ...prev.filter((id) => current.includes(id)),
        ...current.filter((id) => !prev.includes(id)),
      ]
    })
  }, [groups])

  useEffect(() => {
    const items = activeGroup?.items ?? []
    const sorted = [...items].sort((x, y) => (x.order ?? Infinity) - (y.order ?? Infinity))
    setOrderedListIds((prev) => {
      const current = sorted.map((l) => l.id)
      return [
        ...prev.filter((id) => current.includes(id)),
        ...current.filter((id) => !prev.includes(id)),
      ]
    })
  }, [activeGroupId, groups])

  const handleAddGroup = () => {
    dispatch(a.createGroupRequest(`Grupo ${groups.length + 1}`))
  }

  const handleAddList = () => {
    if (!activeGroup) return
    dispatch(a.createListRequest({ groupId: activeGroupId, name: `Lista ${activeGroup.items.length + 1}` }))
  }

  const handleRowChange = (rowId, field, value) => {
    if (!activeList) return
    const row = activeList.rows.find((r) => r.id === rowId)
    if (!row) return
    dispatch(a.saveRowRequest({ groupId: activeGroupId, listId: activeListId, row: { ...row, [field]: value } }))
  }

  const handleRowAdd = () => {
    if (!activeList) return
    const nextIndex = activeList.rows.length
      ? Math.max(...activeList.rows.map((r) => r.index ?? 0)) + 1
      : 1
    dispatch(a.saveRowRequest({
      groupId: activeGroupId,
      listId: activeListId,
      row: {
        id: crypto.randomUUID(),
        index: nextIndex,
        description: '',
        category: CALC_LIST_CATEGORIES[0].value,
        classification: CALC_LIST_CLASSIFICATIONS[0].value,
        quantity: 1,
        value: 0,
      },
    }))
  }

  const handleRowReorder = (reorderedIds) => {
    if (!activeList) return
    dispatch(a.reorderRowsRequest({ groupId: activeGroupId, listId: activeListId, orderedIds: reorderedIds }))
  }

  const handleRowDelete = (rowId) => {
    dispatch(a.deleteRowRequest({ groupId: activeGroupId, listId: activeListId, rowId }))
  }

  const handleRowNote = (rowId) => {
    if (!activeList) return
    setNoteRow(activeList.rows.find((r) => r.id === rowId) ?? null)
  }

  const handleNoteSave = (note) => {
    if (!noteRow) return
    dispatch(a.saveRowRequest({ groupId: activeGroupId, listId: activeListId, row: { ...noteRow, note: note || undefined } }))
    setNoteRow(null)
  }

  const handleBudget = (budget) => {
    dispatch(a.updateListRequest({ groupId: activeGroupId, id: activeListId, name: activeList.name, budget }))
  }

  const handleGroupReorder = useCallback((fromId, toId) => {
    if (fromId === toId) return
    setOrderedGroupIds((prev) => {
      const next = [...prev]
      const from = next.indexOf(fromId)
      const to   = next.indexOf(toId)
      next.splice(from, 1)
      next.splice(to, 0, fromId)
      next.forEach((id, order) => {
        const g = groups.find((g) => g.id === id)
        if (g) dispatch(a.updateGroupRequest({ id, name: g.name, order }))
      })
      return next
    })
  }, [groups, dispatch])

  const handleListReorder = useCallback((fromId, toId) => {
    if (fromId === toId) return
    setOrderedListIds((prev) => {
      const next = [...prev]
      const from = next.indexOf(fromId)
      const to   = next.indexOf(toId)
      next.splice(from, 1)
      next.splice(to, 0, fromId)
      next.forEach((id, order) => {
        const l = activeGroup?.items.find((l) => l.id === id)
        if (l) dispatch(a.updateListRequest({ groupId: activeGroupId, id, name: l.name, order }))
      })
      return next
    })
  }, [activeGroup, activeGroupId, dispatch])

  const handleExport = () => {
    const json = JSON.stringify(groups, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href     = url
    link.download = `calc-lists-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImportFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        if (!Array.isArray(parsed)) throw new Error('El archivo no contiene un array de grupos.')
        const valid = parsed.every(
          (g) => typeof g.id === 'string' && typeof g.name === 'string' && Array.isArray(g.items) &&
                 g.items.every((l) => typeof l.id === 'string' && Array.isArray(l.rows))
        )
        if (!valid) throw new Error('Formato inválido.')
        if (!window.confirm(`¿Reemplazar todos los datos con los ${parsed.length} grupos del archivo?`)) return
        dispatch(a.importRequest(parsed))
      } catch (err) {
        dispatch(notify({ type: 'error', message: `Error al importar: ${err.message}` }))
      }
    }
    reader.readAsText(file)
  }

  const allLists = orderedGroupIds.flatMap((gid) => {
    const g = groups.find((g) => g.id === gid)
    return g ? [...g.items].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)) : []
  })
  const allListIds = allLists.map((l) => l.id)

  return (
    <div className="calc-list">
      {noteRow && (
        <NoteModal row={noteRow} onClose={() => setNoteRow(null)} onSave={handleNoteSave} />
      )}
      {syncOpen && (
        <SyncModal myId={myId} status={status} error={error} onConnect={connectTo} onClose={() => setSyncOpen(false)} />
      )}

      <div className="calc-list__groups">
        {orderedGroupIds.map((id) => {
          const group = groups.find((g) => g.id === id)
          if (!group) return null
          return (
            <GroupTabBar
              key={group.id}
              group={group}
              active={group.id === activeGroupId}
              dragging={dragGroupId === group.id}
              dragOver={dragOverGroupId === group.id}
              onSelect={(id) => dispatch(a.setActiveGroup(id))}
              onDelete={(id) => dispatch(a.deleteGroupRequest(id))}
              onClone={(id) => dispatch(a.cloneGroupRequest(id))}
              onRename={(id, name) => dispatch(a.updateGroupRequest({ id, name }))}
              onDragStart={setDragGroupId}
              onDragOver={setDragOverGroupId}
              onDrop={(toId) => { handleGroupReorder(dragGroupId, toId); setDragGroupId(null); setDragOverGroupId(null) }}
              onDragEnd={() => { setDragGroupId(null); setDragOverGroupId(null) }}
            />
          )
        })}
        <button className="calc-list__add-group" onClick={handleAddGroup} title="Nuevo grupo">
          + Grupo
        </button>
      </div>

      <div className="calc-list__tabs">
        {orderedListIds.map((id) => {
          const list = activeGroup?.items.find((l) => l.id === id)
          if (!list) return null
          return (
            <Tab
              key={list.id}
              list={list}
              active={list.id === activeListId}
              dragging={dragTabId === list.id}
              dragOver={dragOverTabId === list.id}
              onSelect={(id) => dispatch(a.setActive(id))}
              onDelete={(id) => dispatch(a.deleteListRequest({ groupId: activeGroupId, listId: id }))}
              onRename={(id, name) => dispatch(a.updateListRequest({ groupId: activeGroupId, id, name }))}
              onDragStart={setDragTabId}
              onDragOver={setDragOverTabId}
              onDrop={(toId) => { handleListReorder(dragTabId, toId); setDragTabId(null); setDragOverTabId(null) }}
              onDragEnd={() => { setDragTabId(null); setDragOverTabId(null) }}
            />
          )
        })}
        <button className="calc-list__add-tab" onClick={handleAddList} title="Nueva lista" disabled={!activeGroup}>+</button>
        <button className="calc-list__export-btn" onClick={handleExport} title="Exportar a JSON">↓</button>
        <button className="calc-list__import-btn" onClick={() => importInputRef.current?.click()} title="Importar desde JSON">↑</button>
        <input
          ref={importInputRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={handleImportFile}
        />
        <button className="calc-list__sync-btn" onClick={() => setSyncOpen(true)} title="Sincronizar con otro dispositivo">
          ⇄
        </button>
      </div>

      <div className="calc-list__content">
        {!activeGroup ? (
          <div className="calc-list__empty-state">
            <span>No hay grupos. Crea uno para empezar.</span>
            <button className="calc-list__new-btn" onClick={handleAddGroup}>+ Nuevo grupo</button>
          </div>
        ) : !activeList ? (
          <div className="calc-list__empty-state">
            <span>No hay listas en este grupo.</span>
            <button className="calc-list__new-btn" onClick={handleAddList}>+ Nueva lista</button>
          </div>
        ) : (
          <EditableTable
            columns={COLUMNS}
            rows={[...activeList.rows].sort((a, b) => (a.index ?? Infinity) - (b.index ?? Infinity))}
            keyExpr="id"
            totalColumn="total"
            onRowChange={handleRowChange}
            onRowAdd={handleRowAdd}
            onRowDelete={handleRowDelete}
            onRowReorder={handleRowReorder}
            onRowNote={handleRowNote}
            budget={activeList.budget}
            onBudgetChange={handleBudget}
            emptyText="Sin filas. Agregá una con el botón de abajo."
          />
        )}
      </div>

      <Summary lists={allLists} orderedIds={allListIds} />
    </div>
  )
}
