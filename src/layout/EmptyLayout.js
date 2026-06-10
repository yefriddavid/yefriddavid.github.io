import React from 'react'
import { Outlet } from 'react-router-dom'
import NotificationToaster from '../components/shared/NotificationToaster'

const EmptyLayout = () => (
  <>
    <Outlet />
    <NotificationToaster />
  </>
)

export default EmptyLayout
