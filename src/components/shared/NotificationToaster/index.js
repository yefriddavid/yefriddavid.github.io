import React, { useCallback, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { dismiss } from '../../../reducers/notificationsSlice'

const DELAY = { error: 8000, success: 5000, warning: 6000, info: 5000 }

const BG = {
  success: { background: '#166534', color: '#fff' },
  error: { background: '#991b1b', color: '#fff' },
  warning: { background: '#92400e', color: '#fff' },
  info: { background: '#1e3a5f', color: '#fff' },
}

const ICON = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ', _default: 'ℹ' }

const HookOutputToast = ({ notification }) => {
  const dispatch = useDispatch()
  const { id, program, output } = notification
  const [visible, setVisible] = useState(false)

  const doClose = useCallback(() => {
    setVisible(false)
    setTimeout(() => dispatch(dismiss(id)), 300)
  }, [id, dispatch])

  useEffect(() => {
    const show = requestAnimationFrame(() => setVisible(true))
    const hide = setTimeout(doClose, 20000)
    return () => {
      cancelAnimationFrame(show)
      clearTimeout(hide)
    }
  }, [id, doClose])

  const hasError = !!output?.error
  const exitOk = !hasError && output?.exitCode === 0
  const exitBadgeColor = hasError ? '#f85149' : exitOk ? '#3fb950' : '#ffd33d'
  const exitBadgeBg = hasError ? '#4b1113' : exitOk ? '#1a4731' : '#3d2e00'

  const pre = {
    fontFamily: "'Fira Code', 'Consolas', monospace",
    fontSize: 11,
    margin: 0,
    padding: '8px 12px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    maxHeight: 140,
    overflow: 'auto',
    lineHeight: 1.6,
  }

  return (
    <div
      style={{
        background: '#0d1117',
        border: `1px solid ${hasError ? '#f85149' : exitOk ? '#3fb950' : '#30363d'}`,
        borderRadius: 8,
        minWidth: 300,
        maxWidth: 440,
        boxShadow: '0 6px 24px rgba(0,0,0,0.6)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(40px)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        pointerEvents: 'auto',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '7px 10px',
          background: '#161b22',
          borderBottom: '1px solid #21262d',
        }}
      >
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#3fb950' }}>$</span>
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 12,
            color: '#e6edf3',
            fontWeight: 600,
            flex: 1,
          }}
        >
          {program}
        </span>
        {output && (
          <span
            style={{
              fontSize: 10,
              padding: '2px 7px',
              borderRadius: 10,
              background: exitBadgeBg,
              color: exitBadgeColor,
              fontFamily: 'monospace',
              fontWeight: 600,
            }}
          >
            {output.error ? 'ERR' : `exit ${output.exitCode}`}
          </span>
        )}
        <button
          onClick={doClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#7d8590',
            cursor: 'pointer',
            fontSize: 14,
            lineHeight: 1,
            padding: '2px 4px',
          }}
        >
          ✕
        </button>
      </div>

      {output?.error && <pre style={{ ...pre, color: '#f85149' }}>{output.error}</pre>}
      {output?.stdout && <pre style={{ ...pre, color: '#e6edf3' }}>{output.stdout}</pre>}
      {output?.stderr && (
        <pre style={{ ...pre, color: '#ffd33d', borderTop: '1px solid #21262d' }}>
          {output.stderr}
        </pre>
      )}
      {!output?.error && !output?.stdout && !output?.stderr && (
        <p
          style={{
            color: '#7d8590',
            margin: 0,
            padding: '8px 12px',
            fontSize: 12,
            fontStyle: 'italic',
          }}
        >
          (sin output)
        </p>
      )}
    </div>
  )
}

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
      {notifications.map((n) =>
        n.type === 'hook-output' ? (
          <HookOutputToast key={n.id} notification={n} />
        ) : (
          <ToastItem key={n.id} notification={n} />
        ),
      )}
    </div>
  )
}

export default NotificationToaster
