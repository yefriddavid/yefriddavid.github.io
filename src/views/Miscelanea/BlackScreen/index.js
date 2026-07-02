import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import './BlackScreen.scss'

const HINT_TIMEOUT_MS = 2500

const BlackScreen = () => {
  const navigate = useNavigate()
  const [hintVisible, setHintVisible] = useState(true)

  const exit = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    navigate(-1)
  }, [navigate])

  useEffect(() => {
    const timer = setTimeout(() => setHintVisible(false), HINT_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') exit()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [exit])

  const handleEnterFullscreen = (e) => {
    e.stopPropagation()
    document.documentElement.requestFullscreen?.().catch(() => {})
  }

  return (
    <div className="black-screen" onClick={exit} role="presentation">
      {hintVisible && (
        <div className="black-screen__hint">
          <span>Toca o pulsa una tecla para salir</span>
          <button
            type="button"
            className="black-screen__fullscreen-btn"
            onClick={handleEnterFullscreen}
          >
            Pantalla completa
          </button>
        </div>
      )}
    </div>
  )
}

export default BlackScreen
