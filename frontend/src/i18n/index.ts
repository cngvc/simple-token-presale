import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import arTranslation from '@/i18n/locales/ar/translation.json'
import cnTranslation from '@/i18n/locales/cn/translation.json'
import deTranslation from '@/i18n/locales/de/translation.json'
import enTranslation from '@/i18n/locales/en/translation.json'
import frTranslation from '@/i18n/locales/fr/translation.json'
import idTranslation from '@/i18n/locales/id/translation.json'
import itTranslation from '@/i18n/locales/it/translation.json'
import ptTranslation from '@/i18n/locales/pt/translation.json'
import ruTranslation from '@/i18n/locales/ru/translation.json'
import thTranslation from '@/i18n/locales/th/translation.json'
import trTranslation from '@/i18n/locales/tr/translation.json'
import vnTranslation from '@/i18n/locales/vn/translation.json'

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: {
      gb: {
        translation: enTranslation
      },
      ar: {
        translation: arTranslation
      },
      cn: {
        translation: cnTranslation
      },
      de: {
        translation: deTranslation
      },
      id: {
        translation: idTranslation
      },
      it: {
        translation: itTranslation
      },
      pt: {
        translation: ptTranslation
      },
      ru: {
        translation: ruTranslation
      },
      fr: {
        translation: frTranslation
      },
      tr: {
        translation: trTranslation
      },
      vn: {
        translation: vnTranslation
      },
      th: {
        translation: thTranslation
      }
    },
    lng: localStorage.getItem('language') ?? 'gb',
    fallbackLng: 'gb',
    interpolation: {
      escapeValue: false
    }
  })
export default i18n
