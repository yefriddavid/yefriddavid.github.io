import React, { useEffect, useState, useMemo } from 'react'
import { CCard, CBadge, CButton } from '@coreui/react'
import DataGrid, { Column, Paging, FilterRow, Toolbar, Item as ToolbarItem } from 'devextreme-react/data-grid'
import moment from 'moment'
import { getPerfLogs } from 'src/services/firebase/system/perfLogs'
import Spinner from 'src/components/shared/Spinner'

const renderTs = ({ value }) => (
  <span style={{ fontFamily: 'monospace', fontSize: 12, opacity: 0.75 }}>
    {value ? moment(value).format('DD/MM HH:mm:ss') : '—'}
  </span>
)

const renderDuration = ({ value, data }) => {
  const color = value > 5000 ? '#ef4444' : value > 2000 ? '#f97316' : '#22c55e'
  return (
    <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color }}>
      {value}ms
    </span>
  )
}

const renderSlow = ({ value }) => (
  <CBadge color={value ? 'danger' : 'success'} style={{ fontSize: 10 }}>
    {value ? 'LENTA' : 'OK'}
  </CBadge>
)

const PerfLogsPage = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    getPerfLogs()
      .then(setLogs)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const slowCount = useMemo(() => logs.filter((l) => l.slow).length, [logs])
  const avgMs = useMemo(() => {
    if (!logs.length) return 0
    return Math.round(logs.reduce((s, l) => s + (l.durationMs ?? 0), 0) / logs.length)
  }, [logs])
  const worstLabel = useMemo(() => {
    if (!logs.length) return '—'
    return logs.reduce((a, b) => (a.durationMs > b.durationMs ? a : b)).label ?? '—'
  }, [logs])

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>⚡</span>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>Performance</h1>
          <span style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.4 }}>queries {'>'} 2s</span>
        </div>
        <CButton color="primary" variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? <Spinner size="sm" /> : '↺'}&nbsp;Recargar
        </CButton>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total registros', value: logs.length, color: '#94a3b8' },
          { label: 'Lentas (>2s)', value: slowCount, color: slowCount > 0 ? '#ef4444' : '#22c55e' },
          { label: 'Promedio', value: `${avgMs}ms`, color: avgMs > 1000 ? '#f97316' : '#94a3b8' },
          { label: 'Peor query', value: worstLabel, color: '#3b82f6' },
        ].map(({ label, value, color }) => (
          <CCard key={label} style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace', color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
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
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
            <div style={{ fontWeight: 600 }}>Sin queries lentas registradas</div>
            <div style={{ fontSize: 13, opacity: 0.45, marginTop: 4 }}>Solo se registran queries que superen 2 segundos</div>
          </div>
        )}
        {!loading && logs.length > 0 && (
          <DataGrid
            dataSource={logs}
            keyExpr="id"
            showBorders={false}
            showColumnLines={false}
            showRowLines={true}
            rowAlternationEnabled={false}
            hoverStateEnabled={true}
            wordWrapEnabled={false}
          >
            <FilterRow visible={true} />
            <Paging defaultPageSize={25} />
            <Toolbar>
              <ToolbarItem name="searchPanel" />
            </Toolbar>
            <Column dataField="timestamp" caption="Timestamp" width={130} dataType="date" cellRender={renderTs} defaultSortOrder="desc" />
            <Column dataField="slow" caption="Estado" width={80} cellRender={renderSlow} />
            <Column dataField="durationMs" caption="Duración" width={110} cellRender={renderDuration} />
            <Column dataField="label" caption="Query" />
            <Column dataField="username" caption="Usuario" width={120} />
            <Column dataField="route" caption="Ruta" width={200} />
            <Column dataField="error" caption="Error" width={200} />
          </DataGrid>
        )}
      </CCard>
    </div>
  )
}

export default PerfLogsPage
