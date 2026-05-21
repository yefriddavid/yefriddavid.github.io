import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { prefStorage } from './utils/storage'

import es from './locales/es.json'
import en from './locales/en.json'

export const LANGUAGES = [
  { code: 'es', label: 'Español', flag: '🇨🇴' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
]

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: prefStorage.getLang(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
