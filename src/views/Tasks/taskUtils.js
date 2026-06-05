import moment from 'moment'

export const PRIORITY = {
  high:   { label: 'Alta',  color: '#ef4444' },
  medium: { label: 'Media', color: '#f97316' },
  low:    { label: 'Baja',  color: '#3b82f6' },
}

export const FILTER_KEYS = ['all', 'today', 'upcoming', 'overdue', 'high', 'done']

export const FILTER_LABELS = {
  all:      'Todas',
  today:    'Hoy',
  upcoming: 'Próximas',
  overdue:  'Vencidas',
  high:     '★ Alta',
  done:     '✓ Hechas',
}

const startOfDay = () => moment().startOf('day')

export const isOverdue  = (t) => !t.done && !!t.dueDate && moment(t.dueDate).isBefore(startOfDay())
export const isDueToday = (t) => !t.done && !!t.dueDate && moment(t.dueDate).isSame(startOfDay(), 'day')
export const isUpcoming = (t) =>
  !t.done &&
  !!t.dueDate &&
  moment(t.dueDate).isAfter(startOfDay()) &&
  moment(t.dueDate).isBefore(moment().add(8, 'days').startOf('day'))

export const filterTasks = (tasks, filter) => {
  switch (filter) {
    case 'today':    return tasks.filter((t) => !t.done && (isDueToday(t) || isOverdue(t)))
    case 'upcoming': return tasks.filter((t) => isUpcoming(t))
    case 'overdue':  return tasks.filter((t) => isOverdue(t))
    case 'high':     return tasks.filter((t) => !t.done && t.priority === 'high')
    case 'done':     return tasks.filter((t) => t.done)
    default:         return tasks.filter((t) => !t.done)
  }
}

export const groupTasks = (tasks) => ({
  overdue:  tasks.filter(isOverdue).sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
  today:    tasks.filter(isDueToday),
  upcoming: tasks.filter(isUpcoming).sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
  undated:  tasks.filter((t) => !t.done && !t.dueDate),
})

export const formatDue = (dueDate) => {
  if (!dueDate) return null
  const d = moment(dueDate)
  const tod = startOfDay()
  if (d.isSame(tod, 'day')) return 'Hoy'
  if (d.isSame(moment().add(1, 'day'), 'day')) return 'Mañana'
  if (d.isBefore(tod)) {
    const diff = tod.diff(d, 'days')
    return diff === 1 ? 'Ayer' : `Hace ${diff}d`
  }
  return d.format('D MMM')
}

export const taskStats = (tasks) => ({
  pending:  tasks.filter((t) => !t.done).length,
  today:    tasks.filter((t) => isDueToday(t) || isOverdue(t)).filter((t) => !t.done).length,
  overdue:  tasks.filter(isOverdue).length,
  done:     tasks.filter((t) => t.done).length,
})

export const newTask = (overrides = {}) => ({
  id: crypto.randomUUID(),
  title: '',
  notes: '',
  priority: 'medium',
  dueDate: null,
  tags: [],
  done: false,
  doneAt: null,
  createdAt: new Date().toISOString(),
  localUpdatedAt: new Date().toISOString(),
  syncedAt: null,
  ...overrides,
})
