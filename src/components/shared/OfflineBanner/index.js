import React, { useEffect, useState } from 'react'
import useConnectivity from '../../../hooks/useConnectivity'

const OfflineBanner = () => {
  const online = useConnectivity()
  const [visible, setVisible] = useState(false)
  const [reconnected, setReconnected] = useState(false)

  useEffect(() => {
    if (!online) {
      setVisible(true)
      setReconnected(false)
    } else if (visible) {
      setReconnected(true)
      const t = setTimeout(() => {
        setVisible(false)
        setReconnected(false)
      }, 3000)
      return () => clearTimeout(t)
    }
  }, [online])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        padding: '10px 20px',
        borderRadius: 8,
        fontWeight: 600,
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        transition: 'background 0.3s',
        background: reconnected ? '#16a34a' : '#dc2626',
        color: '#fff',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: 16 }}>{reconnected ? '✓' : '⚠'}</span>
      {reconnected ? 'Conexión restaurada' : 'Sin conexión — los cambios se guardarán al reconectar'}
    </div>
  )
}

export default OfflineBanner
