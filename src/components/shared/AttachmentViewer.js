import React, { useState } from 'react'
import './AttachmentViewer.scss'

function base64ToBlob(dataUrl) {
  const [header, data] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)[1]
  const binary = atob(data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

function download(dataUrl, filename) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename || 'adjunto.jpg'
  a.click()
}

async function share(dataUrl, filename) {
  try {
    const blob = base64ToBlob(dataUrl)
    const file = new File([blob], filename || 'adjunto.jpg', { type: blob.type })
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: filename })
      return
    }
    if (navigator.share) {
      await navigator.share({ title: filename, text: filename })
      return
    }
    download(dataUrl, filename)
  } catch {
    download(dataUrl, filename)
  }
}

export default function AttachmentViewer({ src, filename, onClose }) {
  const [zoom, setZoom] = useState(false)
  const [sharing, setSharing] = useState(false)

  const handleShare = async () => {
    setSharing(true)
    await share(src, filename)
    setSharing(false)
  }

  const canShare = !!(navigator.share || navigator.canShare)

  return (
    <div className="attachment-viewer" onClick={onClose}>
      <div className="attachment-viewer__bar" onClick={(e) => e.stopPropagation()}>
        <span className="attachment-viewer__filename">{filename || 'Adjunto'}</span>
        <div className="attachment-viewer__actions">
          <button
            className="attachment-viewer__btn"
            onClick={() => download(src, filename)}
            title="Descargar"
          >
            ⬇
          </button>
          {canShare && (
            <button
              className={`attachment-viewer__btn${sharing ? ' attachment-viewer__btn--disabled' : ''}`}
              onClick={handleShare}
              disabled={sharing}
              title="Compartir"
            >
              {sharing ? '…' : '↗'}
            </button>
          )}
          <button
            className="attachment-viewer__btn attachment-viewer__btn--close"
            onClick={onClose}
            title="Cerrar"
          >
            ✕
          </button>
        </div>
      </div>

      <div
        className={`attachment-viewer__area${zoom ? ' attachment-viewer__area--zoomed' : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          setZoom((z) => !z)
        }}
      >
        <img
          src={src}
          alt={filename || 'adjunto'}
          className={`attachment-viewer__image${zoom ? ' attachment-viewer__image--zoomed' : ''}`}
        />
      </div>

      <div className="attachment-viewer__hint">
        <span>Toca la imagen para {zoom ? 'reducir' : 'ampliar'} · Toca fuera para cerrar</span>
      </div>
    </div>
  )
}
