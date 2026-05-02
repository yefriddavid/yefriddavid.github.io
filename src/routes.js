import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
// Managment
const Accounts = React.lazy(() => import('./views/Accounting/Accounts'))
const AccountsMaster = React.lazy(() => import('./views/Accounting/AccountsMaster'))

// Users & Profile
const Users = React.lazy(() => import('./views/users/Users'))
const Tenants = React.lazy(() => import('./views/admin/Tenants'))
const PushSubscribers = React.lazy(() => import('./views/users/PushSubscribers'))
const Profile = React.lazy(() => import('./views/profile/Profile'))
const AppSettings = React.lazy(() => import('./views/settings/AppSettings'))

// Movements
const Payments = React.lazy(() => import('./views/movements/payments/Payments'))
const Transactions = React.lazy(() => import('./views/Accounting/Transactions'))
const AccountStatus = React.lazy(() => import('./views/Accounting/AccountStatus'))
const Reports = React.lazy(() => import('./views/reports/Reports'))

const Eggs = React.lazy(() => import('./views/CashFlow/eggs/Eggs'))
const MyProjects = React.lazy(() => import('./views/CashFlow/projects/MyProjects'))
const Assets = React.lazy(() => import('./views/CashFlow/assets/Assets'))

// Tools
const IncreaseDecrease = React.lazy(
  () => import('./views/tools/increase-decrease/IncreaseDecrease'),
)
const Visits = React.lazy(() => import('./views/tools/visits/Visits'))
const SalaryDistribution = React.lazy(() => import('./views/CashFlow/tools/SalaryDistribution'))

const routes = [
  {
    path: '/finance/dashboard',
    name: 'Dashboard',
    longName: 'Dashboard',
    tKey: 'nav.dashboard',
    element: Dashboard,
    landingPage: true,
  },
  {
    path: '/finance/management/accounts',
    name: 'Accounts',
    longName: 'Cuentas',
    tKey: 'nav.accounts',
    element: Accounts,
    landingPage: true,
  },
  {
    path: '/finance/management/payments',
    name: 'Payments',
    longName: 'Pagos',
    tKey: 'nav.payments',
    element: Payments,
    landingPage: true,
  },
  {
    path: '/finance/management/transactions',
    name: 'Transactions',
    longName: 'Transacciones',
    element: Transactions,
    landingPage: true,
  },
  {
    path: '/finance/management/account-status',
    name: 'Account Status',
    longName: 'Estado de Cuentas',
    element: AccountStatus,
    landingPage: true,
  },
  {
    path: '/finance/management/accounts-master',
    name: 'Accounts Master',
    longName: 'Maestro de Cuentas',
    element: AccountsMaster,
    landingPage: true,
  },
  {
    path: '/finance/management/reports',
    name: 'Reports',
    longName: 'Reportes',
    tKey: 'nav.reports',
    element: Reports,
    landingPage: true,
  },
  { path: '/finance/management/users', name: 'Users', element: Users, roles: ['superAdmin'] },
  {
    path: '/admin/tenants',
    name: 'Tenants',
    longName: 'Admin — Tenants',
    element: Tenants,
    roles: ['superAdmin'],
  },
  {
    path: '/finance/management/push-subscribers',
    name: 'Push Subscribers',
    element: PushSubscribers,
    roles: ['superAdmin'],
  },
  { path: '/finance/profile', name: 'Profile', element: Profile },
  { path: '/finance/settings', name: 'Settings', element: AppSettings, roles: ['superAdmin'] },

  { path: '/finance/eggs', name: 'Eggs', longName: 'Eggs', element: Eggs, landingPage: true },
  {
    path: '/finance/projects',
    name: 'My Projects',
    longName: 'Mis Proyectos',
    element: MyProjects,
    landingPage: true,
  },
  {
    path: '/finance/assets',
    name: 'Assets',
    longName: 'Activos',
    element: Assets,
    landingPage: true,
  },
  {
    path: '/finance/tools/adjustments',
    name: 'Increase Decrease',
    longName: 'Herramientas — Ajustes',
    tKey: 'nav.increaseDecrease',
    element: IncreaseDecrease,
    landingPage: true,
  },
  {
    path: '/finance/tools/visits',
    name: 'Visits',
    longName: 'Herramientas — Visitas',
    tKey: 'nav.visits',
    element: Visits,
    landingPage: true,
  },
  {
    path: '/finance/tools/salary-distribution',
    name: 'Salary Distribution',
    longName: 'Herramientas — Distribución Salarial',
    element: SalaryDistribution,
    landingPage: true,
  },
]

export default routes
