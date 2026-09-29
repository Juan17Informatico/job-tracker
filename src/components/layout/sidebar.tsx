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
        aria-label="Close navigation"
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
            Your workspace<small>Personal space</small>
          </div>
          <span className="personal-dot" />
        </div>
        <div className="nav-caption">WORKSPACE</div>
        <nav aria-label="Main navigation">
          <button
            className={cn('nav-item', page === 'overview' && 'active')}
            onClick={() => navigate('overview')}
          >
            <LayoutDashboard size={18} />
            Overview
          </button>
          <button
            className={cn('nav-item', page === 'opportunities' && 'active')}
            onClick={() => navigate('opportunities')}
          >
            <BriefcaseBusiness size={18} />
            Opportunities<span className="nav-count">{count}</span>
          </button>
          <button
            className={cn('nav-item', page === 'technologies' && 'active')}
            onClick={() => navigate('technologies')}
          >
            <Code2 size={19} />
            Technologies
          </button>
          <div className="nav-item nav-disabled" aria-disabled="true">
            <ChartNoAxesCombined size={18} />
            Analytics<span className="soon-label">SOON</span>
          </div>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Sprout size={25} strokeWidth={1.5} />
            <h3>
              Small steps.
              <br />
              Big possibilities.
            </h3>
            <p>
              Your next chapter starts
              <br />
              with one opportunity.
            </p>
            <span>
              Keep moving forward <ArrowUpRight size={14} />
            </span>
          </div>
          <button
            className={cn('nav-item settings-nav', page === 'settings' && 'active')}
            onClick={() => navigate('settings')}
          >
            <Settings2 size={18} />
            Settings
            <ChevronRight size={15} className="ml-auto" />
          </button>
          <div className="theme-row">
            <span>Appearance</span>
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
                  aria-label={`${value} theme`}
                  aria-pressed={theme === value}
                  title={`${value[0].toUpperCase()}${value.slice(1)} theme`}
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
            <Compass size={12} /> A little direction for what’s next.
          </div>
        </div>
      </aside>
    </>
  )
}
