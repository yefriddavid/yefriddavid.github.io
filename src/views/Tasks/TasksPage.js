import React, { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as actions from 'src/actions/taskActions'
import TaskBoard from './TaskBoard'
import './Tasks.scss'

const TasksPage = () => {
  const dispatch = useDispatch()
  const tasks = useSelector((s) => s.task.data)

  useEffect(() => {
    dispatch(actions.fetchRequest())
  }, [dispatch])

  const handleSave = useCallback(
    (task) => dispatch(actions.saveRequest(task)),
    [dispatch],
  )

  const handleDelete = useCallback(
    (id) => dispatch(actions.deleteRequest(id)),
    [dispatch],
  )

  const handleAdd = useCallback(
    (task) => dispatch(actions.saveRequest(task)),
    [dispatch],
  )

  return (
    <TaskBoard
      tasks={tasks}
      onSave={handleSave}
      onDelete={handleDelete}
      onAdd={handleAdd}
    />
  )
}

export default TasksPage
