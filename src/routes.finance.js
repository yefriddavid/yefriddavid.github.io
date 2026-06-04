import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Accounts = React.lazy(() => import('./views/Accounting/Accounts'))
const AccountsMaster = React.lazy(() => import('./views/Accounting/AccountsMaster'))
const Users = React.lazy(() => import('./views/users/Users'))
const Profile = React.lazy(() => import('./views/profile/Profile'))
const Payments = React.lazy(() => import('./views/movements/payments/Payments'))
const Transactions = React.lazy(() => import('./views/Accounting/Transactions'))
const AccountStatus = React.lazy(() => import('./views/Accounting/AccountStatus'))
const DeclaracionRenta = React.lazy(() => import('./views/Accounting/DeclaracionRenta'))
const Reports = React.lazy(() => import('./views/reports/Reports'))
const Eggs = React.lazy(() => import('./views/CashFlow/eggs/Eggs'))
const MyProjects = React.lazy(() => import('./views/CashFlow/projects/MyProjects'))
const Assets = React.lazy(() => import('./views/CashFlow/assets/Assets'))
const GridTrade = React.lazy(() => import('./views/CashFlow/trade/GridTrade'))
const CustomGridTrade = React.lazy(() => import('./views/Finance/trade/CustomGridTrade'))
const IncreaseDecrease = React.lazy(
  () => import('./views/tools/increase-decrease/IncreaseDecrease'),
)
const SalaryDistribution = React.lazy(() => import('./views/CashFlow/tools/SalaryDistribution'))

// Paths are relative to the /finance/* parent route (no /finance prefix)
const financeRoutes = [
  { path: '/dashboard', element: Dashboard, landingPage: true },
  { path: '/management/accounts', element: Accounts, landingPage: true },
  { path: '/management/payments', element: Payments, landingPage: true },
  { path: '/management/transactions', element: Transactions, landingPage: true },
  { path: '/management/account-status', element: AccountStatus, landingPage: true },
  { path: '/management/accounts-master', element: AccountsMaster, landingPage: true },
  { path: '/management/declaracion-renta', element: DeclaracionRenta, landingPage: true },
  { path: '/management/reports', element: Reports, landingPage: true },
  { path: '/management/users', element: Users, roles: ['superAdmin'] },
  { path: '/profile', element: Profile },
  { path: '/eggs', element: Eggs, landingPage: true },
  { path: '/projects', element: MyProjects, landingPage: true },
  { path: '/assets', element: Assets, landingPage: true },
  { path: '/trade/grid', element: GridTrade, landingPage: true },
  { path: '/trade/custom-grid', element: CustomGridTrade, landingPage: true },
  { path: '/tools/adjustments', element: IncreaseDecrease, landingPage: true },
  { path: '/tools/salary-distribution', element: SalaryDistribution, landingPage: true },
]

export default financeRoutes
