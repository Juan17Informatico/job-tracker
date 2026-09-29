import { describe, expect, it } from 'vitest'
import { createBackup, parseBackup } from './backup'
import { emptyApplication } from '@/features/applications/schema'
const record = {
  ...emptyApplication(),
  company: 'Acme',
  position: 'Engineer',
  id: crypto.randomUUID(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
describe('versioned backups', () => {
  it('round trips records and theme', () => {
    const backup = createBackup([record], { theme: 'dark' })
    expect(parseBackup(JSON.stringify(backup))).toEqual(backup)
  })
  it.each([
    ['future version', { ...createBackup([], { theme: 'light' }), version: 2 }],
    [
      'unsafe URL',
      createBackup([{ ...record, jobUrl: 'javascript:alert(1)' }], { theme: 'light' }),
    ],
    ['duplicate IDs', createBackup([record, record], { theme: 'light' })],
    [
      'invalid salary',
      createBackup([{ ...record, salaryMin: 100, salaryMax: 50 }], { theme: 'light' }),
    ],
    ['invalid date', createBackup([{ ...record, appliedAt: '2026-02-30' }], { theme: 'light' })],
    ['missing fields', { version: 1, applications: [{}] }],
  ])('rejects %s', (_name, data) => expect(() => parseBackup(JSON.stringify(data))).toThrow())
})
