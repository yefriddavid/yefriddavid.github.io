import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { dismiss } from '../../reducers/notificationsSlice'

const DELAY = { error: 8000, success: 5000, warning: 6000, info: 5000 }

const BG = {
  success: { background: '#166534', color: '#fff' },
  error: { background: '#991b1b', color: '#fff' },
  warning: { background: '#92400e', color: '#fff' },
  info: { background: '#1e3a5f', color: '#fff' },
}

const ICON = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ', _default: 'ℹ' }

const ToastItem = ({ notification }) => {
  const dispatch = useDispatch()
  const { id, type = 'info', message } = notification
  const delay = DELAY[type] ?? 5000
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const show = requestAnimationFrame(() => setVisible(true))
    const hide = setTimeout(() => {
      setVisible(false)
      setTimeout(() => dispatch(dismiss(id)), 300)
    }, delay)
    return () => {
      cancelAnimationFrame(show)
      clearTimeout(hide)
    }
  }, [id, delay, dispatch])

  const style = BG[type] ?? BG.info

  return (
    <div
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 14px',
        borderRadius: 8,
        minWidth: 260,
        maxWidth: 380,
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        fontSize: 14,
        fontWeight: 500,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(40px)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        pointerEvents: 'auto',
      }}
    >
      <span data-testid="notification-icon" style={{ fontSize: 16, flexShrink: 0 }}>
        {ICON[type] ?? ICON._default}
      </span>
      <span style={{ flexGrow: 1 }}>{message}</span>
      <button
        onClick={() => {
          setVisible(false)
          setTimeout(() => dispatch(dismiss(id)), 300)
        }}
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          color: '#fff',
          borderRadius: 4,
          width: 22,
          height: 22,
          cursor: 'pointer',
          fontSize: 13,
          lineHeight: 1,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ✕
      </button>
    </div>
  )
}

const NotificationToaster = () => {
  const notifications = useSelector((s) => s.notifications)

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {notifications.map((n) => (
        <ToastItem key={n.id} notification={n} />
      ))}
    </div>
  )
}

export default NotificationToaster
