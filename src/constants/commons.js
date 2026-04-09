import moment from 'src/utils/moment'

/** Full month names in English — used as Firestore data keys, never for display. */
export const MONTH_NAMES = moment.localeData('en').months()
