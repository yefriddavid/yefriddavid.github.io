import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import EditableTable from 'src/components/shared/EditableTable'
import * as a from 'src/actions/finance/calcListActions'
import { fmtUsd } from '../tradeUtils'
import './CalcList.scss'

const COLUMNS = [
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'quantity', label: 'Qty', type: 'number', width: 100 },
  { key: 'value', label: 'Value', type: 'number', width: 130 },
  {
    key: 'total',
    label: 'Total',
    type: 'calc',
    width: 140,
    calc: (row) => (row.quantity || 0) * (row.value || 0),
    format: fmtUsd,
  },
]

function Tab({ list, active, onSelect, onDelete, onRename }) {
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
      className={`calc-list__tab${active ? ' calc-list__tab--active' : ''}`}
      onClick={() => onSelect(list.id)}
      onDoubleClick={startEdit}
      title="Doble click para renombrar"
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

  useEffect(() => { dispatch(a.loadRequest()) }, [dispatch])

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
      row: { id: crypto.randomUUID(), description: '', quantity: 1, value: 0 },
    }))
  }

  const handleRowDelete = (rowId) => {
    dispatch(a.deleteRowRequest({ listId: activeId, rowId }))
  }

  return (
    <div className="calc-list">
      <div className="calc-list__tabs">
        {lists.map((list) => (
          <Tab
            key={list.id}
            list={list}
            active={list.id === activeId}
            onSelect={(id) => dispatch(a.setActive(id))}
            onDelete={(id) => dispatch(a.deleteListRequest(id))}
            onRename={(id, name) => dispatch(a.renameListRequest({ id, name }))}
          />
        ))}
        <button className="calc-list__add-tab" onClick={handleAddList} title="Nueva lista">+</button>
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
            emptyText="Sin filas. Agregá una con el botón de abajo."
          />
        )}
      </div>
    </div>
  )
}
