import React, { useEffect, useState, useMemo } from 'react'
import { CCard, CBadge, CButton } from '@coreui/react'
import { Column, Paging, FilterRow, Toolbar, Item as ToolbarItem } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import moment from 'moment'
import { getAuditLogs } from 'src/services/firebase/system/auditLogs'
import Spinner from 'src/components/shared/Spinner'

const OP_COLOR = { CREATE: 'success', UPDATE: 'warning', DELETE: 'danger' }

const renderOp = ({ value }) => (
  <CBadge color={OP_COLOR[value] ?? 'secondary'} style={{ fontFamily: 'monospace', fontSize: 11 }}>
    {value}
  </CBadge>
)

const renderTs = ({ value }) => (
  <span style={{ fontFamily: 'monospace', fontSize: 12, opacity: 0.75 }}>
    {value ? moment(value).format('DD/MM HH:mm:ss') : '—'}
  </span>
)

const renderEntity = ({ value }) => (
  <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{value}</span>
)

const renderPayload = ({ value }) => {
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')
  return (
    <span style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.6 }} title={str}>
      {str.slice(0, 80)}{str.length > 80 ? '…' : ''}
    </span>
  )
}

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    getAuditLogs()
      .then(setLogs)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const today = useMemo(() => {
    const start = moment().startOf('day')
    return logs.filter((l) => moment(l.timestamp).isAfter(start)).length
  }, [logs])

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>📋</span>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>Audit Log</h1>
          <span style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.4 }}>System_audit_logs</span>
        </div>
        <CButton color="primary" variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? <Spinner size="sm" /> : '↺'}&nbsp;Recargar
        </CButton>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total', value: logs.length, color: '#94a3b8' },
          { label: 'Hoy', value: today, color: today > 0 ? '#3b82f6' : '#94a3b8' },
          { label: 'Eliminaciones hoy', value: logs.filter(l => l.operation === 'DELETE' && moment(l.timestamp).isAfter(moment().startOf('day'))).length, color: '#ef4444' },
        ].map(({ label, value, color }) => (
          <CCard key={label} style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'monospace', color }}>{value}</div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.5 }}>{label}</div>
          </CCard>
        ))}
      </div>

      <CCard style={{ borderRadius: 12, overflow: 'hidden' }}>
        {loading && (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <Spinner color="primary" />
          </div>
        )}
        {!loading && logs.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', opacity: 0.4 }}>Sin operaciones registradas</div>
        )}
        {!loading && logs.length > 0 && (
          <StandardGrid
            dataSource={logs}
            keyExpr="id"
            showBorders={false}
            showColumnLines={false}
            showRowLines={true}
            rowAlternationEnabled={false}
            wordWrapEnabled={false}
          >
            <FilterRow visible={true} />
            <Paging defaultPageSize={25} />
            <Toolbar>
              <ToolbarItem name="searchPanel" />
            </Toolbar>
            <Column dataField="timestamp" caption="Timestamp" width={130} dataType="date" cellRender={renderTs} defaultSortOrder="desc" />
            <Column dataField="operation" caption="Operación" width={100} cellRender={renderOp} />
            <Column dataField="entity" caption="Entidad" width={160} cellRender={renderEntity} />
            <Column dataField="username" caption="Usuario" width={120} />
            <Column dataField="payload" caption="Datos" cellRender={renderPayload} />
            <Column dataField="route" caption="Ruta" width={180} />
          </StandardGrid>
        )}
      </CCard>
    </div>
  )
}

export default AuditLogsPage
