import React from 'react'

const Dashboard = React.lazy(() => import('./views/pages/dashboard/Dashboard'))
const Colors = React.lazy(() => import('./views/theme/colors/Colors'))
const Typography = React.lazy(() => import('./views/theme/typography/Typography'))

// Managment
const Accounts = React.lazy(() => import('./views/pages/Accounting/Accounts'))
const AccountsMaster = React.lazy(() => import('./views/pages/Accounting/AccountsMaster'))
const Settlements = React.lazy(() => import('./views/pages/taxis/Settlements/Index'))
const Drivers = React.lazy(() => import('./views/pages/taxis/Drivers'))
const Vehicles = React.lazy(() => import('./views/pages/taxis/Vehicles'))
const Expenses = React.lazy(() => import('./views/pages/taxis/Expenses'))
const Summary = React.lazy(() => import('./views/pages/taxis/Summary'))
const TaxisHome = React.lazy(() => import('./views/pages/taxis/Home'))
const Partners = React.lazy(() => import('./views/pages/taxis/Partners'))
const Distributions = React.lazy(() => import('./views/pages/taxis/Distributions'))
const Operations = React.lazy(() => import('./views/pages/taxis/Operations'))

// Users & Profile
const Users = React.lazy(() => import('./views/pages/users/Users'))
const PushSubscribers = React.lazy(() => import('./views/pages/users/PushSubscribers'))
const Profile = React.lazy(() => import('./views/pages/profile/Profile'))

// Movements
const Payments = React.lazy(() => import('./views/pages/movements/payments/Payments'))
const Transactions = React.lazy(() => import('./views/pages/Accounting/Transactions'))
const AccountStatus = React.lazy(() => import('./views/pages/Accounting/AccountStatus'))
const Reports = React.lazy(() => import('./views/pages/reports/Reports'))

const AbountMe = React.lazy(() => import('./views/pages/aboutMe/Index'))

const Eggs = React.lazy(() => import('./views/pages/CashFlow/eggs/Eggs'))
const MyProjects = React.lazy(() => import('./views/pages/CashFlow/projects/MyProjects'))
const Assets = React.lazy(() => import('./views/pages/CashFlow/assets/Assets'))

// Tools
const IncreaseDecrease = React.lazy(
  () => import('./views/pages/tools/increase-decrease/IncreaseDecrease'),
)
const Visits = React.lazy(() => import('./views/pages/tools/visits/Visits'))
const SalaryDistribution = React.lazy(
  () => import('./views/pages/CashFlow/tools/SalaryDistribution'),
)

// Base
//const Accordion = React.lazy(() => import('./views/base/accordion/Accordion'))
//const Breadcrumbs = React.lazy(() => import('./views/base/breadcrumbs/Breadcrumbs'))
//const Cards = React.lazy(() => import('./views/base/cards/Cards'))
//const Carousels = React.lazy(() => import('./views/base/carousels/Carousels'))
//const Collapses = React.lazy(() => import('./views/base/collapses/Collapses'))
//const ListGroups = React.lazy(() => import('./views/base/list-groups/ListGroups'))
//const Navs = React.lazy(() => import('./views/base/navs/Navs'))
//const Paginations = React.lazy(() => import('./views/base/paginations/Paginations'))
//const Placeholders = React.lazy(() => import('./views/base/placeholders/Placeholders'))
//const Popovers = React.lazy(() => import('./views/base/popovers/Popovers'))
//const Progress = React.lazy(() => import('./views/base/progress/Progress'))
//const Spinners = React.lazy(() => import('./views/base/spinners/Spinners'))
//const Tabs = React.lazy(() => import('./views/base/tabs/Tabs'))
//const Tables = React.lazy(() => import('./views/base/tables/Tables'))
//const Tooltips = React.lazy(() => import('./views/base/tooltips/Tooltips'))

// Buttons
//const Buttons = React.lazy(() => import('./views/buttons/buttons/Buttons'))
//const ButtonGroups = React.lazy(() => import('./views/buttons/button-groups/ButtonGroups'))
//const Dropdowns = React.lazy(() => import('./views/buttons/dropdowns/Dropdowns'))

//Forms
//const ChecksRadios = React.lazy(() => import('./views/forms/checks-radios/ChecksRadios'))
//const FloatingLabels = React.lazy(() => import('./views/forms/floating-labels/FloatingLabels'))
//const FormControl = React.lazy(() => import('./views/forms/form-control/FormControl'))
//const InputGroup = React.lazy(() => import('./views/forms/input-group/InputGroup'))
//const Layout = React.lazy(() => import('./views/forms/layout/Layout'))
//const Range = React.lazy(() => import('./views/forms/range/Range'))
//const Select = React.lazy(() => import('./views/forms/select/Select'))
//const Validation = React.lazy(() => import('./views/forms/validation/Validation'))
//
//const Charts = React.lazy(() => import('./views/charts/Charts'))

// Icons
//const CoreUIIcons = React.lazy(() => import('./views/icons/coreui-icons/CoreUIIcons'))
//const Flags = React.lazy(() => import('./views/icons/flags/Flags'))
//const Brands = React.lazy(() => import('./views/icons/brands/Brands'))

// Notifications
//const Alerts = React.lazy(() => import('./views/notifications/alerts/Alerts'))
//const Badges = React.lazy(() => import('./views/notifications/badges/Badges'))
//const Modals = React.lazy(() => import('./views/notifications/modals/Modals'))
//const Toasts = React.lazy(() => import('./views/notifications/toasts/Toasts'))

//const Widgets = React.lazy(() => import('./views/widgets/Widgets'))

const routes = [
  //  { path: '/', exact: true, name: 'Home' },
  //{ path: '/', exact: true, element: AbountMe },
  { path: '/cash_flow/dashboard', name: 'Dashboard', longName: 'Dashboard', tKey: 'nav.dashboard', element: Dashboard, landingPage: true },
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
  { path: '/taxis/operations', name: 'Operaciones', longName: 'Taxi — Operaciones', element: Operations, landingPage: true },
  { path: '/taxis/partners', name: 'Partners', longName: 'Taxi — Partners', element: Partners, landingPage: true },
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
  { path: '/cash_flow/management/transactions', name: 'Transactions', longName: 'Transacciones', element: Transactions, landingPage: true },
  { path: '/cash_flow/management/account-status', name: 'Account Status', longName: 'Estado de Cuentas', element: AccountStatus, landingPage: true },
  {
    path: '/cash_flow/management/accounts-master',
    name: 'Accounts Master',
    longName: 'Maestro de Cuentas',
    element: AccountsMaster,
    landingPage: true,
  },
  { path: '/cash_flow/management/reports', name: 'Reports', longName: 'Reportes', tKey: 'nav.reports', element: Reports, landingPage: true },
  { path: '/cash_flow/management/users', name: 'Users', element: Users, roles: ['superAdmin'] },
  {
    path: '/cash_flow/management/push-subscribers',
    name: 'Push Subscribers',
    element: PushSubscribers,
    roles: ['superAdmin'],
  },
  { path: '/cash_flow/profile', name: 'Profile', element: Profile },

  { path: '/cash_flow/eggs', name: 'Eggs', longName: 'Eggs', element: Eggs, landingPage: true },
  { path: '/cash_flow/projects', name: 'My Projects', longName: 'Mis Proyectos', element: MyProjects, landingPage: true },
  { path: '/cash_flow/assets', name: 'Assets', longName: 'Activos', element: Assets, landingPage: true },
  {
    path: '/cash_flow/tools/adjustments',
    name: 'Increase Decrease',
    longName: 'Herramientas — Ajustes',
    tKey: 'nav.increaseDecrease',
    element: IncreaseDecrease,
    landingPage: true,
  },
  { path: '/cash_flow/tools/visits', name: 'Visits', longName: 'Herramientas — Visitas', tKey: 'nav.visits', element: Visits, landingPage: true },
  {
    path: '/cash_flow/tools/salary-distribution',
    name: 'Salary Distribution',
    longName: 'Herramientas — Distribución Salarial',
    element: SalaryDistribution,
    landingPage: true,
  },

  /*{ path: '/theme/typography', name: 'Typography', element: Typography },
  { path: '/base', name: 'Base', element: Cards, exact: true },
  { path: '/base/accordion', name: 'Accordion', element: Accordion },
  { path: '/base/breadcrumbs', name: 'Breadcrumbs', element: Breadcrumbs },
  { path: '/base/cards', name: 'Cards', element: Cards },
  { path: '/base/carousels', name: 'Carousel', element: Carousels },
  { path: '/base/collapses', name: 'Collapse', element: Collapses },
  { path: '/base/list-groups', name: 'List Groups', element: ListGroups },
  { path: '/base/navs', name: 'Navs', element: Navs },
  { path: '/base/paginations', name: 'Paginations', element: Paginations },
  { path: '/base/placeholders', name: 'Placeholders', element: Placeholders },
  { path: '/base/popovers', name: 'Popovers', element: Popovers },
  { path: '/base/progress', name: 'Progress', element: Progress },
  { path: '/base/spinners', name: 'Spinners', element: Spinners },
  { path: '/base/tabs', name: 'Tabs', element: Tabs },
  { path: '/base/tables', name: 'Tables', element: Tables },
  { path: '/base/tooltips', name: 'Tooltips', element: Tooltips },
  { path: '/buttons', name: 'Buttons', element: Buttons, exact: true },
  { path: '/buttons/buttons', name: 'Buttons', element: Buttons },
  { path: '/buttons/dropdowns', name: 'Dropdowns', element: Dropdowns },
  { path: '/buttons/button-groups', name: 'Button Groups', element: ButtonGroups },
  { path: '/charts', name: 'Charts', element: Charts },
  { path: '/forms', name: 'Forms', element: FormControl, exact: true },
  { path: '/forms/form-control', name: 'Form Control', element: FormControl },
  { path: '/forms/select', name: 'Select', element: Select },
  { path: '/forms/checks-radios', name: 'Checks & Radios', element: ChecksRadios },
  { path: '/forms/range', name: 'Range', element: Range },
  { path: '/forms/input-group', name: 'Input Group', element: InputGroup },
  { path: '/forms/floating-labels', name: 'Floating Labels', element: FloatingLabels },
  { path: '/forms/layout', name: 'Layout', element: Layout },
  { path: '/forms/validation', name: 'Validation', element: Validation },
  { path: '/icons', exact: true, name: 'Icons', element: CoreUIIcons },
  { path: '/icons/coreui-icons', name: 'CoreUI Icons', element: CoreUIIcons },
  { path: '/icons/flags', name: 'Flags', element: Flags },
  { path: '/icons/brands', name: 'Brands', element: Brands },
  { path: '/notifications', name: 'Notifications', element: Alerts, exact: true },
  { path: '/notifications/alerts', name: 'Alerts', element: Alerts },
  { path: '/notifications/badges', name: 'Badges', element: Badges },
  { path: '/notifications/modals', name: 'Modals', element: Modals },
  { path: '/notifications/toasts', name: 'Toasts', element: Toasts },
  { path: '/widgets', name: 'Widgets', element: Widgets },*/
]

export default routes
