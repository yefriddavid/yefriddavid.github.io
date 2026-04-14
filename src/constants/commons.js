import moment from 'src/utils/moment'

/** Full month names in English — used as Firestore data keys, never for display. */
export const MONTH_NAMES = moment.localeData('en').months()

/** Available landing pages for user profile configuration. */
export const LANDING_PAGES = [
  { value: '/cash_flow/dashboard', label: 'Dashboard' },
  { value: '/cash_flow/management/transactions', label: 'Transacciones' },
  { value: '/cash_flow/management/account-status', label: 'Estado de Cuentas' },
  { value: '/cash_flow/management/accounts-master', label: 'Maestro de Cuentas' },
  { value: '/cash_flow/management/accounts', label: 'Cuentas' },
  { value: '/cash_flow/management/payments', label: 'Pagos' },
  { value: '/taxis/home', label: 'Taxi — Inicio' },
  { value: '/taxis/settlements', label: 'Taxi — Liquidaciones' },
  { value: '/cash_flow/tools/adjustments', label: 'Herramientas — Ajustes' },
  { value: '/cash_flow/tools/visits', label: 'Herramientas — Visitas' },
  { value: '/cash_flow/eggs', label: 'Eggs' },
]
