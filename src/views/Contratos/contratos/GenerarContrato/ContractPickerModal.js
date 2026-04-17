import React, { useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import * as contractActions from 'src/actions/contratos/contractActions'
import { IcoDoc, IcoPencil, IcoCheck, IcoClose } from './icons'

export default function ContractPickerModal({ contracts, onSelect, onClose }) {
  const dispatch = useDispatch()
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef(null)

  const startRename = (e, item) => {
    e.stopPropagation()
    setRenamingId(item.id)
    setRenameValue(item.name)
    setTimeout(() => renameInputRef.current?.focus(), 30)
  }

  const confirmRename = (id) => {
    const trimmed = renameValue.trim()
    if (!trimmed) { setRenamingId(null); return }
    dispatch(contractActions.updateRequest({ id, data: { name: trimmed } }))
    onSelect({ id, name: trimmed }, true)
    setRenamingId(null)
  }

  return (
    <div
      className="c-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="c-picker">
        <div className="c-picker-header">
          <div className="c-card-icon" style={{ width: 40, height: 40 }}>
            <IcoDoc />
          </div>
          <div>
            <h2>¿Qué contrato vamos a ejecutar?</h2>
            <p>Contratos guardados en Firebase</p>
          </div>
        </div>
        <div className="c-picker-list">
          {!contracts ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>
              Cargando…
            </div>
          ) : contracts.length === 0 ? (
            <div className="c-picker-empty">
              <p>
                No hay contratos guardados aún. Usa <strong>Nuevo</strong> para crear uno.
              </p>
            </div>
          ) : (
            contracts.map((item) =>
              renamingId === item.id ? (
                <div key={item.id} className="c-picker-item c-picker-item--renaming">
                  <IcoDoc />
                  <input
                    ref={renameInputRef}
                    className="c-input"
                    style={{ flex: 1, height: 34, fontSize: '.9rem' }}
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmRename(item.id)
                      if (e.key === 'Escape') setRenamingId(null)
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    type="button"
                    className="c-dropdown-delete"
                    style={{ color: 'var(--gold)' }}
                    onMouseDown={(e) => { e.stopPropagation(); confirmRename(item.id) }}
                    title="Confirmar nombre"
                  >
                    <IcoCheck />
                  </button>
                  <button
                    type="button"
                    className="c-dropdown-delete"
                    onMouseDown={(e) => { e.stopPropagation(); setRenamingId(null) }}
                    title="Cancelar"
                  >
                    <IcoClose />
                  </button>
                </div>
              ) : (
                <div
                  key={item.id}
                  className="c-picker-item"
                  onClick={() => onSelect(item)}
                >
                  <IcoDoc />
                  <span>{item.name}</span>
                  <button
                    type="button"
                    className="c-dropdown-delete"
                    onMouseDown={(e) => startRename(e, item)}
                    title="Renombrar contrato"
                  >
                    <IcoPencil />
                  </button>
                  <span className="arrow">→</span>
                </div>
              ),
            )
          )}
        </div>
      </div>
    </div>
  )
}
