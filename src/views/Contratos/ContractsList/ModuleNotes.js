import React, { useState } from 'react'
import Spinner from 'src/components/shared/Spinner'

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}

function NoteItem({ note, saving, onSave, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(note.text)

  const handleSave = () => {
    const trimmed = draft.trim()
    if (!trimmed || trimmed === note.text) { setEditing(false); return }
    onSave(trimmed)
    setEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave() }
    if (e.key === 'Escape') { setDraft(note.text); setEditing(false) }
  }

  return (
    <div className="cl-notes__item">
      {editing ? (
        <textarea
          className="cl-notes__edit-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          rows={2}
        />
      ) : (
        <div className="cl-notes__text">{note.text}</div>
      )}
      <div className="cl-notes__meta">
        {note.updatedAt && (
          <span className="cl-notes__date">
            {note.updatedAt !== note.createdAt ? 'Editado ' : ''}{fmtDate(note.updatedAt)}
          </span>
        )}
        <div className="cl-notes__actions">
          {editing ? (
            <>
              <button type="button" className="cl-notes__btn cl-notes__btn--save" onClick={handleSave} disabled={saving}>
                {saving ? <Spinner size="sm" /> : 'Guardar'}
              </button>
              <button type="button" className="cl-notes__btn cl-notes__btn--cancel" onClick={() => { setDraft(note.text); setEditing(false) }}>
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button type="button" className="cl-notes__btn" onClick={() => setEditing(true)} title="Editar">✏️</button>
              <button type="button" className="cl-notes__btn cl-notes__btn--delete" onClick={() => onDelete(note.id)} title="Eliminar">×</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ModuleNotes({ notes, fetching, saving, onAdd, onUpdate, onDelete }) {
  const [text, setText] = useState('')

  const handleAdd = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setText('')
  }

  return (
    <div className="cl-notes">
      <div className="cl-notes__header">
        <span className="cl-notes__title">Notas del módulo</span>
        {notes.length > 0 && <span className="cl-notes__count">{notes.length}</span>}
      </div>

      {fetching ? (
        <div className="cl-notes__loading"><Spinner size="sm" /></div>
      ) : notes.length === 0 ? (
        <div className="cl-notes__empty">Sin notas</div>
      ) : (
        <div className="cl-notes__list">
          {notes.map((n) => (
            <NoteItem
              key={n.id}
              note={n}
              saving={saving}
              onSave={(text) => onUpdate(n.id, text)}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      <div className="cl-notes__add">
        <textarea
          className="cl-notes__add-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd() } }}
          placeholder="Nueva nota… (Enter para agregar)"
          rows={2}
        />
        <button
          type="button"
          className="cl-notes__add-btn"
          onClick={handleAdd}
          disabled={saving || !text.trim()}
        >
          {saving ? <Spinner size="sm" /> : 'Agregar'}
        </button>
      </div>
    </div>
  )
}
