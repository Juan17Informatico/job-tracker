import { ArrowUpRight, CalendarDays, MapPin, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { formatDate, salaryLabel } from '@/lib/utils'
import { useAppStore } from '@/store/use-app-store'
import {
  statuses,
  statusLabels,
  type ApplicationStatus,
  type JobApplication,
} from '@/types/application'
export function ApplicationCard({
  application: a,
  onEdit,
  onDelete,
}: {
  application: JobApplication
  onEdit: () => void
  onDelete: () => void
}) {
  const salary = salaryLabel(a.salaryMin, a.salaryMax, a.currency)
  const tone = a.company.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0) % 5
  return (
    <article className="application-card">
      <div className="application-top">
        <span className={`company-avatar avatar-${tone}`}>
          {a.company.slice(0, 1).toUpperCase()}
        </span>
        <div className="company-name">
          {a.company}
          {a.source === 'Demo data' && <span className="sample-label">SAMPLE</span>}
        </div>
        <div className={`status-control status-${a.status}`}>
          <span className="status-dot" />
          <select
            aria-label={`Status for ${a.company} ${a.position}`}
            value={a.status}
            onChange={(e) => {
              try {
                useAppStore.getState().changeStatus(a.id, e.target.value as ApplicationStatus)
                toast.success('Status updated')
              } catch (e) {
                toast.error((e as Error).message)
              }
            }}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button className="position-link" onClick={onEdit}>
        {a.position}
      </button>
      <div className="application-location">
        <MapPin size={13} />
        {a.location || (a.remote ? 'Work from anywhere' : 'Location not specified')}
        {a.remote && (
          <>
            <span className="middle-dot">·</span>
            <span className="remote-label">Remote</span>
          </>
        )}
      </div>
      <div className="application-tags">
        {a.technologies.slice(0, 4).map((tag) => (
          <span className="tech-tag" key={tag}>
            {tag}
          </span>
        ))}
        {a.technologies.length > 4 && (
          <span className="tech-tag">+{a.technologies.length - 4}</span>
        )}
        {a.technologies.length === 0 && (
          <span className="no-technologies">Room to add a few skills</span>
        )}
      </div>
      <div className="application-salary">
        {salary ?? 'Salary not specified'}
        {salary && <span> / year · {a.currency}</span>}
      </div>
      <div className="application-bottom">
        <span>
          <CalendarDays size={13} />
          {a.appliedAt ? formatDate(a.appliedAt) : 'No date set'}
        </span>
        <div className="card-actions">
          {a.jobUrl && (
            <Button asChild variant="ghost" size="icon">
              <a
                href={a.jobUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open job at ${a.company}`}
                title="Open job listing"
              >
                <ArrowUpRight size={16} />
              </a>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${a.company} opportunity`}
            title="Edit opportunity"
            onClick={onEdit}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="delete-button"
            aria-label={`Delete ${a.company} opportunity`}
            title="Delete opportunity"
            onClick={onDelete}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </article>
  )
}
