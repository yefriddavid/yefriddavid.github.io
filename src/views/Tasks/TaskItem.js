import React, { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PRIORITY, formatDue, isOverdue, isDueToday, parseListItems, getListProgress } from './taskUtils'

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

const ListProgress = ({ task }) => {
  const progress = getListProgress(task)
  if (!progress) return null
  const allDone = progress.done === progress.total
  return (
    <span className={`tk__progress${allDone ? ' tk__progress--done' : ''}`}>
      {progress.done}/{progress.total}
    </span>
  )
}

const TagPill = ({ tag, onRemove }) => (
  <span className="tk__tag">
    {tag}
    {onRemove && (
      <button type="button" className="tk__tag-remove" onClick={() => onRemove(tag)}>×</button>
    )}
  </span>
)

const SortableListRow = ({ id, checked, text, editing, editValue, setEditValue, onToggle, onCommitEdit, onStartEdit, onCancelEdit }) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      {...attributes}
      className={`tk__list-row${checked ? ' tk__list-row--done' : ''}`}
      onClick={onToggle}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        className="tk__list-drag-handle"
        title="Mover"
        onClick={(e) => e.stopPropagation()}
        {...listeners}
      >
        ⠿
      </button>
      <span className={`tk__list-check${checked ? ' tk__list-check--done' : ''}`}>
        {checked ? '✓' : ''}
      </span>
      {editing ? (
        <input
          className="tk__list-edit-input"
          autoFocus
          value={editValue}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={onCommitEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); onCommitEdit() }
            if (e.key === 'Escape') { e.preventDefault(); onCancelEdit() }
          }}
        />
      ) : (
        <span className="tk__list-text" onDoubleClick={(e) => { e.stopPropagation(); onStartEdit() }}>
          {text}
        </span>
      )}
    </div>
  )
}

const ListModeView = ({ notes, onToggle, onAdd, onEdit, onReorder }) => {
  const lines = parseListItems(notes)
  const [newItem, setNewItem] = useState('')
  const [editingIndex, setEditingIndex] = useState(null)
  const [editValue, setEditValue] = useState('')
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const submitNew = () => {
    if (!newItem.trim()) return
    onAdd(newItem)
    setNewItem('')
  }

  const commitEdit = () => {
    if (editValue.trim()) onEdit(editingIndex, editValue)
    setEditingIndex(null)
  }

  const rowIds = lines.map((_, i) => `item-${i}`)

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const oldIndex = rowIds.indexOf(active.id)
    const newIndex = rowIds.indexOf(over.id)
    onReorder(arrayMove(lines, oldIndex, newIndex))
  }

  return (
    <div className="tk__list-view">
      {!lines.length && (
        <div className="tk__list-empty">Sin ítems. Agregá el primero abajo.</div>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
          {lines.map((line, i) => {
            const checked = line.startsWith('- ')
            const text = checked ? line.slice(2) : line
            return (
              <SortableListRow
                key={rowIds[i]}
                id={rowIds[i]}
                checked={checked}
                text={text}
                editing={editingIndex === i}
                editValue={editValue}
                setEditValue={setEditValue}
                onToggle={() => onToggle(i)}
                onCommitEdit={commitEdit}
                onStartEdit={() => { setEditingIndex(i); setEditValue(text) }}
                onCancelEdit={() => setEditingIndex(null)}
              />
            )
          })}
        </SortableContext>
      </DndContext>
      <div className="tk__list-add">
        <input
          className="tk__list-add-input"
          placeholder="Nuevo ítem…"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submitNew() } }}
        />
        <button type="button" className="tk__list-add-btn" onClick={submitNew}>
          + item
        </button>
      </div>
    </div>
  )
}

const TaskItem = ({ task, onSave, onDelete }) => {
  const [expanded, setExpanded] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const { register, handleSubmit, watch, setValue, getValues, formState: { isDirty } } = useForm({
    defaultValues: {
      title:    task.title,
      notes:    task.notes,
      priority: task.priority,
      dueDate:  task.dueDate ?? '',
      tags:     task.tags ?? [],
      listMode: task.listMode ?? false,
    },
  })

  const tags     = watch('tags')
  const listMode = watch('listMode')
  const notes    = watch('notes')

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

  const toggleListItem = useCallback(
    (index) => {
      const allLines = (notes ?? '').split('\n')
      let count = 0
      for (let i = 0; i < allLines.length; i++) {
        if (allLines[i].trim() !== '') {
          if (count === index) {
            allLines[i] = allLines[i].startsWith('- ')
              ? allLines[i].slice(2)
              : `- ${allLines[i]}`
            break
          }
          count++
        }
      }
      setValue('notes', allLines.join('\n'), { shouldDirty: true })
    },
    [notes, setValue],
  )

  const reorderListItems = useCallback(
    (newLines) => {
      const newNotes = newLines.join('\n')
      setValue('notes', newNotes, { shouldDirty: true })
      onSave({ ...task, ...getValues(), notes: newNotes, dueDate: getValues('dueDate') || null })
    },
    [setValue, getValues, onSave, task],
  )

  const addListItem = useCallback(
    (text) => {
      const lines = parseListItems(notes)
      const newNotes = [...lines, text.trim()].join('\n')
      setValue('notes', newNotes, { shouldDirty: true })
      onSave({ ...task, ...getValues(), notes: newNotes, dueDate: getValues('dueDate') || null })
    },
    [notes, setValue, getValues, onSave, task],
  )

  const editListItem = useCallback(
    (index, text) => {
      const allLines = (notes ?? '').split('\n')
      let count = 0
      for (let i = 0; i < allLines.length; i++) {
        if (allLines[i].trim() !== '') {
          if (count === index) {
            const checked = allLines[i].startsWith('- ')
            allLines[i] = checked ? `- ${text.trim()}` : text.trim()
            break
          }
          count++
        }
      }
      setValue('notes', allLines.join('\n'), { shouldDirty: true })
    },
    [notes, setValue],
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
          <ListProgress task={task} />
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

          <div className="tk__notes-header">
            <span className="tk__edit-label">Notas</span>
            <label className="tk__list-mode-toggle">
              <input type="checkbox" {...register('listMode')} />
              <span>List mode</span>
            </label>
          </div>

          {listMode ? (
            <ListModeView
              notes={notes}
              onToggle={toggleListItem}
              onAdd={addListItem}
              onEdit={editListItem}
              onReorder={reorderListItems}
            />
          ) : (
            <textarea
              className="tk__edit-notes"
              placeholder="Notas…"
              rows={6}
              {...register('notes')}
            />
          )}

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
