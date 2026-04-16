import React, { useEffect, useState } from 'react'
import {
  CAlert,
  CButton,
  CListGroup,
  CListGroupItem,
  CSpinner,
  CProgress,
  CBadge,
  CTable,
  CTableRow,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import { cilReload } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { fetchCollectionCounts, SPARK_LIMITS } from 'src/services/firebase/admin/usageMetrics'

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatNumber(n) {
  return n?.toLocaleString('es-CO') ?? '—'
}

const MODULE_ORDER = ['Taxi', 'CashFlow', 'Vauchers', 'Seguridad', 'Otros']

function groupByModule(rows) {
  const map = {}
  for (const row of rows) {
    if (!map[row.module]) map[row.module] = []
    map[row.module].push(row)
  }
  return map
}

const StorageSettings = () => {
  // Local storage
  const [storageInfo, setStorageInfo] = useState(null)
  const [localLoading, setLocalLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Firebase
  const [fbRows, setFbRows] = useState(null)
  const [fbLoading, setFbLoading] = useState(false)

  const loadStorageInfo = async () => {
    setLocalLoading(true)
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const { usage, quota } = await navigator.storage.estimate()
        setStorageInfo({ usage, quota })
      } else {
        setStorageInfo(null)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLocalLoading(false)
    }
  }

  const loadFirebaseMetrics = async () => {
    setFbLoading(true)
    try {
      const rows = await fetchCollectionCounts()
      setFbRows(rows)
    } catch (e) {
      setError(`Firebase: ${e.message}`)
    } finally {
      setFbLoading(false)
    }
  }

  useEffect(() => {
    loadStorageInfo()
    loadFirebaseMetrics()
  }, [])

  const clearCaches = async () => {
    setClearing(true)
    setError(null)
    setSuccess(null)
    try {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
      setSuccess(
        `${keys.length} caché(s) eliminado(s). La app descargará los archivos de nuevo al recargar.`,
      )
      await loadStorageInfo()
    } catch (e) {
      setError(e.message)
    } finally {
      setClearing(false)
    }
  }

  const usagePercent =
    storageInfo && storageInfo.quota > 0
      ? Math.round((storageInfo.usage / storageInfo.quota) * 100)
      : 0

  const totalDocs = fbRows ? fbRows.reduce((acc, r) => acc + (r.count ?? 0), 0) : null
  const grouped = fbRows ? groupByModule(fbRows) : {}

  return (
    <div>
      {error && (
        <CAlert color="danger" dismissible onClose={() => setError(null)}>
          {error}
        </CAlert>
      )}
      {success && (
        <CAlert color="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </CAlert>
      )}

      {/* ── Local storage ── */}
      <h6 className="text-secondary mb-3">Almacenamiento local (este dispositivo)</h6>
      {localLoading ? (
        <div className="text-center py-3">
          <CSpinner size="sm" />
        </div>
      ) : storageInfo ? (
        <CListGroup className="mb-4">
          <CListGroupItem>
            <div className="d-flex justify-content-between mb-1">
              <span>Uso total</span>
              <strong>
                {formatBytes(storageInfo.usage)} / {formatBytes(storageInfo.quota)}
              </strong>
            </div>
            <CProgress value={usagePercent} color={usagePercent > 80 ? 'danger' : 'primary'} />
            <small className="text-secondary">{usagePercent}% utilizado</small>
          </CListGroupItem>
          <CListGroupItem className="d-flex justify-content-between align-items-center">
            <div>
              <div>Limpiar caché de Service Worker</div>
              <small className="text-secondary">
                Elimina archivos en caché. Se descargarán de nuevo al recargar.
              </small>
            </div>
            <CButton
              color="danger"
              variant="outline"
              size="sm"
              onClick={clearCaches}
              disabled={clearing}
            >
              {clearing ? <CSpinner size="sm" /> : 'Limpiar'}
            </CButton>
          </CListGroupItem>
        </CListGroup>
      ) : (
        <CAlert color="secondary" className="mb-4">
          La API de estimación de almacenamiento no está disponible.
        </CAlert>
      )}

      {/* ── Firebase Firestore ── */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h6 className="text-secondary mb-0">Firebase Firestore — Spark (free tier)</h6>
        <CButton
          size="sm"
          color="secondary"
          variant="ghost"
          onClick={loadFirebaseMetrics}
          disabled={fbLoading}
        >
          <CIcon icon={cilReload} size="sm" />
        </CButton>
      </div>

      {/* Limits reference */}
      <CListGroup className="mb-3" style={{ fontSize: 13 }}>
        <CListGroupItem className="d-flex justify-content-between py-1">
          <span>Lecturas / día</span>
          <CBadge color="info">{formatNumber(SPARK_LIMITS.readsPerDay)}</CBadge>
        </CListGroupItem>
        <CListGroupItem className="d-flex justify-content-between py-1">
          <span>Escrituras / día</span>
          <CBadge color="info">{formatNumber(SPARK_LIMITS.writesPerDay)}</CBadge>
        </CListGroupItem>
        <CListGroupItem className="d-flex justify-content-between py-1">
          <span>Eliminaciones / día</span>
          <CBadge color="info">{formatNumber(SPARK_LIMITS.deletesPerDay)}</CBadge>
        </CListGroupItem>
        <CListGroupItem className="d-flex justify-content-between py-1">
          <span>Almacenamiento total</span>
          <CBadge color="info">{SPARK_LIMITS.storageGB} GiB</CBadge>
        </CListGroupItem>
        <CListGroupItem className="d-flex justify-content-between py-1">
          <span>Transferencia de red / mes</span>
          <CBadge color="info">{SPARK_LIMITS.networkGB} GiB</CBadge>
        </CListGroupItem>
      </CListGroup>

      {/* Collection counts */}
      <p className="text-secondary small mb-2">
        Documentos por colección (cada recarga consume 1 lectura por colección).
      </p>
      {fbLoading && !fbRows ? (
        <div className="text-center py-3">
          <CSpinner size="sm" />
        </div>
      ) : fbRows ? (
        <>
          {MODULE_ORDER.map((mod) => {
            const rows = grouped[mod]
            if (!rows) return null
            return (
              <div key={mod} className="mb-3">
                <div
                  className="fw-semibold small text-secondary mb-1 text-uppercase"
                  style={{ letterSpacing: 1 }}
                >
                  {mod}
                </div>
                <CTable small bordered className="mb-0" style={{ fontSize: 13 }}>
                  <CTableBody>
                    {rows.map((row) => (
                      <CTableRow key={row.name}>
                        <CTableDataCell>{row.label}</CTableDataCell>
                        <CTableDataCell className="text-end" style={{ width: 80 }}>
                          {row.error ? (
                            <span className="text-danger">—</span>
                          ) : (
                            <strong>{formatNumber(row.count)}</strong>
                          )}
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>
            )
          })}
          <div className="d-flex justify-content-end">
            <small className="text-secondary">
              Total documentos: <strong>{formatNumber(totalDocs)}</strong>
            </small>
          </div>
          <small className="text-secondary d-block mt-1">
            Para ver bytes usados y operaciones en tiempo real, abre la{' '}
            <a
              href={`https://console.firebase.google.com/project/${import.meta.env.VITE_FIREBASE_PROJECT_ID}/usage`}
              target="_blank"
              rel="noreferrer"
            >
              consola de Firebase
            </a>
            .
          </small>
        </>
      ) : null}
    </div>
  )
}

export default StorageSettings
