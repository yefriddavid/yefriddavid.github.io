import React from 'react'
import useInstallPrompt from '../../hooks/useInstallPrompt'
import './InstallBanner.scss'

const InstallBanner = () => {
  const { canInstall, install, dismiss } = useInstallPrompt()

  if (!canInstall) return null

  return (
    <div className="install-banner">
      <img
        src="icons/icon.svg"
        alt=""
        width={32}
        height={32}
        className="install-banner__icon"
      />
      <span className="install-banner__text">
        Instalar <strong>Mi Admin</strong> como app
      </span>
      <button className="install-banner__install-btn" onClick={install}>
        Instalar
      </button>
      <button className="install-banner__close-btn" onClick={dismiss} aria-label="Cerrar">
        ✕
      </button>
    </div>
  )
}

export default InstallBanner
