import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CBadge,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CCollapse,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash } from '@coreui/icons'
import { db } from 'src/services/providers/firebase/settings'
import { collection, getDocs, orderBy, query, limit, deleteDoc, doc } from 'firebase/firestore'

const parseUA = (ua = '') => {
  if (!ua) return ''
  if (/iPhone|iPad/.test(ua)) return '📱 iOS'
  if (/Android/.test(ua)) return '📱 Android'
  if (/Windows/.test(ua)) return '🖥️ Windows'
  if (/Mac OS/.test(ua)) return '🖥️ macOS'
  if (/Linux/.test(ua)) return '🖥️ Linux'
  return ua.slice(0, 40)
}

const parseBrowser = (ua = '') => {
  if (/Edg\//.test(ua)) return 'Edge'
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return 'Chrome'
  if (/Firefox\//.test(ua)) return 'Firefox'
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) return 'Safari'
  if (/OPR\/|Opera\//.test(ua)) return 'Opera'
  return '—'
}

const formatDate = (ts) => {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
}

const DetailRow = ({ label, value, mono }) => (
  value ? (
    <div style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: '1px solid var(--cui-border-color, #e8e8e8)' }}>
      <span style={{ minWidth: 130, fontSize: 12, color: 'var(--cui-secondary-color, #6c757d)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12, fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>{value}</span>
    </div>
  ) : null
)

const VisitDetail = ({ v }) => (
  <div style={{
    margin: '0 8px 12px 32px',
    background: 'var(--cui-card-bg, #fff)',
    border: '1px solid var(--cui-border-color, #dee2e6)',
    borderRadius: 10,
    padding: '16px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--cui-secondary-color, #6c757d)', margin: '0 0 6px' }}>Identidad</p>
        <DetailRow label="IP" value={v.ip} mono />
        <DetailRow label="Organización" value={v.org} />
        <DetailRow label="Coordenadas" value={v.loc} mono />
        <DetailRow label="Ciudad" value={v.city} />
        <DetailRow label="Región" value={v.region} />
        <DetailRow label="País" value={v.country} />
        <DetailRow label="Zona horaria" value={v.timezone} />
      </div>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--cui-secondary-color, #6c757d)', margin: '0 0 6px' }}>Dispositivo & Navegador</p>
        <DetailRow label="Sistema operativo" value={parseUA(v.userAgent)} />
        <DetailRow label="Navegador" value={parseBrowser(v.userAgent)} />
        <DetailRow label="Idioma" value={v.language} />
        <DetailRow label="Otros idiomas" value={v.languages} />
        <DetailRow label="Pantalla" value={v.screenWidth && v.screenHeight ? `${v.screenWidth} × ${v.screenHeight} px` : null} />
        <DetailRow label="Plataforma" value={v.platform} />
        <DetailRow label="Cookies" value={v.cookiesEnabled != null ? (v.cookiesEnabled ? 'Habilitadas' : 'Deshabilitadas') : null} />
      </div>
    </div>
    <div style={{ marginTop: 12 }}>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--cui-secondary-color, #6c757d)', margin: '0 0 6px' }}>Navegación</p>
      <DetailRow label="Referrer" value={v.referrer || 'direct'} />
      <DetailRow label="URL visitada" value={v.url} mono />
      <DetailRow label="Fecha" value={formatDate(v.createdAt)} />
    </div>
    {v.userAgent && (
      <div style={{ marginTop: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--cui-secondary-color, #6c757d)', margin: '0 0 4px' }}>User Agent completo</p>
        <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--cui-secondary-color, #6c757d)', margin: 0, wordBreak: 'break-all' }}>{v.userAgent}</p>
      </div>
    )}
  </div>
)

const Visits = () => {
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('¿Eliminar este registro?')) return
    await deleteDoc(doc(db, 'page_visits', id))
    setVisits((prev) => prev.filter((v) => v.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const toggleRow = (id) => setExpandedId((prev) => (prev === id ? null : id))

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, 'page_visits'), orderBy('createdAt', 'desc'), limit(200))
        const snap = await getDocs(q)
        setVisits(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return (
    <CCard>
      <CCardHeader className="d-flex align-items-center gap-2">
        <strong>Visitas — About Me</strong>
        <CBadge color="secondary">{visits.length}</CBadge>
      </CCardHeader>
      <CCardBody style={{ overflowX: 'auto', padding: 0 }}>
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <CSpinner color="primary" />
          </div>
        ) : visits.length === 0 ? (
          <p className="text-body-secondary text-center py-4">Sin registros aún.</p>
        ) : (
          <CTable small hover responsive style={{ marginBottom: 0 }}>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell style={{ width: 28 }} />
                <CTableHeaderCell>Fecha</CTableHeaderCell>
                <CTableHeaderCell>IP</CTableHeaderCell>
                <CTableHeaderCell>Ubicación</CTableHeaderCell>
                <CTableHeaderCell>OS</CTableHeaderCell>
                <CTableHeaderCell>Navegador</CTableHeaderCell>
                <CTableHeaderCell>Referrer</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {visits.map((v) => (
                <React.Fragment key={v.id}>
                  <CTableRow
                    onClick={() => toggleRow(v.id)}
                    style={{ cursor: 'pointer', background: expandedId === v.id ? 'var(--cui-primary-bg-subtle, #e7f1ff)' : undefined }}
                  >
                    <CTableDataCell style={{ textAlign: 'center', color: 'var(--cui-secondary-color, #6c757d)', fontSize: 11 }}>
                      {expandedId === v.id ? '▼' : '▶'}
                    </CTableDataCell>
                    <CTableDataCell style={{ whiteSpace: 'nowrap' }}>{formatDate(v.createdAt)}</CTableDataCell>
                    <CTableDataCell style={{ fontFamily: 'monospace', fontSize: 12 }}>{v.ip || '—'}</CTableDataCell>
                    <CTableDataCell style={{ whiteSpace: 'nowrap' }}>
                      {[v.city, v.country].filter(Boolean).join(', ') || '—'}
                    </CTableDataCell>
                    <CTableDataCell>{parseUA(v.userAgent)}</CTableDataCell>
                    <CTableDataCell>{parseBrowser(v.userAgent)}</CTableDataCell>
                    <CTableDataCell style={{ fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {v.referrer || 'direct'}
                    </CTableDataCell>
                    <CTableDataCell>
                      <button
                        onClick={(e) => handleDelete(v.id, e)}
                        style={{ background: 'none', border: 'none', color: '#e03131', cursor: 'pointer', padding: '2px 6px' }}
                        title="Eliminar"
                      >
                        <CIcon icon={cilTrash} size="sm" />
                      </button>
                    </CTableDataCell>
                  </CTableRow>
                  {expandedId === v.id && (
                    <CTableRow style={{ background: 'transparent' }}>
                      <CTableDataCell colSpan={8} style={{ padding: 0, border: 'none' }}>
                        <VisitDetail v={v} />
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </React.Fragment>
              ))}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  )
}

export default Visits
