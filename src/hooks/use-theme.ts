import { useEffect } from 'react'
import { useAppStore } from '@/store/use-app-store'

export function useTheme() {
  const theme = useAppStore((s) => s.settings.theme)
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () =>
      document.documentElement.classList.toggle(
        'dark',
        theme === 'dark' || (theme === 'system' && query.matches),
      )
    apply()
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [theme])
  return theme
}
