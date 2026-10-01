import { ArrowUpRight, BriefcaseBusiness, MessagesSquare, MousePointer2, Send } from 'lucide-react'
import { applicationStats } from './selectors'
import type { JobApplication } from '@/types/application'
import { useTranslation } from 'react-i18next'
export function Stats({ applications }: { applications: JobApplication[] }) {
  const { t } = useTranslation()
  const stats = applicationStats(applications)
  const items = [
    {
      label: t('dashboard.stats.applications'),
      value: stats.total,
      caption: t('dashboard.stats.every'),
      Icon: BriefcaseBusiness,
      className: 'stat-neutral',
    },
    {
      label: t('dashboard.stats.active'),
      value: stats.active,
      caption: t('dashboard.stats.motion'),
      Icon: Send,
      className: 'stat-orange',
    },
    {
      label: t('dashboard.stats.interviews'),
      value: stats.interviews,
      caption: t('dashboard.stats.impression'),
      Icon: MessagesSquare,
      className: 'stat-purple',
    },
    {
      label: t('dashboard.stats.rate'),
      value: `${stats.rate}%`,
      caption: t('dashboard.stats.rateHelp'),
      Icon: MousePointer2,
      className: 'stat-green',
    },
  ]
  return (
    <section className="stats-grid" aria-label={t('dashboard.stats.applications')}>
      {items.map(({ label, value, caption, Icon, className }) => (
        <div className={`stat-card ${className}`} key={label}>
          <div className="stat-top">
            <span>{label}</span>
            <Icon size={17} strokeWidth={1.6} />
          </div>
          <div className="stat-value">
            {value}
            <span className="stat-dash">
              <ArrowUpRight size={17} />
            </span>
          </div>
          <p>{caption}</p>
        </div>
      ))}
    </section>
  )
}
