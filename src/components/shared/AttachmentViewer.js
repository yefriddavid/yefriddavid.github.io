import React, { useState } from 'react'

// Converts a base64 data URL to a Blob
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
    // fallback: download
    download(dataUrl, filename)
  } catch {
    download(dataUrl, filename)
  }
}

// ── AttachmentViewer ───────────────────────────────────────────────────────────
// Props:
//   src       — base64 data URL (required)
//   filename  — string (optional)
//   onClose   — function (required)
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
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.7)',
            maxWidth: 200,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {filename || 'Adjunto'}
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Download */}
          <button
            onClick={() => download(src, filename)}
            title="Descargar"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ⬇
          </button>
          {/* Share */}
          {canShare && (
            <button
              onClick={handleShare}
              disabled={sharing}
              title="Compartir"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                fontSize: 18,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: sharing ? 0.5 : 1,
              }}
            >
              {sharing ? '…' : '↗'}
            </button>
          )}
          {/* Close */}
          <button
            onClick={onClose}
            title="Cerrar"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              fontSize: 20,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Image area */}
      <div
        onClick={(e) => {
          e.stopPropagation()
          setZoom((z) => !z)
        }}
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          alignItems: zoom ? 'flex-start' : 'center',
          justifyContent: 'center',
          padding: 12,
        }}
      >
        <img
          src={src}
          alt={filename || 'adjunto'}
          style={{
            maxWidth: zoom ? 'none' : '100%',
            width: zoom ? 'auto' : undefined,
            maxHeight: zoom ? 'none' : '100%',
            borderRadius: 8,
            cursor: zoom ? 'zoom-out' : 'zoom-in',
            boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
          }}
        />
      </div>

      {/* Bottom hint */}
      <div style={{ textAlign: 'center', padding: '8px 0 16px', flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
          Toca la imagen para {zoom ? 'reducir' : 'ampliar'} · Toca fuera para cerrar
        </span>
      </div>
    </div>
  )
}
