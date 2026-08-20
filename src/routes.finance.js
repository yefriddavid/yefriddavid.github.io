import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Accounts = React.lazy(() => import('./views/Accounting/Accounts'))
const AccountsMaster = React.lazy(() => import('./views/Accounting/AccountsMaster'))
const Users = React.lazy(() => import('./views/users/Users'))
const UserEdit = React.lazy(() => import('./views/users/UserEdit'))
const Profile = React.lazy(() => import('./views/profile/Profile'))
const Payments = React.lazy(() => import('./views/movements/payments/Payments'))
const Transactions = React.lazy(() => import('./views/Accounting/Transactions'))
const AccountStatus = React.lazy(() => import('./views/Accounting/AccountStatus'))
const DeclaracionRenta = React.lazy(() => import('./views/Accounting/DeclaracionRenta'))
const Reports = React.lazy(() => import('./views/reports/Reports'))
const Analysis = React.lazy(() => import('./views/Finance/Analysis'))
const CryptoReport = React.lazy(() => import('./views/reports/CryptoReport'))
const CryptoActivityDashboard = React.lazy(() => import('./views/reports/CryptoActivityDashboard'))
const CryptoQuery = React.lazy(() => import('./views/reports/CryptoQuery'))
const CryptoMonthly = React.lazy(() => import('./views/reports/CryptoMonthly'))
const CryptoPlatforms = React.lazy(() => import('./views/reports/CryptoPlatforms'))
const CryptoWithdrawalsReport = React.lazy(() => import('./views/reports/CryptoWithdrawalsReport'))
const CryptoDcaReport = React.lazy(() => import('./views/reports/CryptoDcaReport'))
const GridTradeSimulation = React.lazy(() => import('./views/reports/GridTradeSimulation'))
const BtcLosses2025 = React.lazy(() => import('./views/reports/BtcLosses2025'))
const Eggs = React.lazy(() => import('./views/CashFlow/eggs/Eggs'))
const MyProjects = React.lazy(() => import('./views/CashFlow/projects/MyProjects'))
const Assets = React.lazy(() => import('./views/CashFlow/assets/Assets'))
const GridTrade = React.lazy(() => import('./views/CashFlow/trade/GridTrade'))
const CustomGridTrade = React.lazy(() => import('./views/Finance/trade/CustomGridTrade'))
const TradePrices = React.lazy(() => import('./views/Finance/trade/Prices'))
const TradeTools = React.lazy(() => import('./views/Finance/trade/Tools'))
const CalcList = React.lazy(() => import('./views/Finance/trade/CalcList'))
const LoanCalc = React.lazy(() => import('./views/Finance/trade/LoanCalc'))
const CalcPercentage = React.lazy(() => import('./views/Finance/trade/CalcPercentage'))
const CalcSheet = React.lazy(() => import('./views/Finance/trade/CalcSheet'))
const Bounces = React.lazy(() => import('./views/Finance/trade/Bounces'))
const IncreaseDecrease = React.lazy(
  () => import('./views/tools/increase-decrease/IncreaseDecrease'),
)
const CryptoPurchasesV2 = React.lazy(() => import('./views/tools/crypto-purchases'))
const CryptoWithdrawals = React.lazy(() => import('./views/tools/crypto-withdrawals'))
const Savings = React.lazy(() => import('./views/tools/savings'))
const SalaryDistribution = React.lazy(() => import('./views/CashFlow/tools/SalaryDistribution'))

// Paths are relative to the /finance/* parent route (no /finance prefix)
const financeRoutes = [
  { path: '/dashboard', name: 'Dashboard', element: Dashboard, landingPage: true },
  { path: '/management/accounts', name: 'Cuentas', element: Accounts, landingPage: true },
  { path: '/management/payments', name: 'Pagos', element: Payments, landingPage: true },
  {
    path: '/management/transactions',
    name: 'Transacciones',
    element: Transactions,
    landingPage: true,
  },
  {
    path: '/management/account-status',
    name: 'Estado de Cuentas',
    element: AccountStatus,
    landingPage: true,
  },
  {
    path: '/management/accounts-master',
    name: 'Maestro de Cuentas',
    element: AccountsMaster,
    landingPage: true,
  },
  {
    path: '/management/declaracion-renta',
    name: 'Declaración de Renta',
    element: DeclaracionRenta,
    landingPage: true,
  },
  {
    path: '/management/reports',
    name: 'Estado de Resultados',
    element: Reports,
    landingPage: true,
  },
  { path: '/management/analysis', name: 'Análisis', element: Analysis, landingPage: true },
  {
    path: '/management/crypto-report',
    name: 'Resumen Cripto',
    element: CryptoReport,
    landingPage: true,
  },
  {
    path: '/management/crypto-activity',
    name: 'Compras y Ventas',
    element: CryptoActivityDashboard,
    landingPage: true,
  },
  {
    path: '/management/crypto-query',
    name: 'Consulta de Compras/Ventas',
    element: CryptoQuery,
    landingPage: true,
  },
  {
    path: '/management/crypto-monthly',
    name: 'Compras/Ventas por Mes',
    element: CryptoMonthly,
    landingPage: true,
  },
  {
    path: '/management/crypto-platforms',
    name: 'Totales por Plataforma',
    element: CryptoPlatforms,
    landingPage: true,
  },
  {
    path: '/management/crypto-withdrawals-report',
    name: 'Retiros',
    element: CryptoWithdrawalsReport,
    landingPage: true,
  },
  {
    path: '/management/crypto-dca',
    name: 'Costo Promedio (DCA)',
    element: CryptoDcaReport,
    landingPage: true,
  },
  {
    path: '/management/grid-simulation',
    name: 'Simulación Grid Trading',
    element: GridTradeSimulation,
    landingPage: true,
  },
  {
    path: '/management/btc-perdidas-2025',
    name: 'BTC Pérdidas 2025',
    element: BtcLosses2025,
    landingPage: true,
  },
  { path: '/management/users', name: 'Usuarios', element: Users, roles: ['superAdmin'] },
  {
    path: '/management/users/:username',
    name: 'Editar Usuario',
    element: UserEdit,
    roles: ['superAdmin'],
  },
  { path: '/profile', name: 'Perfil', element: Profile },
  { path: '/eggs', name: 'Eggs', element: Eggs, landingPage: true },
  { path: '/projects', name: 'Mis Proyectos', element: MyProjects, landingPage: true },
  { path: '/assets', name: 'Activos', element: Assets, landingPage: true },
  { path: '/trade/grid', name: 'Grid Trading', element: GridTrade, landingPage: true },
  {
    path: '/trade/custom-grid',
    name: 'Custom Grid Trading',
    element: CustomGridTrade,
    landingPage: true,
  },
  { path: '/trade/prices', name: 'Prices', element: TradePrices, landingPage: true },
  { path: '/trade/tools', name: 'Btc Histograma', element: TradeTools, landingPage: true },
  { path: '/trade/calc-list', name: 'Calc List', element: CalcList, landingPage: true },
  { path: '/trade/bounces', name: 'Rebotes', element: Bounces, landingPage: true },
  { path: '/tools/loan-calc', name: 'Loan Calculator', element: LoanCalc, landingPage: true },
  {
    path: '/tools/calc-percentage',
    name: 'Calc Percentage',
    element: CalcPercentage,
    landingPage: true,
  },
  { path: '/tools/calc-sheet', name: 'Calc Sheet', element: CalcSheet, landingPage: true },
  {
    path: '/tools/adjustments',
    name: 'Aumento / Disminución',
    element: IncreaseDecrease,
    landingPage: true,
  },
  {
    path: '/tools/v2/adjustments',
    name: 'Crypto Purchases (v2)',
    element: CryptoPurchasesV2,
    landingPage: true,
  },
  {
    path: '/tools/crypto-withdrawals',
    name: 'Crypto Withdrawals',
    element: CryptoWithdrawals,
    landingPage: true,
  },
  { path: '/tools/savings', name: 'Ahorros', element: Savings, landingPage: true },
  {
    path: '/tools/salary-distribution',
    name: 'Salary Distribution',
    element: SalaryDistribution,
    landingPage: true,
  },
]

export default financeRoutes
