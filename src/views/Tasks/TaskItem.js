import React, { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { PRIORITY, formatDue, isOverdue, isDueToday } from './taskUtils'

const PriorityDot = ({ priority }) => {
  const color = PRIORITY[priority]?.color ?? '#94a3b8'
  return <span className="tk__dot" style={{ background: color }} title={PRIORITY[priority]?.label} />
}

const DueBadge = ({ task }) => {
  const label = formatDue(task.dueDate)
  if (!label) return null
  const cls = isOverdue(task)
    ? 'tk__due tk__due--overdue'
    : isDueToday(task)
    ? 'tk__due tk__due--today'
    : 'tk__due'
  return <span className={cls}>{label}</span>
}

const TagPill = ({ tag, onRemove }) => (
  <span className="tk__tag">
    {tag}
    {onRemove && (
      <button type="button" className="tk__tag-remove" onClick={() => onRemove(tag)}>×</button>
    )}
  </span>
)

const TaskItem = ({ task, onSave, onDelete }) => {
  const [expanded, setExpanded] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { isDirty } } = useForm({
    defaultValues: {
      title: task.title,
      notes: task.notes,
      priority: task.priority,
      dueDate: task.dueDate ?? '',
      tags: task.tags ?? [],
    },
  })

  const tags = watch('tags')

  const addTag = useCallback(() => {
    const t = tagInput.trim()
    if (!t || tags.includes(t)) return
    setValue('tags', [...tags, t], { shouldDirty: true })
    setTagInput('')
  }, [tagInput, tags, setValue])

  const removeTag = useCallback(
    (tag) => setValue('tags', tags.filter((t) => t !== tag), { shouldDirty: true }),
    [tags, setValue],
  )

  const onSubmit = (data) => {
    onSave({ ...task, ...data, dueDate: data.dueDate || null })
    setExpanded(false)
  }

  const toggleDone = (e) => {
    e.stopPropagation()
    onSave({
      ...task,
      done: !task.done,
      doneAt: !task.done ? new Date().toISOString() : null,
    })
  }

  return (
    <div className={`tk__item${task.done ? ' tk__item--done' : ''}${isOverdue(task) ? ' tk__item--overdue' : ''}${expanded ? ' tk__item--expanded' : ''}`}>
      <div className="tk__row" onClick={() => !task.done && setExpanded((v) => !v)}>
        <button
          type="button"
          className={`tk__check${task.done ? ' tk__check--done' : ''}`}
          onClick={toggleDone}
          title={task.done ? 'Marcar pendiente' : 'Marcar hecha'}
        >
          {task.done ? '✓' : ''}
        </button>

        <PriorityDot priority={task.priority} />

        <span className="tk__title">{task.title || <em className="tk__placeholder">Sin título</em>}</span>

        <div className="tk__meta">
          <DueBadge task={task} />
          {(task.tags ?? []).map((tag) => (
            <TagPill key={tag} tag={tag} />
          ))}
        </div>

        <button
          type="button"
          className="tk__delete"
          onClick={(e) => { e.stopPropagation(); onDelete(task.id) }}
          title="Eliminar"
        >
          ✕
        </button>
      </div>

      {expanded && (
        <form className="tk__expand" onSubmit={handleSubmit(onSubmit)} onClick={(e) => e.stopPropagation()}>
          <input
            className="tk__edit-title"
            placeholder="Título de la tarea"
            {...register('title', { required: true })}
          />

          <textarea
            className="tk__edit-notes"
            placeholder="Notas…"
            rows={6}
            {...register('notes')}
          />

          <div className="tk__edit-row">
            <div className="tk__edit-field">
              <label className="tk__edit-label">Prioridad</label>
              <select className="tk__edit-select" {...register('priority')}>
                <option value="high">🔴 Alta</option>
                <option value="medium">🟡 Media</option>
                <option value="low">🔵 Baja</option>
              </select>
            </div>

            <div className="tk__edit-field">
              <label className="tk__edit-label">Fecha límite</label>
              <input type="date" className="tk__edit-input" {...register('dueDate')} />
            </div>
          </div>

          <div className="tk__edit-field">
            <label className="tk__edit-label">Tags</label>
            <div className="tk__tag-row">
              {tags.map((tag) => (
                <TagPill key={tag} tag={tag} onRemove={removeTag} />
              ))}
              <input
                className="tk__tag-input"
                placeholder="Agregar tag…"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
              />
            </div>
          </div>

          <div className="tk__edit-actions">
            <button type="button" className="tk__btn tk__btn--cancel" onClick={() => setExpanded(false)}>
              Cancelar
            </button>
            <button type="submit" className="tk__btn tk__btn--save" disabled={!isDirty}>
              Guardar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default TaskItem
