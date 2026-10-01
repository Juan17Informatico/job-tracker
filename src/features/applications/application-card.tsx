import { ArrowUpRight, CalendarDays, MapPin, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { formatDate, salaryLabel } from '@/lib/utils'
import { useAppStore } from '@/store/use-app-store'
import { statuses, type ApplicationStatus, type JobApplication } from '@/types/application'
export function ApplicationCard({
  application: a,
  onEdit,
  onDelete,
}: {
  application: JobApplication
  onEdit: () => void
  onDelete: () => void
}) {
  const { t, i18n } = useTranslation()
  const salary = salaryLabel(a.salaryMin, a.salaryMax, a.currency, i18n.language, {
    from: t('common.from'),
    upTo: t('common.upTo'),
  })
  const tone = a.company.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0) % 5
  return (
    <article className="application-card">
      <div className="application-top">
        <span className={`company-avatar avatar-${tone}`}>
          {a.company.slice(0, 1).toUpperCase()}
        </span>
        <div className="company-name">
          {a.company}
          {a.source === 'Demo data' && <span className="sample-label">{t('common.sample')}</span>}
        </div>
        <div className={`status-control status-${a.status}`}>
          <span className="status-dot" />
          <select
            aria-label={t('card.statusFor', { company: a.company, position: a.position })}
            value={a.status}
            onChange={(e) => {
              try {
                useAppStore.getState().changeStatus(a.id, e.target.value as ApplicationStatus)
                toast.success(t('card.statusUpdated'))
              } catch (e) {
                toast.error((e as Error).message)
              }
            }}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {t(`status.${s}`)}
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
        {a.location || (a.remote ? t('card.anywhere') : t('card.locationMissing'))}
        {a.remote && (
          <>
            <span className="middle-dot">·</span>
            <span className="remote-label">{t('common.remote')}</span>
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
          <span className="no-technologies">{t('card.roomToAdd')}</span>
        )}
      </div>
      <div className="application-salary">
        {salary ?? t('card.salaryMissing')}
        {salary && (
          <span>
            {' '}
            {t('common.year')} · {a.currency}
          </span>
        )}
      </div>
      <div className="application-bottom">
        <span>
          <CalendarDays size={13} />
          {a.appliedAt ? formatDate(a.appliedAt, i18n.language) : t('common.noDate')}
        </span>
        <div className="card-actions">
          {a.jobUrl && (
            <Button asChild variant="ghost" size="icon">
              <a
                href={a.jobUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`${t('card.openJob')} ${a.company}`}
                title={t('card.openJob')}
              >
                <ArrowUpRight size={16} />
              </a>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label={`${t('card.edit')} ${a.company} ${t('card.opportunitySuffix')}`}
            title={t('card.edit')}
            onClick={onEdit}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="delete-button"
            aria-label={`${t('card.delete')} ${a.company} ${t('card.opportunitySuffix')}`}
            title={t('card.delete')}
            onClick={onDelete}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </article>
  )
}
