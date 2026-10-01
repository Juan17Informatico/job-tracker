import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowUpRight, BriefcaseBusiness, Check, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { TagInput } from '@/components/common/tag-input'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { useAppStore } from '@/store/use-app-store'
import {
  statuses,
  type ApplicationInput,
  type InterviewEvent,
  type InterviewType,
  type JobApplication,
} from '@/types/application'
import { formatDate, formatDateTime } from '@/lib/utils'
import { applicationSchema, emptyApplication } from './schema'

interface Props {
  application: JobApplication | null
  open: boolean
  onClose: () => void
}
const interviewTypes: InterviewType[] = ['recruiter', 'technical', 'behavioral', 'final', 'other']

export function ApplicationSheet({ application, open, onClose }: Props) {
  const { t, i18n } = useTranslation()
  const [discard, setDiscard] = useState(false)
  const [interviewDraft, setInterviewDraft] = useState<Partial<InterviewEvent> | null>(null)
  const [interviewType, setInterviewType] = useState<InterviewType>('recruiter')
  const [interviewDate, setInterviewDate] = useState('')
  const [interviewCompleted, setInterviewCompleted] = useState('')
  const [interviewNotes, setInterviewNotes] = useState('')
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: application ?? emptyApplication(),
  })
  const timeline = useMemo(
    () =>
      application
        ? [...application.statusHistory].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))
        : [],
    [application],
  )
  const requestClose = () => (isDirty ? setDiscard(true) : onClose())
  const error = (name: keyof ApplicationInput) =>
    errors[name] ? (
      <span className="field-error" role="alert">
        {t(`errors.${String(errors[name]?.message)}`)}
      </span>
    ) : null
  const save = (values: ApplicationInput) => {
    try {
      if (application) {
        useAppStore.getState().updateApplication(application.id, values)
        toast.success(t('toastUpdated'))
      } else {
        useAppStore.getState().addApplication(values)
        toast.success(t('toastAdded'))
      }
      onClose()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('saveError'))
    }
  }
  const resetInterview = () => {
    setInterviewDraft(null)
    setInterviewType('recruiter')
    setInterviewDate('')
    setInterviewCompleted('')
    setInterviewNotes('')
  }
  const openInterview = (interview?: InterviewEvent) => {
    setInterviewDraft(interview ?? {})
    setInterviewType(interview?.type ?? 'recruiter')
    setInterviewDate(interview?.scheduledAt.slice(0, 16) ?? '')
    setInterviewCompleted(interview?.completedAt?.slice(0, 16) ?? '')
    setInterviewNotes(interview?.notes ?? '')
  }
  const saveInterview = () => {
    if (!application || !interviewDate) return
    try {
      const input = {
        type: interviewType,
        scheduledAt: new Date(interviewDate).toISOString(),
        ...(interviewCompleted ? { completedAt: new Date(interviewCompleted).toISOString() } : {}),
        ...(interviewNotes ? { notes: interviewNotes } : {}),
      }
      if (interviewDraft?.id) {
        useAppStore.getState().updateInterview(application.id, interviewDraft.id, input)
        toast.success(t('interviews.updated'))
      } else {
        useAppStore.getState().addInterview(application.id, input)
        toast.success(t('interviews.added'))
      }
      resetInterview()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('interviews.saveError'))
    }
  }
  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(value) => {
          if (!value) requestClose()
        }}
      >
        <SheetContent>
          <div className="sheet-header">
            <span className="sheet-symbol">
              <BriefcaseBusiness size={22} />
            </span>
            <span className="eyebrow">
              {(application ? t('form.editTitle') : t('form.newTitle')).toUpperCase()}
            </span>
            <SheetTitle>{application ? t('form.editTitle') : t('form.newTitle')}</SheetTitle>
            <SheetDescription>
              {application ? t('form.editDescription') : t('form.newDescription')}
            </SheetDescription>
          </div>
          <form onSubmit={handleSubmit(save)} className="opportunity-form">
            <div className="form-scroll">
              <div className="form-section-heading">
                <span>01</span>
                <h3>{t('form.sectionEssentials')}</h3>
                <small>{t('form.requiredHint')}</small>
              </div>
              <div className="field">
                <label htmlFor="company">
                  {t('form.company')} <span>*</span>
                </label>
                <input
                  id="company"
                  autoFocus
                  placeholder={t('form.companyPlaceholder')}
                  {...register('company')}
                  aria-invalid={!!errors.company}
                />
                {error('company')}
              </div>
              <div className="field">
                <label htmlFor="position">
                  {t('form.position')} <span>*</span>
                </label>
                <input
                  id="position"
                  placeholder={t('form.positionPlaceholder')}
                  {...register('position')}
                  aria-invalid={!!errors.position}
                />
                {error('position')}
              </div>
              <div className="field">
                <label htmlFor="jobUrl">
                  {t('form.jobUrl')} <ArrowUpRight size={13} />
                </label>
                <input
                  id="jobUrl"
                  placeholder={t('form.jobUrlPlaceholder')}
                  {...register('jobUrl')}
                />
                {error('jobUrl')}
              </div>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="status">{t('form.status')}</label>
                  <select id="status" {...register('status')}>
                    {statuses.map((status) => (
                      <option value={status} key={status}>
                        {t(`status.${status}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="appliedAt">{t('form.applicationDate')}</label>
                  <input id="appliedAt" type="date" {...register('appliedAt')} />
                  {error('appliedAt')}
                </div>
              </div>
              <div className="form-section-heading">
                <span>02</span>
                <h3>{t('form.sectionRole')}</h3>
                <small>{t('form.optionalHint')}</small>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="location">{t('form.location')}</label>
                  <input
                    id="location"
                    placeholder={t('form.locationPlaceholder')}
                    {...register('location')}
                  />
                  {error('location')}
                </div>
                <label className="checkbox-field">
                  <input type="checkbox" {...register('remote')} />
                  {t('form.remoteFriendly')}
                </label>
              </div>
              <div className="salary-fields">
                <div className="field">
                  <label htmlFor="salaryMin">{t('form.salaryFrom')}</label>
                  <input
                    id="salaryMin"
                    type="number"
                    min="0"
                    step="any"
                    placeholder={t('form.salaryMinPlaceholder')}
                    {...register('salaryMin', {
                      setValueAs: (v) =>
                        v === '' || v === null || v === undefined ? null : Number(v),
                    })}
                  />
                  {error('salaryMin')}
                </div>
                <div className="field">
                  <label htmlFor="salaryMax">{t('form.salaryTo')}</label>
                  <input
                    id="salaryMax"
                    type="number"
                    min="0"
                    step="any"
                    placeholder={t('form.salaryMaxPlaceholder')}
                    {...register('salaryMax', {
                      setValueAs: (v) =>
                        v === '' || v === null || v === undefined ? null : Number(v),
                    })}
                  />
                  {error('salaryMax')}
                </div>
                <div className="field">
                  <label htmlFor="currency">{t('form.currency')}</label>
                  <select id="currency" {...register('currency')}>
                    {['USD', 'EUR', 'GBP', 'CAD', 'COP', 'AUD'].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="technologies">{t('form.technologies')}</label>
                <Controller
                  name="technologies"
                  control={control}
                  render={({ field }) => (
                    <TagInput
                      id="technologies"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t('form.technologiesPlaceholder')}
                    />
                  )}
                />
                <small>{t('form.technologyHint')}</small>
                {error('technologies')}
              </div>
              <div className="field">
                <label htmlFor="missingTechnologies">{t('form.missing')}</label>
                <Controller
                  name="missingTechnologies"
                  control={control}
                  render={({ field }) => (
                    <TagInput
                      id="missingTechnologies"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t('form.missingPlaceholder')}
                    />
                  )}
                />
                {error('missingTechnologies')}
              </div>
              <details className="extra-details" open={application ? true : undefined}>
                <summary>
                  {t('form.moreDetails')} <ChevronDown size={16} />
                </summary>
                <div className="field">
                  <label htmlFor="companyUrl">{t('form.companyUrl')}</label>
                  <input
                    id="companyUrl"
                    placeholder={t('form.companyUrlPlaceholder')}
                    {...register('companyUrl')}
                  />
                  {error('companyUrl')}
                </div>
                <div className="field">
                  <label htmlFor="source">{t('form.source')}</label>
                  <input
                    id="source"
                    placeholder={t('form.sourcePlaceholder')}
                    {...register('source')}
                  />
                  {error('source')}
                </div>
                <div className="field">
                  <label htmlFor="notes">{t('form.notes')}</label>
                  <textarea
                    id="notes"
                    rows={4}
                    placeholder={t('form.notesPlaceholder')}
                    {...register('notes')}
                  />
                  {error('notes')}
                </div>
              </details>
              {application && (
                <div className="detail-section">
                  <div className="form-section-heading">
                    <span>03</span>
                    <h3>{t('timeline.title')}</h3>
                    <small>{timeline.length}</small>
                  </div>
                  <div className="timeline">
                    {timeline.length ? (
                      timeline.map((event) => (
                        <div className="timeline-item" key={event.id}>
                          <span className={`timeline-dot status-${event.status}`} />
                          <div>
                            <strong>{t(`status.${event.status}`)}</strong>
                            <time>{formatDate(event.occurredAt.slice(0, 10), i18n.language)}</time>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="muted-copy">{t('timeline.empty')}</p>
                    )}
                  </div>
                </div>
              )}
              {application && (
                <div className="detail-section">
                  <div className="form-section-heading">
                    <span>04</span>
                    <h3>{t('interviews.title')}</h3>
                    <button type="button" className="text-link" onClick={() => openInterview()}>
                      {t('interviews.add')}
                    </button>
                  </div>
                  {application.interviews.length ? (
                    <div className="interview-list">
                      {application.interviews.map((interview) => (
                        <div className="interview-item" key={interview.id}>
                          <div>
                            <strong>{t(`interviews.${interview.type}`)}</strong>
                            <time>
                              {formatDateTime(interview.scheduledAt, i18n.language)}
                              {interview.completedAt
                                ? ` · ${t('interviews.completedShort')} ${formatDateTime(interview.completedAt, i18n.language)}`
                                : ''}
                            </time>
                            {interview.notes && <p>{interview.notes}</p>}
                          </div>
                          <div>
                            <button
                              type="button"
                              className="text-link"
                              onClick={() => openInterview(interview)}
                            >
                              {t('common.edit')}
                            </button>
                            <button
                              type="button"
                              className="text-link danger-link"
                              onClick={() => {
                                useAppStore.getState().deleteInterview(application.id, interview.id)
                                toast.success(t('interviews.deleted'))
                              }}
                            >
                              {t('common.delete')}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="muted-copy">{t('interviews.empty')}</p>
                  )}
                  {interviewDraft && (
                    <div className="interview-editor">
                      <div className="form-grid">
                        <div className="field">
                          <label htmlFor="interviewType">{t('interviews.type')}</label>
                          <select
                            id="interviewType"
                            value={interviewType}
                            onChange={(e) => setInterviewType(e.target.value as InterviewType)}
                          >
                            {interviewTypes.map((type) => (
                              <option key={type} value={type}>
                                {t(`interviews.${type}`)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="field">
                          <label htmlFor="interviewDate">{t('interviews.scheduled')}</label>
                          <input
                            id="interviewDate"
                            type="datetime-local"
                            value={interviewDate}
                            onChange={(e) => setInterviewDate(e.target.value)}
                          />
                        </div>
                        <div className="field">
                          <label htmlFor="interviewCompleted">{t('interviews.completed')}</label>
                          <input
                            id="interviewCompleted"
                            type="datetime-local"
                            value={interviewCompleted}
                            onChange={(e) => setInterviewCompleted(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="field">
                        <label htmlFor="interviewNotes">{t('interviews.notes')}</label>
                        <textarea
                          id="interviewNotes"
                          rows={3}
                          placeholder={t('interviews.notesPlaceholder')}
                          value={interviewNotes}
                          onChange={(e) => setInterviewNotes(e.target.value)}
                        />
                      </div>
                      <div className="interview-actions">
                        <Button type="button" variant="outline" onClick={resetInterview}>
                          {t('common.cancel')}
                        </Button>
                        <Button type="button" onClick={saveInterview} disabled={!interviewDate}>
                          {t('interviews.save')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="sheet-footer">
              <span>
                <Check size={13} /> {t('common.savedOnDevice')}
              </span>
              <Button variant="outline" type="button" onClick={requestClose}>
                {t('common.cancel')}
              </Button>
              <Button type="submit">
                {application ? t('form.saveChanges') : t('form.add')}
                <ArrowUpRight size={16} />
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
      <ConfirmDialog
        open={discard}
        onOpenChange={setDiscard}
        title={t('form.discardTitle')}
        description={t('form.discardText')}
        confirmLabel={t('form.discardConfirm')}
        onConfirm={() => {
          setDiscard(false)
          onClose()
        }}
      />
    </>
  )
}
