import moment from 'moment'
import 'moment/locale/es'

moment.locale(localStorage.getItem('lang') || 'es')

export default moment

/** Format date as storage/display format: '2024/Ene/15' */
export const formatDate = (date) => moment(date).format('YYYY/MMM/DD')

/** Format date as readable display: 'Ene 15, 2024' */
export const formatDisplayDate = (date) => moment(date).format('MMM DD, YYYY')

/** Format date as HTML input value: '2024-01-15' */
export const formatInputDate = (date) => moment(date).format('YYYY-MM-DD')
