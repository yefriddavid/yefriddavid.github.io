import React, { useEffect, useState, useCallback } from 'react'
import { Column } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import { CCard, CCardBody, CCardHeader, CSpinner, CBadge, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilReload, cilTrash } from '@coreui/icons'
import { getTokens, deleteFcmToken } from 'src/services/firebase/security/fcmTokens'

const parseDevice = (userAgent) => {
  if (!userAgent) return '—'
  if (/iPhone|iPad/.test(userAgent)) return 'iOS'
  if (/Android/.test(userAgent)) return 'Android'
  if (/Windows/.test(userAgent)) return 'Windows'
  if (/Mac/.test(userAgent)) return 'macOS'
  if (/Linux/.test(userAgent)) return 'Linux'
  return 'Desconocido'
}

const parseBrowser = (userAgent) => {
  if (!userAgent) return '—'
  if (/Edg\//.test(userAgent)) return 'Edge'
  if (/Chrome\//.test(userAgent)) return 'Chrome'
  if (/Firefox\//.test(userAgent)) return 'Firefox'
  if (/Safari\//.test(userAgent)) return 'Safari'
  return 'Otro'
}

const PushSubscribers = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const tokens = await getTokens()
      setRows(
        tokens.map((t) => ({
          ...t,
          device: parseDevice(t.userAgent),
          browser: parseBrowser(t.userAgent),
          tokenShort: `${t.token.slice(0, 12)}…${t.token.slice(-8)}`,
          registeredAt: t.createdAt ? t.createdAt.toLocaleString('es-CO') : '—',
          origin: t.origin || '—',
        })),
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este suscriptor?')) return
    setDeletingId(id)
    try {
      await deleteFcmToken(id)
      setRows((prev) => prev.filter((r) => r.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <CCard>
      <CCardHeader className="d-flex align-items-center justify-content-between gap-2">
        <div className="d-flex align-items-center gap-2">
          <strong>Suscriptores Push</strong>
          <CBadge color="secondary">{rows.length}</CBadge>
          {loading && <CSpinner size="sm" />}
        </div>
        <CButton size="sm" color="secondary" variant="outline" onClick={load} disabled={loading}>
          <CIcon icon={cilReload} size="sm" /> Actualizar
        </CButton>
      </CCardHeader>

      <CCardBody style={{ padding: 0 }}>
        {loading && rows.length === 0 ? (
          <div className="d-flex justify-content-center py-5">
            <CSpinner color="primary" />
          </div>
        ) : (
          <StandardGrid
            id="pushSubscribersGrid"
            dataSource={rows}
            keyExpr="id"
            noDataText="No hay dispositivos suscritos."
          >
            <Column dataField="tokenShort" caption="Token" minWidth={180} allowSorting={false} />
            <Column dataField="origin" caption="Origen" minWidth={200} />
            <Column dataField="browser" caption="Navegador" width={120} />
            <Column dataField="device" caption="Dispositivo" width={120} />
            <Column dataField="registeredAt" caption="Registrado" width={180} />
            <Column
              caption=""
              width={60}
              allowSorting={false}
              allowResizing={false}
              cellRender={({ data }) => (
                <button
                  onClick={() => handleDelete(data.id)}
                  disabled={deletingId === data.id}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#e03131',
                    cursor: 'pointer',
                    padding: '2px 4px',
                  }}
                  title="Eliminar suscriptor"
                >
                  {deletingId === data.id ? (
                    <CSpinner size="sm" />
                  ) : (
                    <CIcon icon={cilTrash} size="sm" />
                  )}
                </button>
              )}
            />
          </StandardGrid>
        )}
      </CCardBody>
    </CCard>
  )
}

export default PushSubscribers
