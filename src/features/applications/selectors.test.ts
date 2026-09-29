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
  it('calculates current-state statistics and a safe empty rate', () => {
    expect(applicationStats(data)).toEqual({ total: 6, active: 4, interviews: 2, rate: 60 })
    expect(applicationStats([]).rate).toBe(0)
  })
})
