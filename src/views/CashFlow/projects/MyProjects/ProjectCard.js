import React, { useEffect, useState } from 'react'
import { CSpinner } from '@coreui/react'
import { fmt, uid, now, totalOf, paidOf } from './helpers'

export default function ProjectCard({
  project,
  isFirst,
  isLast,
  syncing,
  onEdit,
  onDelete,
  onSync,
  onSave,
  onClone,
  onMove,
}) {
  const isSynced = !!project.syncedAt

  const [localDescription, setLocalDescription] = useState(project.description)
  const [localGoal, setLocalGoal] = useState(String(project.goal ?? ''))
  const [localNotes, setLocalNotes] = useState(project.notes ?? '')
  const [localDate, setLocalDate] = useState(project.date ?? '')
  const [localItems, setLocalItems] = useState(project.items ?? [])
  const [localProjectNotes, setLocalProjectNotes] = useState(project.projectNotes ?? [])
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    setLocalDescription(project.description)
    setLocalGoal(String(project.goal ?? ''))
    setLocalNotes(project.notes ?? '')
    setLocalDate(project.date ?? '')
    setLocalItems(project.items ?? [])
    setLocalProjectNotes(project.projectNotes ?? [])
    setIsDirty(false)
  }, [project.updatedAt])

  const total = totalOf(localItems)
  const paid = paidOf(localItems)
  const goal = Number(localGoal) || 0
  const remaining = goal > 0 ? goal - total : null
  const paidOverrun = goal > 0 && paid > goal ? paid - goal : 0

  const [editingName, setEditingName] = useState(false)
  const [editingGoal, setEditingGoal] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [editingItemId, setEditingItemId] = useState(null)
  const [localOrigen, setLocalOrigen] = useState('')
  const [editingValueId, setEditingValueId] = useState(null)
  const [localValue, setLocalValue] = useState('')
  const [cloning, setCloning] = useState(false)
  const [cloneName, setCloneName] = useState('')
  const [showProjectNotes, setShowProjectNotes] = useState(false)
  const [addingNote, setAddingNote] = useState(false)
  const [newNoteText, setNewNoteText] = useState('')
  const [newNoteRef, setNewNoteRef] = useState('')

  const mark = () => setIsDirty(true)

  const commitName = () => {
    setEditingName(false)
    const trimmed = localDescription.trim()
    if (!trimmed) setLocalDescription(project.description)
    else mark()
  }

  const startItemEdit = (item) => {
    setEditingItemId(item.id)
    setLocalOrigen(item.origen)
  }

  const commitItem = (item) => {
    setEditingItemId(null)
    const trimmed = localOrigen.trim()
    if (trimmed === item.origen) return
    setLocalItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, origen: trimmed } : it)))
    mark()
  }

  const commitGoal = () => {
    setEditingGoal(false)
    mark()
  }

  const commitNotes = () => {
    setEditingNotes(false)
    mark()
  }

  const startValueEdit = (item) => {
    setEditingValueId(item.id)
    setLocalValue(String(item.value ?? ''))
  }

  const commitValue = (item) => {
    setEditingValueId(null)
    const num = Number(String(localValue).replace(/\D/g, ''))
    if (num === Number(item.value)) return
    setLocalItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, value: num } : it)))
    mark()
  }

  const toggleItemPaid = (item) => {
    setLocalItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, paid: !it.paid } : it)))
    mark()
  }

  const [dragItemId, setDragItemId] = useState(null)
  const [dragOverItemId, setDragOverItemId] = useState(null)

  const reorderCardItems = (fromId, toId) => {
    if (fromId === toId) return
    setLocalItems((prev) => {
      const next = [...prev]
      const fromIdx = next.findIndex((it) => it.id === fromId)
      const toIdx = next.findIndex((it) => it.id === toId)
      const [moved] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, moved)
      return next
    })
    mark()
  }

  const saveCardNote = () => {
    if (!newNoteText.trim()) return
    const note = {
      id: uid(),
      text: newNoteText.trim(),
      reference: newNoteRef.trim(),
      createdAt: now(),
    }
    setLocalProjectNotes((prev) => [...prev, note])
    setNewNoteText('')
    setNewNoteRef('')
    setAddingNote(false)
    mark()
  }

  const deleteCardNote = (noteId) => {
    setLocalProjectNotes((prev) => prev.filter((n) => n.id !== noteId))
    mark()
  }

  const handleSaveCard = () => {
    onSave({
      ...project,
      description: localDescription.trim() || project.description,
      goal: Number(localGoal) || 0,
      notes: localNotes.trim(),
      date: localDate.trim(),
      items: localItems,
      projectNotes: localProjectNotes,
      updatedAt: now(),
      syncedAt: null,
    })
    setIsDirty(false)
  }

  const inlineInput = (value, onChange, onBlur, styles = {}) => (
    <input
      autoFocus
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
      style={{
        border: 'none',
        borderBottom: '2px solid #1e3a5f',
        outline: 'none',
        background: 'transparent',
        padding: '0 0 2px',
        width: '100%',
        ...styles,
      }}
    />
  )

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: '14px 16px',
        marginBottom: 10,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        borderLeft: `4px solid ${isSynced ? '#86efac' : '#ffe066'}`,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editingName ? (
            inlineInput(
              localDescription,
              (v) => {
                setLocalDescription(v)
                mark()
              },
              commitName,
              {
                fontSize: 15,
                fontWeight: 700,
                color: '#1a1a2e',
              },
            )
          ) : (
            <div
              onClick={() => setEditingName(true)}
              title="Toca para editar"
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#1a1a2e',
                marginBottom: 2,
                cursor: 'text',
                borderBottom: '1px dashed transparent',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = '#dee2e6')}
              onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = 'transparent')}
            >
              {localDescription}
            </div>
          )}
          {goal > 0 && (
            <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: '#adb5bd' }}>Falta:</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: remaining <= 0 ? '#2f9e44' : '#e67700',
                }}
              >
                {remaining <= 0 ? '✅ Listo' : fmt(remaining)}
              </span>
            </div>
          )}
          {editingNotes ? (
            <textarea
              autoFocus
              value={localNotes}
              rows={2}
              onChange={(e) => {
                setLocalNotes(e.target.value)
                mark()
              }}
              onBlur={commitNotes}
              onKeyDown={(e) => e.key === 'Escape' && commitNotes()}
              style={{
                width: '100%',
                marginTop: 2,
                border: 'none',
                borderBottom: '2px solid #1e3a5f',
                outline: 'none',
                background: 'transparent',
                fontSize: 11,
                color: '#6c757d',
                fontStyle: 'italic',
                resize: 'none',
                fontFamily: 'inherit',
                padding: '0 0 2px',
              }}
            />
          ) : (
            <div
              onClick={() => setEditingNotes(true)}
              title="Toca para editar"
              style={{
                fontSize: 11,
                color: localNotes ? '#adb5bd' : '#dee2e6',
                marginTop: 2,
                fontStyle: 'italic',
                cursor: 'text',
                borderBottom: '1px dashed transparent',
                minHeight: 14,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = '#dee2e6')}
              onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = 'transparent')}
            >
              {localNotes || 'Agregar descripción…'}
            </div>
          )}
          {localDate && (
            <div style={{ fontSize: 12, color: '#6c757d', marginTop: 2 }}>📅 {localDate}</div>
          )}
        </div>
        {/* goal value */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {editingGoal ? (
            <input
              autoFocus
              type="number"
              min="0"
              value={localGoal}
              onChange={(e) => {
                setLocalGoal(e.target.value)
                mark()
              }}
              onBlur={commitGoal}
              onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
              style={{
                border: 'none',
                borderBottom: '2px solid #1e3a5f',
                outline: 'none',
                background: 'transparent',
                fontSize: 17,
                fontWeight: 800,
                color: '#1e3a5f',
                textAlign: 'right',
                width: 130,
                padding: '0 0 2px',
              }}
            />
          ) : (
            <div
              onClick={() => setEditingGoal(true)}
              title="Toca para editar"
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: '#1e3a5f',
                cursor: 'text',
                borderBottom: '1px dashed transparent',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = '#c5d8ff')}
              onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = 'transparent')}
            >
              {goal > 0 ? fmt(goal) : fmt(total)}
            </div>
          )}
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: isSynced ? '#2f9e44' : '#f59f00',
              marginTop: 2,
            }}
          >
            {isSynced ? '● Sincronizado' : '○ Local'}
          </div>
        </div>
      </div>

      {/* Items preview */}
      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 8, marginBottom: 10 }}>
        {localItems.length > 0 &&
          localItems.map((item) => (
            <div
              key={item.id}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOverItemId(item.id)
              }}
              onDrop={(e) => {
                e.preventDefault()
                reorderCardItems(dragItemId, item.id)
                setDragItemId(null)
                setDragOverItemId(null)
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 2px',
                borderBottom: '1px solid #f8f9fa',
                background:
                  dragOverItemId === item.id ? '#e8f4fd' : item.paid ? '#f0fdf4' : 'transparent',
                opacity: dragItemId === item.id ? 0.4 : 1,
                transition: 'background 0.1s',
                borderRadius: 4,
              }}
            >
              {/* Paid checkbox */}
              <input
                type="checkbox"
                checked={!!item.paid}
                onChange={() => toggleItemPaid(item)}
                title="Marcar como efectuado"
                style={{
                  width: 14,
                  height: 14,
                  cursor: 'pointer',
                  accentColor: '#2f9e44',
                  flexShrink: 0,
                  marginRight: 4,
                }}
              />
              {editingItemId === item.id ? (
                inlineInput(localOrigen, setLocalOrigen, () => commitItem(item), {
                  fontSize: 13,
                  color: '#6c757d',
                  flex: 1,
                })
              ) : (
                <span
                  style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, gap: 2 }}
                >
                  {/* drag handle */}
                  <span
                    draggable
                    onDragStart={() => setDragItemId(item.id)}
                    onDragEnd={() => {
                      setDragItemId(null)
                      setDragOverItemId(null)
                    }}
                    style={{
                      cursor: 'grab',
                      color: '#adb5bd',
                      fontSize: 13,
                      flexShrink: 0,
                      userSelect: 'none',
                      lineHeight: 1,
                      padding: '0 2px',
                    }}
                    title="Arrastrar para reordenar"
                  >
                    ⠿
                  </span>
                  <button
                    onClick={() => {
                      setLocalItems((prev) => prev.filter((it) => it.id !== item.id))
                      mark()
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#e03131',
                      fontSize: 13,
                      lineHeight: 1,
                      padding: '0 2px',
                      flexShrink: 0,
                    }}
                    title="Eliminar aporte"
                  >
                    ×
                  </button>
                  <span
                    onClick={() => startItemEdit(item)}
                    title="Toca para editar"
                    style={{
                      fontSize: 13,
                      color: item.paid ? '#2f9e44' : '#6c757d',
                      cursor: 'text',
                      borderBottom: '1px dashed transparent',
                      textDecoration: item.paid ? 'line-through' : 'none',
                      opacity: item.paid ? 0.7 : 1,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = '#dee2e6')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = 'transparent')}
                  >
                    {item.origen || <em style={{ color: '#adb5bd' }}>sin nombre</em>}
                  </span>
                </span>
              )}
              {editingValueId === item.id ? (
                <input
                  autoFocus
                  type="number"
                  min="0"
                  value={localValue}
                  onChange={(e) => setLocalValue(e.target.value)}
                  onBlur={() => commitValue(item)}
                  onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                  style={{
                    border: 'none',
                    borderBottom: '2px solid #1e3a5f',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#1e3a5f',
                    textAlign: 'right',
                    width: 110,
                    marginLeft: 8,
                    flexShrink: 0,
                    padding: '0 0 2px',
                  }}
                />
              ) : (
                <span
                  onClick={() => startValueEdit(item)}
                  title="Toca para editar"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#1a1a2e',
                    marginLeft: 8,
                    flexShrink: 0,
                    cursor: 'text',
                    borderBottom: '1px dashed transparent',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = '#dee2e6')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = 'transparent')}
                >
                  {fmt(item.value)}
                </span>
              )}
            </div>
          ))}

        {/* Add item inline */}
        <button
          onClick={() => {
            const newItem = { id: uid(), origen: '', value: 0, paid: false }
            setLocalItems((prev) => [...prev, newItem])
            mark()
            setTimeout(() => startItemEdit(newItem), 50)
          }}
          style={{
            width: '100%',
            marginTop: 6,
            padding: '5px 0',
            border: '1px dashed #dee2e6',
            borderRadius: 8,
            background: 'transparent',
            fontSize: 12,
            color: '#adb5bd',
            cursor: 'pointer',
          }}
        >
          + aporte
        </button>
      </div>

      {/* Remaining */}
      {remaining !== null && (
        <div
          style={{
            borderTop: project.items?.length > 0 ? 'none' : '1px solid #f1f5f9',
            paddingTop: project.items?.length > 0 ? 0 : 8,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              padding: '8px 10px',
              borderRadius: 10,
              background: paidOverrun > 0 ? '#fff5f5' : remaining <= 0 ? '#f0fdf4' : '#fff8e1',
              border: `1px solid ${paidOverrun > 0 ? '#ffa8a8' : remaining <= 0 ? '#86efac' : '#ffe066'}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#6c757d', fontWeight: 600 }}>Proyectado</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{fmt(total)}</span>
            </div>
            {paid > 0 && (
              <div
                style={{
                  borderTop: '1px solid rgba(0,0,0,0.07)',
                  paddingTop: 6,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: paidOverrun > 0 ? '#e03131' : '#2f9e44',
                  }}
                >
                  ✅ Efectuado
                </span>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: paidOverrun > 0 ? '#e03131' : '#2f9e44',
                      display: 'block',
                    }}
                  >
                    {fmt(paid)}
                  </span>
                  {paidOverrun > 0 && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#e03131' }}>
                      +{fmt(paidOverrun)} sobre presupuesto
                    </span>
                  )}
                </div>
              </div>
            )}
            <div
              style={{
                borderTop: '1px solid rgba(0,0,0,0.07)',
                paddingTop: 6,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: remaining <= 0 ? '#2f9e44' : '#e67700',
                }}
              >
                {remaining <= 0 ? '✅ Meta alcanzada' : '⏳ Falta'}
              </span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: remaining <= 0 ? '#2f9e44' : '#e67700',
                }}
              >
                {remaining <= 0 ? fmt(0) : fmt(remaining)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Project notes section */}
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
          <span>
            📝 Notas{localProjectNotes.length > 0 ? ` (${localProjectNotes.length})` : ''}
          </span>
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

      {/* Clone prompt */}
      {cloning && (
        <div
          style={{
            marginBottom: 10,
            padding: '10px 12px',
            borderRadius: 10,
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6c757d', marginBottom: 6 }}>
            NOMBRE DEL NUEVO PROYECTO
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              autoFocus
              type="text"
              value={cloneName}
              onChange={(e) => setCloneName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && cloneName.trim()) {
                  onClone(project, cloneName.trim())
                  setCloning(false)
                }
                if (e.key === 'Escape') setCloning(false)
              }}
              style={{
                flex: 1,
                border: 'none',
                borderBottom: '2px solid #1e3a5f',
                outline: 'none',
                background: 'transparent',
                fontSize: 14,
                color: '#1a1a2e',
                padding: '2px 0',
              }}
            />
            <button
              onClick={() => {
                if (cloneName.trim()) onClone(project, cloneName.trim())
                setCloning(false)
              }}
              disabled={!cloneName.trim()}
              style={{
                padding: '4px 12px',
                borderRadius: 8,
                border: 'none',
                background: cloneName.trim() ? '#1e3a5f' : '#e9ecef',
                color: cloneName.trim() ? '#fff' : '#adb5bd',
                fontSize: 13,
                fontWeight: 700,
                cursor: cloneName.trim() ? 'pointer' : 'not-allowed',
                flexShrink: 0,
              }}
            >
              Clonar
            </button>
            <button
              onClick={() => setCloning(false)}
              style={{
                padding: '4px 10px',
                borderRadius: 8,
                border: '1px solid #dee2e6',
                background: '#fff',
                fontSize: 13,
                color: '#6c757d',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Save changes button */}
      {isDirty && (
        <button
          onClick={handleSaveCard}
          style={{
            width: '100%',
            marginBottom: 8,
            padding: '10px',
            borderRadius: 10,
            border: 'none',
            background: '#1e3a5f',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          💾 Guardar cambios
        </button>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => onEdit(project)}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: 8,
            border: '1px solid #dee2e6',
            background: '#fff',
            fontSize: 13,
            fontWeight: 600,
            color: '#1e3a5f',
            cursor: 'pointer',
          }}
        >
          ✏️ Editar
        </button>
        {/* project reorder */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button
            onClick={() => onMove(project, -1)}
            disabled={isFirst}
            style={{
              padding: '3px 10px',
              borderRadius: 6,
              border: '1px solid #dee2e6',
              background: isFirst ? '#f8f9fa' : '#fff',
              color: isFirst ? '#dee2e6' : '#6c757d',
              fontSize: 11,
              cursor: isFirst ? 'default' : 'pointer',
              lineHeight: 1,
            }}
            title="Mover arriba"
          >
            ▲
          </button>
          <button
            onClick={() => onMove(project, 1)}
            disabled={isLast}
            style={{
              padding: '3px 10px',
              borderRadius: 6,
              border: '1px solid #dee2e6',
              background: isLast ? '#f8f9fa' : '#fff',
              color: isLast ? '#dee2e6' : '#6c757d',
              fontSize: 11,
              cursor: isLast ? 'default' : 'pointer',
              lineHeight: 1,
            }}
            title="Mover abajo"
          >
            ▼
          </button>
        </div>
        <button
          onClick={() => onSync(project)}
          disabled={syncing}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: 8,
            border: 'none',
            background: syncing ? '#e9ecef' : '#eef4ff',
            fontSize: 13,
            fontWeight: 600,
            color: syncing ? '#adb5bd' : '#1e3a5f',
            cursor: syncing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          {syncing ? <CSpinner size="sm" /> : '☁️ Sync'}
        </button>
        <button
          onClick={() => onDelete(project)}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: 'none',
            background: '#fff5f5',
            fontSize: 13,
            color: '#e03131',
            cursor: 'pointer',
          }}
        >
          🗑
        </button>
        <button
          onClick={() => {
            setCloneName(project.description)
            setCloning(true)
          }}
          title="Clonar proyecto"
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: 'none',
            background: '#f8f9fa',
            fontSize: 13,
            color: '#6c757d',
            cursor: 'pointer',
          }}
        >
          ⎘
        </button>
      </div>
    </div>
  )
}
