import React, { useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import * as contractActions from 'src/actions/contratos/contractActions'
import { IcoDoc, IcoPencil, IcoCheck, IcoClose, IcoArchive, IcoUnarchive } from './icons'

export default function ContractPickerModal({ contracts, onSelect, onClose }) {
  const dispatch = useDispatch()
  const [tab, setTab] = useState('activos')
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef(null)

  const active = (contracts || []).filter((c) => !c.archived)
  const archived = (contracts || []).filter((c) => c.archived)
  const list = tab === 'activos' ? active : archived

  const startRename = (e, item) => {
    e.stopPropagation()
    setRenamingId(item.id)
    setRenameValue(item.name)
    setTimeout(() => renameInputRef.current?.focus(), 30)
  }

  const confirmRename = (id) => {
    const trimmed = renameValue.trim()
    if (!trimmed) {
      setRenamingId(null)
      return
    }
    dispatch(contractActions.updateRequest({ id, data: { name: trimmed } }))
    onSelect({ id, name: trimmed }, true)
    setRenamingId(null)
  }

  const toggleArchive = (e, item) => {
    e.stopPropagation()
    dispatch(contractActions.archiveRequest({ id: item.id, archived: !item.archived }))
  }

  return (
    <div className="c-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="c-picker">
        <div className="c-picker-header">
          <div className="c-card-icon" style={{ width: 40, height: 40 }}>
            <IcoDoc />
          </div>
          <div style={{ flex: 1 }}>
            <h2>¿Qué contrato vamos a ejecutar?</h2>
            <p>Contratos guardados</p>
          </div>
          <button type="button" className="c-dropdown-delete" onClick={onClose} title="Cerrar">
            <IcoClose />
          </button>
        </div>

        <div className="c-picker-tabs">
          <button
            className={`c-picker-tab${tab === 'activos' ? ' active' : ''}`}
            onClick={() => setTab('activos')}
          >
            Activos
            {active.length > 0 && <span className="c-picker-tab-count">{active.length}</span>}
          </button>
          <button
            className={`c-picker-tab${tab === 'archivados' ? ' active' : ''}`}
            onClick={() => setTab('archivados')}
          >
            Archivados
            {archived.length > 0 && <span className="c-picker-tab-count">{archived.length}</span>}
          </button>
        </div>

        <div className="c-picker-list">
          {!contracts ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>
              Cargando…
            </div>
          ) : list.length === 0 ? (
            <div className="c-picker-empty">
              <p>
                {tab === 'activos' ? (
                  <span>
                    No hay contratos activos. Usa <strong>Nuevo</strong> para crear uno.
                  </span>
                ) : (
                  'No hay contratos archivados.'
                )}
              </p>
            </div>
          ) : (
            list.map((item) =>
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
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      confirmRename(item.id)
                    }}
                    title="Confirmar nombre"
                  >
                    <IcoCheck />
                  </button>
                  <button
                    type="button"
                    className="c-dropdown-delete"
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      setRenamingId(null)
                    }}
                    title="Cancelar"
                  >
                    <IcoClose />
                  </button>
                </div>
              ) : (
                <div
                  key={item.id}
                  className="c-picker-item"
                  onClick={() => tab === 'activos' && onSelect(item, false, true)}
                  style={tab === 'archivados' ? { cursor: 'default', opacity: 0.75 } : undefined}
                >
                  <IcoDoc />
                  <span>{item.name}</span>
                  <div style={{ display: 'flex', marginLeft: 'auto' }}>
                    {tab === 'activos' && (
                      <button
                        type="button"
                        className="c-dropdown-delete"
                        onMouseDown={(e) => startRename(e, item)}
                        title="Renombrar contrato"
                      >
                        <IcoPencil />
                      </button>
                    )}
                    <button
                      type="button"
                      className="c-dropdown-delete"
                      onMouseDown={(e) => toggleArchive(e, item)}
                      title={item.archived ? 'Restaurar contrato' : 'Archivar contrato'}
                    >
                      {item.archived ? <IcoUnarchive /> : <IcoArchive />}
                    </button>
                  </div>
                  {tab === 'activos' && <span className="arrow">→</span>}
                </div>
              ),
            )
          )}
        </div>
      </div>
    </div>
  )
}
