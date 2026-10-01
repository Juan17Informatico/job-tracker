import { describe, expect, it } from 'vitest'
import { filterApplications, applicationStats } from './selectors'
import { demoApplications } from './demo'
describe('dashboard selectors', () => {
  const data = demoApplications()
  it('searches case-insensitively and combines with status', () => {
    expect(filterApplications(data, '  REACT ', 'all')).toHaveLength(6)
    expect(filterApplications(data, 'linear', 'interview')).toHaveLength(1)
    expect(filterApplications(data, 'linear', 'applied')).toHaveLength(0)
  })
  it('combines work mode, technology and applied date filters', () => {
    expect(
      filterApplications(data, {
        query: '',
        status: 'all',
        remote: 'remote',
        technology: 'React',
        missingTechnology: '',
        appliedAfter: '',
        appliedBefore: '',
      }),
    ).toHaveLength(5)
    expect(
      filterApplications(data, {
        query: '',
        status: 'all',
        remote: 'all',
        technology: '',
        missingTechnology: 'GraphQL',
        appliedAfter: '',
        appliedBefore: '',
      }),
    ).toHaveLength(1)
    expect(
      filterApplications(data, {
        query: '',
        status: 'all',
        remote: 'all',
        technology: '',
        missingTechnology: '',
        appliedAfter: data[0].appliedAt,
        appliedBefore: data[0].appliedAt,
      }),
    ).toHaveLength(6)
  })
  it('calculates current-state statistics and a safe empty rate', () => {
    expect(applicationStats(data)).toEqual({ total: 6, active: 4, interviews: 2, rate: 60 })
    expect(applicationStats([]).rate).toBe(0)
  })
})
