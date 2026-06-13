import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Column, MasterDetail } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import { CCard, CCardBody, CCardHeader, CBadge } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilEnvelopeClosed } from '@coreui/icons'
import * as actions from 'src/actions/system/contactMessageActions'
import Spinner from 'src/components/shared/Spinner'

const formatDate = (ts) => {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
}

const MessageDetail = ({ data: msg }) => (
  <div
    style={{
      margin: '0 8px 12px 32px',
      background: 'var(--cui-card-bg, #fff)',
      border: '1px solid var(--cui-border-color, #dee2e6)',
      borderRadius: 10,
      padding: '16px 20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    }}
  >
    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--cui-secondary-color, #6c757d)', margin: '0 0 8px' }}>
      Mensaje completo
    </p>
    <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{msg.message}</p>
    {msg.email && (
      <p style={{ fontSize: 12, color: 'var(--cui-secondary-color, #6c757d)', marginTop: 10, marginBottom: 0 }}>
        <strong>Email:</strong>{' '}
        <a href={`mailto:${msg.email}`} style={{ color: '#6366f1' }}>{msg.email}</a>
      </p>
    )}
  </div>
)

const ContactMessages = () => {
  const dispatch = useDispatch()
  const { data, fetching: loading } = useSelector((s) => s.contactMessage)
  const messages = data ?? []

  useEffect(() => {
    dispatch(actions.fetchRequest())
  }, [dispatch])

  const handleDelete = (id, e) => {
    e.stopPropagation()
    if (!window.confirm('¿Eliminar este mensaje?')) return
    dispatch(actions.deleteRequest({ id }))
  }

  const handleRowExpand = ({ key, component }) => {
    const msg = messages.find((m) => m.id === key)
    if (msg && !msg.read) dispatch(actions.updateRequest({ id: key, read: true }))
  }

  return (
    <CCard>
      <CCardHeader className="d-flex align-items-center gap-2">
        <CIcon icon={cilEnvelopeClosed} />
        <strong>Mensajes — About Me</strong>
        <CBadge color="secondary">{messages.length}</CBadge>
      </CCardHeader>
      <CCardBody style={{ padding: '16px' }}>
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner color="primary" />
          </div>
        ) : (
          <StandardGrid keyExpr="id" dataSource={messages} noDataText="No hay mensajes aún." onRowExpanding={handleRowExpand}>
            <Column
              dataField="createdAt"
              caption="Fecha"
              width={180}
              cellRender={({ value }) => (
                <span style={{ whiteSpace: 'nowrap' }}>{formatDate(value)}</span>
              )}
            />
            <Column dataField="name" caption="Nombre" width={180} />
            <Column
              dataField="email"
              caption="Email"
              width={220}
              hidingPriority={2}
              cellRender={({ value }) =>
                value ? (
                  <a href={`mailto:${value}`} style={{ color: '#6366f1', fontSize: 13 }}>
                    {value}
                  </a>
                ) : (
                  <span style={{ color: '#aaa' }}>—</span>
                )
              }
            />
            <Column
              dataField="message"
              caption="Mensaje"
              cellRender={({ value }) => (
                <span
                  style={{
                    fontSize: 13,
                    maxWidth: 300,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }}
                >
                  {value}
                </span>
              )}
            />
            <Column
              caption=""
              width={50}
              allowSorting={false}
              allowResizing={false}
              cellRender={({ data }) => (
                <button
                  onClick={(e) => handleDelete(data.id, e)}
                  style={{ background: 'none', border: 'none', color: '#e03131', cursor: 'pointer', padding: '2px 6px' }}
                  title="Eliminar"
                >
                  <CIcon icon={cilTrash} size="sm" />
                </button>
              )}
            />
            <MasterDetail enabled render={({ data }) => <MessageDetail data={data} />} />
          </StandardGrid>
        )}
      </CCardBody>
    </CCard>
  )
}

export default ContactMessages
