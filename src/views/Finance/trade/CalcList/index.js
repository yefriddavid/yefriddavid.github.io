import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import EditableTable from 'src/components/shared/EditableTable'
import * as a from 'src/actions/finance/calcListActions'
import { fmtUsd } from '../tradeUtils'
import { CALC_LIST_CATEGORIES } from 'src/constants/finance'
import usePeerSync from './usePeerSync'
import SyncModal from './SyncModal'
import './CalcList.scss'

const COLUMNS = [
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'category', label: 'Category', type: 'select', options: CALC_LIST_CATEGORIES, width: 110 },
  { key: 'quantity', label: 'Qty', type: 'number', width: 90 },
  { key: 'value', label: 'Value', type: 'number', width: 120 },
  {
    key: 'total',
    label: 'Total',
    type: 'calc',
    width: 130,
    calc: (row) => (row.quantity || 0) * (row.value || 0),
    format: fmtUsd,
  },
]

function CategoryModal({ cat, lists, onClose }) {
  const rows = lists.flatMap((l) =>
    l.rows
      .filter((r) => (r.category || CALC_LIST_CATEGORIES[0].value) === cat.value)
      .map((r) => ({ ...r, listName: l.name, total: (r.quantity || 0) * (r.value || 0) }))
  )
  const grandTotal = rows.reduce((s, r) => s + r.total, 0)

  return (
    <div className="calc-list__cat-modal-overlay" onClick={onClose}>
      <div className="calc-list__cat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="calc-list__cat-modal-header">
          <span className="calc-list__cat-modal-title">{cat.label}</span>
          <span className="calc-list__cat-modal-total">{fmtUsd(grandTotal)}</span>
          <button className="calc-list__cat-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="calc-list__cat-modal-body">
          {rows.length === 0 ? (
            <div className="calc-list__cat-modal-empty">Sin filas en esta categoría.</div>
          ) : (
            <table className="calc-list__cat-modal-table">
              <thead>
                <tr>
                  <th>Lista</th>
                  <th>Descripción</th>
                  <th>Cant.</th>
                  <th>Valor</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="calc-list__cat-modal-list">{r.listName}</td>
                    <td>{r.description || <span className="calc-list__cat-modal-empty-cell">—</span>}</td>
                    <td className="calc-list__cat-modal-num">{r.quantity ?? 1}</td>
                    <td className="calc-list__cat-modal-num">{fmtUsd(r.value || 0)}</td>
                    <td className="calc-list__cat-modal-num calc-list__cat-modal-num--bold">{fmtUsd(r.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
  const lists = useSelector((s) => s.calcList.lists)
  const activeId = useSelector((s) => s.calcList.activeId)
  const activeList = lists.find((l) => l.id === activeId)
  const [syncOpen, setSyncOpen] = useState(false)
  const [dragTabId, setDragTabId] = useState(null)
  const [dragOverTabId, setDragOverTabId] = useState(null)
  const [orderedIds, setOrderedIds] = useState(() => lists.map((l) => l.id))
  const { myId, status, error, connectTo } = usePeerSync()

  useEffect(() => { dispatch(a.loadRequest()) }, [dispatch])

  // sync orderedIds when lists change externally (create / delete / merge)
  useEffect(() => {
    setOrderedIds((prev) => {
      const current = lists.map((l) => l.id)
      return [
        ...prev.filter((id) => current.includes(id)),
        ...current.filter((id) => !prev.includes(id)),
      ]
    })
  }, [lists])

  const handleAddList = () => {
    dispatch(a.createListRequest(`Lista ${lists.length + 1}`))
  }

  const handleRowChange = (rowId, field, value) => {
    if (!activeList) return
    const row = activeList.rows.find((r) => r.id === rowId)
    if (!row) return
    dispatch(a.saveRowRequest({ listId: activeId, row: { ...row, [field]: value } }))
  }

  const handleRowAdd = () => {
    if (!activeList) return
    dispatch(a.saveRowRequest({
      listId: activeId,
      row: { id: crypto.randomUUID(), description: '', category: CALC_LIST_CATEGORIES[0].value, quantity: 1, value: 0 },
    }))
  }

  const handleRowDelete = (rowId) => {
    dispatch(a.deleteRowRequest({ listId: activeId, rowId }))
  }

  const handleBudget = (budget) => {
    dispatch(a.updateListRequest({ id: activeId, name: activeList.name, budget }))
  }

  const handleReorder = useCallback((fromId, toId) => {
    if (fromId === toId) return
    setOrderedIds((prev) => {
      const next = [...prev]
      const from = next.indexOf(fromId)
      const to = next.indexOf(toId)
      next.splice(from, 1)
      next.splice(to, 0, fromId)
      next.forEach((id, order) => {
        const list = lists.find((l) => l.id === id)
        if (list) dispatch(a.updateListRequest({ id, name: list.name, order }))
      })
      return next
    })
  }, [lists, dispatch])

  return (
    <div className="calc-list">
      {syncOpen && (
        <SyncModal
          myId={myId}
          status={status}
          error={error}
          onConnect={connectTo}
          onClose={() => setSyncOpen(false)}
        />
      )}
      <div className="calc-list__tabs">
        {orderedIds.map((id) => {
          const list = lists.find((l) => l.id === id)
          if (!list) return null
          return (
            <Tab
              key={list.id}
              list={list}
              active={list.id === activeId}
              dragging={dragTabId === list.id}
              dragOver={dragOverTabId === list.id}
              onSelect={(id) => dispatch(a.setActive(id))}
              onDelete={(id) => dispatch(a.deleteListRequest(id))}
              onRename={(id, name) => dispatch(a.updateListRequest({ id, name }))}
              onDragStart={setDragTabId}
              onDragOver={setDragOverTabId}
              onDrop={(toId) => { handleReorder(dragTabId, toId); setDragTabId(null); setDragOverTabId(null) }}
              onDragEnd={() => { setDragTabId(null); setDragOverTabId(null) }}
            />
          )
        })}
        <button className="calc-list__add-tab" onClick={handleAddList} title="Nueva lista">+</button>
        <button className="calc-list__sync-btn" onClick={() => setSyncOpen(true)} title="Sincronizar con otro dispositivo">
          ⇄
        </button>
      </div>

      <div className="calc-list__content">
        {!activeList ? (
          <div className="calc-list__empty-state">
            <span>No hay listas. Crea una para empezar.</span>
            <button className="calc-list__new-btn" onClick={handleAddList}>+ Nueva lista</button>
          </div>
        ) : (
          <EditableTable
            columns={COLUMNS}
            rows={activeList.rows}
            keyExpr="id"
            totalColumn="total"
            onRowChange={handleRowChange}
            onRowAdd={handleRowAdd}
            onRowDelete={handleRowDelete}
            budget={activeList.budget}
            onBudgetChange={handleBudget}
            emptyText="Sin filas. Agregá una con el botón de abajo."
          />
        )}
      </div>

      <Summary lists={lists} orderedIds={orderedIds} />
    </div>
  )
}
