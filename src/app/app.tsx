import { useEffect, useState } from 'react'
import { ChevronRight, CircleHelp, LockKeyhole, Menu, X } from 'lucide-react'
import { Toaster } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Sidebar, type Page } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { Dashboard } from '@/features/applications/dashboard'
import { ApplicationSheet } from '@/features/applications/application-sheet'
import { TechnologiesPage } from '@/features/technologies/technologies-page'
import { SettingsPage } from '@/features/settings/settings-page'
import { useTheme } from '@/hooks/use-theme'
import { useLanguage } from '@/hooks/use-language'
import { useAppStore } from '@/store/use-app-store'
import type { JobApplication } from '@/types/application'

export default function App() {
  const { t } = useTranslation()
  const [page, setPage] = useState<Page>('overview')
  const [menu, setMenu] = useState(false)
  const [sheet, setSheet] = useState<{ application: JobApplication | null } | null>(null)
  const [help, setHelp] = useState(false)
  const storageError = useAppStore((s) => s.storageError)
  const theme = useTheme()
  useLanguage()
  const pageLabels = {
    overview: t('nav.overview'),
    opportunities: t('nav.opportunities'),
    technologies: t('nav.technologies'),
    settings: t('nav.settings'),
  }
  const add = () => setSheet({ application: null })
  useEffect(() => {
    if (!menu) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenu(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [menu])
  return (
    <div className="app-shell">
      <Sidebar page={page} onNavigate={setPage} open={menu} onClose={() => setMenu(false)} />
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <Button
              size="icon"
              variant="ghost"
              className="mobile-menu"
              onClick={() => setMenu(!menu)}
              aria-label={menu ? t('closeNavigation') : t('openNavigation')}
            >
              {menu ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <span>{t('nav.workspace')}</span>
            <ChevronRight size={13} />
            <strong>{pageLabels[page]}</strong>
          </div>
          <div className="topbar-right">
            <span className="local-indicator">
              <span />
              {t('common.allLocal')}
            </span>
            <span className="topbar-divider" />
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('nav.workspace')}
              onClick={() => setHelp(!help)}
              aria-expanded={help}
            >
              <CircleHelp size={18} />
            </Button>
            <span className="user-avatar" title={t('yourWorkspace')}>
              Y
            </span>
          </div>
        </header>
        {help && (
          <div className="help-banner">
            <LockKeyhole size={19} />
            <p>{t('help')}</p>
            <Button
              size="icon"
              variant="ghost"
              aria-label={t('closeHelp')}
              onClick={() => setHelp(false)}
            >
              <X size={16} />
            </Button>
          </div>
        )}
        <main className="main-content">
          {storageError && (
            <div className="storage-warning" role="alert">
              {t('storageError')}
              <Button variant="outline" size="sm" onClick={() => setPage('settings')}>
                {t('storageOpen')}
              </Button>
            </div>
          )}
          {(page === 'overview' || page === 'opportunities') && (
            <Dashboard
              onAdd={add}
              onEdit={(application) => setSheet({ application })}
              opportunitiesOnly={page === 'opportunities'}
            />
          )}
          {page === 'technologies' && <TechnologiesPage onAdd={add} />}
          {page === 'settings' && <SettingsPage />}
          <footer className="page-footer">
            <span>
              <LockKeyhole size={12} />
              {t('footer')}
            </span>
            <span>
              {t('footerMade')} <span className="footer-star">✳</span>
            </span>
          </footer>
        </main>
      </div>
      {sheet && (
        <ApplicationSheet
          key={sheet.application?.id ?? 'new'}
          open
          application={sheet.application}
          onClose={() => setSheet(null)}
        />
      )}
      <Toaster richColors position="bottom-right" theme={theme} closeButton />
    </div>
  )
}
