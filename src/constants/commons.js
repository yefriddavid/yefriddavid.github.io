import moment from 'src/utils/moment'
import routes from 'src/routes'

/** Full month names in English — used as Firestore data keys, never for display. */
export const MONTH_NAMES = moment.localeData('en').months()

/** Available landing pages — derived from routes flagged with landingPage: true. */
export const LANDING_PAGES = routes
  .filter((r) => r.landingPage)
  .map((r) => ({ value: r.path, label: r.longName ?? r.name }))
