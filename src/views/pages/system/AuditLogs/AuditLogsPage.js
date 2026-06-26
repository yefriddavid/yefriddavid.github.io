import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  CCard,
  CBadge,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
} from '@coreui/react'
import { Column, Paging, FilterRow, Toolbar, Item as ToolbarItem } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import moment from 'moment'
import * as auditLogActions from 'src/actions/system/auditLogActions'
import Spinner from 'src/components/shared/Spinner'

const OP_COLOR = { CREATE: 'success', UPDATE: 'warning', DELETE: 'danger', RUN: 'info', HOOK: 'primary' }

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
      {str.slice(0, 80)}
      {str.length > 80 ? '…' : ''}
    </span>
  )
}

const FIELD_LABELS = {
  id: 'ID',
  timestamp: 'Timestamp',
  operation: 'Operación',
  entity: 'Entidad',
  actionType: 'Action type',
  username: 'Usuario',
  route: 'Ruta',
  hook: 'Hook',
  program: 'Programa',
  binary: 'Binario',
  exitCode: 'Exit code',
  error: 'Error',
  payload: 'Payload',
  stdout: 'stdout',
  stderr: 'stderr',
}

const PREFORMATTED = new Set(['stdout', 'stderr', 'error'])
const JSON_FIELDS = new Set(['payload'])
const SKIP = new Set(['id'])

const DetailRow = ({ label, value }) => {
  if (value === null || value === undefined || value === '') return null
  const str = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
  const isPre = PREFORMATTED.has(label) || JSON_FIELDS.has(label)
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.45, marginBottom: 4 }}>
        {FIELD_LABELS[label] ?? label}
      </div>
      {isPre ? (
        <pre style={{
          margin: 0,
          padding: '8px 12px',
          background: '#0f172a',
          color: '#e2e8f0',
          borderRadius: 6,
          fontSize: 12,
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          maxHeight: 240,
          overflowY: 'auto',
        }}>{str}</pre>
      ) : (
        <div style={{ fontSize: 13, fontFamily: ['actionType', 'binary', 'hook', 'route'].includes(label) ? 'monospace' : undefined }}>
          {str}
        </div>
      )}
    </div>
  )
}

const FIELD_ORDER = ['timestamp', 'operation', 'entity', 'hook', 'program', 'binary', 'username', 'route', 'actionType', 'exitCode', 'error', 'payload', 'stdout', 'stderr']

const AuditLogsPage = () => {
  const dispatch = useDispatch()
  const { data: logs, fetching: loading } = useSelector((s) => s.auditLog)
  const rows = useMemo(() => logs ?? [], [logs])
  const [selected, setSelected] = useState(null)

  const load = useCallback(() => dispatch(auditLogActions.fetchRequest()), [dispatch])

  useEffect(() => {
    load()
  }, [load])

  const today = useMemo(() => {
    const start = moment().startOf('day')
    return rows.filter((l) => moment(l.timestamp).isAfter(start)).length
  }, [rows])

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>📋</span>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Audit Log
          </h1>
          <span style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.4 }}>
            System_audit_logs
          </span>
        </div>
        <CButton color="primary" variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? <Spinner size="sm" /> : '↺'}&nbsp;Recargar
        </CButton>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 20,
        }}
      >
        {[
          { label: 'Total', value: rows.length, color: '#94a3b8' },
          { label: 'Hoy', value: today, color: today > 0 ? '#3b82f6' : '#94a3b8' },
          {
            label: 'Eliminaciones hoy',
            value: rows.filter(
              (l) =>
                l.operation === 'DELETE' && moment(l.timestamp).isAfter(moment().startOf('day')),
            ).length,
            color: '#ef4444',
          },
        ].map(({ label, value, color }) => (
          <CCard key={label} style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'monospace', color }}>
              {value}
            </div>
            <div
              style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                opacity: 0.5,
              }}
            >
              {label}
            </div>
          </CCard>
        ))}
      </div>

      <CCard style={{ borderRadius: 12, overflow: 'hidden' }}>
        {loading && (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <Spinner color="primary" />
          </div>
        )}
        {!loading && rows.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', opacity: 0.4 }}>
            Sin operaciones registradas
          </div>
        )}
        {!loading && rows.length > 0 && (
          <StandardGrid
            dataSource={rows}
            keyExpr="id"
            showBorders={false}
            showColumnLines={false}
            showRowLines={true}
            rowAlternationEnabled={false}
            wordWrapEnabled={false}
            onRowClick={({ data }) => setSelected(data)}
          >
            <FilterRow visible={true} />
            <Paging defaultPageSize={25} />
            <Toolbar>
              <ToolbarItem name="searchPanel" />
            </Toolbar>
            <Column
              dataField="timestamp"
              caption="Timestamp"
              width={130}
              dataType="date"
              cellRender={renderTs}
              defaultSortOrder="desc"
            />
            <Column dataField="operation" caption="Operación" width={100} cellRender={renderOp} />
            <Column dataField="entity" caption="Entidad" width={160} cellRender={renderEntity} />
            <Column dataField="username" caption="Usuario" width={120} />
            <Column dataField="payload" caption="Datos" cellRender={renderPayload} />
            <Column dataField="route" caption="Ruta" width={180} />
          </StandardGrid>
        )}
      </CCard>

      <CModal size="lg" visible={!!selected} onClose={() => setSelected(null)}>
        <CModalHeader>
          <CModalTitle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CBadge color={OP_COLOR[selected?.operation] ?? 'secondary'} style={{ fontFamily: 'monospace' }}>
              {selected?.operation}
            </CBadge>
            <span style={{ fontFamily: 'monospace', fontSize: 14 }}>{selected?.entity}</span>
            <span style={{ fontSize: 12, opacity: 0.45, fontWeight: 400 }}>
              {selected?.timestamp ? moment(selected.timestamp).format('DD/MM/YYYY HH:mm:ss') : ''}
            </span>
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selected && (
            <>
              {FIELD_ORDER.filter((k) => !SKIP.has(k) && selected[k] !== undefined).map((k) => (
                <DetailRow key={k} label={k} value={selected[k]} />
              ))}
              {Object.keys(selected)
                .filter((k) => !SKIP.has(k) && !FIELD_ORDER.includes(k))
                .map((k) => (
                  <DetailRow key={k} label={k} value={selected[k]} />
                ))}
            </>
          )}
        </CModalBody>
      </CModal>
    </div>
  )
}

export default AuditLogsPage
