import {
  ArrowUpRight,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ChevronRight,
  Code2,
  Compass,
  LayoutDashboard,
  Monitor,
  Moon,
  Settings2,
  Sprout,
  Sun,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/use-app-store'
import { cn } from '@/lib/utils'
export type Page = 'overview' | 'opportunities' | 'technologies' | 'settings'
interface Props {
  page: Page
  onNavigate: (page: Page) => void
  open: boolean
  onClose: () => void
}
export function Sidebar({ page, onNavigate, open, onClose }: Props) {
  const { t } = useTranslation()
  const count = useAppStore((s) => s.applications.length)
  const theme = useAppStore((s) => s.settings.theme)
  const navigate = (next: Page) => {
    onNavigate(next)
    onClose()
  }
  return (
    <>
      <button
        className={cn('sidebar-backdrop', open && 'is-open')}
        aria-label={t('closeNavigation')}
        onClick={onClose}
      />
      <aside className={cn('sidebar', open && 'is-open')}>
        <a
          className="brand"
          href="#overview"
          onClick={(e) => {
            e.preventDefault()
            navigate('overview')
          }}
        >
          <span className="brand-mark">
            <BriefcaseBusiness size={21} strokeWidth={1.7} />
          </span>
          <span>
            job<span className="brand-light">tracker</span>
            <span className="brand-dot">.</span>
          </span>
        </a>
        <div className="workspace-label">
          <span className="workspace-avatar">Y</span>
          <div>
            {t('nav.workspace')}
            <small>{t('nav.personalSpace')}</small>
          </div>
          <span className="personal-dot" />
        </div>
        <div className="nav-caption">{t('nav.workspaceLabel')}</div>
        <nav aria-label={t('nav.workspaceLabel')}>
          <button
            className={cn('nav-item', page === 'overview' && 'active')}
            onClick={() => navigate('overview')}
          >
            <LayoutDashboard size={18} />
            {t('nav.overview')}
          </button>
          <button
            className={cn('nav-item', page === 'opportunities' && 'active')}
            onClick={() => navigate('opportunities')}
          >
            <BriefcaseBusiness size={18} />
            {t('nav.opportunities')}
            <span className="nav-count">{count}</span>
          </button>
          <button
            className={cn('nav-item', page === 'technologies' && 'active')}
            onClick={() => navigate('technologies')}
          >
            <Code2 size={19} />
            {t('nav.technologies')}
          </button>
          <div className="nav-item nav-disabled" aria-disabled="true">
            <ChartNoAxesCombined size={18} />
            {t('nav.analytics')}
            <span className="soon-label">{t('nav.soon')}</span>
          </div>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Sprout size={25} strokeWidth={1.5} />
            <h3>{t('nav.sidebarTitle')}</h3>
            <p>{t('nav.sidebarText')}</p>
            <span>
              {t('nav.keepMoving')} <ArrowUpRight size={14} />
            </span>
          </div>
          <button
            className={cn('nav-item settings-nav', page === 'settings' && 'active')}
            onClick={() => navigate('settings')}
          >
            <Settings2 size={18} />
            {t('nav.settings')}
            <ChevronRight size={15} className="ml-auto" />
          </button>
          <div className="theme-row">
            <span>{t('nav.appearance')}</span>
            <div className="theme-picker">
              {(
                [
                  { value: 'light', Icon: Sun },
                  { value: 'dark', Icon: Moon },
                  { value: 'system', Icon: Monitor },
                ] as const
              ).map(({ value, Icon }) => (
                <button
                  key={value}
                  aria-label={t(`settings.${value}Theme`)}
                  aria-pressed={theme === value}
                  title={t(`settings.${value}Theme`)}
                  className={cn(theme === value && 'selected')}
                  onClick={() => {
                    try {
                      useAppStore.getState().setTheme(value)
                    } catch (e) {
                      toast.error((e as Error).message)
                    }
                  }}
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>
          <div className="sidebar-foot">
            <Compass size={12} /> {t('nav.direction')}
          </div>
        </div>
      </aside>
    </>
  )
}
