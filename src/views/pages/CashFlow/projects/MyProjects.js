import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CSpinner } from '@coreui/react'
import * as actions from 'src/actions/CashFlow/myProjectActions'

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(n ?? 0)

const uid = () => crypto.randomUUID()

const now = () => new Date().toISOString()

function totalOf(items) {
  return (items ?? []).reduce((s, i) => s + (Number(i.value) || 0), 0)
}

// ── Styles shared ─────────────────────────────────────────────────────────────
const sheetOverlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.45)',
  zIndex: 1050,
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
}

const sheetBox = {
  width: '100%',
  maxWidth: 540,
  background: '#fff',
  borderRadius: '20px 20px 0 0',
  padding: '20px 20px 36px',
  boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
  maxHeight: '92vh',
  overflowY: 'auto',
}

const dragHandle = {
  width: 40,
  height: 4,
  borderRadius: 2,
  background: '#dee2e6',
  margin: '0 auto 18px',
}

const fieldLabel = {
  fontSize: 11,
  fontWeight: 600,
  color: '#6c757d',
  display: 'block',
  marginBottom: 4,
  letterSpacing: '0.05em',
}

const fieldInput = {
  width: '100%',
  border: 'none',
  borderBottom: '2px solid #dee2e6',
  outline: 'none',
  padding: '4px 0 8px',
  background: 'transparent',
  fontSize: 15,
  color: '#1a1a2e',
}

const tabBtn = (active) => ({
  flex: 1,
  padding: '10px 0',
  fontSize: 14,
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  background: 'none',
  borderBottom: active ? '2px solid #1e3a5f' : '2px solid transparent',
  color: active ? '#1e3a5f' : '#adb5bd',
  transition: 'all 0.15s',
})

const btnPrimary = (disabled) => ({
  padding: '13px',
  borderRadius: 12,
  border: 'none',
  background: disabled ? '#e9ecef' : '#1e3a5f',
  color: disabled ? '#adb5bd' : '#fff',
  fontSize: 14,
  fontWeight: 700,
  cursor: disabled ? 'not-allowed' : 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
})

const btnGhost = {
  padding: '13px',
  borderRadius: 12,
  border: '1px solid #dee2e6',
  background: '#fff',
  fontSize: 14,
  fontWeight: 600,
  color: '#6c757d',
  cursor: 'pointer',
}

// ── Project form sheet ────────────────────────────────────────────────────────
function ProjectSheet({ initial, saving, onSave, onClose }) {
  const isEdit = !!initial?.id
  const [tab, setTab] = useState('info')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [date, setDate] = useState(initial?.date ?? '')
  const [goal, setGoal] = useState(initial?.goal ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [items, setItems] = useState(
    initial?.items?.length ? initial.items : [{ id: uid(), origen: '', value: '' }],
  )
  const [focusedValueId, setFocusedValueId] = useState(null)
  const [projectNotes, setProjectNotes] = useState(initial?.projectNotes ?? [])
  const [newNoteText, setNewNoteText] = useState('')
  const [newNoteRef, setNewNoteRef] = useState('')

  const addNote = () => {
    if (!newNoteText.trim()) return
    setProjectNotes((prev) => [
      ...prev,
      { id: uid(), text: newNoteText.trim(), reference: newNoteRef.trim(), createdAt: now() },
    ])
    setNewNoteText('')
    setNewNoteRef('')
  }

  const removeNote = (id) => setProjectNotes((prev) => prev.filter((n) => n.id !== id))

  const addItem = () =>
    setItems((prev) => [...prev, { id: uid(), origen: '', value: '' }])

  const updateItem = (id, field, val) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: val } : it)))

  const removeItem = (id) =>
    setItems((prev) => prev.filter((it) => it.id !== id))

  const moveItem = (idx, dir) =>
    setItems((prev) => {
      const next = [...prev]
      const target = idx + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })

  const handleSave = () => {
    if (!description.trim()) return
    const cleanItems = items
      .filter((it) => it.origen.trim() || Number(it.value))
      .map((it) => ({ ...it, value: Number(it.value) || 0 }))
    const project = {
      id: initial?.id ?? uid(),
      description: description.trim(),
      date: date.trim(),
      goal: Number(goal) || 0,
      notes: notes.trim(),
      items: cleanItems,
      projectNotes,
      createdAt: initial?.createdAt ?? now(),
      updatedAt: now(),
      syncedAt: initial?.syncedAt ?? null,
    }
    onSave(project)
  }

  const total = items.reduce((s, i) => s + (Number(i.value) || 0), 0)

  return (
    <div onClick={onClose} style={sheetOverlay}>
      <div onClick={(e) => e.stopPropagation()} style={sheetBox}>
        <div style={dragHandle} />

        <div style={{ fontSize: 17, fontWeight: 700, color: '#1a1a2e', marginBottom: 16 }}>
          {isEdit ? 'Editar proyecto' : 'Nuevo proyecto'}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e9ecef', marginBottom: 20 }}>
          <button style={tabBtn(tab === 'info')} onClick={() => setTab('info')}>Información</button>
          <button style={tabBtn(tab === 'items')} onClick={() => setTab('items')}>
            Aportes{items.filter((i) => i.origen).length > 0 ? ` (${items.filter((i) => i.origen).length})` : ''}
          </button>
          <button style={tabBtn(tab === 'notes')} onClick={() => setTab('notes')}>
            Notas{projectNotes.length > 0 ? ` (${projectNotes.length})` : ''}
          </button>
        </div>

        {/* Info tab */}
        {tab === 'info' && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <label style={fieldLabel}>DESCRIPCIÓN *</label>
              <input
                style={fieldInput}
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Compra carro 2026"
                autoFocus
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={fieldLabel}>FECHA OBJETIVO</label>
              <input
                style={fieldInput}
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="Ej: Octubre 1 2026"
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={fieldLabel}>DESCRIPCIÓN</label>
              <textarea
                style={{ ...fieldInput, resize: 'none', fontFamily: 'inherit', fontSize: 14, lineHeight: 1.5 }}
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas u observaciones del proyecto…"
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={fieldLabel}>VALOR TOTAL DEL PROYECTO (COP)</label>
              <input
                style={fieldInput}
                type="number"
                min="0"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Ej: 50000000"
              />
            </div>
            {total > 0 && (
              <div
                style={{
                  background: '#eef4ff',
                  border: '1px solid #c5d8ff',
                  borderRadius: 12,
                  padding: '12px 16px',
                  marginBottom: 18,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 13, color: '#1e3a5f', fontWeight: 600 }}>Total proyectado</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#1e3a5f' }}>{fmt(total)}</span>
              </div>
            )}
          </div>
        )}

        {/* Items tab */}
        {tab === 'items' && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '24px 1fr 110px 32px',
                gap: 8,
                marginBottom: 8,
                padding: '0 2px',
              }}
            >
              <span />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#adb5bd', letterSpacing: '0.05em' }}>ORIGEN</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#adb5bd', letterSpacing: '0.05em', textAlign: 'right' }}>VALOR (COP)</span>
              <span />
            </div>

            {items.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '24px 1fr 110px 32px',
                  gap: 8,
                  alignItems: 'center',
                  marginBottom: 10,
                  padding: '6px 8px',
                  borderRadius: 10,
                  background: '#f8f9fa',
                  border: '1px solid #e9ecef',
                }}
              >
                {/* Order controls */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <button
                    onClick={() => moveItem(idx, -1)}
                    disabled={idx === 0}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: idx === 0 ? 'default' : 'pointer',
                      color: idx === 0 ? '#dee2e6' : '#6c757d',
                      fontSize: 11,
                      lineHeight: 1,
                      padding: '1px 0',
                    }}
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveItem(idx, 1)}
                    disabled={idx === items.length - 1}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: idx === items.length - 1 ? 'default' : 'pointer',
                      color: idx === items.length - 1 ? '#dee2e6' : '#6c757d',
                      fontSize: 11,
                      lineHeight: 1,
                      padding: '1px 0',
                    }}
                  >
                    ▼
                  </button>
                </div>

                <input
                  type="text"
                  value={item.origen}
                  onChange={(e) => updateItem(item.id, 'origen', e.target.value)}
                  placeholder={`Origen ${idx + 1}`}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: 14,
                    color: '#1a1a2e',
                    width: '100%',
                  }}
                />
                <input
                  type={focusedValueId === item.id ? 'number' : 'text'}
                  value={
                    focusedValueId === item.id
                      ? item.value
                      : item.value
                        ? new Intl.NumberFormat('es-CO').format(Number(item.value))
                        : ''
                  }
                  onChange={(e) => updateItem(item.id, 'value', e.target.value)}
                  onFocus={() => setFocusedValueId(item.id)}
                  onBlur={() => setFocusedValueId(null)}
                  placeholder="0"
                  min="0"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#1e3a5f',
                    textAlign: 'right',
                    width: '100%',
                  }}
                />
                <button
                  onClick={() => removeItem(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#adb5bd',
                    fontSize: 18,
                    lineHeight: 1,
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </div>
            ))}

            <button
              onClick={addItem}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 10,
                border: '2px dashed #dee2e6',
                background: 'transparent',
                fontSize: 13,
                color: '#6c757d',
                cursor: 'pointer',
                marginBottom: 12,
              }}
            >
              + Agregar origen
            </button>

            {total > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: '#2f9e44' }}>Total</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#2f9e44' }}>{fmt(total)}</span>
              </div>
            )}
          </div>
        )}

        {/* Notes tab */}
        {tab === 'notes' && (
          <div>
            {projectNotes.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#adb5bd', fontSize: 13 }}>
                Sin notas aún
              </div>
            )}
            {projectNotes.map((note) => (
              <div
                key={note.id}
                style={{
                  background: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: 10,
                  padding: '10px 12px',
                  marginBottom: 8,
                  position: 'relative',
                }}
              >
                <button
                  onClick={() => removeNote(note.id)}
                  style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#e03131', fontSize: 16, lineHeight: 1, padding: 0,
                  }}
                >×</button>
                <div style={{ fontSize: 14, color: '#1a1a2e', marginBottom: 4, paddingRight: 20 }}>
                  {note.text}
                </div>
                {note.reference && (
                  <div style={{ fontSize: 12, color: '#1e3a5f', marginBottom: 4 }}>
                    🔗 {note.reference}
                  </div>
                )}
                <div style={{ fontSize: 11, color: '#adb5bd' }}>
                  {new Date(note.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
            ))}

            {/* Add note form */}
            <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: 10, padding: '12px', marginTop: 4 }}>
              <div style={{ marginBottom: 10 }}>
                <label style={fieldLabel}>NOTA *</label>
                <textarea
                  style={{ ...fieldInput, resize: 'none', fontFamily: 'inherit', fontSize: 14, lineHeight: 1.5 }}
                  rows={2}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Escribe una nota…"
                />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={fieldLabel}>REFERENCIA</label>
                <input
                  style={fieldInput}
                  type="text"
                  value={newNoteRef}
                  onChange={(e) => setNewNoteRef(e.target.value)}
                  placeholder="URL, libro, persona…"
                />
              </div>
              <button
                onClick={addNote}
                disabled={!newNoteText.trim()}
                style={{
                  width: '100%', padding: '9px', borderRadius: 9,
                  border: 'none',
                  background: newNoteText.trim() ? '#1e3a5f' : '#e9ecef',
                  color: newNoteText.trim() ? '#fff' : '#adb5bd',
                  fontSize: 13, fontWeight: 700,
                  cursor: newNoteText.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                + Agregar nota
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button style={btnGhost} onClick={onClose}>Cancelar</button>
          <button
            style={{ ...btnPrimary(saving || !description.trim()), flex: 2 }}
            onClick={handleSave}
            disabled={saving || !description.trim()}
          >
            {saving ? (
              <CSpinner size="sm" style={{ borderColor: '#fff', borderRightColor: 'transparent' }} />
            ) : (
              isEdit ? 'Guardar cambios' : 'Crear proyecto'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Project card ──────────────────────────────────────────────────────────────
function ProjectCard({ project, isFirst, isLast, syncing, onEdit, onDelete, onSync, onSave, onClone, onMove }) {
  const total = totalOf(project.items)
  const goal = Number(project.goal) || 0
  const remaining = goal > 0 ? goal - total : null
  const isSynced = !!project.syncedAt

  const [editingName, setEditingName] = useState(false)
  const [localName, setLocalName] = useState(project.description)
  const [cloning, setCloning] = useState(false)
  const [cloneName, setCloneName] = useState('')
  const [editingItemId, setEditingItemId] = useState(null)
  const [localOrigen, setLocalOrigen] = useState('')
  const [editingValueId, setEditingValueId] = useState(null)
  const [localValue, setLocalValue] = useState('')
  const [editingGoal, setEditingGoal] = useState(false)
  const [localGoal, setLocalGoal] = useState('')
  const [editingNotes, setEditingNotes] = useState(false)
  const [localNotes, setLocalNotes] = useState('')
  const [showProjectNotes, setShowProjectNotes] = useState(false)
  const [addingNote, setAddingNote] = useState(false)
  const [newNoteText, setNewNoteText] = useState('')
  const [newNoteRef, setNewNoteRef] = useState('')

  const commitName = () => {
    setEditingName(false)
    const trimmed = localName.trim()
    if (!trimmed || trimmed === project.description) return
    onSave({ ...project, description: trimmed, updatedAt: now(), syncedAt: null })
  }

  const startItemEdit = (item) => {
    setEditingItemId(item.id)
    setLocalOrigen(item.origen)
  }

  const commitItem = (item) => {
    setEditingItemId(null)
    const trimmed = localOrigen.trim()
    if (trimmed === item.origen) return
    const updatedItems = project.items.map((it) =>
      it.id === item.id ? { ...it, origen: trimmed } : it,
    )
    onSave({ ...project, items: updatedItems, updatedAt: now(), syncedAt: null })
  }

  const commitGoal = () => {
    setEditingGoal(false)
    const num = Number(String(localGoal).replace(/\D/g, ''))
    if (num === Number(project.goal)) return
    onSave({ ...project, goal: num, updatedAt: now(), syncedAt: null })
  }

  const commitNotes = () => {
    setEditingNotes(false)
    const trimmed = localNotes.trim()
    if (trimmed === (project.notes ?? '')) return
    onSave({ ...project, notes: trimmed, updatedAt: now(), syncedAt: null })
  }

  const startValueEdit = (item) => {
    setEditingValueId(item.id)
    setLocalValue(String(item.value ?? ''))
  }

  const commitValue = (item) => {
    setEditingValueId(null)
    const num = Number(String(localValue).replace(/\D/g, ''))
    if (num === Number(item.value)) return
    const updatedItems = project.items.map((it) =>
      it.id === item.id ? { ...it, value: num } : it,
    )
    onSave({ ...project, items: updatedItems, updatedAt: now(), syncedAt: null })
  }

  const moveCardItem = (idx, dir) => {
    const items = [...project.items]
    const target = idx + dir
    if (target < 0 || target >= items.length) return
    ;[items[idx], items[target]] = [items[target], items[idx]]
    onSave({ ...project, items, updatedAt: now(), syncedAt: null })
  }

  const cardNotes = project.projectNotes ?? []

  const saveCardNote = () => {
    if (!newNoteText.trim()) return
    const note = { id: uid(), text: newNoteText.trim(), reference: newNoteRef.trim(), createdAt: now() }
    onSave({ ...project, projectNotes: [...cardNotes, note], updatedAt: now(), syncedAt: null })
    setNewNoteText('')
    setNewNoteRef('')
    setAddingNote(false)
  }

  const deleteCardNote = (noteId) => {
    onSave({ ...project, projectNotes: cardNotes.filter((n) => n.id !== noteId), updatedAt: now(), syncedAt: null })
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
            inlineInput(localName, setLocalName, commitName, {
              fontSize: 15, fontWeight: 700, color: '#1a1a2e',
            })
          ) : (
            <div
              onClick={() => setEditingName(true)}
              title="Toca para editar"
              style={{
                fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 2,
                cursor: 'text',
                borderBottom: '1px dashed transparent',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = '#dee2e6')}
              onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = 'transparent')}
            >
              {project.description}
            </div>
          )}
          {/* 2 — cuánto falta */}
          {goal > 0 && (
            <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: '#adb5bd' }}>Falta:</span>
              <span style={{
                fontSize: 13, fontWeight: 800,
                color: remaining <= 0 ? '#2f9e44' : '#e67700',
              }}>
                {remaining <= 0 ? '✅ Listo' : fmt(remaining)}
              </span>
            </div>
          )}
          {editingNotes ? (
            <textarea
              autoFocus
              value={localNotes}
              rows={2}
              onChange={(e) => setLocalNotes(e.target.value)}
              onBlur={commitNotes}
              onKeyDown={(e) => e.key === 'Escape' && commitNotes()}
              style={{
                width: '100%', marginTop: 2, border: 'none',
                borderBottom: '2px solid #1e3a5f', outline: 'none',
                background: 'transparent', fontSize: 11, color: '#6c757d',
                fontStyle: 'italic', resize: 'none', fontFamily: 'inherit',
                padding: '0 0 2px',
              }}
            />
          ) : (
            <div
              onClick={() => { setLocalNotes(project.notes ?? ''); setEditingNotes(true) }}
              title="Toca para editar"
              style={{
                fontSize: 11, color: project.notes ? '#adb5bd' : '#dee2e6',
                marginTop: 2, fontStyle: 'italic', cursor: 'text',
                borderBottom: '1px dashed transparent', minHeight: 14,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = '#dee2e6')}
              onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = 'transparent')}
            >
              {project.notes || 'Agregar descripción…'}
            </div>
          )}
          {project.date && (
            <div style={{ fontSize: 12, color: '#6c757d', marginTop: 2 }}>📅 {project.date}</div>
          )}
        </div>
        {/* 1 — valor total del proyecto (goal) */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {editingGoal ? (
            <input
              autoFocus
              type="number"
              min="0"
              value={localGoal}
              onChange={(e) => setLocalGoal(e.target.value)}
              onBlur={commitGoal}
              onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
              style={{
                border: 'none', borderBottom: '2px solid #1e3a5f', outline: 'none',
                background: 'transparent', fontSize: 17, fontWeight: 800,
                color: '#1e3a5f', textAlign: 'right', width: 130, padding: '0 0 2px',
              }}
            />
          ) : (
            <div
              onClick={() => { setLocalGoal(String(project.goal ?? '')); setEditingGoal(true) }}
              title="Toca para editar"
              style={{
                fontSize: 17, fontWeight: 800, color: '#1e3a5f', cursor: 'text',
                borderBottom: '1px dashed transparent',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = '#c5d8ff')}
              onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = 'transparent')}
            >
              {goal > 0 ? fmt(goal) : fmt(total)}
            </div>
          )}
          <div style={{ fontSize: 10, fontWeight: 600, color: isSynced ? '#2f9e44' : '#f59f00', marginTop: 2 }}>
            {isSynced ? '● Sincronizado' : '○ Local'}
          </div>
        </div>
      </div>

      {/* Items preview */}
      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 8, marginBottom: 10 }}>
        {project.items?.length > 0 && project.items.map((item, itemIdx) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 0',
                borderBottom: '1px solid #f8f9fa',
              }}
            >
              {editingItemId === item.id ? (
                inlineInput(localOrigen, setLocalOrigen, () => commitItem(item), {
                  fontSize: 13, color: '#6c757d', flex: 1,
                })
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, gap: 2 }}>
                  {/* reorder */}
                  <span style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                    <button
                      onClick={() => moveCardItem(itemIdx, -1)}
                      disabled={itemIdx === 0}
                      style={{
                        background: 'none', border: 'none', padding: '0 1px', lineHeight: 1,
                        cursor: itemIdx === 0 ? 'default' : 'pointer',
                        color: itemIdx === 0 ? '#dee2e6' : '#adb5bd', fontSize: 8,
                      }}
                    >▲</button>
                    <button
                      onClick={() => moveCardItem(itemIdx, 1)}
                      disabled={itemIdx === project.items.length - 1}
                      style={{
                        background: 'none', border: 'none', padding: '0 1px', lineHeight: 1,
                        cursor: itemIdx === project.items.length - 1 ? 'default' : 'pointer',
                        color: itemIdx === project.items.length - 1 ? '#dee2e6' : '#adb5bd', fontSize: 8,
                      }}
                    >▼</button>
                  </span>
                  <button
                    onClick={() => {
                      const updatedItems = project.items.filter((it) => it.id !== item.id)
                      onSave({ ...project, items: updatedItems, updatedAt: now(), syncedAt: null })
                    }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#e03131', fontSize: 13, lineHeight: 1, padding: '0 2px',
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
                      fontSize: 13, color: '#6c757d', cursor: 'text',
                      borderBottom: '1px dashed transparent',
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
                    fontSize: 13, fontWeight: 600, color: '#1a1a2e',
                    marginLeft: 8, flexShrink: 0, cursor: 'text',
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
            const newItem = { id: uid(), origen: '', value: 0 }
            const updatedItems = [...(project.items ?? []), newItem]
            onSave({ ...project, items: updatedItems, updatedAt: now(), syncedAt: null })
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
              background: remaining <= 0 ? '#f0fdf4' : '#fff8e1',
              border: `1px solid ${remaining <= 0 ? '#86efac' : '#ffe066'}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#6c757d', fontWeight: 600 }}>Tengo</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{fmt(total)}</span>
            </div>
            <div
              style={{
                borderTop: '1px solid rgba(0,0,0,0.07)',
                paddingTop: 6,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: remaining <= 0 ? '#2f9e44' : '#e67700' }}>
                {remaining <= 0 ? '✅ Meta alcanzada' : '⏳ Falta'}
              </span>
              <span style={{ fontSize: 15, fontWeight: 800, color: remaining <= 0 ? '#2f9e44' : '#e67700' }}>
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
          <span>📝 Notas{cardNotes.length > 0 ? ` (${cardNotes.length})` : ''}</span>
          <span style={{ fontSize: 10 }}>{showProjectNotes ? '▲' : '▼'}</span>
        </button>

        {showProjectNotes && (
          <div style={{ padding: '10px 4px 4px' }}>
            {cardNotes.map((note) => (
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
                    position: 'absolute', top: 6, right: 8,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#e03131', fontSize: 15, lineHeight: 1, padding: 0,
                  }}
                >×</button>
                <div style={{ fontSize: 13, color: '#1a1a2e', marginBottom: 2, paddingRight: 18 }}>
                  {note.text}
                </div>
                {note.reference && (
                  <div style={{ fontSize: 11, color: '#1e3a5f', marginBottom: 2 }}>
                    🔗 {note.reference}
                  </div>
                )}
                <div style={{ fontSize: 10, color: '#adb5bd' }}>
                  {new Date(note.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
            ))}

            {addingNote ? (
              <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: 10, padding: '10px' }}>
                <input
                  autoFocus
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                  placeholder="Nota…"
                  style={{
                    width: '100%', border: 'none', borderBottom: '2px solid #1e3a5f',
                    outline: 'none', background: 'transparent', fontSize: 13,
                    color: '#1a1a2e', padding: '2px 0 6px', marginBottom: 8,
                  }}
                />
                <input
                  type="text"
                  value={newNoteRef}
                  onChange={(e) => setNewNoteRef(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveCardNote()}
                  placeholder="Referencia (opcional)…"
                  style={{
                    width: '100%', border: 'none', borderBottom: '1px solid #dee2e6',
                    outline: 'none', background: 'transparent', fontSize: 12,
                    color: '#6c757d', padding: '2px 0 6px', marginBottom: 8,
                  }}
                />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={saveCardNote}
                    disabled={!newNoteText.trim()}
                    style={{
                      flex: 1, padding: '6px', borderRadius: 8, border: 'none',
                      background: newNoteText.trim() ? '#1e3a5f' : '#e9ecef',
                      color: newNoteText.trim() ? '#fff' : '#adb5bd',
                      fontSize: 12, fontWeight: 700,
                      cursor: newNoteText.trim() ? 'pointer' : 'not-allowed',
                    }}
                  >Guardar</button>
                  <button
                    onClick={() => { setAddingNote(false); setNewNoteText(''); setNewNoteRef('') }}
                    style={{
                      padding: '6px 10px', borderRadius: 8, border: '1px solid #dee2e6',
                      background: '#fff', fontSize: 12, color: '#6c757d', cursor: 'pointer',
                    }}
                  >✕</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingNote(true)}
                style={{
                  width: '100%', padding: '7px', borderRadius: 8,
                  border: '1px dashed #dee2e6', background: 'transparent',
                  fontSize: 12, color: '#adb5bd', cursor: 'pointer',
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
        <div style={{ marginBottom: 10, padding: '10px 12px', borderRadius: 10, background: '#f8f9fa', border: '1px solid #dee2e6' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6c757d', marginBottom: 6 }}>NOMBRE DEL NUEVO PROYECTO</div>
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
                flex: 1, border: 'none', borderBottom: '2px solid #1e3a5f',
                outline: 'none', background: 'transparent', fontSize: 14,
                color: '#1a1a2e', padding: '2px 0',
              }}
            />
            <button
              onClick={() => {
                if (cloneName.trim()) onClone(project, cloneName.trim())
                setCloning(false)
              }}
              disabled={!cloneName.trim()}
              style={{
                padding: '4px 12px', borderRadius: 8, border: 'none',
                background: cloneName.trim() ? '#1e3a5f' : '#e9ecef',
                color: cloneName.trim() ? '#fff' : '#adb5bd',
                fontSize: 13, fontWeight: 700, cursor: cloneName.trim() ? 'pointer' : 'not-allowed',
                flexShrink: 0,
              }}
            >
              Clonar
            </button>
            <button
              onClick={() => setCloning(false)}
              style={{
                padding: '4px 10px', borderRadius: 8, border: '1px solid #dee2e6',
                background: '#fff', fontSize: 13, color: '#6c757d', cursor: 'pointer', flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        </div>
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
              padding: '3px 10px', borderRadius: 6, border: '1px solid #dee2e6',
              background: isFirst ? '#f8f9fa' : '#fff',
              color: isFirst ? '#dee2e6' : '#6c757d',
              fontSize: 11, cursor: isFirst ? 'default' : 'pointer', lineHeight: 1,
            }}
            title="Mover arriba"
          >▲</button>
          <button
            onClick={() => onMove(project, 1)}
            disabled={isLast}
            style={{
              padding: '3px 10px', borderRadius: 6, border: '1px solid #dee2e6',
              background: isLast ? '#f8f9fa' : '#fff',
              color: isLast ? '#dee2e6' : '#6c757d',
              fontSize: 11, cursor: isLast ? 'default' : 'pointer', lineHeight: 1,
            }}
            title="Mover abajo"
          >▼</button>
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
          onClick={() => { setCloneName(project.description); setCloning(true) }}
          title="Clonar proyecto"
          style={{
            padding: '8px 12px', borderRadius: 8, border: 'none',
            background: '#f8f9fa', fontSize: 13, color: '#6c757d', cursor: 'pointer',
          }}
        >
          ⎘
        </button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MyProjects() {
  const dispatch = useDispatch()
  const { projects, loading, saving, syncing, syncingAll, importing } = useSelector((s) => s.myProject)

  const [sheet, setSheet] = useState(null) // null | 'new' | project object

  useEffect(() => {
    dispatch(actions.loadRequest())
  }, [dispatch])

  const handleSave = (project) => {
    const withOrder = project.sortOrder != null ? project : { ...project, sortOrder: projects.length }
    dispatch(actions.saveRequest(withOrder))
    setSheet(null)
  }

  const handleDelete = (project) => {
    if (window.confirm(`¿Eliminar "${project.description}"?`)) {
      dispatch(actions.deleteRequest({ id: project.id }))
    }
  }

  const handleSync = (project) => {
    dispatch(actions.syncRequest(project))
  }

  const handleSyncAll = () => {
    dispatch(actions.syncAllRequest(projects))
  }

  const handleClone = (project, name) => {
    const clone = {
      ...project,
      id: uid(),
      description: name,
      createdAt: now(),
      updatedAt: now(),
      syncedAt: null,
      sortOrder: projects.length,
    }
    dispatch(actions.saveRequest(clone))
  }

  const handleMove = (project, dir) => {
    const sorted = projects
      .slice()
      .sort((a, b) => (a.sortOrder ?? Infinity) - (b.sortOrder ?? Infinity))
    const idx = sorted.findIndex((p) => p.id === project.id)
    const targetIdx = idx + dir
    if (targetIdx < 0 || targetIdx >= sorted.length) return
    const aOrder = idx
    const bOrder = targetIdx
    dispatch(actions.saveRequest({ ...sorted[idx], sortOrder: bOrder, updatedAt: now(), syncedAt: null }))
    dispatch(actions.saveRequest({ ...sorted[targetIdx], sortOrder: aOrder, updatedAt: now(), syncedAt: null }))
  }

  const sortedProjects = projects
    .slice()
    .sort((a, b) => (a.sortOrder ?? Infinity) - (b.sortOrder ?? Infinity))

  const unsyncedCount = projects.filter((p) => !p.syncedAt).length
  const grandTotal = projects.reduce((s, p) => s + totalOf(p.items), 0)

  return (
    <div
      style={{
        maxWidth: 540,
        margin: '0 auto',
        padding: '0 12px 40px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 0 16px',
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e' }}>My Projects</div>
          <div style={{ fontSize: 13, color: '#6c757d', marginTop: 2 }}>
            {projects.length} proyecto{projects.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => dispatch(actions.importRequest())}
            disabled={importing}
            title="Importar desde Firebase"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '1px solid #dee2e6',
              background: '#fff',
              color: importing ? '#adb5bd' : '#1e3a5f',
              fontSize: 18,
              cursor: importing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {importing ? <CSpinner size="sm" /> : '☁️'}
          </button>
          <button
            onClick={() => setSheet('new')}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: 'none',
              background: '#1e3a5f',
              color: '#fff',
              fontSize: 22,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          +
        </button>
        </div>
      </div>

      {/* Grand total */}
      {grandTotal > 0 && (
        <div
          style={{
            background: '#eef4ff',
            border: '1px solid #c5d8ff',
            borderRadius: 14,
            padding: '12px 16px',
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 13, color: '#1e3a5f', fontWeight: 600 }}>Total acumulado</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#1e3a5f' }}>{fmt(grandTotal)}</span>
        </div>
      )}

      {/* Sync all button */}
      {unsyncedCount > 0 && (
        <button
          onClick={handleSyncAll}
          disabled={syncingAll}
          style={{
            width: '100%',
            padding: '11px',
            borderRadius: 12,
            border: 'none',
            background: syncingAll ? '#e9ecef' : '#f0fdf4',
            color: syncingAll ? '#adb5bd' : '#2f9e44',
            fontSize: 14,
            fontWeight: 700,
            cursor: syncingAll ? 'not-allowed' : 'pointer',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            border: syncingAll ? '1px solid #dee2e6' : '1px solid #86efac',
          }}
        >
          {syncingAll ? (
            <>
              <CSpinner size="sm" /> Sincronizando…
            </>
          ) : (
            `☁️ Sincronizar todo (${unsyncedCount} pendiente${unsyncedCount !== 1 ? 's' : ''})`
          )}
        </button>
      )}

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <CSpinner color="primary" />
        </div>
      ) : projects.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: '#adb5bd',
            fontSize: 14,
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>💡</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Sin proyectos aún</div>
          <div>Presiona + para crear tu primer proyecto</div>
        </div>
      ) : (
        sortedProjects.map((p, idx) => (
          <ProjectCard
            key={p.id}
            project={p}
            isFirst={idx === 0}
            isLast={idx === sortedProjects.length - 1}
            syncing={syncing}
            onEdit={setSheet}
            onDelete={handleDelete}
            onSync={handleSync}
            onSave={(updated) => dispatch(actions.saveRequest(updated))}
            onClone={handleClone}
            onMove={handleMove}
          />
        ))
      )}

      {/* Sheet */}
      {sheet && (
        <ProjectSheet
          initial={sheet === 'new' ? null : sheet}
          saving={saving}
          onSave={handleSave}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  )
}
