import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CToast, CToastBody, CToastClose, CToaster } from '@coreui/react'
import { dismiss } from '../../reducers/notificationsSlice'

const DELAY = { error: 8000, success: 4000, warning: 6000, info: 4000 }
const COLOR = { error: 'danger', success: 'success', warning: 'warning', info: 'info' }

const Notification = ({ notification }) => {
  const dispatch = useDispatch()
  const { id, type = 'info', message } = notification
  const delay = DELAY[type] ?? 5000

  useEffect(() => {
    const timer = setTimeout(() => dispatch(dismiss(id)), delay)
    return () => clearTimeout(timer)
  }, [id, delay, dispatch])

  return (
    <CToast visible autohide={false} color={COLOR[type] ?? 'secondary'}>
      <div className="d-flex align-items-center">
        <CToastBody className="flex-grow-1">{message}</CToastBody>
        <CToastClose onClick={() => dispatch(dismiss(id))} className="me-2 m-auto" white />
      </div>
    </CToast>
  )
}

const NotificationToaster = () => {
  const notifications = useSelector((s) => s.notifications)

  return (
    <CToaster placement="top-end" className="p-3">
      {notifications.map((n) => (
        <Notification key={n.id} notification={n} />
      ))}
    </CToaster>
  )
}

export default NotificationToaster
