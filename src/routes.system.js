import React from 'react'

const ErrorLogsPage = React.lazy(() => import('./views/pages/system/ErrorLogs/ErrorLogsPage'))
const AuditLogsPage = React.lazy(() => import('./views/pages/system/AuditLogs/AuditLogsPage'))
const PerfLogsPage = React.lazy(() => import('./views/pages/system/PerfLogs/PerfLogsPage'))

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
  {
    path: '/system/error-logs',
    name: 'Error Logs',
    element: ErrorLogsPage,
  },
  {
    path: '/system/audit-logs',
    name: 'Audit Logs',
    element: AuditLogsPage,
  },
  {
    path: '/system/perf-logs',
    name: 'Performance',
    element: PerfLogsPage,
  },
]

export default systemRoutes
