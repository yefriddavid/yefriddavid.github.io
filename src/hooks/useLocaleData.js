import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

// Jan 1 2023 is a Sunday — so offset i gives day i (0=Sun, 1=Mon, ..., 6=Sat)
const SUNDAY_ANCHOR = new Date(2023, 0, 1)

const useLocaleData = () => {
  const { i18n } = useTranslation()
  const lang = i18n.language

  return useMemo(
    () => ({
      monthLabels: Array.from({ length: 12 }, (_, i) =>
        new Date(2023, i, 1).toLocaleDateString(lang, { month: 'long' }),
      ),
      dayNames: Array.from({ length: 7 }, (_, i) => {
        const d = new Date(SUNDAY_ANCHOR)
        d.setDate(SUNDAY_ANCHOR.getDate() + i)
        return d.toLocaleDateString(lang, { weekday: 'short' })
      }),
      dayNamesFull: Array.from({ length: 7 }, (_, i) => {
        const d = new Date(SUNDAY_ANCHOR)
        d.setDate(SUNDAY_ANCHOR.getDate() + i)
        const name = d.toLocaleDateString(lang, { weekday: 'long' })
        return name.charAt(0).toUpperCase() + name.slice(1)
      }),
    }),
    [lang],
  )
}

export default useLocaleData
