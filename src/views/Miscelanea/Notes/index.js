import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilX, cilSave, cilFullscreen, cilStorage, cilActionUndo } from '@coreui/icons'
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import * as actions from 'src/actions/misc/noteActions'
import Spinner from 'src/components/shared/Spinner'
import './Notes.scss'

const IconClone = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="0.5" width="10" height="10" rx="2" />
    <rect x="0.5" y="3" width="10" height="10" rx="2" fill="var(--note-bg, var(--cui-body-bg, #fff))" />
  </svg>
)

const NOTE_COLORS = [
  { value: '#ffffff', label: 'Blanco' },
  { value: '#fef9c3', label: 'Amarillo' },
  { value: '#dcfce7', label: 'Verde' },
  { value: '#dbeafe', label: 'Azul' },
  { value: '#f3e8ff', label: 'Púrpura' },
  { value: '#fce7f3', label: 'Rosa' },
  { value: '#ffedd5', label: 'Naranja' },
  { value: '#f1f5f9', label: 'Gris' },
]

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link'],
    ['clean'],
  ],
}

const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'blockquote', 'code-block', 'link',
]

const parseCsv = (str) => {
  if (!str?.trim()) return [['', ''], ['', '']]
  return str.split('\n').map((row) => {
    const cells = []
    let cell = ''
    let inQuotes = false
    for (let i = 0; i < row.length; i++) {
      const ch = row[i]
      if (ch === '"') {
        if (inQuotes && row[i + 1] === '"') { cell += '"'; i++ }
        else inQuotes = !inQuotes
      } else if (ch === ',' && !inQuotes) {
        cells.push(cell); cell = ''
      } else {
        cell += ch
      }
    }
    cells.push(cell)
    return cells
  })
}

const toTableRows = (content) => {
  if (Array.isArray(content)) return content
  if (!content) return [['', ''], ['', '']]
  try { return JSON.parse(content) } catch { return parseCsv(content) }
}

const KNOWN_PREFIXES = ['sum', 'max', 'min', 'avg', 'string', 'number', 'decimal', 'date', 'checkbox']

const isPrefix = (part) => KNOWN_PREFIXES.includes(part) || part.toLowerCase().startsWith('select(')

const stripPrefixes = (header) => {
  const parts = (header || '').split(':')
  let i = 0
  while (i < parts.length && isPrefix(parts[i])) i++
  return parts.slice(i).join(':') || header
}

const getColType = (header) => {
  const parts = (header || '').split(':')
  for (const part of parts) {
    const lower = part.toLowerCase()
    if (['string', 'number', 'decimal', 'date', 'checkbox'].includes(lower)) return lower
    if (lower.startsWith('select(')) return 'select'
  }
  return 'string'
}

const getColOptions = (header) => {
  const parts = (header || '').split(':')
  const p = parts.find((s) => s.toLowerCase().startsWith('select(') && s.endsWith(')'))
  if (!p) return []
  return p.slice(p.indexOf('(') + 1, -1).split(',').map((o) => o.trim()).filter(Boolean)
}

const formatCellValue = (value, type) => {
  if (value === '' || value == null) return value
  switch (type) {
    case 'number': {
      const n = parseInt(value, 10)
      return isNaN(n) ? value : n.toLocaleString('es-CO')
    }
    case 'decimal': {
      const d = parseFloat(value)
      return isNaN(d) ? value : d.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
    case 'date': {
      const d = new Date(value + 'T00:00:00')
      return isNaN(d.getTime()) ? value : d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
    }
    case 'checkbox':
      return value === 'true' ? '✓' : '✗'
    default:
      return value
  }
}

const parseChecklist = (content) => {
  if (!content?.trim()) return [{ text: '', done: false }]
  try { return JSON.parse(content) } catch { return [{ text: '', done: false }] }
}
const serializeChecklist = (items) => JSON.stringify(items)

const AGGREGATE_PREFIXES = ['sum', 'max', 'min', 'avg']

const calcTableTotals = (content) => {
  if (!content) return []
  const rows = toTableRows(content)
  if (rows.length < 2) return []
  const [head, ...body] = rows
  const results = []
  head.forEach((col, ci) => {
    const lower = col.toLowerCase()
    const agg = AGGREGATE_PREFIXES.find((p) => lower.includes(p + ':') || lower.startsWith(p + ':'))
    if (!agg) return
    const nums = body.map((row) => parseFloat(row[ci])).filter((v) => !isNaN(v))
    if (!nums.length) return
    let value
    if (agg === 'sum') value = nums.reduce((a, b) => a + b, 0)
    else if (agg === 'max') value = Math.max(...nums)
    else if (agg === 'min') value = Math.min(...nums)
    else if (agg === 'avg') value = nums.reduce((a, b) => a + b, 0) / nums.length
    results.push({ label: stripPrefixes(col), value })
  })
  return results
}

const formatDate = (ts) => {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : ts instanceof Date ? ts : new Date(ts)
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ── TableEditor ───────────────────────────────────────────────────────────────

const TableEditor = ({ rows, onChange }) => {
  const colCount = rows[0]?.length ?? 1

  const updateCell = (ri, ci, val) =>
    onChange(rows.map((r, i) => (i === ri ? r.map((c, j) => (j === ci ? val : c)) : r)))

  const renderCellInput = (ri, ci, cell) => {
    const base = {
      className: 'note-table-editor__cell',
      value: cell,
      onChange: (e) => updateCell(ri, ci, e.target.value),
    }
    if (ri === 0) return <input {...base} />
    const type = getColType(rows[0]?.[ci] || '')
    if (type === 'number') return <input {...base} type="number" step="1" />
    if (type === 'decimal') return <input {...base} type="number" step="0.01" />
    if (type === 'date') return <input {...base} type="date" className={`${base.className} note-table-editor__cell--date`} />
    if (type === 'select') {
      const options = getColOptions(rows[0]?.[ci] || '')
      return (
        <select className="note-table-editor__cell" value={cell} onChange={(e) => updateCell(ri, ci, e.target.value)}>
          <option value="">—</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      )
    }
    if (type === 'checkbox') {
      return (
        <div className="note-table-editor__cell-check">
          <input
            type="checkbox"
            checked={cell === 'true'}
            onChange={(e) => updateCell(ri, ci, e.target.checked ? 'true' : 'false')}
          />
        </div>
      )
    }
    return <input {...base} />
  }

  const addRow = () => onChange([...rows, new Array(colCount).fill('')])

  const addCol = () => onChange(rows.map((r) => [...r, '']))

  const removeRow = (ri) => {
    if (rows.length <= 1) return
    onChange(rows.filter((_, i) => i !== ri))
  }

  const removeCol = (ci) => {
    if (colCount <= 1) return
    onChange(rows.map((r) => r.filter((_, j) => j !== ci)))
  }

  return (
    <div className="note-table-editor">
      <div className="note-table-editor__scroll">
        <table className="note-table-editor__table">
          <thead>
            <tr>
              {rows[0]?.map((_, ci) => (
                <th key={ci} className="note-table-editor__col-head">
                  {colCount > 1 && (
                    <button
                      type="button"
                      className="note-table-editor__rm-btn"
                      onClick={() => removeCol(ci)}
                      title="Eliminar columna"
                    >
                      ×
                    </button>
                  )}
                </th>
              ))}
              <th className="note-table-editor__col-head note-table-editor__col-head--add">
                <button type="button" className="note-table-editor__add-btn" onClick={addCol}>
                  + col
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="note-table-editor__cell-td">
                    {renderCellInput(ri, ci, cell)}
                  </td>
                ))}
                <td className="note-table-editor__row-actions">
                  {rows.length > 1 && (
                    <button
                      type="button"
                      className="note-table-editor__rm-btn"
                      onClick={() => removeRow(ri)}
                      title="Eliminar fila"
                    >
                      ×
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="note-table-editor__add-row-btn" onClick={addRow}>
        + fila
      </button>
    </div>
  )
}

// ── NoteTable (read-only) ─────────────────────────────────────────────────────

const NoteTable = ({ content, className, onToggleCheck }) => {
  const rows = content ? toTableRows(content) : []
  if (!rows.length) return null
  const [head, ...body] = rows
  const types = head.map((h) => getColType(h))
  return (
    <table className={`note-table${className ? ` ${className}` : ''}`}>
      <thead>
        <tr>{head.map((c, i) => <th key={i}>{stripPrefixes(c)}</th>)}</tr>
      </thead>
      <tbody>
        {body.map((row, ri) => (
          <tr key={ri}>
            {row.map((c, ci) =>
              types[ci] === 'checkbox' && onToggleCheck ? (
                <td key={ci} className="note-table__cell--check">
                  <input
                    type="checkbox"
                    checked={c === 'true'}
                    onChange={(e) => onToggleCheck(ri, ci, e.target.checked ? 'true' : 'false')}
                  />
                </td>
              ) : (
                <td key={ci}>{formatCellValue(c, types[ci])}</td>
              )
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── ChecklistEditor ───────────────────────────────────────────────────────────

const ChecklistEditor = ({ items, onChange }) => {
  const inputRefs = React.useRef([])

  const addItem = (afterIndex) => {
    const next = [...items]
    next.splice(afterIndex + 1, 0, { text: '', done: false })
    onChange(next)
    setTimeout(() => inputRefs.current[afterIndex + 1]?.focus(), 0)
  }

  const removeItem = (i) => {
    if (items.length <= 1) return onChange([{ text: '', done: false }])
    onChange(items.filter((_, idx) => idx !== i))
  }

  const updateText = (i, text) =>
    onChange(items.map((item, idx) => (idx === i ? { ...item, text } : item)))

  const toggleDone = (i) =>
    onChange(items.map((item, idx) => (idx === i ? { ...item, done: !item.done } : item)))

  const handleKeyDown = (e, i) => {
    if (e.key === 'Enter') { e.preventDefault(); addItem(i) }
    if (e.key === 'Backspace' && items[i].text === '') { e.preventDefault(); removeItem(i); setTimeout(() => inputRefs.current[i - 1]?.focus(), 0) }
  }

  return (
    <div className="note-checklist-editor">
      {items.map((item, i) => (
        <div key={i} className="note-checklist-editor__item">
          <input
            type="checkbox"
            className="note-checklist-editor__check"
            checked={item.done}
            onChange={() => toggleDone(i)}
          />
          <input
            ref={(el) => (inputRefs.current[i] = el)}
            className={`note-checklist-editor__text${item.done ? ' note-checklist-editor__text--done' : ''}`}
            value={item.text}
            placeholder="Ítem…"
            onChange={(e) => updateText(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          />
          <button type="button" className="note-checklist-editor__rm" onClick={() => removeItem(i)}>×</button>
        </div>
      ))}
      <button type="button" className="note-checklist-editor__add" onClick={() => addItem(items.length - 1)}>
        + Agregar ítem
      </button>
    </div>
  )
}

// ── NoteChecklist (read-only) ─────────────────────────────────────────────────

const NoteChecklist = ({ content, className, onToggle }) => {
  const items = parseChecklist(content)
  const done = items.filter((i) => i.done).length
  return (
    <div className={`note-checklist${className ? ` ${className}` : ''}`}>
      {items.map((item, i) => (
        <div
          key={i}
          className={`note-checklist__item${item.done ? ' note-checklist__item--done' : ''}${onToggle ? ' note-checklist__item--interactive' : ''}`}
          onClick={() => onToggle?.(i)}
        >
          <span className="note-checklist__mark">{item.done ? '✓' : '○'}</span>
          <span className="note-checklist__text">{item.text || <em>sin texto</em>}</span>
        </div>
      ))}
      {items.length > 0 && (
        <div className="note-checklist__progress">
          {done}/{items.length}
        </div>
      )}
    </div>
  )
}

// ── NoteCard ──────────────────────────────────────────────────────────────────

const NoteCard = ({ note, onEdit, onDelete, onView, onClone, onArchive, dragHandleRef, dragListeners }) => {
  const dispatch = useDispatch()
  const totals = note.mode === 'table' ? calcTableTotals(note.content) : []
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(note.title || '')

  const handleToggleChecklist = (index) => {
    const items = parseChecklist(note.content)
    const updated = items.map((item, i) => i === index ? { ...item, done: !item.done } : item)
    dispatch(actions.updateRequest({ id: note.id, content: serializeChecklist(updated) }))
  }

  const handleToggleCheck = (ri, ci, val) => {
    const rows = toTableRows(note.content)
    const updated = rows.map((r, i) => i === ri + 1 ? r.map((c, j) => j === ci ? val : c) : r)
    dispatch(actions.updateRequest({ id: note.id, content: JSON.stringify(updated) }))
  }

  const commitTitle = () => {
    setEditingTitle(false)
    const trimmed = titleValue.trim()
    if (trimmed !== (note.title || '')) {
      dispatch(actions.updateRequest({ id: note.id, title: trimmed, content: note.content, color: note.color, mode: note.mode }))
    }
  }

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') e.target.blur()
    if (e.key === 'Escape') { setTitleValue(note.title || ''); setEditingTitle(false) }
  }

  return (
  <div className="note-card" style={{ '--note-bg': note.color || '#fff' }}>
    <div className="note-card__header">
      <h6 className="note-card__title">
        {editingTitle ? (
          <input
            className="note-card__title-input"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={handleTitleKeyDown}
            autoFocus
          />
        ) : (
          <span
            className="note-card__title-text"
            onClick={() => { setTitleValue(note.title || ''); setEditingTitle(true) }}
          >
            {note.title || <em>Sin título</em>}
          </span>
        )}
      </h6>
      <div className="note-card__actions">
        <button
          ref={dragHandleRef}
          className="note-card__drag-handle"
          title="Mover"
          {...dragListeners}
        >⠿</button>
        <button className="note-card__btn" onClick={onView} title="Ver">
          <CIcon icon={cilFullscreen} size="sm" />
        </button>
        <button className="note-card__btn" onClick={onClone} title="Clonar">
          <IconClone />
        </button>
        {note.archived ? (
          <button className="note-card__btn" onClick={onArchive} title="Restaurar">
            <CIcon icon={cilActionUndo} size="sm" />
          </button>
        ) : (
          <button className="note-card__btn" onClick={onArchive} title="Archivar">
            <CIcon icon={cilStorage} size="sm" />
          </button>
        )}
        <button className="note-card__btn" onClick={onEdit} title="Editar">
          <CIcon icon={cilPencil} size="sm" />
        </button>
        <button className="note-card__btn note-card__btn--danger" onClick={onDelete} title="Eliminar">
          <CIcon icon={cilTrash} size="sm" />
        </button>
      </div>
    </div>
    <div className="note-card__date">{formatDate(note.updatedAt)}</div>
    {note.mode === 'table' ? (
      <>
        <div className="note-card__preview note-card__preview--table">
          <NoteTable content={note.content} onToggleCheck={handleToggleCheck} />
        </div>
        {totals.length > 0 && (
          <div className="note-card__totals">
            {totals.map((t, i) => (
              <span key={i} className="note-card__total">{t.label}: {t.value.toLocaleString('es-CO', { maximumFractionDigits: 2 })}</span>
            ))}
          </div>
        )}
      </>
    ) : note.mode === 'checklist' ? (
      <NoteChecklist content={note.content} className="note-card__preview" onToggle={handleToggleChecklist} />
    ) : (
      <div
        className="note-card__preview ql-editor"
        dangerouslySetInnerHTML={{ __html: note.content }}
      />
    )}
  </div>
  )
}

// ── SortableNoteCard ──────────────────────────────────────────────────────────

const SortableNoteCard = (props) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: props.note.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      {...attributes}
    >
      <NoteCard {...props} dragHandleRef={setActivatorNodeRef} dragListeners={listeners} />
    </div>
  )
}


// ── NoteEditorModal ───────────────────────────────────────────────────────────

const NoteEditorModal = ({ note, onSave, onClose, saving }) => {
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      title: note?.title || '',
      content: note?.content || '',
      color: note?.color || '#ffffff',
      mode: note?.mode || 'textarea',
    },
  })

  const content = watch('content')
  const color = watch('color')
  const mode = watch('mode')

  const [tableRows, setTableRows] = useState(() =>
    note?.mode === 'table' ? toTableRows(note?.content) : [['', ''], ['', '']],
  )

  const [checklistItems, setChecklistItems] = useState(() =>
    note?.mode === 'checklist' ? parseChecklist(note?.content) : [{ text: '', done: false }],
  )

  const handleModeSwitch = (newMode) => {
    if (newMode === mode) return
    setValue('mode', newMode)
    if (newMode === 'table') setTableRows([['', ''], ['', '']])
    else if (newMode === 'checklist') setChecklistItems([{ text: '', done: false }])
    else setValue('content', '')
  }

  const buildPayload = (data) => ({
    ...data,
    content: data.mode === 'table'
      ? JSON.stringify(tableRows)
      : data.mode === 'checklist'
      ? serializeChecklist(checklistItems)
      : data.content,
  })

  const onSubmit = (data) => onSave(buildPayload(data), false)
  const onSubmitKeep = (data) => onSave(buildPayload(data), true)

  return (
    <div className="note-editor-overlay" onClick={onClose}>
      <div className="note-editor" onClick={(e) => e.stopPropagation()}>
        <div className="note-editor__bar">
          <input
            className="note-editor__title"
            placeholder="Título de la nota…"
            {...register('title')}
          />
          <div className="note-editor__mode-toggle">
            <button
              type="button"
              className={`note-editor__mode-btn${mode === 'textarea' ? ' note-editor__mode-btn--active' : ''}`}
              onClick={() => handleModeSwitch('textarea')}
            >
              Texto
            </button>
            <button
              type="button"
              className={`note-editor__mode-btn${mode === 'table' ? ' note-editor__mode-btn--active' : ''}`}
              onClick={() => handleModeSwitch('table')}
            >
              Tabla
            </button>
            <button
              type="button"
              className={`note-editor__mode-btn${mode === 'checklist' ? ' note-editor__mode-btn--active' : ''}`}
              onClick={() => handleModeSwitch('checklist')}
            >
              Lista
            </button>
          </div>
          <div className="note-editor__colors">
            {NOTE_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.label}
                className={`note-editor__color-dot${color === c.value ? ' note-editor__color-dot--active' : ''}`}
                style={{ background: c.value }}
                onClick={() => setValue('color', c.value)}
              />
            ))}
          </div>
          <button className="note-editor__icon-btn" onClick={onClose} title="Cerrar">
            <CIcon icon={cilX} />
          </button>
        </div>

        <div className="note-editor__body">
          {mode === 'table' ? (
            <TableEditor rows={tableRows} onChange={setTableRows} />
          ) : mode === 'checklist' ? (
            <ChecklistEditor items={checklistItems} onChange={setChecklistItems} />
          ) : (
            <ReactQuill
              theme="snow"
              value={content}
              onChange={(val) => setValue('content', val)}
              modules={QUILL_MODULES}
              formats={QUILL_FORMATS}
              className="note-editor__quill"
            />
          )}
        </div>

        <div className="note-editor__footer">
          <button className="note-editor__btn note-editor__btn--cancel" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="note-editor__btn note-editor__btn--save-keep"
            onClick={handleSubmit(onSubmitKeep)}
            disabled={saving}
          >
            {saving ? <Spinner size="sm" /> : 'Guardar'}
          </button>
          <button
            className="note-editor__btn note-editor__btn--save"
            onClick={handleSubmit(onSubmit)}
            disabled={saving}
          >
            {saving ? <Spinner size="sm" /> : <><CIcon icon={cilSave} className="me-1" /> Guardar y cerrar</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── NoteViewModal ─────────────────────────────────────────────────────────────

const NoteViewModal = ({ note, onClose, onEdit }) => {
  const totals = note.mode === 'table' ? calcTableTotals(note.content) : []
  return (
  <div className="note-view-overlay" onClick={onClose}>
    <div
      className="note-view"
      style={{ '--note-bg': note.color || '#fff' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="note-view__bar">
        <h5 className="note-view__title">
          {note.title || <em>Sin título</em>}
        </h5>
        <div className="note-view__bar-actions">
          <button className="note-editor__icon-btn" onClick={onEdit} title="Editar">
            <CIcon icon={cilPencil} />
          </button>
          <button className="note-editor__icon-btn" onClick={onClose} title="Cerrar">
            <CIcon icon={cilX} />
          </button>
        </div>
      </div>
      <div className="note-view__date">{formatDate(note.updatedAt)}</div>
      {note.mode === 'table' ? (
        <div className="note-view__content note-view__content--table">
          <NoteTable content={note.content} />
          {totals.length > 0 && (
            <div className="note-view__totals">
              {totals.map((t, i) => (
                <span key={i} className="note-view__total">{t.label}: {t.value.toLocaleString('es-CO', { maximumFractionDigits: 2 })}</span>
              ))}
            </div>
          )}
        </div>
      ) : note.mode === 'checklist' ? (
        <NoteChecklist content={note.content} className="note-view__content note-view__content--checklist" />
      ) : (
        <div
          className="note-view__content ql-editor"
          dangerouslySetInnerHTML={{ __html: note.content }}
        />
      )}
    </div>
  </div>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────────

const sortByOrder = (arr) => [...arr].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))

const Notes = () => {
  const dispatch = useDispatch()
  const { data, fetching, saving } = useSelector((s) => s.note)
  const [items, setItems] = useState([])
  const [dragging, setDragging] = useState(false)
  const [activeTab, setActiveTab] = useState('active')
  const [showHelp, setShowHelp] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  useEffect(() => {
    dispatch(actions.fetchRequest())
  }, [dispatch])

  useEffect(() => {
    if (!dragging) setItems(sortByOrder(data ?? []))
  }, [data, dragging])

  const handleDragStart = () => setDragging(true)

  const handleDragEnd = ({ active, over }) => {
    setDragging(false)
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((n) => n.id === active.id)
    const newIndex = items.findIndex((n) => n.id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex)
    setItems(reordered)
    dispatch(actions.reorderRequest(reordered.map((n, i) => ({ id: n.id, order: i }))))
  }

  const handleSave = (form, keepOpen = false) => {
    if (editing === 'new') {
      dispatch(actions.createRequest(form))
      setEditing(null)
    } else {
      dispatch(actions.updateRequest({ id: editing.id, ...form }))
      if (!keepOpen) setEditing(null)
    }
  }

  const handleArchive = (note) => {
    dispatch(actions.updateRequest({ id: note.id, archived: !note.archived }))
  }

  const handleClone = (note) => {
    dispatch(actions.createRequest({
      title: note.title ? `${note.title} (copia)` : 'Copia',
      content: note.content,
      color: note.color,
      mode: note.mode,
    }))
  }

  const handleDelete = (note) => {
    if (!window.confirm(`¿Eliminar la nota "${note.title || 'Sin título'}"?`)) return
    dispatch(actions.deleteRequest({ id: note.id }))
  }

  const visibleItems = items.filter((n) =>
    activeTab === 'active' ? !n.archived : n.archived === true,
  )

  return (
    <div className="notes">
      <div className="notes__header">
        <div className="notes__header-left">
          <div className="notes__tabs">
            <button
              className={`notes__tab${activeTab === 'active' ? ' notes__tab--active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Activas
            </button>
            <button
              className={`notes__tab${activeTab === 'archived' ? ' notes__tab--active' : ''}`}
              onClick={() => setActiveTab('archived')}
            >
              Archivadas
            </button>
          </div>
          <button
            className={`notes__help-btn${showHelp ? ' notes__help-btn--active' : ''}`}
            onClick={() => setShowHelp((v) => !v)}
            title="Ayuda de operadores"
          >
            {showHelp ? '✕' : '?'} Operadores
          </button>
        </div>
        {activeTab === 'active' && (
          <button className="notes__new-btn" onClick={() => setEditing('new')}>
            + Nueva nota
          </button>
        )}
      </div>

      {showHelp && (
        <div className="notes__help">
          <div className="notes__help-section">
            <span className="notes__help-title">Tipos de columna</span>
            <div className="notes__help-grid">
              {[
                ['string:Nombre', 'Texto libre'],
                ['number:Cantidad', 'Entero, valida en tiempo real'],
                ['decimal:Precio', 'Decimal, valida en tiempo real'],
                ['date:Fecha', 'Selector de fecha'],
                ['select(A,B,C):Estado', 'Lista desplegable con opciones'],
                ['checkbox:Activo', 'Casilla de verificación (✓ / ✗)'],
              ].map(([op, desc]) => (
                <div key={op} className="notes__help-row">
                  <code className="notes__help-code">{op}</code>
                  <span className="notes__help-desc">{desc}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="notes__help-section">
            <span className="notes__help-title">Agregados (badge bajo la tabla)</span>
            <div className="notes__help-grid">
              {[
                ['sum:Total', 'Suma de la columna'],
                ['max:Máximo', 'Valor máximo'],
                ['min:Mínimo', 'Valor mínimo'],
                ['avg:Promedio', 'Promedio de la columna'],
              ].map(([op, desc]) => (
                <div key={op} className="notes__help-row">
                  <code className="notes__help-code">{op}</code>
                  <span className="notes__help-desc">{desc}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="notes__help-section">
            <span className="notes__help-title">Combinaciones válidas</span>
            <div className="notes__help-grid">
              {[
                ['sum:number:Total', 'Entero + suma'],
                ['sum:decimal:Precio', 'Decimal + suma'],
                ['max:decimal:Precio', 'Decimal + máximo'],
                ['avg:number:Días', 'Entero + promedio'],
              ].map(([op, desc]) => (
                <div key={op} className="notes__help-row">
                  <code className="notes__help-code">{op}</code>
                  <span className="notes__help-desc">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {fetching ? (
        <Spinner mode="section" />
      ) : visibleItems.length === 0 ? (
        <div className="notes__empty">
          {activeTab === 'active' ? (
            <>
              <p>No hay notas todavía.</p>
              <button className="notes__new-btn" onClick={() => setEditing('new')}>
                + Crear primera nota
              </button>
            </>
          ) : (
            <p>No hay notas archivadas.</p>
          )}
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <SortableContext items={visibleItems.map((n) => n.id)} strategy={rectSortingStrategy}>
            <div className="notes__grid">
              {visibleItems.map((note) => (
                <SortableNoteCard
                  key={note.id}
                  note={note}
                  onView={() => setViewing(note)}
                  onEdit={() => setEditing(note)}
                  onClone={() => handleClone(note)}
                  onArchive={() => handleArchive(note)}
                  onDelete={() => handleDelete(note)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {viewing && !editing && (
        <NoteViewModal
          note={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => {
            setEditing(viewing)
            setViewing(null)
          }}
        />
      )}

      {editing && (
        <NoteEditorModal
          note={editing === 'new' ? null : editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
          saving={saving}
        />
      )}
    </div>
  )
}

export default Notes
