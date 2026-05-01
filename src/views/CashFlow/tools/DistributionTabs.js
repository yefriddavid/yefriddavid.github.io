import React from 'react'

export default function DistributionTabs({
  distributions,
  activeConfig,
  editingTabId,
  editingTabName,
  isMobile,
  onSelect,
  onRenameChange,
  onRenameCommit,
  onRenameCancel,
  onStartRename,
  onMove,
  onDelete,
  onAdd,
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 0,
        marginBottom: 20,
        overflowX: 'auto',
        overflowY: 'hidden',
        borderBottom: '2px solid var(--cui-border-color)',
      }}
    >
      {distributions.map((d) => {
        const isActive = d.id === activeConfig.id
        const idx = distributions.findIndex((x) => x.id === d.id)
        return (
          <div
            key={d.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: isMobile ? '10px 12px' : '8px 14px',
              borderBottom: isActive ? '2px solid var(--cui-primary)' : '2px solid transparent',
              marginBottom: -2,
              cursor: 'pointer',
              background: isActive ? 'var(--cui-tertiary-bg)' : 'transparent',
              borderRadius: '6px 6px 0 0',
              flexShrink: 0,
            }}
            onClick={() => onSelect(d.id)}
          >
            {editingTabId === d.id ? (
              <input
                autoFocus
                value={editingTabName}
                onChange={(e) => onRenameChange(e.target.value)}
                onBlur={() => onRenameCommit(d.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onRenameCommit(d.id)
                  if (e.key === 'Escape') onRenameCancel()
                }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  border: 'none',
                  borderBottom: '2px solid var(--cui-primary)',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--cui-body-color)',
                  width: 100,
                  padding: '0 0 1px',
                }}
              />
            ) : (
              <span
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--cui-body-color)' : 'var(--cui-secondary-color)',
                  userSelect: 'none',
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation()
                  onStartRename(d.id, d.name)
                }}
                title="Doble clic para renombrar"
              >
                {d.name}
              </span>
            )}
            {distributions.length > 1 && isActive && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onMove(d.id, -1)
                  }}
                  disabled={idx === 0}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: idx === 0 ? 'default' : 'pointer',
                    color: idx === 0 ? 'var(--cui-tertiary-color)' : 'var(--cui-secondary-color)',
                    fontSize: 13,
                    lineHeight: 1,
                    padding: '0 2px',
                    minWidth: 20,
                    minHeight: 24,
                  }}
                  title="Mover izquierda"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onMove(d.id, 1)
                  }}
                  disabled={idx === distributions.length - 1}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: idx === distributions.length - 1 ? 'default' : 'pointer',
                    color:
                      idx === distributions.length - 1
                        ? 'var(--cui-tertiary-color)'
                        : 'var(--cui-secondary-color)',
                    fontSize: 13,
                    lineHeight: 1,
                    padding: '0 2px',
                    minWidth: 20,
                    minHeight: 24,
                  }}
                  title="Mover derecha"
                >
                  ›
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm(`¿Eliminar "${d.name}"?`)) onDelete(d.id)
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--cui-danger)',
                    fontSize: 16,
                    lineHeight: 1,
                    padding: '0 0 0 2px',
                    minWidth: 24,
                    minHeight: 24,
                  }}
                >
                  ×
                </button>
              </>
            )}
          </div>
        )
      })}
      <button
        onClick={onAdd}
        style={{
          padding: isMobile ? '10px 14px' : '8px 12px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          color: 'var(--cui-secondary-color)',
          fontSize: 20,
          lineHeight: 1,
          flexShrink: 0,
          marginBottom: -2,
          minWidth: 44,
        }}
        title="Agregar distribución"
      >
        +
      </button>
    </div>
  )
}
