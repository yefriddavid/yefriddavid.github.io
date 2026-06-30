import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilPencil } from '@coreui/icons'
import * as actions from 'src/actions/misc/noteActions'
import Spinner from 'src/components/shared/Spinner'
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
  const { data, fetching } = useSelector((s) => s.note)

  useEffect(() => {
    if (!data) dispatch(actions.fetchRequest())
  }, [dispatch, data])

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
        {note.mode === 'table' ? (
          <NoteTableFull
            note={note}
            onToggleCheck={handleToggleCheck}
            onCellChange={handleCellChange}
          />
        ) : note.mode === 'checklist' ? (
          <NoteChecklistFull note={note} onToggle={handleToggleChecklist} />
        ) : (
          <div className="nfp__html ql-editor" dangerouslySetInnerHTML={{ __html: note.content }} />
        )}
      </div>
    </div>
  )
}

const NoteTableFull = ({ note, onToggleCheck, onCellChange }) => {
  const rows = toTableRows(note.content)
  if (rows.length < 2) return null
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
    <table className="nfp__table">
      <thead>
        <tr>
          {head.map((c, i) => (
            <th key={i}>{stripPfx(c)}</th>
          ))}
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
              ) : types[ci] === 'number' || types[ci] === 'decimal' || types[ci] === 'currency' ? (
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
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const NoteChecklistFull = ({ note, onToggle }) => {
  const items = parseChecklist(note.content)
  const done = items.filter((i) => i.done).length
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
        </div>
      ))}
    </div>
  )
}

export default NoteFullPage
