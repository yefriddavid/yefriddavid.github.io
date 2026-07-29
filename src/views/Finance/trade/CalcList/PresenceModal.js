import React from 'react'
import './PresenceModal.scss'

const DEVICE_LABEL = { mobile: 'Mobile', desktop: 'Desktop' }

const fmtDataVersion = (iso) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('es-CO', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

export default function PresenceModal({ peers, busy, myDataVersion, onConnect, onClose }) {
  return (
    <div className="presence-modal__overlay" onClick={onClose}>
      <div className="presence-modal" onClick={(e) => e.stopPropagation()}>
        <div className="presence-modal__header">
          <div className="presence-modal__header-text">
            <span className="presence-modal__my-version">Mis datos actualizados: {fmtDataVersion(myDataVersion)}</span>
            <span className="presence-modal__title">Usuarios en línea</span>
          </div>
          <button className="presence-modal__close" onClick={onClose}>×</button>
        </div>

        <div className="presence-modal__body">
          {peers?.length ? (
            <table className="presence-modal__table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Dispositivo</th>
                  <th>Últ. modificación</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {peers.map((p) => (
                  <tr key={p.id}>
                    <td>{p.username || p.id.slice(0, 8)}</td>
                    <td>{DEVICE_LABEL[p.deviceType] || '—'}</td>
                    <td>{fmtDataVersion(p.dataVersion)}</td>
                    <td className="presence-modal__action-cell">
                      <button
                        className="presence-modal__sync-btn"
                        disabled={busy}
                        onClick={() => onConnect(p.id)}
                      >
                        Sincronizar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="presence-modal__empty">Nadie más conectado ahora.</p>
          )}
        </div>
      </div>
    </div>
  )
}
