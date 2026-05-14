import React from 'react'
import { fmt } from '../helpers'

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

export default function ProjectItemsList({
  localItems,
  editingItemId,
  localOrigen,
  setLocalOrigen,
  editingValueId,
  localValue,
  setLocalValue,
  dragItemId,
  dragOverItemId,
  setDragItemId,
  setDragOverItemId,
  startItemEdit,
  commitItem,
  startValueEdit,
  commitValue,
  toggleItemPaid,
  reorderCardItems,
  removeItem,
  addItem,
}) {
  return (
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
              <span style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, gap: 2 }}>
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
                  onClick={() => removeItem(item.id)}
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

      <button
        onClick={addItem}
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
  )
}
