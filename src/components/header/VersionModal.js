import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CButton,
  CSpinner,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload, cilReload } from '@coreui/icons'

/* eslint-disable no-undef */
const LOCAL_HASH = __COMMIT_HASH__
const LOCAL_MESSAGE = __COMMIT_MESSAGE__
const LOCAL_DATE = __BUILD_DATE__
const LOCAL_VERSION = __APP_VERSION__
/* eslint-enable no-undef */

const Row = ({ label, value, mono }) => (
  <div style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13, alignItems: 'flex-start' }}>
    <span style={{ color: 'var(--cui-secondary-color)', minWidth: 110, flexShrink: 0 }}>
      {label}
    </span>
    <span style={{ fontFamily: mono ? 'monospace' : undefined, fontWeight: 500, wordBreak: 'break-all' }}>
      {value ?? '—'}
    </span>
  </div>
)

const SectionLabel = ({ children }) => (
  <div
    style={{
      fontSize: 10,
      fontWeight: 700,
      color: 'var(--cui-secondary-color)',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 8,
    }}
  >
    {children}
  </div>
)

const VersionModal = ({ visible, onClose }) => {
  const [server, setServer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const [updating, setUpdating] = useState(false)

  const fetchServer = async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch('/version.json?t=' + Date.now())
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setServer(data)
    } catch (e) {
      setFetchError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible) fetchServer()
  }, [visible])

  const isOutdated = server && server.hash && server.hash !== LOCAL_HASH

  const handleForceUpdate = async () => {
    setUpdating(true)
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
    window.location.reload()
  }

  const fmtDate = (iso) => {
    if (!iso) return '—'
    try {
      return new Date(iso).toLocaleString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return iso
    }
  }

  return (
    <CModal visible={visible} onClose={onClose} size="sm" alignment="center">
      <CModalHeader>
        <CModalTitle style={{ fontSize: 15 }}>Versión del software</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <SectionLabel>En ejecución (este navegador)</SectionLabel>
        <Row label="Versión" value={LOCAL_VERSION} />
        <Row label="Commit" value={LOCAL_HASH} mono />
        <Row label="Compilado" value={fmtDate(LOCAL_DATE)} />
        {LOCAL_MESSAGE && <Row label="Mensaje" value={LOCAL_MESSAGE} />}

        <hr style={{ margin: '12px 0' }} />

        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}
        >
          <SectionLabel>Servidor (último deploy)</SectionLabel>
          <button
            onClick={fetchServer}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0 0 8px 0',
              color: 'var(--cui-primary)',
              lineHeight: 1,
            }}
            title="Verificar de nuevo"
          >
            <CIcon icon={cilReload} size="sm" />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 12 }}>
            <CSpinner size="sm" />
          </div>
        ) : fetchError ? (
          <div style={{ color: '#e03131', fontSize: 13, marginBottom: 8 }}>
            Error: {fetchError}
          </div>
        ) : server ? (
          <>
            <Row label="Versión" value={server.appVersion} />
            <Row label="Commit" value={server.hash} mono />
            <Row label="Compilado" value={fmtDate(server.buildDate)} />
            {server.commitMessage && <Row label="Mensaje" value={server.commitMessage} />}
            <div style={{ marginTop: 10 }}>
              {isOutdated ? (
                <CBadge color="warning" style={{ fontSize: 12 }}>
                  Nueva versión disponible
                </CBadge>
              ) : (
                <CBadge color="success" style={{ fontSize: 12 }}>
                  Al día
                </CBadge>
              )}
            </div>
          </>
        ) : null}

        <hr style={{ margin: '14px 0' }} />

        <CButton
          color="primary"
          variant="outline"
          size="sm"
          style={{ width: '100%' }}
          disabled={updating}
          onClick={handleForceUpdate}
        >
          {updating ? (
            <>
              <CSpinner size="sm" className="me-2" />
              Actualizando…
            </>
          ) : (
            <>
              <CIcon icon={cilCloudDownload} className="me-2" />
              Forzar actualización
            </>
          )}
        </CButton>
        <div
          style={{
            fontSize: 11,
            color: 'var(--cui-secondary-color)',
            marginTop: 6,
            textAlign: 'center',
          }}
        >
          Borra caché del SW y recarga la app
        </div>
      </CModalBody>
    </CModal>
  )
}

export default VersionModal
