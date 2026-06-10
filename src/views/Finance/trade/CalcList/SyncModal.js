import React, { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { STATUS } from './usePeerSync'

const STATUS_LABEL = {
  [STATUS.IDLE]:       { text: 'Esperando conexión…', color: 'var(--cui-secondary-color)' },
  [STATUS.CONNECTING]: { text: 'Conectando…',          color: '#f59f00' },
  [STATUS.CONNECTED]:  { text: 'Conectado — sincronizando…', color: '#1c7ed6' },
  [STATUS.SYNCED]:     { text: '✓ Sincronizado',        color: '#2f9e44' },
  [STATUS.ERROR]:      { text: 'Error de conexión',     color: 'var(--cui-danger)' },
}

export default function SyncModal({ myId, status, error, onConnect, onClose }) {
  const canvasRef = useRef(null)
  const [remoteId, setRemoteId] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (myId && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, myId, { width: 200, margin: 1 })
    }
  }, [myId])

  const handleCopy = () => {
    navigator.clipboard.writeText(myId)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const { text: statusText, color: statusColor } = STATUS_LABEL[status]

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.title}>Sync entre dispositivos</span>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div style={styles.body}>
          {/* QR side */}
          <div style={styles.section}>
            <p style={styles.label}>Tu ID — mostrá este QR en el otro dispositivo</p>
            <div style={styles.qrWrap}>
              {myId ? <canvas ref={canvasRef} /> : <div style={styles.qrPlaceholder}>Generando…</div>}
            </div>
            {myId && (
              <div style={styles.idRow}>
                <span style={styles.idText}>{myId}</span>
                <button style={styles.copyBtn} onClick={handleCopy}>
                  {copied ? '✓' : 'Copiar'}
                </button>
              </div>
            )}
          </div>

          <div style={styles.divider} />

          {/* Connect side */}
          <div style={styles.section}>
            <p style={styles.label}>Conectar al otro dispositivo</p>
            <p style={styles.hint}>Pegá el ID del otro dispositivo o escaneá su QR con una app de cámara.</p>
            <input
              style={styles.input}
              placeholder="ID del otro dispositivo"
              value={remoteId}
              onChange={(e) => setRemoteId(e.target.value)}
              disabled={status === STATUS.CONNECTING || status === STATUS.CONNECTED}
            />
            <button
              style={{
                ...styles.connectBtn,
                opacity: !remoteId.trim() || status === STATUS.CONNECTING ? 0.5 : 1,
              }}
              disabled={!remoteId.trim() || status === STATUS.CONNECTING || status === STATUS.CONNECTED}
              onClick={() => onConnect(remoteId)}
            >
              {status === STATUS.CONNECTING ? 'Conectando…' : 'Conectar'}
            </button>

            <div style={{ ...styles.statusRow, color: statusColor }}>
              <span style={{ ...styles.statusDot, background: statusColor }} />
              {statusText}
              {error && <span style={styles.errorDetail}>{error}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050,
  },
  modal: {
    background: 'var(--cui-body-bg)', borderRadius: 12,
    border: '1px solid var(--cui-border-color)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    width: 520, maxWidth: '95vw',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 18px', borderBottom: '1px solid var(--cui-border-color)',
  },
  title: { fontWeight: 700, fontSize: '0.95rem', color: 'var(--cui-body-color)' },
  closeBtn: {
    background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer',
    color: 'var(--cui-secondary-color)', lineHeight: 1, padding: '0 4px',
  },
  body: {
    display: 'flex', gap: 0, padding: 0,
  },
  section: {
    flex: 1, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 10,
  },
  divider: {
    width: 1, background: 'var(--cui-border-color)', margin: '16px 0',
  },
  label: { margin: 0, fontWeight: 600, fontSize: '0.8rem', color: 'var(--cui-body-color)' },
  hint: { margin: 0, fontSize: '0.75rem', color: 'var(--cui-secondary-color)', lineHeight: 1.5 },
  qrWrap: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    padding: '8px 0',
  },
  qrPlaceholder: {
    width: 200, height: 200, background: 'var(--cui-tertiary-bg)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 8, fontSize: '0.8rem', color: 'var(--cui-secondary-color)',
  },
  idRow: { display: 'flex', alignItems: 'center', gap: 8 },
  idText: {
    flex: 1, fontSize: '0.72rem', fontFamily: 'monospace',
    color: 'var(--cui-secondary-color)', wordBreak: 'break-all',
    background: 'var(--cui-tertiary-bg)', padding: '4px 8px', borderRadius: 4,
  },
  copyBtn: {
    background: 'var(--cui-tertiary-bg)', border: '1px solid var(--cui-border-color)',
    borderRadius: 4, fontSize: '0.75rem', cursor: 'pointer', padding: '4px 10px',
    color: 'var(--cui-body-color)', flexShrink: 0,
  },
  input: {
    width: '100%', padding: '8px 10px', borderRadius: 6, boxSizing: 'border-box',
    border: '1px solid var(--cui-border-color)', background: 'var(--cui-body-bg)',
    color: 'var(--cui-body-color)', fontSize: '0.85rem', outline: 'none',
  },
  connectBtn: {
    padding: '8px 16px', background: 'var(--cui-primary)', color: '#fff',
    border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600,
    fontSize: '0.85rem', transition: 'opacity 0.15s',
  },
  statusRow: {
    display: 'flex', alignItems: 'center', gap: 7,
    fontSize: '0.8rem', fontWeight: 600, marginTop: 4,
  },
  statusDot: {
    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
  },
  errorDetail: {
    display: 'block', fontSize: '0.72rem', fontWeight: 400,
    color: 'var(--cui-secondary-color)', marginTop: 2,
  },
}
