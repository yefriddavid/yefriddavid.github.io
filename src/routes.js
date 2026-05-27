import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
// Managment
const Accounts = React.lazy(() => import('./views/Accounting/Accounts'))
const AccountsMaster = React.lazy(() => import('./views/Accounting/AccountsMaster'))

// Users & Profile
const Users = React.lazy(() => import('./views/users/Users'))
const Profile = React.lazy(() => import('./views/profile/Profile'))
// Movements
const Payments = React.lazy(() => import('./views/movements/payments/Payments'))
const Transactions = React.lazy(() => import('./views/Accounting/Transactions'))
const AccountStatus = React.lazy(() => import('./views/Accounting/AccountStatus'))
const Reports = React.lazy(() => import('./views/reports/Reports'))

const Eggs = React.lazy(() => import('./views/CashFlow/eggs/Eggs'))
const MyProjects = React.lazy(() => import('./views/CashFlow/projects/MyProjects'))
const Assets = React.lazy(() => import('./views/CashFlow/assets/Assets'))
const GridTrade = React.lazy(() => import('./views/CashFlow/trade/GridTrade'))
const CustomGridTrade = React.lazy(() => import('./views/Finance/trade/CustomGridTrade'))
const InmobiliariaDesigns = React.lazy(() => import('./views/Inmobiliaria/Designs'))
const InmobiliariaDesignEditor = React.lazy(() => import('./views/Inmobiliaria/DesignEditor'))
const InmobiliariaPlanos = React.lazy(() => import('./views/Inmobiliaria/Planos'))
const InmobiliariaPlanoEditor = React.lazy(() => import('./views/Inmobiliaria/PlanosEditor'))

// Tools
const IncreaseDecrease = React.lazy(
  () => import('./views/tools/increase-decrease/IncreaseDecrease'),
)
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
    tKey: 'nav.transactions',
    element: Transactions,
    landingPage: true,
  },
  {
    path: '/finance/management/account-status',
    name: 'Account Status',
    longName: 'Estado de Cuentas',
    tKey: 'nav.accountStatus',
    element: AccountStatus,
    landingPage: true,
  },
  {
    path: '/finance/management/accounts-master',
    name: 'Accounts Master',
    longName: 'Maestro de Cuentas',
    tKey: 'nav.accountsMaster',
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
  { path: '/finance/management/users', name: 'Users', longName: 'Usuarios', tKey: 'nav.users', element: Users, roles: ['superAdmin'] },
  { path: '/finance/profile', name: 'Profile', longName: 'Perfil', tKey: 'nav.profile', element: Profile },

  { path: '/finance/eggs', name: 'Eggs', longName: 'Eggs', tKey: 'nav.eggs', element: Eggs, landingPage: true },
  {
    path: '/finance/projects',
    name: 'My Projects',
    longName: 'Mis Proyectos',
    tKey: 'nav.projects',
    element: MyProjects,
    landingPage: true,
  },
  {
    path: '/finance/assets',
    name: 'Assets',
    longName: 'Activos',
    tKey: 'nav.assets',
    element: Assets,
    landingPage: true,
  },
  {
    path: '/finance/trade/grid',
    name: 'Grid Trade',
    longName: 'Grid Trading',
    tKey: 'nav.gridTrade',
    element: GridTrade,
    landingPage: true,
  },
  {
    path: '/finance/trade/custom-grid',
    name: 'Custom Grid Trade',
    longName: 'Custom Grid Trading',
    tKey: 'nav.customGridTrade',
    element: CustomGridTrade,
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
    path: '/finance/tools/salary-distribution',
    name: 'Salary Distribution',
    longName: 'Distribución Salarial',
    tKey: 'nav.salaryDistribution',
    element: SalaryDistribution,
    landingPage: true,
  },
  {
    path: '/inmobiliaria/designs',
    name: 'Designs',
    longName: 'Diseños — Inmobiliaria',
    tKey: 'nav.inmobiliariaDesigns',
    element: InmobiliariaDesigns,
    landingPage: true,
  },
  {
    path: '/inmobiliaria/designs/new',
    name: 'New Design',
    longName: 'Nuevo Diseño',
    tKey: 'nav.inmobiliariaDesignNew',
    element: InmobiliariaDesignEditor,
  },
  {
    path: '/inmobiliaria/designs/:id',
    name: 'Edit Design',
    longName: 'Editar Diseño',
    tKey: 'nav.inmobiliariaDesignEdit',
    element: InmobiliariaDesignEditor,
  },
  {
    path: '/inmobiliaria/planos',
    name: 'Planos',
    longName: 'Planos — Inmobiliaria',
    tKey: 'nav.inmobiliariaPlanos',
    element: InmobiliariaPlanos,
    landingPage: true,
  },
  {
    path: '/inmobiliaria/planos/new',
    name: 'New Plano',
    longName: 'Nuevo Plano',
    tKey: 'nav.inmobiliariaPlanoNew',
    element: InmobiliariaPlanoEditor,
  },
  {
    path: '/inmobiliaria/planos/:id',
    name: 'Edit Plano',
    longName: 'Editar Plano',
    tKey: 'nav.inmobiliariaPlanoEdit',
    element: InmobiliariaPlanoEditor,
  },
]

export default routes
