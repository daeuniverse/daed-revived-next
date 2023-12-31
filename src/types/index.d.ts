import { LANG, resources } from '~/i18n'

declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false
    defaultNS: 'translation'
    resources: { translation: (typeof resources)[LANG.enUS]['translation'] }
  }
}
