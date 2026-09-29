import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowUpRight, BriefcaseBusiness, Check, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { TagInput } from '@/components/common/tag-input'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { useAppStore } from '@/store/use-app-store'
import {
  statuses,
  statusLabels,
  type ApplicationInput,
  type JobApplication,
} from '@/types/application'
import { applicationSchema, emptyApplication } from './schema'

interface Props {
  application: JobApplication | null
  open: boolean
  onClose: () => void
}
export function ApplicationSheet({ application, open, onClose }: Props) {
  const [discard, setDiscard] = useState(false)
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: application ?? emptyApplication(),
  })
  const requestClose = () => (isDirty ? setDiscard(true) : onClose())
  const error = (name: keyof ApplicationInput) =>
    errors[name] ? (
      <span className="field-error" role="alert">
        {errors[name]?.message}
      </span>
    ) : null
  const save = (values: ApplicationInput) => {
    try {
      if (application) useAppStore.getState().updateApplication(application.id, values)
      else useAppStore.getState().addApplication(values)
      toast.success(application ? 'Opportunity updated' : 'Opportunity added. One step closer!')
      onClose()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save opportunity')
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
            <span className="eyebrow">YOUR NEXT CHAPTER</span>
            <SheetTitle>{application ? 'Edit opportunity' : 'A new possibility.'}</SheetTitle>
            <SheetDescription>
              {application
                ? 'Keep the details up to date as things move forward.'
                : 'Start with the essentials. You can fill in the rest later.'}
            </SheetDescription>
          </div>
          <form onSubmit={handleSubmit(save)} className="opportunity-form">
            <div className="form-scroll">
              <div className="form-section-heading">
                <span>01</span>
                <h3>The essentials</h3>
                <small>* Required</small>
              </div>
              <div className="field">
                <label htmlFor="company">
                  Company <span>*</span>
                </label>
                <input
                  id="company"
                  autoFocus
                  placeholder="e.g. Linear"
                  {...register('company')}
                  aria-invalid={!!errors.company}
                />
                {error('company')}
              </div>
              <div className="field">
                <label htmlFor="position">
                  Position <span>*</span>
                </label>
                <input
                  id="position"
                  placeholder="e.g. Frontend Engineer"
                  {...register('position')}
                  aria-invalid={!!errors.position}
                />
                {error('position')}
              </div>
              <div className="field">
                <label htmlFor="jobUrl">
                  Job URL <ArrowUpRight size={13} />
                </label>
                <input
                  id="jobUrl"
                  placeholder="https://company.com/careers/…"
                  {...register('jobUrl')}
                />
                {error('jobUrl')}
              </div>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="status">Status</label>
                  <select id="status" {...register('status')}>
                    {statuses.map((status) => (
                      <option value={status} key={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="appliedAt">Application date</label>
                  <input id="appliedAt" type="date" {...register('appliedAt')} />
                  {error('appliedAt')}
                </div>
              </div>
              <div className="form-section-heading">
                <span>02</span>
                <h3>The role</h3>
                <small>Optional</small>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="location">Location</label>
                  <input
                    id="location"
                    placeholder="e.g. San Francisco, CA"
                    {...register('location')}
                  />
                  {error('location')}
                </div>
                <label className="checkbox-field">
                  <input type="checkbox" {...register('remote')} />
                  Remote friendly
                </label>
              </div>
              <div className="salary-fields">
                <div className="field">
                  <label htmlFor="salaryMin">Annual salary, from</label>
                  <input
                    id="salaryMin"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="80,000"
                    {...register('salaryMin', {
                      setValueAs: (v) =>
                        v === '' || v === null || v === undefined ? null : Number(v),
                    })}
                  />
                  {error('salaryMin')}
                </div>
                <div className="field">
                  <label htmlFor="salaryMax">To</label>
                  <input
                    id="salaryMax"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="120,000"
                    {...register('salaryMax', {
                      setValueAs: (v) =>
                        v === '' || v === null || v === undefined ? null : Number(v),
                    })}
                  />
                  {error('salaryMax')}
                </div>
                <div className="field">
                  <label htmlFor="currency">Currency</label>
                  <select id="currency" {...register('currency')}>
                    {['USD', 'EUR', 'GBP', 'CAD', 'COP', 'AUD'].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="technologies">Technologies</label>
                <Controller
                  name="technologies"
                  control={control}
                  render={({ field }) => (
                    <TagInput
                      id="technologies"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="React, TypeScript, …"
                    />
                  )}
                />
                <small>Press Enter or comma to add a tag.</small>
                {error('technologies')}
              </div>
              <div className="field">
                <label htmlFor="missingTechnologies">Skills to grow</label>
                <Controller
                  name="missingTechnologies"
                  control={control}
                  render={({ field }) => (
                    <TagInput
                      id="missingTechnologies"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Technologies you’d like to learn…"
                    />
                  )}
                />
                {error('missingTechnologies')}
              </div>
              <details className="extra-details" open={application ? true : undefined}>
                <summary>
                  A few more details <ChevronDown size={16} />
                </summary>
                <div className="field">
                  <label htmlFor="companyUrl">Company website</label>
                  <input
                    id="companyUrl"
                    placeholder="https://company.com"
                    {...register('companyUrl')}
                  />
                  {error('companyUrl')}
                </div>
                <div className="field">
                  <label htmlFor="source">Where did you find it?</label>
                  <input
                    id="source"
                    placeholder="LinkedIn, referral, company website…"
                    {...register('source')}
                  />
                  {error('source')}
                </div>
                <div className="field">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    rows={4}
                    placeholder="What stands out? Anything to follow up on?"
                    {...register('notes')}
                  />
                  {error('notes')}
                </div>
              </details>
            </div>
            <div className="sheet-footer">
              <span>
                <Check size={13} /> Saved on your device
              </span>
              <Button variant="outline" type="button" onClick={requestClose}>
                Cancel
              </Button>
              <Button type="submit">
                {application ? 'Save changes' : 'Add opportunity'}
                <ArrowUpRight size={16} />
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
      <ConfirmDialog
        open={discard}
        onOpenChange={setDiscard}
        title="Discard your changes?"
        description="The changes in this form haven’t been saved yet."
        confirmLabel="Discard changes"
        onConfirm={() => {
          setDiscard(false)
          onClose()
        }}
      />
    </>
  )
}
