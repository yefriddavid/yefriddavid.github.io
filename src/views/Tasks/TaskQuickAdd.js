import React from 'react'
import { useForm } from 'react-hook-form'
import { newTask } from './taskUtils'

const EMPTY = { title: '', priority: 'medium', dueDate: '' }

const TaskQuickAdd = ({ onAdd }) => {
  const { register, handleSubmit, reset, setFocus } = useForm({ defaultValues: EMPTY })

  const onSubmit = (data) => {
    if (!data.title.trim()) return
    onAdd(newTask({ title: data.title.trim(), priority: data.priority, dueDate: data.dueDate || null }))
    reset(EMPTY)
    setFocus('title')
  }

  return (
    <form className="tk__quick-add" onSubmit={handleSubmit(onSubmit)}>
      <span className="tk__quick-icon">+</span>
      <input
        className="tk__quick-input"
        placeholder="Agregar tarea… (Enter para guardar)"
        autoComplete="off"
        {...register('title')}
      />
      <select className="tk__quick-priority" {...register('priority')} title="Prioridad">
        <option value="high">🔴</option>
        <option value="medium">🟡</option>
        <option value="low">🔵</option>
      </select>
      <input type="date" className="tk__quick-date" {...register('dueDate')} title="Fecha límite" />
      <button type="submit" className="tk__quick-btn">Agregar</button>
    </form>
  )
}

export default TaskQuickAdd
