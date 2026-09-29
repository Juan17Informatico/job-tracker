import type { ApplicationStatus, JobApplication } from '@/types/application'
export function filterApplications(
  applications: JobApplication[],
  query: string,
  status: ApplicationStatus | 'all',
) {
  const needle = query.trim().toLowerCase()
  return applications.filter(
    (a) =>
      (status === 'all' || a.status === status) &&
      [a.company, a.position, a.location, ...a.technologies, ...a.missingTechnologies]
        .join(' ')
        .toLowerCase()
        .includes(needle),
  )
}
export function applicationStats(applications: JobApplication[]) {
  const submitted = applications.filter((a) => a.status !== 'saved')
  const interviews = applications.filter((a) =>
    ['interview', 'technical_test'].includes(a.status),
  ).length
  const reachedInterview = applications.filter((a) =>
    ['interview', 'technical_test', 'offer'].includes(a.status),
  ).length
  return {
    total: applications.length,
    active: applications.filter((a) => !['saved', 'rejected', 'offer'].includes(a.status)).length,
    interviews,
    rate: submitted.length ? Math.round((reachedInterview / submitted.length) * 100) : 0,
  }
}
