import moment from 'moment'
import { TASK_PRIORITY, TASK_FILTER_KEYS, TASK_FILTER_LABELS } from 'src/constants/tasks'

export { TASK_PRIORITY as PRIORITY, TASK_FILTER_KEYS as FILTER_KEYS, TASK_FILTER_LABELS as FILTER_LABELS }

const startOfDay = () => moment().startOf('day')

export const isOverdue  = (t) => !t.done && !!t.dueDate && moment(t.dueDate).isBefore(startOfDay())
export const isDueToday = (t) => !t.done && !!t.dueDate && moment(t.dueDate).isSame(startOfDay(), 'day')
export const isUpcoming = (t) =>
  !t.done && !!t.dueDate && moment(t.dueDate).isAfter(startOfDay())

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
  pending: tasks.filter((t) => !t.done).length,
  today:   tasks.filter((t) => isDueToday(t) || isOverdue(t)).filter((t) => !t.done).length,
  overdue: tasks.filter(isOverdue).length,
  done:    tasks.filter((t) => t.done).length,
})

export const hasPendingSync = (tasks) =>
  tasks.some((t) => !t.syncedAt || t.localUpdatedAt > t.syncedAt)

export const newTask = (overrides = {}) => ({
  id: crypto.randomUUID(),
  title: '',
  notes: '',
  priority: 'medium',
  dueDate: null,
  tags: [],
  done: false,
  doneAt: null,
  listMode: false,
  createdAt: new Date().toISOString(),
  localUpdatedAt: new Date().toISOString(),
  syncedAt: null,
  ...overrides,
})

export const parseListItems = (notes) =>
  (notes ?? '').split('\n').filter((l) => l.trim() !== '')

export const getListProgress = (task) => {
  if (!task.listMode || !task.notes) return null
  const lines = parseListItems(task.notes)
  if (!lines.length) return null
  return { done: lines.filter((l) => l.startsWith('- ')).length, total: lines.length }
}
