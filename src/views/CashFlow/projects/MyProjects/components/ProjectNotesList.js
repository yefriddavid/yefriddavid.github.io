import React from 'react'

export default function ProjectNotesList({
  localProjectNotes,
  showProjectNotes,
  setShowProjectNotes,
  addingNote,
  setAddingNote,
  newNoteText,
  setNewNoteText,
  newNoteRef,
  setNewNoteRef,
  saveCardNote,
  deleteCardNote,
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <button
        onClick={() => setShowProjectNotes((v) => !v)}
        style={{
          width: '100%',
          padding: '7px 10px',
          borderRadius: 8,
          border: '1px solid #e9ecef',
          background: showProjectNotes ? '#f8f9fa' : '#fff',
          fontSize: 12,
          fontWeight: 600,
          color: '#6c757d',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>📝 Notas{localProjectNotes.length > 0 ? ` (${localProjectNotes.length})` : ''}</span>
        <span style={{ fontSize: 10 }}>{showProjectNotes ? '▲' : '▼'}</span>
      </button>

      {showProjectNotes && (
        <div style={{ padding: '10px 4px 4px' }}>
          {localProjectNotes.map((note) => (
            <div
              key={note.id}
              style={{
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: 10,
                padding: '8px 10px',
                marginBottom: 6,
                position: 'relative',
              }}
            >
              <button
                onClick={() => deleteCardNote(note.id)}
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 8,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#e03131',
                  fontSize: 15,
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ×
              </button>
              <div style={{ fontSize: 13, color: '#1a1a2e', marginBottom: 2, paddingRight: 18 }}>
                {note.text}
              </div>
              {note.reference && (
                <div style={{ fontSize: 11, color: '#1e3a5f', marginBottom: 2 }}>
                  🔗 {note.reference}
                </div>
              )}
              <div style={{ fontSize: 10, color: '#adb5bd' }}>
                {new Date(note.createdAt).toLocaleDateString('es-CO', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
            </div>
          ))}

          {addingNote ? (
            <div
              style={{
                background: '#fff',
                border: '1px solid #dee2e6',
                borderRadius: 10,
                padding: '10px',
              }}
            >
              <input
                autoFocus
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                placeholder="Nota…"
                style={{
                  width: '100%',
                  border: 'none',
                  borderBottom: '2px solid #1e3a5f',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 13,
                  color: '#1a1a2e',
                  padding: '2px 0 6px',
                  marginBottom: 8,
                }}
              />
              <input
                type="text"
                value={newNoteRef}
                onChange={(e) => setNewNoteRef(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveCardNote()}
                placeholder="Referencia (opcional)…"
                style={{
                  width: '100%',
                  border: 'none',
                  borderBottom: '1px solid #dee2e6',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 12,
                  color: '#6c757d',
                  padding: '2px 0 6px',
                  marginBottom: 8,
                }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={saveCardNote}
                  disabled={!newNoteText.trim()}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: 8,
                    border: 'none',
                    background: newNoteText.trim() ? '#1e3a5f' : '#e9ecef',
                    color: newNoteText.trim() ? '#fff' : '#adb5bd',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: newNoteText.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setAddingNote(false)
                    setNewNoteText('')
                    setNewNoteRef('')
                  }}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: '1px solid #dee2e6',
                    background: '#fff',
                    fontSize: 12,
                    color: '#6c757d',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingNote(true)}
              style={{
                width: '100%',
                padding: '7px',
                borderRadius: 8,
                border: '1px dashed #dee2e6',
                background: 'transparent',
                fontSize: 12,
                color: '#adb5bd',
                cursor: 'pointer',
              }}
            >
              + Agregar nota
            </button>
          )}
        </div>
      )}
    </div>
  )
}
