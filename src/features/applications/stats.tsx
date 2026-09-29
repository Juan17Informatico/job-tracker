import { ArrowUpRight, BriefcaseBusiness, MessagesSquare, MousePointer2, Send } from 'lucide-react'
import { applicationStats } from './selectors'
import type { JobApplication } from '@/types/application'
export function Stats({ applications }: { applications: JobApplication[] }) {
  const stats = applicationStats(applications)
  const items = [
    {
      label: 'Applications',
      value: stats.total,
      caption: 'Every possibility, in one place',
      Icon: BriefcaseBusiness,
      className: 'stat-neutral',
    },
    {
      label: 'Active applications',
      value: stats.active,
      caption: 'Conversations in motion',
      Icon: Send,
      className: 'stat-orange',
    },
    {
      label: 'Interviews',
      value: stats.interviews,
      caption: 'A chance to make an impression',
      Icon: MessagesSquare,
      className: 'stat-purple',
    },
    {
      label: 'Interview rate',
      value: `${stats.rate}%`,
      caption: 'Interview, test or offer / submitted',
      Icon: MousePointer2,
      className: 'stat-green',
    },
  ]
  return (
    <section className="stats-grid" aria-label="Application statistics">
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
