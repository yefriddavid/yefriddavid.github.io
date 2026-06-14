import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus, cilX, cilSave } from '@coreui/icons'
import * as actions from 'src/actions/misc/noteActions'
import Spinner from 'src/components/shared/Spinner'
import './Notes.scss'

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
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'blockquote',
  'code-block',
  'link',
]

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

// ── Note card ────────────────────────────────────────────────────────────────

const NoteCard = ({ note, onEdit, onDelete }) => (
  <div className="note-card" style={{ '--note-bg': note.color || '#fff' }}>
    <div className="note-card__header">
      <h6 className="note-card__title">{note.title || <em>Sin título</em>}</h6>
      <div className="note-card__actions">
        <button className="note-card__btn" onClick={onEdit} title="Editar">
          <CIcon icon={cilPencil} size="sm" />
        </button>
        <button
          className="note-card__btn note-card__btn--danger"
          onClick={onDelete}
          title="Eliminar"
        >
          <CIcon icon={cilTrash} size="sm" />
        </button>
      </div>
    </div>
    <div className="note-card__date">{formatDate(note.updatedAt)}</div>
    <div
      className="note-card__preview ql-editor"
      dangerouslySetInnerHTML={{ __html: note.content }}
    />
  </div>
)

// ── Editor modal ─────────────────────────────────────────────────────────────

const NoteEditorModal = ({ note, onSave, onClose, saving }) => {
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      title: note?.title || '',
      content: note?.content || '',
      color: note?.color || '#ffffff',
    },
  })

  const content = watch('content')
  const color = watch('color')

  const onSubmit = (data) => onSave(data)

  return (
    <div className="note-editor-overlay" onClick={onClose}>
      <div className="note-editor" onClick={(e) => e.stopPropagation()}>
        <div className="note-editor__bar">
          <input
            className="note-editor__title"
            placeholder="Título de la nota…"
            {...register('title')}
          />
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
          <ReactQuill
            theme="snow"
            value={content}
            onChange={(val) => setValue('content', val)}
            modules={QUILL_MODULES}
            formats={QUILL_FORMATS}
            className="note-editor__quill"
          />
        </div>

        <div className="note-editor__footer">
          <button className="note-editor__btn note-editor__btn--cancel" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="note-editor__btn note-editor__btn--save"
            onClick={handleSubmit(onSubmit)}
            disabled={saving}
          >
            {saving ? (
              <Spinner size="sm" />
            ) : (
              <>
                <CIcon icon={cilSave} className="me-1" /> Guardar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main view ────────────────────────────────────────────────────────────────

const Notes = () => {
  const dispatch = useDispatch()
  const { data, fetching, saving } = useSelector((s) => s.note)
  const notes = data ?? []
  const [editing, setEditing] = useState(null) // null | 'new' | note

  useEffect(() => {
    dispatch(actions.fetchRequest())
  }, [dispatch])

  const handleSave = (form) => {
    if (editing === 'new') {
      dispatch(actions.createRequest(form))
    } else {
      dispatch(actions.updateRequest({ id: editing.id, ...form }))
    }
    setEditing(null)
  }

  const handleDelete = (note) => {
    if (!window.confirm(`¿Eliminar la nota "${note.title || 'Sin título'}"?`)) return
    dispatch(actions.deleteRequest({ id: note.id }))
  }

  return (
    <div className="notes">
      <div className="notes__header">
        <h5 className="notes__title">Notas</h5>
        <button className="notes__new-btn" onClick={() => setEditing('new')}>
          <CIcon icon={cilPlus} className="me-1" />
          Nueva nota
        </button>
      </div>

      {fetching ? (
        <Spinner mode="section" />
      ) : notes.length === 0 ? (
        <div className="notes__empty">
          <p>No hay notas todavía.</p>
          <button className="notes__new-btn" onClick={() => setEditing('new')}>
            + Crear primera nota
          </button>
        </div>
      ) : (
        <div className="notes__grid">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={() => setEditing(note)}
              onDelete={() => handleDelete(note)}
            />
          ))}
        </div>
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
