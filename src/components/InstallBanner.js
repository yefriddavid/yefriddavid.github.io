import React from 'react'
import useInstallPrompt from '../hooks/useInstallPrompt'

const InstallBanner = () => {
  const { canInstall, install, dismiss } = useInstallPrompt()

  if (!canInstall) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: '#1e3a5f',
      color: '#fff',
      padding: '12px 20px',
      borderRadius: 12,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      fontSize: 14,
      whiteSpace: 'nowrap',
      maxWidth: '90vw',
    }}>
      <img src="icons/icon.svg" alt="" width={32} height={32} style={{ borderRadius: 6, flexShrink: 0 }} />
      <span style={{ flexShrink: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        Instalar <strong>Mi Admin</strong> como app
      </span>
      <button
        onClick={install}
        style={{
          background: '#f5c842',
          color: '#1e3a5f',
          border: 'none',
          borderRadius: 8,
          padding: '6px 16px',
          fontWeight: 700,
          fontSize: 13,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Instalar
      </button>
      <button
        onClick={dismiss}
        aria-label="Cerrar"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#aac4e0',
          fontSize: 18,
          cursor: 'pointer',
          lineHeight: 1,
          flexShrink: 0,
          padding: '0 4px',
        }}
      >
        ✕
      </button>
    </div>
  )
}

export default InstallBanner
