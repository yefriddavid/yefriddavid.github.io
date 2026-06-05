import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import * as actions from 'src/actions/system/errorLogActions'
import ErrorLogs from './ErrorLogs'

const ErrorLogsPage = () => {
  const dispatch = useDispatch()
  const logs = useSelector((s) => s.errorLog.data ?? [])
  const loading = useSelector((s) => s.errorLog.fetching)

  useEffect(() => {
    dispatch(actions.fetchRequest())
  }, [dispatch])

  return (
    <ErrorLogs
      logs={logs}
      loading={loading}
      onDelete={(id) => dispatch(actions.deleteRequest(id))}
      onRefresh={() => dispatch(actions.fetchRequest())}
      onClearAll={() => dispatch(actions.clearAllRequest())}
    />
  )
}

export default ErrorLogsPage
