import React, { useState, useEffect } from 'react'
import CIcon from '@coreui/icons-react'
import { cilWifiSignal4, cilWifiSignalOff } from '@coreui/icons'
import TaskItem from './TaskItem'
import TaskQuickAdd from './TaskQuickAdd'
import TaskSyncStatusModal from './TaskSyncStatusModal'
import { FILTER_KEYS, FILTER_LABELS, filterTasks, groupTasks, taskStats } from './taskUtils'

const useOnlineStatus = () => {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on  = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  return online
}

const Section = ({ title, accent, tasks, onSave, onDelete }) => {
  if (!tasks.length) return null
  return (
    <div className="tk__section">
      <div className="tk__section-title" style={{ '--accent': accent }}>
        <span className="tk__section-bar" />
        {title}
        <span className="tk__section-count">{tasks.length}</span>
      </div>
      {tasks.map((t) => (
        <TaskItem key={t.id} task={t} onSave={onSave} onDelete={onDelete} />
      ))}
    </div>
  )
}

const DoneSection = ({ tasks, onSave, onDelete }) => {
  const [open, setOpen] = useState(false)
  if (!tasks.length) return null
  return (
    <div className="tk__section tk__section--done">
      <button className="tk__done-toggle" onClick={() => setOpen((v) => !v)}>
        <span className="tk__section-bar" style={{ '--accent': '#22c55e' }} />
        Completadas ({tasks.length}) {open ? '▾' : '▸'}
      </button>
      {open && tasks.map((t) => (
        <TaskItem key={t.id} task={t} onSave={onSave} onDelete={onDelete} />
      ))}
    </div>
  )
}

const TaskBoard = ({ tasks, syncing, hasPending, onSave, onDelete, onAdd, onSync }) => {
  const [filter, setFilter] = useState('all')
  const [showSyncModal, setShowSyncModal] = useState(false)
  const online = useOnlineStatus()

  const stats  = taskStats(tasks)
  const active = filterTasks(tasks, filter)
  const done   = tasks.filter((t) => t.done)
  const groups = groupTasks(active)

  return (
    <div className="tk">
      {/* Header */}
      <div className="tk__header">
        <div className="tk__header-left">
          <div className="tk__header-indicator" />
          <h1 className="tk__header-title">Tasks</h1>
        </div>
        <span className={`tk__wifi${online ? ' tk__wifi--on' : ' tk__wifi--off'}`} title={online ? 'En línea' : 'Sin conexión'}>
          <CIcon icon={online ? cilWifiSignal4 : cilWifiSignalOff} />
        </span>

        <div className="tk__sync-wrap">
          <button
            type="button"
            className={`tk__sync-btn${syncing ? ' tk__sync-btn--spinning' : ''}${hasPending && !syncing ? ' tk__sync-btn--pending' : ''}`}
            onClick={onSync}
            disabled={syncing}
            title={hasPending && !syncing ? 'Hay cambios sin sincronizar' : 'Sincronizado'}
          >
            ↻
          </button>
          {hasPending && !syncing && <span className="tk__sync-dot" />}
        </div>

        <button
          type="button"
          className="tk__status-btn"
          onClick={() => setShowSyncModal(true)}
          title="Ver estado de sincronización"
        >
          Estado sync
        </button>
        <div className="tk__stats">
          <div className="tk__stat">
            <span className="tk__stat-value">{stats.pending}</span>
            <span className="tk__stat-label">Pendientes</span>
          </div>
          {stats.today > 0 && (
            <div className="tk__stat">
              <span className="tk__stat-value" style={{ color: '#f97316' }}>{stats.today}</span>
              <span className="tk__stat-label">Para hoy</span>
            </div>
          )}
          {stats.overdue > 0 && (
            <div className="tk__stat">
              <span className="tk__stat-value" style={{ color: '#ef4444' }}>{stats.overdue}</span>
              <span className="tk__stat-label">Vencidas</span>
            </div>
          )}
          <div className="tk__stat">
            <span className="tk__stat-value" style={{ color: '#22c55e' }}>{stats.done}</span>
            <span className="tk__stat-label">Hechas</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="tk__filters">
        {FILTER_KEYS.map((key) => (
          <button
            key={key}
            className={`tk__filter-btn${filter === key ? ' tk__filter-btn--active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {FILTER_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Quick add */}
      {filter !== 'done' && <TaskQuickAdd onAdd={onAdd} />}

      {/* Sync status modal */}
      <TaskSyncStatusModal
        visible={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        tasks={tasks}
        syncing={syncing}
        online={online}
        onSync={onSync}
      />

      {/* Task list */}
      <div className="tk__list">
        {filter === 'all' ? (
          <>
            <Section title="Vencidas"  accent="#ef4444" tasks={groups.overdue}  onSave={onSave} onDelete={onDelete} />
            <Section title="Hoy"       accent="#f97316" tasks={groups.today}    onSave={onSave} onDelete={onDelete} />
            <Section title="Próximas"  accent="#3b82f6" tasks={groups.upcoming} onSave={onSave} onDelete={onDelete} />
            <Section title="Sin fecha"    accent="#94a3b8" tasks={groups.undated}  onSave={onSave} onDelete={onDelete} />
            <DoneSection tasks={done} onSave={onSave} onDelete={onDelete} />
          </>
        ) : filter === 'done' ? (
          <>{active.map((t) => <TaskItem key={t.id} task={t} onSave={onSave} onDelete={onDelete} />)}</>
        ) : (
          <>
            {active.length === 0
              ? <div className="tk__empty">Sin tareas en esta vista</div>
              : active.map((t) => <TaskItem key={t.id} task={t} onSave={onSave} onDelete={onDelete} />)
            }
          </>
        )}
      </div>
    </div>
  )
}

export default TaskBoard
