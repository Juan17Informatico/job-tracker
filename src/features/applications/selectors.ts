import type { ApplicationStatus, JobApplication } from '@/types/application'
export interface ApplicationFilters {
  query: string
  status: ApplicationStatus | 'all'
  remote: 'all' | 'remote' | 'onsite'
  technology: string
  missingTechnology: string
  appliedAfter: string
  appliedBefore: string
}
export function filterApplications(
  applications: JobApplication[],
  queryOrFilters: string | ApplicationFilters,
  status: ApplicationStatus | 'all' = 'all',
) {
  const filters: ApplicationFilters =
    typeof queryOrFilters === 'string'
      ? {
          query: queryOrFilters,
          status,
          remote: 'all',
          technology: '',
          missingTechnology: '',
          appliedAfter: '',
          appliedBefore: '',
        }
      : queryOrFilters
  const needle = filters.query.trim().toLowerCase()
  return applications.filter(
    (a) =>
      (filters.status === 'all' || a.status === filters.status) &&
      (filters.remote === 'all' || (filters.remote === 'remote' ? a.remote : !a.remote)) &&
      (!filters.technology ||
        a.technologies.some((tag) => tag.toLowerCase() === filters.technology.toLowerCase())) &&
      (!filters.missingTechnology ||
        a.missingTechnologies.some(
          (tag) => tag.toLowerCase() === filters.missingTechnology.toLowerCase(),
        )) &&
      (!filters.appliedAfter || !a.appliedAt || a.appliedAt >= filters.appliedAfter) &&
      (!filters.appliedBefore || !a.appliedAt || a.appliedAt <= filters.appliedBefore) &&
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
