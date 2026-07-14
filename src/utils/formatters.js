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
 * Formats a number as USD currency.
 * @param {number} n - The number to format.
 * @returns {string} Formatted currency string.
 */
export const fmtUSD = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

/**
 * Formats a number as compact COP currency (e.g. $1.2M, $850K).
 * @param {number} n - The number to format.
 * @returns {string} Formatted compact currency string.
 */
export const fmtCompact = (n) => {
  if (!n) return '$0'
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return fmt(n)
}
