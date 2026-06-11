import React, { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Html5Qrcode } from 'html5-qrcode'
import { STATUS } from './usePeerSync'
import './SyncModal.scss'

const STATUS_LABEL = {
  [STATUS.IDLE]:       { text: 'Esperando conexión…', mod: 'idle' },
  [STATUS.CONNECTING]: { text: 'Conectando…',          mod: 'connecting' },
  [STATUS.CONNECTED]:  { text: 'Conectado — sincronizando…', mod: 'connected' },
  [STATUS.SYNCED]:     { text: '✓ Sincronizado',        mod: 'synced' },
  [STATUS.ERROR]:      { text: 'Error de conexión',     mod: 'error' },
}

function QrScanner({ onScanned }) {
  const [camError, setCamError] = useState(null)

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-scanner-region')
    let running = false

    const stop = () => {
      if (running) {
        running = false
        scanner.stop().catch(() => {})
      }
    }

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      (text) => {
        stop()
        onScanned(text.trim())
      },
      () => {},
    ).then(() => {
      running = true
    }).catch((err) => setCamError(String(err)))

    return stop
  }, [onScanned])

  if (camError) return (
    <div className="sync-modal__cam-error">
      No se pudo acceder a la cámara.<br />{camError}
    </div>
  )

  return <div id="qr-scanner-region" className="sync-modal__scanner" />
}

export default function SyncModal({ myId, status, error, onConnect, onClose }) {
  const canvasRef = useRef(null)
  const [remoteId, setRemoteId] = useState('')
  const [copied, setCopied]     = useState(false)
  const [scanning, setScanning] = useState(false)

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

  const handleScanned = (text) => {
    setScanning(false)
    setRemoteId(text)
    onConnect(text)
  }

  const { text: statusText, mod: statusMod } = STATUS_LABEL[status]
  const busy = status === STATUS.CONNECTING || status === STATUS.CONNECTED

  return (
    <div className="sync-modal__overlay" onClick={onClose}>
      <div className="sync-modal" onClick={(e) => e.stopPropagation()}>

        <div className="sync-modal__header">
          <span className="sync-modal__title">Sync entre dispositivos</span>
          <button className="sync-modal__close" onClick={onClose}>×</button>
        </div>

        <div className="sync-modal__body">
          {/* QR display */}
          <div className="sync-modal__section">
            <p className="sync-modal__label">Tu ID — mostrá este QR en el otro dispositivo</p>
            <div className="sync-modal__qr-wrap">
              {myId
                ? <canvas ref={canvasRef} />
                : <div className="sync-modal__qr-placeholder">Generando…</div>}
            </div>
            {myId && (
              <div className="sync-modal__id-row">
                <span className="sync-modal__id-text">{myId}</span>
                <button className="sync-modal__copy-btn" onClick={handleCopy}>
                  {copied ? '✓' : 'Copiar'}
                </button>
              </div>
            )}
          </div>

          <div className="sync-modal__divider" />

          {/* Connect */}
          <div className="sync-modal__section">
            <p className="sync-modal__label">Conectar al otro dispositivo</p>
            {scanning ? (
              <>
                <QrScanner onScanned={handleScanned} />
                <button className="sync-modal__cancel-btn" onClick={() => setScanning(false)}>
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <input
                  className="sync-modal__input"
                  placeholder="ID del otro dispositivo"
                  value={remoteId}
                  onChange={(e) => setRemoteId(e.target.value)}
                  disabled={busy}
                />
                <div className="sync-modal__connect-row">
                  <button
                    className="sync-modal__scan-btn"
                    disabled={busy}
                    onClick={() => setScanning(true)}
                  >
                    📷 Escanear QR
                  </button>
                  <button
                    className="sync-modal__connect-btn"
                    disabled={!remoteId.trim() || busy}
                    onClick={() => onConnect(remoteId)}
                  >
                    {status === STATUS.CONNECTING ? 'Conectando…' : 'Conectar'}
                  </button>
                </div>
              </>
            )}

            <div className={`sync-modal__status sync-modal__status--${statusMod}`}>
              <span className="sync-modal__status-dot" />
              {statusText}
              {error && <span className="sync-modal__status-error">{error}</span>}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
