import React, { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as actions from 'src/actions/taskActions'
import Spinner from 'src/components/shared/Spinner'
import TaskBoard from './TaskBoard'
import './Tasks.scss'

const TasksPage = () => {
  const dispatch = useDispatch()
  const tasks    = useSelector((s) => s.task.data)
  const fetching = useSelector((s) => s.task.fetching)

  useEffect(() => {
    dispatch(actions.fetchRequest())
  }, [dispatch])

  const handleSave   = useCallback((task) => dispatch(actions.saveRequest(task)),   [dispatch])
  const handleDelete = useCallback((id)   => dispatch(actions.deleteRequest(id)),   [dispatch])
  const handleAdd    = useCallback((task) => dispatch(actions.saveRequest(task)),    [dispatch])

  if (fetching && tasks.length === 0) return <Spinner mode="section" />

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
