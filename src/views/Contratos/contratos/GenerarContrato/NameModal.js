import React, { useRef, useState } from 'react'
import { IcoSpinner, IcoSave } from './icons'

export default function NameModal({
  icon,
  title,
  subtitle,
  placeholder,
  confirmLabel,
  confirmIcon,
  saving,
  onConfirm,
  onCancel,
}) {
  const [name, setName] = useState('')
  const inputRef = useRef(null)

  React.useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const handleConfirm = () => {
    if (!name.trim()) return
    onConfirm(name.trim())
  }

  return (
    <div
      className="c-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="c-clone-modal">
        <div className="c-clone-header">
          <div className="c-card-icon" style={{ width: 36, height: 36 }}>
            {icon}
          </div>
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
        </div>
        <div className="c-clone-body">
          <div className="c-field">
            <label className="c-label">
              Nombre del contrato <span className="req">*</span>
            </label>
            <input
              ref={inputRef}
              className="c-input"
              type="text"
              placeholder={placeholder}
              autoComplete="off"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirm()
                if (e.key === 'Escape') onCancel()
              }}
            />
          </div>
          <div className="c-clone-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button
              type="button"
              className={`btn-generate${saving ? ' loading' : ''}`}
              style={{ padding: '10px 22px' }}
              disabled={saving || !name.trim()}
              onClick={handleConfirm}
            >
              {confirmIcon ?? <IcoSave />}
              <span className="btn-text">{confirmLabel ?? 'Crear'}</span>
              <div className="spinner" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
