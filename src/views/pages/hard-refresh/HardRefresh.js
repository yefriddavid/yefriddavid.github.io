import React, { useEffect, useState } from 'react'

/* eslint-disable no-undef */
const LOCAL_HASH = __COMMIT_HASH__
const LOCAL_MESSAGE = __COMMIT_MESSAGE__
const LOCAL_DATE = __BUILD_DATE__
const LOCAL_VERSION = __APP_VERSION__
/* eslint-enable no-undef */

const fmtDate = (iso) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return iso
  }
}

const Row = ({ label, value, mono }) => (
  <div style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 14 }}>
    <span style={{ color: '#94a3b8', minWidth: 130, flexShrink: 0 }}>{label}</span>
    <span style={{ fontFamily: mono ? 'monospace' : undefined, fontWeight: 600, color: '#1e293b', wordBreak: 'break-all' }}>
      {value ?? '—'}
    </span>
  </div>
)

const HardRefresh = () => {
  const params = new URLSearchParams(window.location.search)
  const isDone = params.get('done') === '1'

  const [status, setStatus] = useState(isDone ? 'done' : 'clearing')

  useEffect(() => {
    if (isDone) return

    const run = async () => {
      try {
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations()
          await Promise.all(regs.map((r) => r.unregister()))
        }
        if ('caches' in window) {
          const keys = await caches.keys()
          await Promise.all(keys.map((k) => caches.delete(k)))
        }
      } catch {}
      window.location.replace('/hard-refresh?done=1')
    }

    run()
  }, [])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '32px 40px',
          maxWidth: 480,
          width: '100%',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}
      >
        {status === 'clearing' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⟳</div>
            <div style={{ color: '#64748b', fontSize: 14 }}>Limpiando caché…</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <span style={{ fontSize: 22 }}>✅</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#1e293b' }}>
                  Caché limpiada correctamente
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  Service worker desregistrado · caches eliminados
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '16px 20px',
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#94a3b8',
                  marginBottom: 12,
                }}
              >
                Versión en ejecución
              </div>
              <Row label="Versión" value={`v${LOCAL_VERSION}`} />
              <Row label="Commit" value={LOCAL_HASH} mono />
              <Row label="Compilado" value={fmtDate(LOCAL_DATE)} />
              {LOCAL_MESSAGE && <Row label="Mensaje" value={LOCAL_MESSAGE} />}
            </div>

            <button
              onClick={() => window.location.replace('/')}
              style={{
                width: '100%',
                padding: '10px 0',
                background: '#1e3a5f',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Ir al inicio
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default HardRefresh
