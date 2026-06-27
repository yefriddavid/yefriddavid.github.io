import React from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody, CButton } from '@coreui/react'
import moment from 'moment'

const isDirty = (t) => !t.syncedAt || t.localUpdatedAt > t.syncedAt

const formatTs = (iso) => {
  if (!iso) return '—'
  const m = moment(iso)
  const diff = moment().diff(m, 'minutes')
  if (diff < 1) return 'hace un momento'
  if (diff < 60) return `hace ${diff} min`
  if (diff < 1440) return m.format('HH:mm')
  return m.format('D MMM HH:mm')
}

const Row = ({ label, value, accent }) => (
  <div className="tk__sm-row">
    <span className="tk__sm-label">{label}</span>
    <span className="tk__sm-value" style={accent ? { color: accent } : undefined}>{value}</span>
  </div>
)

const Section = ({ title, icon, children }) => (
  <div className="tk__sm-section">
    <div className="tk__sm-section-title">
      <span className="tk__sm-section-icon">{icon}</span>
      {title}
    </div>
    {children}
  </div>
)

const PendingList = ({ tasks }) => {
  if (!tasks.length) return <div className="tk__sm-empty">Ninguna tarea pendiente</div>
  return (
    <div className="tk__sm-pending-list">
      {tasks.map((t) => (
        <div key={t.id} className="tk__sm-pending-item">
          <span className="tk__sm-pending-title">{t.title || <em>Sin título</em>}</span>
          <span className="tk__sm-pending-ts">{formatTs(t.localUpdatedAt)}</span>
        </div>
      ))}
    </div>
  )
}

const TaskSyncStatusModal = ({ visible, onClose, tasks, syncing, online, onSync }) => {
  const total   = tasks.length
  const pending = tasks.filter(isDirty)
  const synced  = tasks.filter((t) => t.syncedAt && !isDirty(t))
  const neverSynced = tasks.filter((t) => !t.syncedAt)

  const lastSync = tasks
    .map((t) => t.syncedAt)
    .filter(Boolean)
    .sort()
    .at(-1)

  const lastLocal = tasks
    .map((t) => t.localUpdatedAt)
    .filter(Boolean)
    .sort()
    .at(-1)

  return (
    <CModal visible={visible} onClose={onClose} alignment="center" size="sm">
      <CModalHeader>
        <CModalTitle className="tk__sm-title">Estado de sincronización</CModalTitle>
      </CModalHeader>
      <CModalBody className="tk__sm-body">

        {/* IndexedDB */}
        <Section title="IndexedDB (local)" icon="💾">
          <Row label="Total tareas"         value={total} />
          <Row label="Sincronizadas"        value={synced.length}     accent="#22c55e" />
          <Row label="Pendientes de sync"   value={pending.length}    accent={pending.length > 0 ? '#f97316' : undefined} />
          <Row label="Nunca sincronizadas"  value={neverSynced.length} accent={neverSynced.length > 0 ? '#ef4444' : undefined} />
          <Row label="Última modificación"  value={formatTs(lastLocal)} />
        </Section>

        {/* Firebase */}
        <Section title="Firebase" icon="☁️">
          <Row
            label="Conexión"
            value={online ? 'En línea' : 'Sin conexión'}
            accent={online ? '#22c55e' : '#ef4444'}
          />
          <Row
            label="Estado"
            value={syncing ? 'Sincronizando…' : pending.length === 0 ? 'Al día' : `${pending.length} pendiente(s)`}
            accent={syncing ? '#3b82f6' : pending.length > 0 ? '#f97316' : '#22c55e'}
          />
          <Row label="Última sync exitosa" value={formatTs(lastSync)} />
          <Row label="Tareas en Firebase"  value={synced.length + ' / ' + total} />
        </Section>

        {/* Pending tasks detail */}
        {pending.length > 0 && (
          <Section title={`Pendientes (${pending.length})`} icon="⏳">
            <PendingList tasks={pending} />
          </Section>
        )}

        <CButton
          color="primary"
          size="sm"
          className="tk__sm-sync-btn"
          onClick={() => { onSync(); onClose() }}
          disabled={syncing || !online}
        >
          {syncing ? 'Sincronizando…' : 'Sincronizar ahora'}
        </CButton>
      </CModalBody>
    </CModal>
  )
}

export default TaskSyncStatusModal
