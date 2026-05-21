/**
 * Node-compatible shim for src/constants/commons.js
 * Replaces the routes-dependent LANDING_PAGES and the moment-locale MONTH_NAMES
 * with static values safe for Node.js CLI context.
 */

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export const LANDING_PAGES = []
