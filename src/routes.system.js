import React from 'react'

const Users = React.lazy(() => import('./views/users/Users'))
const AppSettings = React.lazy(() => import('./views/settings/AppSettings'))
const Tenants = React.lazy(() => import('./views/admin/Tenants'))
const PushSubscribers = React.lazy(() => import('./views/users/PushSubscribers'))
const Visits = React.lazy(() => import('./views/tools/visits/Visits'))

const systemRoutes = [
  {
    path: '/system/users',
    name: 'Users',
    element: Users,
  },
  {
    path: '/system/settings',
    name: 'Settings',
    element: AppSettings,
  },
  {
    path: '/system/tenants',
    name: 'Tenants',
    element: Tenants,
  },
  {
    path: '/system/push-subscribers',
    name: 'Push Subscribers',
    element: PushSubscribers,
  },
  {
    path: '/system/visits',
    name: 'Visits',
    element: Visits,
  },
]

export default systemRoutes
