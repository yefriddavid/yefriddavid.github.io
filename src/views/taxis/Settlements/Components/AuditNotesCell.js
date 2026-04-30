import React, { useState } from 'react'
import { IssueEntry } from './AuditMissingCell'
import './Audit.scss'

const AuditNotesCell = ({
  day,
  auditDriverFilter,
  periodDrivers,
  getNotesForDay,
  editingNote,
  setEditingNote,
  handleResolvedToggle,
  handleNoteSave,
  t,
}) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [addingDriver, setAddingDriver] = useState('')

  const notesForDay = getNotesForDay(day.dateStr)
  const driverNoteSet = new Set(notesForDay.map((n) => n.driver))

  const eligibleDrivers = periodDrivers.filter((d) => {
    if (d.startDate && d.startDate > day.dateStr) return false
    if (d.endDate && d.endDate < day.dateStr) return false
    return true
  })

  const availableDrivers = eligibleDrivers.filter((d) => !driverNoteSet.has(d.name))

  const visibleNotes =
    auditDriverFilter.size > 0
      ? notesForDay.filter((n) => auditDriverFilter.has(n.driver))
      : notesForDay

  const handleAdd = (noteText) => {
    if (!addingDriver || !noteText.trim()) {
      setShowAddForm(false)
      setAddingDriver('')
      return
    }
    handleNoteSave(day.dateStr, addingDriver, noteText.trim())
    setShowAddForm(false)
    setAddingDriver('')
  }

  const cancelAdd = (e) => {
    e?.stopPropagation()
    setShowAddForm(false)
    setAddingDriver('')
  }

  return (
    <td className="audit-cell">
      <div className="audit-cell__issues">
        {visibleNotes.map(({ driver, note, resolved }) => {
          const isEditing = editingNote?.date === day.dateStr && editingNote?.driver === driver
          return (
            <IssueEntry
              key={driver}
              label={driver.split(' ')[0]}
              note={note}
              resolved={resolved}
              isEditing={isEditing}
              variant="note"
              onResolveToggle={(e) => {
                e.stopPropagation()
                handleResolvedToggle(day.dateStr, driver)
              }}
              onEditToggle={(e) => {
                e.stopPropagation()
                setEditingNote(isEditing ? null : { date: day.dateStr, driver })
              }}
              onNoteSave={(val) => handleNoteSave(day.dateStr, driver, val)}
              onNoteDelete={(e) => {
                e.stopPropagation()
                handleNoteSave(day.dateStr, driver, '')
              }}
              onCancel={() => setEditingNote(null)}
              t={t}
            />
          )
        })}

        {!showAddForm && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowAddForm(true)
            }}
            style={{
              background: 'none',
              border: '1px dashed #93c5fd',
              color: '#3b82f6',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 11,
              padding: '1px 7px',
              lineHeight: 1.6,
              whiteSpace: 'nowrap',
            }}
            title="Agregar nota de auditoría"
          >
            + Nota
          </button>
        )}

        {showAddForm && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <select
                autoFocus
                value={addingDriver}
                onChange={(e) => setAddingDriver(e.target.value)}
                style={{
                  fontSize: 11,
                  padding: '2px 4px',
                  borderRadius: 4,
                  border: '1px solid #93c5fd',
                  color: addingDriver ? '#1e40af' : '#64748b',
                  background: '#f0f9ff',
                  maxWidth: 110,
                }}
              >
                <option value="">Conductor…</option>
                {availableDrivers.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name.split(' ')[0]}
                  </option>
                ))}
              </select>
              <button
                onClick={cancelAdd}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e03131',
                  cursor: 'pointer',
                  fontSize: 13,
                  padding: '0 2px',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            {addingDriver && (
              <input
                autoFocus
                placeholder={t('taxis.settlements.audit.notePlaceholder')}
                className="issue-entry__note-input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd(e.target.value)
                  if (e.key === 'Escape') cancelAdd()
                }}
                onBlur={(e) => handleAdd(e.target.value)}
              />
            )}
          </div>
        )}
      </div>
    </td>
  )
}

export default AuditNotesCell
