import React from 'react'
import { CSpinner } from '@coreui/react'
import { fmt } from './utils'

const IssueEntry = ({
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
  t,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span
        style={{
          fontSize: 11,
          background: resolved ? '#dcfce7' : '#fee2e2',
          color: resolved ? '#166534' : '#b91c1c',
          borderRadius: 4,
          padding: '2px 7px',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {onQuickSettle && (
          <button
            onClick={onQuickSettle}
            title="Crear liquidación"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: '#2f9e44',
              fontSize: 13,
              lineHeight: 1,
              fontWeight: 700,
            }}
          >
            ✓
          </button>
        )}
        {label}
      </span>
      <button
        onClick={onResolveToggle}
        title={resolved ? 'Desmarcar resuelto' : 'Marcar como resuelto'}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '1px 3px',
          color: resolved ? '#2f9e44' : '#adb5bd',
          fontSize: 14,
          lineHeight: 1,
          fontWeight: 700,
        }}
      >
        ✓
      </button>
      <button
        onClick={onEditToggle}
        title={note ? t('taxis.settlements.audit.editNote') : t('taxis.settlements.audit.addNote')}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '1px 3px',
          color: note ? '#e67700' : '#adb5bd',
          fontSize: 12,
          lineHeight: 1,
        }}
      >
        ✎
      </button>
      {note && (
        <button
          onClick={onNoteDelete}
          title={t('common.remove')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '1px 3px',
            color: '#e03131',
            fontSize: 11,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </div>
    {isEditing && (
      <input
        autoFocus
        defaultValue={note}
        placeholder={t('taxis.settlements.audit.notePlaceholder')}
        onBlur={(e) => {
          if (e.target.value === note) {
            onCancel()
          } else {
            onNoteSave(e.target.value)
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onNoteSave(e.target.value)
          if (e.key === 'Escape') onCancel()
        }}
        style={{
          fontSize: 11,
          padding: '2px 6px',
          borderRadius: 4,
          border: '1px solid #fed7aa',
          outline: 'none',
          width: 140,
        }}
      />
    )}
    {!isEditing && note && (
      <span
        style={{
          fontSize: 10,
          color: '#92400e',
          background: '#fffbeb',
          border: '1px solid #fcd34d',
          borderRadius: 3,
          padding: '1px 5px',
          maxWidth: 160,
          wordBreak: 'break-word',
        }}
      >
        {note}
      </span>
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
  <td style={{ padding: '8px 6px' }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
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
                dispatchCreate({
                  driver: dr,
                  plate: driverObj.defaultVehicle || '',
                  amount,
                  date: day.dateStr,
                })
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
          <div key={dr} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                fontSize: 11,
                background: '#f3e8ff',
                color: '#6b21a8',
                border: '1px solid #d8b4fe',
                borderRadius: 4,
                padding: '2px 7px',
                fontWeight: 600,
              }}
            >
              🚫 {dr.split(' ')[0]}
            </span>
          </div>
        ))}

      {/* Loading spinner */}
      {loadingDay === day.dateStr && (
        <CSpinner
          size="sm"
          color="primary"
          style={{ width: 14, height: 14, alignSelf: 'center' }}
        />
      )}
    </div>
  </td>
)

export default AuditMissingCell
