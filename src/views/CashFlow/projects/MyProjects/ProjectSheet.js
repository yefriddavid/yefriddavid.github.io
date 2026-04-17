import React, { useState } from 'react'
import { CSpinner } from '@coreui/react'
import {
  fmt,
  uid,
  now,
  sheetOverlay,
  sheetBox,
  dragHandle,
  fieldLabel,
  fieldInput,
  tabBtn,
  btnPrimary,
  btnGhost,
} from './helpers'

export default function ProjectSheet({ initial, saving, onSave, onClose }) {
  const isEdit = !!initial?.id
  const [tab, setTab] = useState('info')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [date, setDate] = useState(initial?.date ?? '')
  const [goal, setGoal] = useState(initial?.goal ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [items, setItems] = useState(
    initial?.items?.length ? initial.items : [{ id: uid(), origen: '', value: '', paid: false }],
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
    setItems((prev) => [...prev, { id: uid(), origen: '', value: '', paid: false }])

  const updateItem = (id, field, val) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: val } : it)))

  const removeItem = (id) => setItems((prev) => prev.filter((it) => it.id !== id))

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
          <button style={tabBtn(tab === 'info')} onClick={() => setTab('info')}>
            Información
          </button>
          <button style={tabBtn(tab === 'items')} onClick={() => setTab('items')}>
            Aportes
            {items.filter((i) => i.origen).length > 0
              ? ` (${items.filter((i) => i.origen).length})`
              : ''}
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
                style={{
                  ...fieldInput,
                  resize: 'none',
                  fontFamily: 'inherit',
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
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
                <span style={{ fontSize: 13, color: '#1e3a5f', fontWeight: 600 }}>
                  Total proyectado
                </span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#1e3a5f' }}>
                  {fmt(total)}
                </span>
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
                gridTemplateColumns: '24px 28px 1fr 110px 32px',
                gap: 8,
                marginBottom: 8,
                padding: '0 2px',
              }}
            >
              <span />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#adb5bd',
                  letterSpacing: '0.05em',
                  textAlign: 'center',
                }}
              >
                ✓
              </span>
              <span
                style={{ fontSize: 11, fontWeight: 700, color: '#adb5bd', letterSpacing: '0.05em' }}
              >
                ORIGEN
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#adb5bd',
                  letterSpacing: '0.05em',
                  textAlign: 'right',
                }}
              >
                VALOR (COP)
              </span>
              <span />
            </div>

            {items.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '24px 28px 1fr 110px 32px',
                  gap: 8,
                  alignItems: 'center',
                  marginBottom: 10,
                  padding: '6px 8px',
                  borderRadius: 10,
                  background: item.paid ? '#f0fdf4' : '#f8f9fa',
                  border: `1px solid ${item.paid ? '#86efac' : '#e9ecef'}`,
                }}
              >
                {/* Order controls */}
                <div
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}
                >
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

                {/* Paid checkbox */}
                <input
                  type="checkbox"
                  checked={!!item.paid}
                  onChange={(e) => updateItem(item.id, 'paid', e.target.checked)}
                  title="Marcar como efectuado"
                  style={{
                    width: 16,
                    height: 16,
                    cursor: 'pointer',
                    accentColor: '#2f9e44',
                    justifySelf: 'center',
                  }}
                />

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
                    textDecoration: item.paid ? 'line-through' : 'none',
                    opacity: item.paid ? 0.6 : 1,
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
                    color: item.paid ? '#2f9e44' : '#1e3a5f',
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

            {total > 0 &&
              (() => {
                const paidTotal = items
                  .filter((i) => i.paid)
                  .reduce((s, i) => s + (Number(i.value) || 0), 0)
                const goalNum = Number(goal) || 0
                const overrun = goalNum > 0 && paidTotal > goalNum ? paidTotal - goalNum : 0
                return (
                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        borderRadius: 10,
                        background: '#f0fdf4',
                        border: '1px solid #86efac',
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#2f9e44' }}>
                        Total proyectado
                      </span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#2f9e44' }}>
                        {fmt(total)}
                      </span>
                    </div>
                    {paidTotal > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          borderRadius: 10,
                          background: overrun > 0 ? '#fff5f5' : '#eef4ff',
                          border: `1px solid ${overrun > 0 ? '#ffa8a8' : '#c5d8ff'}`,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: overrun > 0 ? '#e03131' : '#1e3a5f',
                          }}
                        >
                          ✅ Efectuado
                        </span>
                        <div style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              fontSize: 15,
                              fontWeight: 800,
                              color: overrun > 0 ? '#e03131' : '#1e3a5f',
                              display: 'block',
                            }}
                          >
                            {fmt(paidTotal)}
                          </span>
                          {overrun > 0 && (
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#e03131' }}>
                              +{fmt(overrun)} sobre presupuesto
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
          </div>
        )}

        {/* Notes tab */}
        {tab === 'notes' && (
          <div>
            {projectNotes.length === 0 && (
              <div
                style={{ textAlign: 'center', padding: '24px 0', color: '#adb5bd', fontSize: 13 }}
              >
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
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#e03131',
                    fontSize: 16,
                    lineHeight: 1,
                    padding: 0,
                  }}
                >
                  ×
                </button>
                <div style={{ fontSize: 14, color: '#1a1a2e', marginBottom: 4, paddingRight: 20 }}>
                  {note.text}
                </div>
                {note.reference && (
                  <div style={{ fontSize: 12, color: '#1e3a5f', marginBottom: 4 }}>
                    🔗 {note.reference}
                  </div>
                )}
                <div style={{ fontSize: 11, color: '#adb5bd' }}>
                  {new Date(note.createdAt).toLocaleDateString('es-CO', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </div>
            ))}

            {/* Add note form */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #dee2e6',
                borderRadius: 10,
                padding: '12px',
                marginTop: 4,
              }}
            >
              <div style={{ marginBottom: 10 }}>
                <label style={fieldLabel}>NOTA *</label>
                <textarea
                  style={{
                    ...fieldInput,
                    resize: 'none',
                    fontFamily: 'inherit',
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
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
                  width: '100%',
                  padding: '9px',
                  borderRadius: 9,
                  border: 'none',
                  background: newNoteText.trim() ? '#1e3a5f' : '#e9ecef',
                  color: newNoteText.trim() ? '#fff' : '#adb5bd',
                  fontSize: 13,
                  fontWeight: 700,
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
          <button style={btnGhost} onClick={onClose}>
            Cancelar
          </button>
          <button
            style={{ ...btnPrimary(saving || !description.trim()), flex: 2 }}
            onClick={handleSave}
            disabled={saving || !description.trim()}
          >
            {saving ? (
              <CSpinner
                size="sm"
                style={{ borderColor: '#fff', borderRightColor: 'transparent' }}
              />
            ) : isEdit ? (
              'Guardar cambios'
            ) : (
              'Crear proyecto'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
