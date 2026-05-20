import React from 'react'
import Spinner from 'src/components/shared/Spinner'

export default function ProjectCardActions({
  project,
  isFirst,
  isLast,
  syncing,
  isDirty,
  cloning,
  cloneName,
  setCloning,
  setCloneName,
  onEdit,
  onDelete,
  onSync,
  onClone,
  onMove,
  handleSaveCard,
}) {
  return (
    <>
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
          {syncing ? <Spinner size="sm" /> : '☁️ Sync'}
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
    </>
  )
}
