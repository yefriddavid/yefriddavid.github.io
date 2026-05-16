import React, { useState, useMemo } from 'react'
import { CCard, CBadge, CButton, CSpinner } from '@coreui/react'
import DataGrid, { Column, Paging, FilterRow, Toolbar, Item as ToolbarItem } from 'devextreme-react/data-grid'
import moment from 'moment'
import './ErrorLogs.scss'

const classifyContext = (context = '') => {
  if (context === 'window.onerror') return 'danger'
  if (context === 'unhandledrejection') return 'warning'
  if (context.startsWith('ErrorBoundary:')) return 'boundary'
  return 'saga'
}

const SEVERITY_LABELS = {
  danger: 'JS Error',
  warning: 'Promise',
  boundary: 'Boundary',
  saga: 'Saga',
}

const SEVERITY_COLORS = {
  danger: '#ef4444',
  warning: '#f97316',
  boundary: '#a855f7',
  saga: '#3b82f6',
}

const hashRoute = (url = '') => {
  const idx = url.indexOf('#')
  return idx >= 0 ? url.slice(idx) : url
}

const mostAffected = (logs) => {
  if (!logs.length) return '—'
  const counts = {}
  logs.forEach((l) => {
    const key = (l.context || '').split('/')[0]
    counts[key] = (counts[key] || 0) + 1
  })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
}

const StatCard = ({ label, value, accent }) => (
  <div className="el__stat-card">
    <span className="el__stat-value" style={{ color: accent }}>{value}</span>
    <span className="el__stat-label">{label}</span>
  </div>
)

const StackTrace = ({ stack }) => {
  if (!stack) return <span className="el__stack-empty">No stack trace available</span>
  return (
    <div className="el__stack-body">
      {stack.split('\n').map((line, i) => {
        const isAtLine = line.trim().startsWith('at ')
        const fileMatch = line.match(/(https?:\/\/[^\s)]+)/)
        if (fileMatch) {
          const before = line.slice(0, line.indexOf(fileMatch[1]))
          const after = line.slice(line.indexOf(fileMatch[1]) + fileMatch[1].length)
          return (
            <div key={i} className="el__stack-line el__stack-line--at">
              <span className="el__stack-prefix">{before}</span>
              <span className="el__stack-file">{fileMatch[1]}</span>
              <span className="el__stack-prefix">{after}</span>
            </div>
          )
        }
        return (
          <div key={i} className={`el__stack-line${isAtLine ? ' el__stack-line--at' : ' el__stack-line--msg'}`}>
            {line}
          </div>
        )
      })}
    </div>
  )
}

const ActionTimeline = ({ actions }) => {
  if (!actions?.length) return <span className="el__timeline-empty">Sin acciones registradas</span>
  return (
    <div className="el__timeline">
      {actions.map((a, i) => (
        <div key={i} className="el__timeline-item">
          <div className="el__timeline-dot" />
          <div className="el__timeline-content">
            <span className="el__timeline-type">{a.type}</span>
            <span className="el__timeline-ts">{moment(a.ts).format('HH:mm:ss.SSS')}</span>
            {a.payload !== undefined && a.payload !== null && (
              <span className="el__timeline-payload">
                {JSON.stringify(a.payload).slice(0, 80)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

const DetailPanel = ({ log, onDelete }) => {
  const severity = classifyContext(log.context)
  const color = SEVERITY_COLORS[severity]

  return (
    <div className="el__detail">
      <div className="el__detail-header">
        <div className="el__detail-title">
          <span className="el__detail-dot" style={{ background: color }} />
          <span className="el__detail-context">{log.context}</span>
          <span className="el__detail-ts">{moment(log.timestamp).format('DD/MM/YYYY HH:mm:ss')}</span>
          {log.username && <span className="el__detail-user">@{log.username}</span>}
        </div>
        <CButton color="danger" size="sm" variant="outline" onClick={() => onDelete(log.id)}>
          Eliminar
        </CButton>
      </div>

      <div className="el__detail-message">{log.message}</div>

      <div className="el__detail-cols">
        <div className="el__detail-col">
          <div className="el__detail-section-title">
            <span className="el__detail-section-icon">{'>'}_</span> Stack Trace
          </div>
          <div className="el__stack">
            <StackTrace stack={log.stack} />
          </div>
        </div>

        <div className="el__detail-col">
          <div className="el__detail-section-title">
            <span className="el__detail-section-icon">⟳</span> Redux Actions
          </div>
          <ActionTimeline actions={log.recentActions} />

          {log.reduxState && (
            <div className="el__detail-meta">
              <div className="el__detail-meta-row">
                <span className="el__detail-meta-key">route</span>
                <span className="el__detail-meta-val">{log.reduxState.currentRoute}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const EmptyState = () => (
  <div className="el__empty">
    <div className="el__empty-icon">✓</div>
    <div className="el__empty-title">Sin errores registrados</div>
    <div className="el__empty-sub">El sistema está funcionando correctamente</div>
  </div>
)

const SkeletonRow = () => (
  <div className="el__skeleton-row">
    <div className="el__skeleton el__skeleton--dot" />
    <div className="el__skeleton el__skeleton--ts" />
    <div className="el__skeleton el__skeleton--badge" />
    <div className="el__skeleton el__skeleton--msg" />
    <div className="el__skeleton el__skeleton--user" />
  </div>
)

const ErrorLogs = ({ logs = [], loading, onDelete, onRefresh }) => {
  const [selectedId, setSelectedId] = useState(null)

  const selectedLog = useMemo(() => logs.find((l) => l.id === selectedId), [logs, selectedId])

  const today = useMemo(() => {
    const start = moment().startOf('day')
    return logs.filter((l) => moment(l.timestamp).isAfter(start)).length
  }, [logs])

  const thisWeek = useMemo(() => {
    const start = moment().startOf('isoWeek')
    return logs.filter((l) => moment(l.timestamp).isAfter(start)).length
  }, [logs])

  const topContext = useMemo(() => mostAffected(logs), [logs])

  const handleRowClick = (e) => {
    const id = e.data?.id
    if (!id) return
    setSelectedId((prev) => (prev === id ? null : id))
  }

  const renderSeverity = (data) => {
    const sev = classifyContext(data.value)
    return (
      <span className="el__sev-dot" style={{ background: SEVERITY_COLORS[sev] }} title={SEVERITY_LABELS[sev]} />
    )
  }

  const renderContext = (data) => {
    const sev = classifyContext(data.value)
    return (
      <span className="el__badge" style={{ '--badge-color': SEVERITY_COLORS[sev] }}>
        {data.value}
      </span>
    )
  }

  const renderMessage = (data) => (
    <span className="el__msg-cell" title={data.value}>{data.value}</span>
  )

  const renderTs = (data) => (
    <span className="el__ts-cell">{data.value ? moment(data.value).format('DD/MM HH:mm:ss') : '—'}</span>
  )

  const renderRoute = (data) => {
    const route = hashRoute(data.value || '')
    return <span className="el__route-cell" title={data.value}>{route || '—'}</span>
  }

  const renderActions = (data) => (
    <CButton
      color="danger"
      size="sm"
      variant="ghost"
      className="el__del-btn"
      onClick={(e) => { e.stopPropagation(); onDelete(data.data.id) }}
    >
      ✕
    </CButton>
  )

  const rowClass = (row) => row.data?.id === selectedId ? 'el__row--selected' : ''

  return (
    <div className="el">
      <div className="el__header">
        <div className="el__header-left">
          <div className="el__header-indicator" />
          <h1 className="el__title">Error Monitor</h1>
          <span className="el__subtitle">System_error_logs</span>
        </div>
        <CButton color="primary" variant="outline" size="sm" onClick={onRefresh} disabled={loading} className="el__refresh-btn">
          {loading ? <CSpinner size="sm" /> : '↺'}&nbsp; Recargar
        </CButton>
      </div>

      <div className="el__stats">
        <StatCard label="Total" value={logs.length} accent="#94a3b8" />
        <StatCard label="Hoy" value={today} accent={today > 0 ? '#ef4444' : '#22c55e'} />
        <StatCard label="Esta semana" value={thisWeek} accent={thisWeek > 5 ? '#f97316' : '#94a3b8'} />
        <StatCard label="Más afectado" value={topContext} accent="#3b82f6" />
      </div>

      <CCard className="el__card">
        {loading && (
          <div className="el__skeleton-wrap">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        )}

        {!loading && logs.length === 0 && <EmptyState />}

        {!loading && logs.length > 0 && (
          <DataGrid
            dataSource={logs}
            keyExpr="id"
            showBorders={false}
            showColumnLines={false}
            showRowLines={true}
            rowAlternationEnabled={false}
            hoverStateEnabled={true}
            onRowClick={handleRowClick}
            rowCssClass={rowClass}
            className="el__grid"
            wordWrapEnabled={false}
          >
            <FilterRow visible={true} />
            <Paging defaultPageSize={25} />
            <Toolbar>
              <ToolbarItem name="searchPanel" />
              <ToolbarItem name="columnChooserButton" />
            </Toolbar>
            <Column dataField="context" caption="" width={40} allowFiltering={false} allowSorting={false} cellRender={renderSeverity} />
            <Column dataField="timestamp" caption="Timestamp" width={130} dataType="date" cellRender={renderTs} defaultSortOrder="desc" />
            <Column dataField="context" caption="Contexto" width={260} cellRender={renderContext} />
            <Column dataField="message" caption="Mensaje" cellRender={renderMessage} />
            <Column dataField="username" caption="Usuario" width={110} />
            <Column dataField="url" caption="Ruta" width={180} cellRender={renderRoute} />
            <Column caption="" width={48} allowFiltering={false} allowSorting={false} cellRender={renderActions} />
          </DataGrid>
        )}
      </CCard>

      {selectedLog && (
        <CCard className="el__detail-card">
          <DetailPanel log={selectedLog} onDelete={(id) => { onDelete(id); setSelectedId(null) }} />
        </CCard>
      )}
    </div>
  )
}

export default ErrorLogs
