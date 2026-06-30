import React from 'react'

const ErrorLogsPage = React.lazy(() => import('./views/pages/system/ErrorLogs/ErrorLogsPage'))
const AuditLogsPage = React.lazy(() => import('./views/pages/system/AuditLogs/AuditLogsPage'))
const PerfLogsPage = React.lazy(() => import('./views/pages/system/PerfLogs/PerfLogsPage'))
const Programs = React.lazy(() => import('./views/pages/system/Programs'))

const Users = React.lazy(() => import('./views/users/Users'))
const UserEdit = React.lazy(() => import('./views/users/UserEdit'))
const AppSettings = React.lazy(() => import('./views/settings/AppSettings'))
const Tenants = React.lazy(() => import('./views/admin/Tenants'))
const PushSubscribers = React.lazy(() => import('./views/users/PushSubscribers'))
const Visits = React.lazy(() => import('./views/tools/visits/Visits'))
const ContactMessages = React.lazy(() => import('./views/tools/contactMessages/ContactMessages'))

const systemRoutes = [
  {
    path: '/system/users',
    name: 'Users',
    tKey: 'nav.users',
    element: Users,
  },
  {
    path: '/system/users/:username',
    name: 'UserEdit',
    element: UserEdit,
  },
  {
    path: '/system/settings',
    name: 'Settings',
    tKey: 'nav.settings',
    element: AppSettings,
  },
  {
    path: '/system/tenants',
    name: 'Tenants',
    tKey: 'nav.tenants',
    element: Tenants,
  },
  {
    path: '/system/push-subscribers',
    name: 'Push Subscribers',
    tKey: 'nav.pushSubscribers',
    element: PushSubscribers,
  },
  {
    path: '/system/visits',
    name: 'Visits',
    tKey: 'nav.visits',
    element: Visits,
  },
  {
    path: '/system/messages',
    name: 'Messages',
    tKey: 'nav.messages',
    element: ContactMessages,
  },
  {
    path: '/system/error-logs',
    name: 'Error Logs',
    tKey: 'nav.errorLogs',
    element: ErrorLogsPage,
  },
  {
    path: '/system/audit-logs',
    name: 'Audit Logs',
    tKey: 'nav.auditLogs',
    element: AuditLogsPage,
  },
  {
    path: '/system/perf-logs',
    name: 'Performance',
    tKey: 'nav.perfLogs',
    element: PerfLogsPage,
  },
  {
    path: '/system/programs',
    name: 'Programs',
    tKey: 'nav.programs',
    element: Programs,
  },
]

export default systemRoutes
