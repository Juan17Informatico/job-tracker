import { useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { useAppStore } from '@/store/use-app-store'
import { createBackup } from '@/storage/backup'
import {
  statuses,
  statusLabels,
  type ApplicationStatus,
  type JobApplication,
} from '@/types/application'
import { Stats } from './stats'
import { EmptyState } from './empty-state'
import { ApplicationCard } from './application-card'
import { filterApplications } from './selectors'
import { demoApplications } from './demo'
interface Props {
  onAdd: () => void
  onEdit: (a: JobApplication) => void
  opportunitiesOnly: boolean
}
export function Dashboard({ onAdd, onEdit, opportunitiesOnly }: Props) {
  const applications = useAppStore((s) => s.applications)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ApplicationStatus | 'all'>('all')
  const [sort, setSort] = useState('newest')
  const [view, setView] = useState('grid')
  const [deleting, setDeleting] = useState<JobApplication | null>(null)
  const filtered = filterApplications(applications, query, status).sort((a, b) =>
    sort === 'company'
      ? a.company.localeCompare(b.company)
      : sort === 'oldest'
        ? a.createdAt.localeCompare(b.createdAt)
        : b.createdAt.localeCompare(a.createdAt),
  )
  const loadDemo = () => {
    try {
      const store = useAppStore.getState()
      if (store.storageError) throw new Error('Recover your stored data in Settings first.')
      store.replaceData(createBackup(demoApplications(), store.settings))
      toast.success('Demo opportunities added. Make yourself at home.')
    } catch (e) {
      toast.error((e as Error).message)
    }
  }
  const remove = () => {
    if (!deleting) return
    try {
      useAppStore.getState().deleteApplication(deleting.id)
      setDeleting(null)
      toast.success('Opportunity deleted')
    } catch (e) {
      toast.error((e as Error).message)
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow heading-eyebrow">
            <span /> YOUR CAREER, WITH INTENTION
          </div>
          <h1>
            {opportunitiesOnly ? 'Your opportunities' : 'Job Tracker'}
            <span className="title-dot">.</span>
          </h1>
          <p>Track opportunities. Learn from the market.</p>
        </div>
        <Button onClick={onAdd}>
          <Plus size={18} />
          Add opportunity
        </Button>
      </div>
      {!opportunitiesOnly && <Stats applications={applications} />}
      {!opportunitiesOnly && (
        <div className="journey-strip">
          <span className="journey-icon">
            <Sprout size={18} />
          </span>
          <p>
            <strong>A little progress, every day.</strong>
            <span> Your next opportunity is out there. Let’s keep things moving.</span>
          </p>
          <ArrowUpRight size={17} />
        </div>
      )}
      <section className="opportunities-section" aria-labelledby="opportunities-title">
        <div className="section-heading">
          <div>
            <h2 id="opportunities-title">
              Your opportunities <span>{applications.length}</span>
            </h2>
            <p>A clear view of what’s next.</p>
          </div>
          <div className="view-switch" aria-label="View options">
            <button
              className={view === 'grid' ? 'selected' : ''}
              aria-label="Grid view"
              aria-pressed={view === 'grid'}
              onClick={() => setView('grid')}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={view === 'list' ? 'selected' : ''}
              aria-label="List view"
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
              placeholder="Search company, role, or technology…"
              aria-label="Search opportunities"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button aria-label="Clear search" onClick={() => setQuery('')}>
                <X size={15} />
              </button>
            )}
          </div>
          <div className="filter-select">
            <SlidersHorizontal size={15} />
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ApplicationStatus | 'all')}
            >
              <option value="all">All statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {statusLabels[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-select sort-select">
            <ArrowDownWideNarrow size={15} />
            <select
              aria-label="Sort opportunities"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="company">Company A–Z</option>
            </select>
          </div>
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
              Showing {filtered.length} of {applications.length} opportunities
              <span>Every application is a step forward.</span>
            </div>
          </>
        ) : (
          <EmptyState
            onAdd={onAdd}
            onDemo={loadDemo}
            filtered={applications.length > 0 || !!query || status !== 'all'}
            onReset={() => {
              setQuery('')
              setStatus('all')
            }}
          />
        )}
      </section>
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        title="Delete this opportunity?"
        description={`Your ${deleting?.position ?? ''} opportunity at ${deleting?.company ?? ''} and its notes will be permanently removed.`}
        confirmLabel="Delete opportunity"
        onConfirm={remove}
      />
    </>
  )
}
