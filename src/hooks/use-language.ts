import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { i18n } from '@/i18n'
import { useAppStore } from '@/store/use-app-store'
import type { Settings } from '@/types/application'

export function useLanguage() {
  const language = useAppStore((s) => s.settings.language)
  const setLanguage = useAppStore((s) => s.setLanguage)
  const { i18n: instance } = useTranslation()
  useEffect(() => {
    void instance.changeLanguage(language)
  }, [instance, language])
  return {
    language,
    setLanguage,
    changeLanguage: (next: Settings['language']) => {
      setLanguage(next)
      void i18n.changeLanguage(next)
    },
  }
}
