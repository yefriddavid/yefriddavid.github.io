import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilPencil, cilPlus, cilTrash } from '@coreui/icons'
import * as actions from 'src/actions/misc/noteActions'
import Spinner from 'src/components/shared/Spinner'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import './NoteFullPage.scss'

const toTableRows = (content) => {
  if (Array.isArray(content)) return content
  if (!content) return []
  try {
    return JSON.parse(content)
  } catch {
    return []
  }
}

const parseChecklist = (content) => {
  if (!content?.trim()) return []
  try {
    return JSON.parse(content)
  } catch {
    return []
  }
}

const serializeChecklist = (items) => JSON.stringify(items)

const NoteFullPage = () => {
  const { noteId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const activeTenantId = useActiveTenantId()
  const { data, fetching } = useSelector((s) => s.note)

  useEffect(() => {
    dispatch(actions.fetchRequest())
  }, [dispatch, activeTenantId])

  const note = (data ?? []).find((n) => n.id === noteId)

  const handleToggleCheck = (ri, ci, val) => {
    const rows = toTableRows(note.content)
    const updated = rows.map((row, r) =>
      r === ri + 1 ? row.map((cell, c) => (c === ci ? val : cell)) : row,
    )
    dispatch(actions.updateRequest({ id: note.id, content: JSON.stringify(updated) }))
  }

  const handleCellChange = (ri, ci, val) => {
    const rows = toTableRows(note.content)
    const updated = rows.map((row, r) =>
      r === ri + 1 ? row.map((cell, c) => (c === ci ? val : cell)) : row,
    )
    dispatch(actions.updateRequest({ id: note.id, content: JSON.stringify(updated) }))
  }

  const handleToggleChecklist = (index) => {
    const items = parseChecklist(note.content)
    const updated = items.map((item, i) => (i === index ? { ...item, done: !item.done } : item))
    dispatch(actions.updateRequest({ id: note.id, content: serializeChecklist(updated) }))
  }

  const handleAddRow = () => {
    const rows = toTableRows(note.content)
    const colCount = rows[0]?.length ?? 1
    dispatch(
      actions.updateRequest({
        id: note.id,
        content: JSON.stringify([...rows, new Array(colCount).fill('')]),
      }),
    )
  }

  const handleAddChecklistItem = (text) => {
    const items = parseChecklist(note.content)
    dispatch(
      actions.updateRequest({
        id: note.id,
        content: serializeChecklist([...items, { text, done: false }]),
      }),
    )
  }

  const handleRemoveRow = (ri) => {
    const rows = toTableRows(note.content)
    const updated = rows.filter((_, r) => r !== ri + 1)
    dispatch(actions.updateRequest({ id: note.id, content: JSON.stringify(updated) }))
  }

  const handleRemoveChecklistItem = (index) => {
    const items = parseChecklist(note.content)
    const updated = items.filter((_, i) => i !== index)
    dispatch(actions.updateRequest({ id: note.id, content: serializeChecklist(updated) }))
  }

  if (fetching && !note) return <Spinner mode="page" />
  if (!note)
    return (
      <div className="nfp">
        <div className="nfp__not-found">Nota no encontrada.</div>
      </div>
    )

  return (
    <div className="nfp" style={{ '--note-bg': note.color || '#fff' }}>
      <div className="nfp__bar">
        <button className="nfp__back" onClick={() => navigate(-1)}>
          <CIcon icon={cilArrowLeft} />
        </button>
        <h1 className="nfp__title">{note.title || <em>Sin título</em>}</h1>
        <button className="nfp__edit" onClick={() => navigate(`/miscelanea/notes?edit=${noteId}`)}>
          <CIcon icon={cilPencil} />
        </button>
      </div>

      <div className="nfp__content">
        {note.private ? (
          <div className="nfp__hidden">🔒 Contenido oculto — edita la nota para verlo</div>
        ) : note.mode === 'table' ? (
          <>
            <NoteTableFull
              note={note}
              onToggleCheck={handleToggleCheck}
              onCellChange={handleCellChange}
              onAddRow={handleAddRow}
              onRemoveRow={handleRemoveRow}
            />
            {note.body && (
              <div
                className="nfp__table-body ql-editor"
                dangerouslySetInnerHTML={{ __html: note.body }}
              />
            )}
          </>
        ) : note.mode === 'checklist' ? (
          <NoteChecklistFull
            note={note}
            onToggle={handleToggleChecklist}
            onAdd={handleAddChecklistItem}
            onRemove={handleRemoveChecklistItem}
          />
        ) : (
          <div className="nfp__html ql-editor" dangerouslySetInnerHTML={{ __html: note.content }} />
        )}
      </div>
    </div>
  )
}

const NoteTableFull = ({ note, onToggleCheck, onCellChange, onAddRow, onRemoveRow }) => {
  const rows = toTableRows(note.content)
  if (rows.length < 1) return null
  const [head, ...body] = rows

  const getType = (h) => {
    const parts = (h || '').split(':')
    for (const p of parts) {
      const l = p.toLowerCase()
      if (['string', 'number', 'decimal', 'date', 'checkbox'].includes(l)) return l
      if (l.startsWith('select(')) return 'select'
      if (l.startsWith('currency(')) return 'currency'
    }
    return 'string'
  }

  const getOptions = (h) => {
    const parts = (h || '').split(':')
    const p = parts.find((s) => s.toLowerCase().startsWith('select(') && s.endsWith(')'))
    if (!p) return []
    return p
      .slice(p.indexOf('(') + 1, -1)
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean)
  }

  const stripPfx = (h) => {
    const known = ['sum', 'max', 'min', 'avg', 'string', 'number', 'decimal', 'date', 'checkbox']
    const parts = (h || '').split(':')
    let i = 0
    while (
      i < parts.length &&
      (known.includes(parts[i]) ||
        parts[i].toLowerCase().startsWith('select(') ||
        parts[i].toLowerCase().startsWith('currency('))
    )
      i++
    return parts.slice(i).join(':') || h
  }

  const types = head.map(getType)

  return (
    <div className="nfp__table-wrap">
      <table className="nfp__table">
        <thead>
          <tr>
            {head.map((c, i) => (
              <th key={i}>{stripPfx(c)}</th>
            ))}
            <th className="nfp__table-actions-head" />
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri}>
              {row.map((c, ci) =>
                types[ci] === 'checkbox' ? (
                  <td key={ci} className="nfp__table-check">
                    <input
                      type="checkbox"
                      checked={c === 'true'}
                      onChange={(e) => onToggleCheck(ri, ci, e.target.checked ? 'true' : 'false')}
                    />
                  </td>
                ) : types[ci] === 'select' ? (
                  <td key={ci} className="nfp__table-cell">
                    <select
                      className="nfp__cell-input"
                      defaultValue={c}
                      onChange={(e) => onCellChange(ri, ci, e.target.value)}
                    >
                      <option value="">—</option>
                      {getOptions(head[ci]).map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </td>
                ) : types[ci] === 'date' ? (
                  <td key={ci} className="nfp__table-cell">
                    <input
                      className="nfp__cell-input"
                      type="date"
                      defaultValue={c}
                      onBlur={(e) => onCellChange(ri, ci, e.target.value)}
                    />
                  </td>
                ) : types[ci] === 'number' ||
                  types[ci] === 'decimal' ||
                  types[ci] === 'currency' ? (
                  <td key={ci} className="nfp__table-cell nfp__table-cell--num">
                    <input
                      className="nfp__cell-input nfp__cell-input--num"
                      type="number"
                      step={types[ci] === 'number' ? '1' : '0.01'}
                      defaultValue={c}
                      onBlur={(e) => onCellChange(ri, ci, e.target.value)}
                    />
                  </td>
                ) : (
                  <td key={ci} className="nfp__table-cell">
                    <input
                      className="nfp__cell-input"
                      type="text"
                      defaultValue={c}
                      onBlur={(e) => onCellChange(ri, ci, e.target.value)}
                    />
                  </td>
                ),
              )}
              <td className="nfp__table-actions">
                <button
                  type="button"
                  className="nfp__table-rm-btn"
                  onClick={() => onRemoveRow(ri)}
                  title="Eliminar fila"
                >
                  <CIcon icon={cilTrash} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="nfp__table-add-row" onClick={onAddRow}>
        <CIcon icon={cilPlus} /> Agregar fila
      </button>
    </div>
  )
}

const NoteChecklistFull = ({ note, onToggle, onAdd, onRemove }) => {
  const [newText, setNewText] = useState('')
  const items = parseChecklist(note.content)
  const done = items.filter((i) => i.done).length

  const submitAdd = () => {
    const text = newText.trim()
    if (!text) return
    onAdd(text)
    setNewText('')
  }

  return (
    <div className="nfp__checklist">
      <div className="nfp__checklist-progress">
        {done}/{items.length} completados
      </div>
      {items.map((item, i) => (
        <div
          key={i}
          className={`nfp__checklist-item${item.done ? ' nfp__checklist-item--done' : ''}`}
          onClick={() => onToggle(i)}
        >
          <span className="nfp__checklist-mark">{item.done ? '✓' : '○'}</span>
          <span className="nfp__checklist-text">{item.text || <em>sin texto</em>}</span>
          <button
            type="button"
            className="nfp__checklist-rm-btn"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(i)
            }}
            title="Eliminar ítem"
          >
            <CIcon icon={cilTrash} />
          </button>
        </div>
      ))}
      <div className="nfp__checklist-add">
        <input
          className="nfp__checklist-add-input"
          value={newText}
          placeholder="Nuevo ítem…"
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              submitAdd()
            }
          }}
        />
        <button type="button" className="nfp__checklist-add-btn" onClick={submitAdd}>
          <CIcon icon={cilPlus} />
        </button>
      </div>
    </div>
  )
}

export default NoteFullPage
