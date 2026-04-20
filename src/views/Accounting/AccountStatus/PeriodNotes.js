import React, { useState } from 'react'
import { CSpinner } from '@coreui/react'

export default function PeriodNotes({
  period: _period,
  notes,
  saving,
  fetching,
  onAdd,
  onToggle,
  onDelete,
}) {
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)

  const handleAdd = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setText('')
  }

  const fmtDate = (iso) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e9ecef',
        borderRadius: 14,
        marginBottom: 16,
        overflow: 'hidden',
      }}
    >
      {/* Header toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15 }}>📝</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>Notas del período</span>
          {notes.length > 0 && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: '#eef4ff',
                color: '#1e3a5f',
                borderRadius: 10,
                padding: '1px 7px',
              }}
            >
              {notes.length}
            </span>
          )}
        </div>
        <span
          style={{
            fontSize: 14,
            color: '#adb5bd',
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'none',
          }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px' }}>
          {/* Notes list */}
          {fetching ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
              <CSpinner size="sm" />
            </div>
          ) : notes.length === 0 ? (
            <div
              style={{ fontSize: 13, color: '#adb5bd', padding: '4px 0 12px', textAlign: 'center' }}
            >
              Sin notas para este período
            </div>
          ) : (
            <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {notes.map((n) => (
                <div
                  key={n.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 10,
                    background: n.checked ? '#f0fdf4' : '#f8f9fa',
                    border: `1px solid ${n.checked ? '#86efac' : '#e9ecef'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!n.checked}
                    onChange={() => onToggle(n)}
                    style={{
                      marginTop: 2,
                      width: 16,
                      height: 16,
                      accentColor: '#2f9e44',
                      flexShrink: 0,
                      cursor: 'pointer',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        color: n.checked ? '#6c757d' : '#1a1a2e',
                        textDecoration: n.checked ? 'line-through' : 'none',
                        wordBreak: 'break-word',
                      }}
                    >
                      {n.text}
                    </div>
                    {n.createdAt && (
                      <div style={{ fontSize: 11, color: '#adb5bd', marginTop: 2 }}>
                        {fmtDate(n.createdAt)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onDelete(n)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#adb5bd',
                      fontSize: 14,
                      padding: '0 2px',
                      flexShrink: 0,
                      lineHeight: 1,
                    }}
                    title="Eliminar nota"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add note input */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Nueva nota…"
              style={{
                flex: 1,
                fontSize: 14,
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid #dee2e6',
                outline: 'none',
                background: '#fafafa',
              }}
            />
            <button
              onClick={handleAdd}
              disabled={saving || !text.trim()}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                border: 'none',
                background: saving || !text.trim() ? '#e9ecef' : '#1e3a5f',
                color: saving || !text.trim() ? '#adb5bd' : '#fff',
                fontSize: 13,
                fontWeight: 700,
                cursor: saving || !text.trim() ? 'not-allowed' : 'pointer',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {saving ? (
                <CSpinner
                  size="sm"
                  style={{ borderColor: '#fff', borderRightColor: 'transparent' }}
                />
              ) : (
                '+'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
