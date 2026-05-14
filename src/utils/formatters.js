import moment from './moment'

/**
 * Formats a number as COP currency.
 * @param {number} n - The number to format.
 * @returns {string} Formatted currency string.
 */
export const fmt = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n ?? 0)

/**
 * Formats a number with specified decimal places.
 * @param {number} n - The number to format.
 * @param {number} decimals - Maximum fraction digits.
 * @returns {string} Formatted number string.
 */
export const fmtNum = (n, decimals = 2) =>
  new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: decimals,
  }).format(n ?? 0)

/**
 * Formats a date as DD/MM/YYYY.
 * @param {Date|string} date - The date to format.
 * @returns {string} Formatted date string.
 */
export const fmtDate = (date) => (date ? moment(date).format('DD/MM/YYYY') : '')
