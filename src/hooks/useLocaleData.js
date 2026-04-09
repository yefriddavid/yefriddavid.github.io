import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import moment from 'src/utils/moment'

/**
 * Returns locale-sensitive date labels that update reactively when
 * the i18n language changes.
 *
 * - monthLabels: full month names in the current locale (Jan→'January' / 'enero')
 * - dayNames:    short weekday names starting from Sunday (0='Dom'/'Sun')
 */
const useLocaleData = () => {
  const { i18n } = useTranslation()
  const lang = i18n.language

  return useMemo(
    () => ({
      monthLabels: moment.localeData(lang).months(),
      dayNames: moment.localeData(lang).weekdaysShort(),
    }),
    [lang],
  )
}

export default useLocaleData
