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
import './VersionModal.scss'

/* eslint-disable no-undef */
const LOCAL_HASH = __COMMIT_HASH__
const LOCAL_MESSAGE = __COMMIT_MESSAGE__
const LOCAL_DATE = __BUILD_DATE__
const LOCAL_VERSION = __APP_VERSION__
/* eslint-enable no-undef */

const Row = ({ label, value, mono }) => (
  <div className="version-row">
    <span className="version-row__label">{label}</span>
    <span className={`version-row__value${mono ? ' version-row__value--mono' : ''}`}>
      {value ?? '—'}
    </span>
  </div>
)

const SectionLabel = ({ children }) => (
  <div className="version-section-label">{children}</div>
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
        <CModalTitle className="version-modal__title">Versión del software</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <SectionLabel>En ejecución (este navegador)</SectionLabel>
        <Row label="Versión" value={LOCAL_VERSION} />
        <Row label="Commit" value={LOCAL_HASH} mono />
        <Row label="Compilado" value={fmtDate(LOCAL_DATE)} />
        {LOCAL_MESSAGE && <Row label="Mensaje" value={LOCAL_MESSAGE} />}

        <hr className="version-modal__divider" />

        <div className="version-modal__server-header">
          <SectionLabel>Servidor (último deploy)</SectionLabel>
          <button
            className="version-modal__refresh-btn"
            onClick={fetchServer}
            disabled={loading}
            title="Verificar de nuevo"
          >
            <CIcon icon={cilReload} size="sm" />
          </button>
        </div>

        {loading ? (
          <div className="version-modal__spinner-wrap">
            <CSpinner size="sm" />
          </div>
        ) : fetchError ? (
          <div className="version-modal__error">Error: {fetchError}</div>
        ) : server ? (
          <>
            <Row label="Versión" value={server.appVersion} />
            <Row label="Commit" value={server.hash} mono />
            <Row label="Compilado" value={fmtDate(server.buildDate)} />
            {server.commitMessage && <Row label="Mensaje" value={server.commitMessage} />}
            <div className="version-modal__badge-wrap">
              {isOutdated ? (
                <CBadge color="warning" className="version-modal__badge">
                  Nueva versión disponible
                </CBadge>
              ) : (
                <CBadge color="success" className="version-modal__badge">
                  Al día
                </CBadge>
              )}
            </div>
          </>
        ) : null}

        <hr className="version-modal__divider version-modal__divider--lg" />

        <CButton
          color="primary"
          variant="outline"
          size="sm"
          className="version-modal__update-btn"
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
        <div className="version-modal__update-hint">Borra caché del SW y recarga la app</div>
      </CModalBody>
    </CModal>
  )
}

export default VersionModal
