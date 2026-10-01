import { describe, expect, it } from 'vitest'
import { createBackup, migrateV1, parseBackup } from './backup'
import { emptyApplication } from '@/features/applications/schema'
import type { BackupV1 } from '@/types/application'
const record = {
  ...emptyApplication(),
  company: 'Acme',
  position: 'Engineer',
  id: crypto.randomUUID(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  statusHistory: [
    { id: crypto.randomUUID(), status: 'saved' as const, occurredAt: new Date().toISOString() },
  ],
  interviews: [],
}
describe('versioned backups', () => {
  it('round trips records, settings and V2 metadata', () => {
    const backup = createBackup(
      [
        {
          ...record,
          interviews: [
            {
              id: crypto.randomUUID(),
              type: 'technical' as const,
              scheduledAt: new Date().toISOString(),
              notes: 'Pairing exercise',
            },
          ],
        },
      ],
      { theme: 'dark', language: 'es' },
    )
    expect(parseBackup(JSON.stringify(backup))).toEqual(backup)
    expect(backup.version).toBe(2)
    expect(backup.settings.language).toBe('es')
    expect(backup.applications[0].interviews[0].notes).toBe('Pairing exercise')
  })
  it('migrates V1 records into V2 with an initial status event', () => {
    const legacyRecord = { ...record } as BackupV1['applications'][number]
    const v1: BackupV1 = {
      version: 1,
      exportedAt: new Date().toISOString(),
      applications: [legacyRecord],
      settings: { theme: 'light' },
    }
    const migrated = migrateV1(v1, 'es')
    expect(migrated.version).toBe(2)
    expect(migrated.settings.language).toBe('es')
    expect(migrated.applications[0].statusHistory).toHaveLength(1)
    expect(migrated.applications[0].statusHistory[0].status).toBe('saved')
    expect(migrated.applications[0].interviews).toEqual([])
    expect(migrateV1(v1, 'es')).toEqual(migrated)
    expect(parseBackup(JSON.stringify(v1))).toMatchObject({
      version: 2,
      settings: { language: 'en' },
    })
  })
  it.each([
    ['future version', { ...createBackup([], { theme: 'light' }), version: 3 }],
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
