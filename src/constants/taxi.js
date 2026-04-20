/**
 * Taxi module constants.
 *
 * Single source of truth for all taxi-specific domain values.
 * Import from here inside the taxis module — never from commons.js.
 */

/**
 * All valid expense categories for taxi operations.
 * Used in Expenses.js forms, filters, and DevExtreme column lookups.
 */
export const TAXI_EXPENSE_CATEGORIES = [
  'Administración',
  'Combustible',
  'Mantenimiento',
  'Préstamos',
  'Repuestos',
  'Lavado',
  'Cambio Aceite',
  'Cambio de Correa Dentada',
  'SOAT',
  'RTM',
  'Multa',
  'Otro',
]

/**
 * Subset of expense categories that represent scheduled maintenance.
 * Used in Operations.js to determine which expenses carry a nextDate field
 * and to drive the calendar view of upcoming maintenance events.
 */
export const TAXI_MAINTENANCE_CATEGORIES = [
  'Cambio Aceite',
  'Cambio de Correa Dentada',
  'Mantenimiento',
  'Lavado',
  'Repuestos',
  'SOAT',
  'RTM',
]
