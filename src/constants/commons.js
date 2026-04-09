import moment from 'moment'

/** Full list of month names in English (used with moment locale). */
export const MONTH_NAMES = moment.localeData('en').months()

/** Short weekday names: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] */
export const DAY_NAMES = moment.weekdaysShort()
