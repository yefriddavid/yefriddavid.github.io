import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
// Managment
const Accounts = React.lazy(() => import('./views/Accounting/Accounts'))
const AccountsMaster = React.lazy(() => import('./views/Accounting/AccountsMaster'))
const Settlements = React.lazy(() => import('./views/taxis/Settlements/Index'))
const Drivers = React.lazy(() => import('./views/taxis/Drivers'))
const Vehicles = React.lazy(() => import('./views/taxis/Vehicles'))
const Expenses = React.lazy(() => import('./views/taxis/Expenses'))
const Summary = React.lazy(() => import('./views/taxis/Summary'))
const TaxisHome = React.lazy(() => import('./views/taxis/Home'))
const Partners = React.lazy(() => import('./views/taxis/Partners'))
const Distributions = React.lazy(() => import('./views/taxis/Distributions'))
const Operations = React.lazy(() => import('./views/taxis/Operations'))

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
    path: '/cash_flow/dashboard',
    name: 'Dashboard',
    longName: 'Dashboard',
    tKey: 'nav.dashboard',
    element: Dashboard,
    landingPage: true,
  },
  {
    path: '/cash_flow/management/accounts',
    name: 'Accounts',
    longName: 'Cuentas',
    tKey: 'nav.accounts',
    element: Accounts,
    landingPage: true,
  },
  {
    path: '/taxis',
    name: 'Taxis',
    tKey: 'nav.taxiManagement',
    element: TaxisHome,
  },
  {
    path: '/taxis/home',
    name: 'Home',
    longName: 'Taxi — Inicio',
    tKey: 'nav.taxiHome',
    element: TaxisHome,
    landingPage: true,
  },
  {
    path: '/taxis/settlements',
    name: 'Settlements',
    longName: 'Taxi — Liquidaciones',
    tKey: 'nav.liquidaciones',
    element: Settlements,
    landingPage: true,
  },
  {
    path: '/taxis/drivers',
    name: 'Drivers',
    longName: 'Taxi — Conductores',
    tKey: 'nav.conductores',
    element: Drivers,
    landingPage: true,
  },
  {
    path: '/taxis/vehicles',
    name: 'Vehicles',
    longName: 'Taxi — Vehículos',
    tKey: 'nav.vehiculos',
    element: Vehicles,
    landingPage: true,
  },
  {
    path: '/taxis/expenses',
    name: 'Expenses',
    longName: 'Taxi — Gastos',
    tKey: 'nav.taxiExpenses',
    element: Expenses,
    landingPage: true,
  },
  {
    path: '/taxis/summary',
    name: 'Summary',
    longName: 'Taxi — Resumen',
    tKey: 'nav.taxiResumen',
    element: Summary,
    landingPage: true,
  },
  {
    path: '/taxis/operations',
    name: 'Operaciones',
    longName: 'Taxi — Operaciones',
    element: Operations,
    landingPage: true,
  },
  {
    path: '/taxis/partners',
    name: 'Partners',
    longName: 'Taxi — Partners',
    element: Partners,
    landingPage: true,
  },
  {
    path: '/taxis/profit-sharing',
    name: 'Distributions',
    longName: 'Taxi — Distribución',
    element: Distributions,
    landingPage: true,
  },
  {
    path: '/cash_flow/management/payments',
    name: 'Payments',
    longName: 'Pagos',
    tKey: 'nav.payments',
    element: Payments,
    landingPage: true,
  },
  {
    path: '/cash_flow/management/transactions',
    name: 'Transactions',
    longName: 'Transacciones',
    element: Transactions,
    landingPage: true,
  },
  {
    path: '/cash_flow/management/account-status',
    name: 'Account Status',
    longName: 'Estado de Cuentas',
    element: AccountStatus,
    landingPage: true,
  },
  {
    path: '/cash_flow/management/accounts-master',
    name: 'Accounts Master',
    longName: 'Maestro de Cuentas',
    element: AccountsMaster,
    landingPage: true,
  },
  {
    path: '/cash_flow/management/reports',
    name: 'Reports',
    longName: 'Reportes',
    tKey: 'nav.reports',
    element: Reports,
    landingPage: true,
  },
  { path: '/cash_flow/management/users', name: 'Users', element: Users, roles: ['superAdmin'] },
  {
    path: '/admin/tenants',
    name: 'Tenants',
    longName: 'Admin — Tenants',
    element: Tenants,
    roles: ['superAdmin'],
  },
  {
    path: '/cash_flow/management/push-subscribers',
    name: 'Push Subscribers',
    element: PushSubscribers,
    roles: ['superAdmin'],
  },
  { path: '/cash_flow/profile', name: 'Profile', element: Profile },
  { path: '/cash_flow/settings', name: 'Settings', element: AppSettings, roles: ['superAdmin'] },

  { path: '/cash_flow/eggs', name: 'Eggs', longName: 'Eggs', element: Eggs, landingPage: true },
  {
    path: '/cash_flow/projects',
    name: 'My Projects',
    longName: 'Mis Proyectos',
    element: MyProjects,
    landingPage: true,
  },
  {
    path: '/cash_flow/assets',
    name: 'Assets',
    longName: 'Activos',
    element: Assets,
    landingPage: true,
  },
  {
    path: '/cash_flow/tools/adjustments',
    name: 'Increase Decrease',
    longName: 'Herramientas — Ajustes',
    tKey: 'nav.increaseDecrease',
    element: IncreaseDecrease,
    landingPage: true,
  },
  {
    path: '/cash_flow/tools/visits',
    name: 'Visits',
    longName: 'Herramientas — Visitas',
    tKey: 'nav.visits',
    element: Visits,
    landingPage: true,
  },
  {
    path: '/cash_flow/tools/salary-distribution',
    name: 'Salary Distribution',
    longName: 'Herramientas — Distribución Salarial',
    element: SalaryDistribution,
    landingPage: true,
  },
]

export default routes
