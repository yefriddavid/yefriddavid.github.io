import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Column } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import { CCard, CCardBody, CCardHeader, CBadge, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilReload, cilTrash } from '@coreui/icons'
import * as fcmTokenActions from 'src/actions/system/fcmTokenActions'
import Spinner from 'src/components/shared/Spinner'

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
  const dispatch = useDispatch()
  const { data: tokenData, fetching: loading } = useSelector((s) => s.fcmToken)
  const [deletingId, setDeletingId] = useState(null)

  const rows = (tokenData ?? []).map((t) => ({
    ...t,
    device: parseDevice(t.userAgent),
    browser: parseBrowser(t.userAgent),
    tokenShort: `${t.token.slice(0, 12)}…${t.token.slice(-8)}`,
    registeredAt: t.createdAt ? t.createdAt.toLocaleString('es-CO') : '—',
    origin: t.origin || '—',
  }))

  useEffect(() => {
    dispatch(fcmTokenActions.fetchRequest())
  }, [dispatch])

  const handleDelete = (id) => {
    if (!window.confirm('¿Eliminar este suscriptor?')) return
    setDeletingId(id)
    dispatch(fcmTokenActions.deleteRequest({ id }))
    setDeletingId(null)
  }

  const handleReload = () => dispatch(fcmTokenActions.fetchRequest())

  return (
    <CCard>
      <CCardHeader className="d-flex align-items-center justify-content-between gap-2">
        <div className="d-flex align-items-center gap-2">
          <strong>Suscriptores Push</strong>
          <CBadge color="secondary">{rows.length}</CBadge>
          {loading && <Spinner size="sm" />}
        </div>
        <CButton
          size="sm"
          color="secondary"
          variant="outline"
          onClick={handleReload}
          disabled={loading}
        >
          <CIcon icon={cilReload} size="sm" /> Actualizar
        </CButton>
      </CCardHeader>

      <CCardBody style={{ padding: 0 }}>
        {loading && rows.length === 0 ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner color="primary" />
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
                    <Spinner size="sm" />
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
