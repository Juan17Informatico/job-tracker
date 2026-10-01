import { beforeEach, describe, expect, it } from 'vitest'
import { emptyApplication } from '@/features/applications/schema'
import { STORAGE_KEY, localStorageService } from './storage'

beforeEach(() => localStorage.clear())

describe('local storage migration', () => {
  it('rewrites a valid V1 envelope as V2 after loading it', () => {
    const application = {
      ...emptyApplication(),
      company: 'Acme',
      position: 'Engineer',
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        exportedAt: new Date().toISOString(),
        applications: [application],
        settings: { theme: 'system' },
      }),
    )

    const loaded = localStorageService.load()
    expect(loaded?.version).toBe(2)
    expect(loaded?.applications[0].statusHistory).toHaveLength(1)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}').version).toBe(2)
  })
})
