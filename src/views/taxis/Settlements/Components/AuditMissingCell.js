import React from 'react'
import { CSpinner } from '@coreui/react'
import { fmt } from './utils'
import './Audit.scss'

export const IssueEntry = ({
  label,
  note,
  resolved,
  isEditing,
  onResolveToggle,
  onEditToggle,
  onNoteSave,
  onNoteDelete,
  onCancel,
  onQuickSettle,
  variant = 'missing',
  t,
}) => (
  <div className="issue-entry">
    <div className="issue-entry__header">
      <span className={`issue-entry__badge${resolved ? ' issue-entry__badge--resolved' : ` issue-entry__badge--${variant}`}`}>
        {onQuickSettle && (
          <button className="issue-entry__quick-settle" onClick={onQuickSettle} title="Crear liquidación">
            ✓
          </button>
        )}
        {label}
      </span>
      <button
        className={`issue-entry__resolve-btn${resolved ? ' issue-entry__resolve-btn--resolved' : ' issue-entry__resolve-btn--pending'}`}
        onClick={onResolveToggle}
        title={resolved ? 'Desmarcar resuelto' : 'Marcar como resuelto'}
      >
        ✓
      </button>
      <button
        className={`issue-entry__edit-btn${note ? ' issue-entry__edit-btn--has-note' : ' issue-entry__edit-btn--no-note'}`}
        onClick={onEditToggle}
        title={note ? t('taxis.settlements.audit.editNote') : t('taxis.settlements.audit.addNote')}
      >
        ✎
      </button>
      {note && (
        <button className="issue-entry__delete-btn" onClick={onNoteDelete} title={t('common.remove')}>
          ×
        </button>
      )}
    </div>
    {isEditing && (
      <input
        autoFocus
        defaultValue={note}
        placeholder={t('taxis.settlements.audit.notePlaceholder')}
        className="issue-entry__note-input"
        onBlur={(e) => {
          if (e.target.value === note) onCancel()
          else onNoteSave(e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onNoteSave(e.target.value)
          if (e.key === 'Escape') onCancel()
        }}
      />
    )}
    {!isEditing && note && (
      <span className="issue-entry__note-text">{note}</span>
    )}
  </div>
)

const AuditMissingCell = ({
  day,
  auditDriverFilter,
  periodDrivers,
  getNote,
  getResolved,
  editingNote,
  setEditingNote,
  handleResolvedToggle,
  handleNoteSave,
  loadingDay,
  dispatchCreate,
  t,
}) => (
  <td className="audit-cell">
    <div className="audit-cell__issues">
      {/* Underpaid vehicles */}
      {!day.isFuture &&
        day.underpaidVehicles.map((pl) => {
          const driver = periodDrivers.find((d) => {
            if (d.defaultVehicle !== pl) return false
            if (d.startDate && d.startDate > day.dateStr) return false
            if (d.endDate && d.endDate < day.dateStr) return false
            return true
          })
          if (!driver) return null
          if (auditDriverFilter.size > 0 && !auditDriverFilter.has(driver.name)) return null
          const expected = day.isSunday
            ? driver.defaultAmountSunday || driver.defaultAmount || 0
            : driver.defaultAmount || 0
          const paid = day.dayRecords
            .filter((r) => r.plate === pl)
            .reduce((s, r) => s + (r.amount || 0), 0)
          const note = getNote(day.dateStr, driver.name)
          const resolved = getResolved(day.dateStr, driver.name)
          const isEditing = editingNote?.date === day.dateStr && editingNote?.driver === driver.name
          return (
            <IssueEntry
              key={pl}
              label={`◐ ${driver.name.split(' ')[0]} · ${fmt(paid)}/${fmt(expected)}`}
              note={note}
              resolved={resolved}
              isEditing={isEditing}
              onResolveToggle={(e) => {
                e.stopPropagation()
                handleResolvedToggle(day.dateStr, driver.name)
              }}
              onEditToggle={(e) => {
                e.stopPropagation()
                setEditingNote(isEditing ? null : { date: day.dateStr, driver: driver.name })
              }}
              onNoteSave={(val) => handleNoteSave(day.dateStr, driver.name, val)}
              onNoteDelete={(e) => {
                e.stopPropagation()
                handleNoteSave(day.dateStr, driver.name, '')
              }}
              onCancel={() => setEditingNote(null)}
              t={t}
            />
          )
        })}

      {/* Missing drivers */}
      {!day.isFuture &&
        (auditDriverFilter.size > 0
          ? day.missing.filter((dr) => auditDriverFilter.has(dr))
          : day.missing
        ).map((dr) => {
          const note = getNote(day.dateStr, dr)
          const resolved = getResolved(day.dateStr, dr)
          const isEditing = editingNote?.date === day.dateStr && editingNote?.driver === dr
          const driverObj = periodDrivers.find((d) => d.name === dr)
          return (
            <IssueEntry
              key={dr}
              label={dr.split(' ')[0]}
              note={note}
              resolved={resolved}
              isEditing={isEditing}
              onQuickSettle={(e) => {
                e.stopPropagation()
                if (!driverObj) return
                const amount =
                  day.isSunday || day.isHoliday
                    ? driverObj.defaultAmountSunday || driverObj.defaultAmount || 0
                    : driverObj.defaultAmount || 0
                dispatchCreate({ driver: dr, plate: driverObj.defaultVehicle || '', amount, date: day.dateStr })
              }}
              onResolveToggle={(e) => {
                e.stopPropagation()
                handleResolvedToggle(day.dateStr, dr)
              }}
              onEditToggle={(e) => {
                e.stopPropagation()
                setEditingNote(isEditing ? null : { date: day.dateStr, driver: dr })
              }}
              onNoteSave={(val) => handleNoteSave(day.dateStr, dr, val)}
              onNoteDelete={(e) => {
                e.stopPropagation()
                handleNoteSave(day.dateStr, dr, '')
              }}
              onCancel={() => setEditingNote(null)}
              t={t}
            />
          )
        })}

      {/* Pico y placa drivers */}
      {!day.isFuture &&
        (auditDriverFilter.size > 0
          ? day.picoPlacaDrivers.filter((dr) => auditDriverFilter.has(dr))
          : day.picoPlacaDrivers
        ).map((dr) => (
          <div key={dr} className="pico-placa-chip">
            <span className="pico-placa-chip__badge">🚫 {dr.split(' ')[0]}</span>
          </div>
        ))}

      {loadingDay === day.dateStr && (
        <CSpinner size="sm" color="primary" style={{ width: 14, height: 14, alignSelf: 'center' }} />
      )}
    </div>
  </td>
)

export default AuditMissingCell
