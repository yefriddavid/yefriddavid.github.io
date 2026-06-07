import React, { useEffect, useState } from 'react'
import {
  CAlert,
  CButton,
  CListGroup,
  CListGroupItem,
  CProgress,
  CBadge,
  CCollapse,
} from '@coreui/react'
import { Column, Paging } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import { cilReload, cilChevronBottom, cilChevronTop, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { fetchCollectionCounts, SPARK_LIMITS } from 'src/services/firebase/admin/usageMetrics'
import Spinner from 'src/components/shared/Spinner'

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

  // IndexedDB
  const [idbDatabases, setIdbDatabases] = useState([])
  const [idbLoading, setIdbLoading] = useState(false)
  const [idbClearing, setIdbClearing] = useState(null)
  const [idbExpanded, setIdbExpanded] = useState({})
  const [idbConfirm, setIdbConfirm] = useState(null)

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

  const loadIndexedDB = async () => {
    setIdbLoading(true)
    try {
      const dbs = await indexedDB.databases()
      const details = await Promise.all(
        dbs.map(async (db) => {
          try {
            const stores = await new Promise((resolve, reject) => {
              const req = indexedDB.open(db.name, db.version)
              req.onsuccess = (e) => {
                const names = Array.from(e.target.result.objectStoreNames)
                e.target.result.close()
                resolve(names)
              }
              req.onerror = () => reject(req.error)
            })
            return { name: db.name, version: db.version, stores }
          } catch {
            return { name: db.name, version: db.version, stores: [] }
          }
        }),
      )
      setIdbDatabases(details.sort((a, b) => a.name.localeCompare(b.name)))
    } catch (e) {
      setError(`IndexedDB: ${e.message}`)
    } finally {
      setIdbLoading(false)
    }
  }

  const deleteDatabase = async (dbName) => {
    setIdbClearing(dbName)
    setIdbConfirm(null)
    try {
      await new Promise((resolve, reject) => {
        const req = indexedDB.deleteDatabase(dbName)
        req.onsuccess = resolve
        req.onerror = () => reject(req.error)
        req.onblocked = () => reject(new Error('La base de datos está en uso. Recarga la página e intenta de nuevo.'))
      })
      setSuccess(`IndexedDB "${dbName}" eliminada correctamente.`)
      await loadIndexedDB()
    } catch (e) {
      setError(`Error eliminando ${dbName}: ${e.message}`)
    } finally {
      setIdbClearing(null)
    }
  }

  const deleteAllDatabases = async () => {
    setIdbClearing('__all__')
    setIdbConfirm(null)
    const names = idbDatabases.map((d) => d.name)
    try {
      await Promise.all(
        names.map(
          (name) =>
            new Promise((resolve) => {
              const req = indexedDB.deleteDatabase(name)
              req.onsuccess = resolve
              req.onerror = resolve
              req.onblocked = resolve
            }),
        ),
      )
      setSuccess(`${names.length} base(s) IndexedDB eliminada(s). Se requiere recargar la página.`)
      await loadIndexedDB()
    } catch (e) {
      setError(`Error en limpieza total: ${e.message}`)
    } finally {
      setIdbClearing(null)
    }
  }

  useEffect(() => {
    loadStorageInfo()
    loadFirebaseMetrics()
    loadIndexedDB()
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
          <Spinner size="sm" />
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
              {clearing ? <Spinner size="sm" /> : 'Limpiar'}
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
          <Spinner size="sm" />
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
                <StandardGrid
                  dataSource={rows}
                  keyExpr="name"
                  style={{ margin: 0, fontSize: 13 }}
                  rowAlternationEnabled={false}
                  hoverStateEnabled={false}
                  allowColumnResizing={false}
                >
                  <Paging enabled={false} />
                  <Column dataField="label" caption="Colección" />
                  <Column
                    caption="Docs"
                    width={90}
                    alignment="right"
                    cellRender={({ data }) =>
                      data.error ? (
                        <span className="text-danger">—</span>
                      ) : (
                        <strong>{formatNumber(data.count)}</strong>
                      )
                    }
                  />
                </StandardGrid>
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

      {/* ── IndexedDB ── */}
      <div className="d-flex align-items-center justify-content-between mb-2 mt-4">
        <h6 className="text-secondary mb-0">IndexedDB</h6>
        <CButton
          size="sm"
          color="secondary"
          variant="ghost"
          onClick={loadIndexedDB}
          disabled={idbLoading}
        >
          <CIcon icon={cilReload} size="sm" />
        </CButton>
      </div>

      {idbLoading ? (
        <div className="text-center py-3">
          <Spinner size="sm" />
        </div>
      ) : idbDatabases.length === 0 ? (
        <CAlert color="secondary">No se encontraron bases de datos IndexedDB.</CAlert>
      ) : (
        <>
          <CListGroup className="mb-3" style={{ fontSize: 13 }}>
            {idbDatabases.map((db) => (
              <CListGroupItem key={db.name} className="py-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div
                    className="d-flex align-items-center gap-2 flex-grow-1"
                    style={{ cursor: db.stores.length > 0 ? 'pointer' : 'default', minWidth: 0 }}
                    onClick={() =>
                      db.stores.length > 0 &&
                      setIdbExpanded((prev) => ({ ...prev, [db.name]: !prev[db.name] }))
                    }
                  >
                    {db.stores.length > 0 && (
                      <CIcon
                        icon={idbExpanded[db.name] ? cilChevronTop : cilChevronBottom}
                        size="sm"
                        className="text-secondary flex-shrink-0"
                      />
                    )}
                    <span className="fw-semibold text-truncate">{db.name}</span>
                    <CBadge color="secondary" style={{ fontSize: 10 }}>
                      v{db.version}
                    </CBadge>
                    <CBadge color="info" style={{ fontSize: 10 }}>
                      {db.stores.length} tabla{db.stores.length !== 1 ? 's' : ''}
                    </CBadge>
                  </div>
                  <div className="d-flex align-items-center gap-2 ms-2 flex-shrink-0">
                    {idbConfirm === db.name ? (
                      <>
                        <small className="text-danger">¿Confirmar?</small>
                        <CButton
                          size="sm"
                          color="danger"
                          onClick={() => deleteDatabase(db.name)}
                          disabled={!!idbClearing}
                        >
                          Sí
                        </CButton>
                        <CButton
                          size="sm"
                          color="secondary"
                          variant="ghost"
                          onClick={() => setIdbConfirm(null)}
                        >
                          No
                        </CButton>
                      </>
                    ) : (
                      <CButton
                        color="danger"
                        variant="outline"
                        size="sm"
                        onClick={() => setIdbConfirm(db.name)}
                        disabled={!!idbClearing}
                      >
                        {idbClearing === db.name ? <Spinner size="sm" /> : <CIcon icon={cilTrash} size="sm" />}
                      </CButton>
                    )}
                  </div>
                </div>
                <CCollapse visible={!!idbExpanded[db.name]}>
                  <div className="mt-2 ps-3" style={{ borderLeft: '2px solid var(--cui-border-color)' }}>
                    {db.stores.map((store) => (
                      <div key={store} className="text-secondary py-1" style={{ fontSize: 12 }}>
                        {store}
                      </div>
                    ))}
                  </div>
                </CCollapse>
              </CListGroupItem>
            ))}
          </CListGroup>

          <div className="d-flex justify-content-end">
            {idbConfirm === '__all__' ? (
              <div className="d-flex align-items-center gap-2">
                <small className="text-danger fw-semibold">
                  ¿Eliminar todas las bases IndexedDB? (se cerrará la sesión)
                </small>
                <CButton
                  size="sm"
                  color="danger"
                  onClick={deleteAllDatabases}
                  disabled={!!idbClearing}
                >
                  {idbClearing === '__all__' ? <Spinner size="sm" /> : 'Sí, limpiar todo'}
                </CButton>
                <CButton size="sm" color="secondary" variant="ghost" onClick={() => setIdbConfirm(null)}>
                  Cancelar
                </CButton>
              </div>
            ) : (
              <CButton
                color="danger"
                size="sm"
                onClick={() => setIdbConfirm('__all__')}
                disabled={!!idbClearing}
              >
                Limpiar todo
              </CButton>
            )}
          </div>
          <small className="text-secondary d-block mt-2">
            Eliminar bases que incluyen auth de Firebase cerrará la sesión al recargar.
          </small>
        </>
      )}
    </div>
  )
}

export default StorageSettings
