import React from 'react'
import { fmt } from './helpers'
import { useProjectCard } from './hooks/useProjectCard'
import ProjectItemsList from './components/ProjectItemsList'
import ProjectBudgetSummary from './components/ProjectBudgetSummary'
import ProjectNotesList from './components/ProjectNotesList'
import ProjectCardActions from './components/ProjectCardActions'

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
  const state = useProjectCard(project, onSave)

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
          {state.editingName ? (
            inlineInput(state.localDescription, (v) => { state.setLocalDescription(v); state.mark() }, state.commitName, { fontSize: 15, fontWeight: 700, color: '#1a1a2e' })
          ) : (
            <div
              onClick={() => state.setEditingName(true)}
              title="Toca para editar"
              style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 2, cursor: 'text', borderBottom: '1px dashed transparent' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = '#dee2e6')}
              onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = 'transparent')}
            >
              {state.localDescription}
            </div>
          )}
          {state.goal > 0 && (
            <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: '#adb5bd' }}>Falta:</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: state.remaining <= 0 ? '#2f9e44' : '#e67700' }}>
                {state.remaining <= 0 ? '✅ Listo' : fmt(state.remaining)}
              </span>
            </div>
          )}
          {state.editingNotes ? (
            <textarea
              autoFocus
              value={state.localNotes}
              rows={2}
              onChange={(e) => { state.setLocalNotes(e.target.value); state.mark() }}
              onBlur={state.commitNotes}
              onKeyDown={(e) => e.key === 'Escape' && state.commitNotes()}
              style={{ width: '100%', marginTop: 2, border: 'none', borderBottom: '2px solid #1e3a5f', outline: 'none', background: 'transparent', fontSize: 11, color: '#6c757d', fontStyle: 'italic', resize: 'none', fontFamily: 'inherit', padding: '0 0 2px' }}
            />
          ) : (
            <div
              onClick={() => state.setEditingNotes(true)}
              title="Toca para editar"
              style={{ fontSize: 11, color: state.localNotes ? '#adb5bd' : '#dee2e6', marginTop: 2, fontStyle: 'italic', cursor: 'text', borderBottom: '1px dashed transparent', minHeight: 14 }}
              onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = '#dee2e6')}
              onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = 'transparent')}
            >
              {state.localNotes || 'Agregar descripción…'}
            </div>
          )}
          {state.localDate && (
            <div style={{ fontSize: 12, color: '#6c757d', marginTop: 2 }}>📅 {state.localDate}</div>
          )}
        </div>

        {/* Goal value */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {state.editingGoal ? (
            <input
              autoFocus
              type="number"
              min="0"
              value={state.localGoal}
              onChange={(e) => { state.setLocalGoal(e.target.value); state.mark() }}
              onBlur={state.commitGoal}
              onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
              style={{ border: 'none', borderBottom: '2px solid #1e3a5f', outline: 'none', background: 'transparent', fontSize: 17, fontWeight: 800, color: '#1e3a5f', textAlign: 'right', width: 130, padding: '0 0 2px' }}
            />
          ) : (
            <div
              onClick={() => state.setEditingGoal(true)}
              title="Toca para editar"
              style={{ fontSize: 17, fontWeight: 800, color: '#1e3a5f', cursor: 'text', borderBottom: '1px dashed transparent' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = '#c5d8ff')}
              onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = 'transparent')}
            >
              {state.goal > 0 ? fmt(state.goal) : fmt(state.total)}
            </div>
          )}
          <div style={{ fontSize: 10, fontWeight: 600, color: isSynced ? '#2f9e44' : '#f59f00', marginTop: 2 }}>
            {isSynced ? '● Sincronizado' : '○ Local'}
          </div>
        </div>
      </div>

      <ProjectItemsList
        localItems={state.localItems}
        editingItemId={state.editingItemId}
        localOrigen={state.localOrigen}
        setLocalOrigen={state.setLocalOrigen}
        editingValueId={state.editingValueId}
        localValue={state.localValue}
        setLocalValue={state.setLocalValue}
        dragItemId={state.dragItemId}
        dragOverItemId={state.dragOverItemId}
        setDragItemId={state.setDragItemId}
        setDragOverItemId={state.setDragOverItemId}
        startItemEdit={state.startItemEdit}
        commitItem={state.commitItem}
        startValueEdit={state.startValueEdit}
        commitValue={state.commitValue}
        toggleItemPaid={state.toggleItemPaid}
        reorderCardItems={state.reorderCardItems}
        removeItem={state.removeItem}
        addItem={state.addItem}
      />

      <ProjectBudgetSummary
        total={state.total}
        paid={state.paid}
        goal={state.goal}
        remaining={state.remaining}
        paidOverrun={state.paidOverrun}
        hasItems={project.items?.length > 0}
      />

      <ProjectNotesList
        localProjectNotes={state.localProjectNotes}
        showProjectNotes={state.showProjectNotes}
        setShowProjectNotes={state.setShowProjectNotes}
        addingNote={state.addingNote}
        setAddingNote={state.setAddingNote}
        newNoteText={state.newNoteText}
        setNewNoteText={state.setNewNoteText}
        newNoteRef={state.newNoteRef}
        setNewNoteRef={state.setNewNoteRef}
        saveCardNote={state.saveCardNote}
        deleteCardNote={state.deleteCardNote}
      />

      <ProjectCardActions
        project={project}
        isFirst={isFirst}
        isLast={isLast}
        syncing={syncing}
        isDirty={state.isDirty}
        cloning={state.cloning}
        cloneName={state.cloneName}
        setCloning={state.setCloning}
        setCloneName={state.setCloneName}
        onEdit={onEdit}
        onDelete={onDelete}
        onSync={onSync}
        onClone={onClone}
        onMove={onMove}
        handleSaveCard={state.handleSaveCard}
      />
    </div>
  )
}
