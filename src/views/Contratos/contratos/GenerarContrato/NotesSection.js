import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import * as contractNoteActions from 'src/actions/contratos/contractNoteActions'
import { IcoNote, IcoCheck, IcoPencil, IcoTrash, IcoPlus } from './icons'

export default function NotesSection({ contractId, notes, saving }) {
  const dispatch = useDispatch()
  const [newNoteText, setNewNoteText] = useState('')
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [editingNoteText, setEditingNoteText] = useState('')

  const addNote = () => {
    if (!newNoteText.trim()) return
    dispatch(contractNoteActions.createRequest({ contractId, text: newNoteText.trim() }))
    setNewNoteText('')
  }

  return (
    <section className="c-card" id="sec-notas">
      <div className="c-card-header">
        <div className="c-card-icon">
          <IcoNote />
        </div>
        <h2>Notas</h2>
        <p>Observaciones del contrato</p>
      </div>
      <div className="c-notes-list">
        {notes.length === 0 && (
          <div className="c-notes-empty">Sin notas para este contrato.</div>
        )}
        {notes.map((note) => (
          <div key={note.id} className={`c-note-item${note.resolved ? ' resolved' : ''}`}>
            <button
              type="button"
              className={`c-note-cb${note.resolved ? ' checked' : ''}`}
              title={note.resolved ? 'Desmarcar' : 'Marcar como resuelto'}
              onClick={() =>
                dispatch(
                  contractNoteActions.updateRequest({
                    id: note.id,
                    text: note.text,
                    resolved: !note.resolved,
                  }),
                )
              }
            >
              <IcoCheck />
            </button>

            <div className="c-note-body">
              {editingNoteId === note.id ? (
                <div className="c-note-edit">
                  <textarea
                    className="c-note-textarea"
                    value={editingNoteText}
                    onChange={(e) => setEditingNoteText(e.target.value)}
                    autoFocus
                  />
                  <div className="c-note-inline-actions">
                    <button
                      type="button"
                      className="c-note-btn-sm primary"
                      disabled={saving || !editingNoteText.trim()}
                      onClick={() => {
                        dispatch(
                          contractNoteActions.updateRequest({
                            id: note.id,
                            text: editingNoteText.trim(),
                            resolved: note.resolved,
                          }),
                        )
                        setEditingNoteId(null)
                      }}
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      className="c-note-btn-sm ghost"
                      onClick={() => setEditingNoteId(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="c-note-text">{note.text}</p>
              )}
              <div className="c-note-foot">
                <span className="c-note-meta">
                  {note.updatedAt && note.updatedAt !== note.createdAt
                    ? `Editado ${new Date(note.updatedAt).toLocaleString('es-CO')}`
                    : note.createdAt
                      ? new Date(note.createdAt).toLocaleString('es-CO')
                      : ''}
                </span>
                {editingNoteId !== note.id && (
                  <div className="c-note-actions">
                    <button
                      type="button"
                      className="c-note-icon-btn"
                      title="Editar"
                      onClick={() => {
                        setEditingNoteId(note.id)
                        setEditingNoteText(note.text)
                      }}
                    >
                      <IcoPencil />
                    </button>
                    <button
                      type="button"
                      className="c-note-icon-btn danger"
                      title="Eliminar"
                      onClick={() => dispatch(contractNoteActions.deleteRequest({ id: note.id }))}
                    >
                      <IcoTrash />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="c-note-add">
          <textarea
            className="c-note-textarea"
            placeholder="Escribir una nota…"
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && newNoteText.trim()) addNote()
            }}
          />
          <div className="c-note-add-footer">
            <span className="c-note-hint">Ctrl + Enter para guardar</span>
            <button
              type="button"
              className="btn-secondary"
              disabled={saving || !newNoteText.trim()}
              onClick={addNote}
            >
              <IcoPlus /> Agregar nota
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
