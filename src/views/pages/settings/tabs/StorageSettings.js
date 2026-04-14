import React, { useEffect, useState } from 'react'
import { CAlert, CButton, CListGroup, CListGroupItem, CSpinner, CBadge, CProgress } from '@coreui/react'

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

const StorageSettings = () => {
  const [storageInfo, setStorageInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const loadStorageInfo = async () => {
    setLoading(true)
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
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStorageInfo()
  }, [])

  const clearCaches = async () => {
    setClearing(true)
    setError(null)
    setSuccess(null)
    try {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
      setSuccess(`${keys.length} caché(s) eliminado(s). La app se actualizará en el próximo inicio.`)
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

      <h6 className="text-secondary mb-3">Uso de almacenamiento</h6>

      {loading ? (
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
        </CListGroup>
      ) : (
        <CAlert color="secondary">La API de estimación de almacenamiento no está disponible.</CAlert>
      )}

      <h6 className="text-secondary mb-3">Acciones</h6>
      <CListGroup>
        <CListGroupItem className="d-flex justify-content-between align-items-center">
          <div>
            <div>Limpiar caché de Service Worker</div>
            <small className="text-secondary">
              Elimina los archivos en caché. La app los descargará de nuevo al recargar.
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
    </div>
  )
}

export default StorageSettings
