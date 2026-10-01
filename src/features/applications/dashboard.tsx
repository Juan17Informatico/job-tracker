import { useMemo, useState } from 'react'
import {
  ArrowDownWideNarrow,
  ArrowUpRight,
  LayoutGrid,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  Sprout,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { useAppStore } from '@/store/use-app-store'
import { createBackup } from '@/storage/backup'
import { statuses, type ApplicationStatus, type JobApplication } from '@/types/application'
import { Stats } from './stats'
import { EmptyState } from './empty-state'
import { ApplicationCard } from './application-card'
import { filterApplications, type ApplicationFilters } from './selectors'
import { demoApplications } from './demo'

interface Props {
  onAdd: () => void
  onEdit: (a: JobApplication) => void
  opportunitiesOnly: boolean
}
export function Dashboard({ onAdd, onEdit, opportunitiesOnly }: Props) {
  const { t } = useTranslation()
  const applications = useAppStore((s) => s.applications)
  const [filters, setFilters] = useState<ApplicationFilters>({
    query: '',
    status: 'all',
    remote: 'all',
    technology: '',
    missingTechnology: '',
    appliedAfter: '',
    appliedBefore: '',
  })
  const [sort, setSort] = useState('newest')
  const [view, setView] = useState('grid')
  const [deleting, setDeleting] = useState<JobApplication | null>(null)
  const technologies = useMemo(
    () =>
      [
        ...new Map(
          applications.flatMap((a) =>
            a.technologies.map((tag) => [tag.toLowerCase(), tag] as const),
          ),
        ).values(),
      ].sort(),
    [applications],
  )
  const missingTechnologies = useMemo(
    () =>
      [
        ...new Map(
          applications.flatMap((a) =>
            a.missingTechnologies.map((tag) => [tag.toLowerCase(), tag] as const),
          ),
        ).values(),
      ].sort(),
    [applications],
  )
  const filtered = filterApplications(applications, filters).sort((a, b) =>
    sort === 'company'
      ? a.company.localeCompare(b.company)
      : sort === 'oldest'
        ? a.createdAt.localeCompare(b.createdAt)
        : b.createdAt.localeCompare(a.createdAt),
  )
  const activeFilterCount = [
    !!filters.query,
    filters.status !== 'all',
    filters.remote !== 'all',
    !!filters.technology,
    !!filters.missingTechnology,
    !!filters.appliedAfter,
    !!filters.appliedBefore,
  ].filter(Boolean).length
  const update = (change: Partial<ApplicationFilters>) =>
    setFilters((current) => ({ ...current, ...change }))
  const reset = () =>
    setFilters({
      query: '',
      status: 'all',
      remote: 'all',
      technology: '',
      missingTechnology: '',
      appliedAfter: '',
      appliedBefore: '',
    })
  const loadDemo = () => {
    try {
      const store = useAppStore.getState()
      if (store.storageError) throw new Error(t('persistenceError'))
      store.replaceData(createBackup(demoApplications(), store.settings))
      toast.success(t('toastAdded'))
    } catch (e) {
      toast.error((e as Error).message)
    }
  }
  const remove = () => {
    if (!deleting) return
    try {
      useAppStore.getState().deleteApplication(deleting.id)
      setDeleting(null)
      toast.success(t('toastDeleted'))
    } catch (e) {
      toast.error((e as Error).message)
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow heading-eyebrow">
            <span /> {t('dashboard.eyebrow')}
          </div>
          <h1>
            {opportunitiesOnly ? t('dashboard.opportunitiesTitle') : t('dashboard.title')}
            <span className="title-dot">.</span>
          </h1>
          <p>{t('dashboard.subtitle')}</p>
        </div>
        <Button onClick={onAdd}>
          <Plus size={18} />
          {t('dashboard.add')}
        </Button>
      </div>
      {!opportunitiesOnly && <Stats applications={applications} />}
      {!opportunitiesOnly && (
        <div className="journey-strip">
          <span className="journey-icon">
            <Sprout size={18} />
          </span>
          <p>
            <strong>{t('dashboard.journey')}</strong>
            <span> {t('dashboard.journeyText')}</span>
          </p>
          <ArrowUpRight size={17} />
        </div>
      )}
      <section className="opportunities-section" aria-labelledby="opportunities-title">
        <div className="section-heading">
          <div>
            <h2 id="opportunities-title">
              {t('dashboard.opportunitiesTitle')} <span>{applications.length}</span>
            </h2>
            <p>{t('dashboard.opportunitiesSubtitle')}</p>
          </div>
          <div className="view-switch" aria-label={t('dashboard.grid')}>
            <button
              className={view === 'grid' ? 'selected' : ''}
              aria-label={t('dashboard.grid')}
              aria-pressed={view === 'grid'}
              onClick={() => setView('grid')}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={view === 'list' ? 'selected' : ''}
              aria-label={t('dashboard.list')}
              aria-pressed={view === 'list'}
              onClick={() => setView('list')}
            >
              <List size={17} />
            </button>
          </div>
        </div>
        <div className="filter-bar">
          <div className="search-box">
            <Search size={17} />
            <input
              placeholder={t('dashboard.search')}
              aria-label={t('dashboard.searchLabel')}
              value={filters.query}
              onChange={(e) => update({ query: e.target.value })}
            />
            {filters.query && (
              <button aria-label={t('common.clear')} onClick={() => update({ query: '' })}>
                <X size={15} />
              </button>
            )}
          </div>
          <div className="filter-select">
            <SlidersHorizontal size={15} />
            <select
              aria-label={t('dashboard.filterStatus')}
              value={filters.status}
              onChange={(e) => update({ status: e.target.value as ApplicationStatus | 'all' })}
            >
              <option value="all">{t('dashboard.allStatuses')}</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {t(`status.${s}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-select sort-select">
            <ArrowDownWideNarrow size={15} />
            <select
              aria-label={t('dashboard.sortLabel')}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">{t('dashboard.newest')}</option>
              <option value="oldest">{t('dashboard.oldest')}</option>
              <option value="company">{t('dashboard.companyAZ')}</option>
            </select>
          </div>
        </div>
        <div className="advanced-filters">
          <div className="filter-select">
            <select
              aria-label={t('filters.remote')}
              value={filters.remote}
              onChange={(e) => update({ remote: e.target.value as ApplicationFilters['remote'] })}
            >
              <option value="all">{t('filters.allWorkModes')}</option>
              <option value="remote">{t('filters.remoteOnly')}</option>
              <option value="onsite">{t('filters.onsiteOnly')}</option>
            </select>
          </div>
          <div className="filter-select">
            <select
              aria-label={t('filters.technology')}
              value={filters.technology}
              onChange={(e) => update({ technology: e.target.value })}
            >
              <option value="">{t('filters.allTechnologies')}</option>
              {technologies.map((tag) => (
                <option value={tag} key={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-select">
            <select
              aria-label={t('filters.missingTechnology')}
              value={filters.missingTechnology}
              onChange={(e) => update({ missingTechnology: e.target.value })}
            >
              <option value="">{t('filters.allMissing')}</option>
              {missingTechnologies.map((tag) => (
                <option value={tag} key={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
          <label className="date-filter">
            {t('filters.appliedAfter')}
            <input
              type="date"
              aria-label={t('filters.appliedAfter')}
              value={filters.appliedAfter}
              onChange={(e) => update({ appliedAfter: e.target.value })}
            />
          </label>
          <label className="date-filter">
            {t('filters.appliedBefore')}
            <input
              type="date"
              aria-label={t('filters.appliedBefore')}
              value={filters.appliedBefore}
              onChange={(e) => update({ appliedBefore: e.target.value })}
            />
          </label>
          {activeFilterCount > 0 && (
            <>
              <span className="filter-count">
                {t('filters.active', { count: activeFilterCount })}
              </span>
              <Button variant="ghost" size="sm" onClick={reset}>
                {t('filters.reset')}
              </Button>
            </>
          )}
        </div>
        {filtered.length ? (
          <>
            <div className={`applications-grid ${view === 'list' ? 'list-view' : ''}`}>
              {filtered.map((a) => (
                <ApplicationCard
                  key={a.id}
                  application={a}
                  onEdit={() => onEdit(a)}
                  onDelete={() => setDeleting(a)}
                />
              ))}
            </div>
            <div className="list-count">
              {t('dashboard.showing', { shown: filtered.length, total: applications.length })}
              <span>{t('dashboard.step')}</span>
            </div>
          </>
        ) : (
          <EmptyState
            onAdd={onAdd}
            onDemo={loadDemo}
            filtered={applications.length > 0 || !!filters.query || activeFilterCount > 0}
            onReset={reset}
          />
        )}
      </section>
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        title={t('deleteDialog.title')}
        description={t('deleteDialog.description', {
          position: deleting?.position ?? '',
          company: deleting?.company ?? '',
        })}
        confirmLabel={t('deleteDialog.confirm')}
        onConfirm={remove}
      />
    </>
  )
}
