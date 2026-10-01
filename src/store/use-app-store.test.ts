import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAppStore } from './use-app-store'
import { localStorageService, STORAGE_KEY } from '@/storage/storage'
import { emptyApplication } from '@/features/applications/schema'
const input = { ...emptyApplication(), company: 'Acme', position: 'Frontend Engineer' }
beforeEach(() => localStorage.clear())
describe('persisted opportunity lifecycle', () => {
  it('keeps create, edit, status, settings and delete across fresh stores', () => {
    const first = createAppStore(localStorageService)
    first.getState().addApplication(input)
    const id = first.getState().applications[0].id
    expect(first.getState().applications[0].statusHistory).toHaveLength(1)
    first.getState().updateApplication(id, {
      ...input,
      technologies: ['React'],
      salaryMin: 100000,
      salaryMax: 150000,
    })
    expect(first.getState().applications[0].statusHistory).toHaveLength(1)
    first.getState().changeStatus(id, 'interview')
    expect(first.getState().applications[0].statusHistory.at(-1)?.status).toBe('interview')
    first.getState().changeStatus(id, 'interview')
    expect(first.getState().applications[0].statusHistory).toHaveLength(2)
    first.getState().addInterview(id, {
      type: 'technical',
      scheduledAt: '2026-09-30T15:00:00.000Z',
      completedAt: '2026-09-30T16:00:00.000Z',
      notes: 'Live coding',
    })
    const interviewId = first.getState().applications[0].interviews[0].id
    first
      .getState()
      .updateInterview(id, interviewId, { type: 'final', scheduledAt: '2026-10-01T15:00:00.000Z' })
    first.getState().setTheme('dark')
    first.getState().setLanguage('es')
    const refreshed = createAppStore(localStorageService)
    refreshed.getState().hydrate()
    expect(refreshed.getState().applications[0]).toMatchObject({
      id,
      status: 'interview',
      technologies: ['React'],
      salaryMin: 100000,
    })
    expect(refreshed.getState().applications[0].statusHistory).toHaveLength(2)
    expect(refreshed.getState().applications[0].interviews[0]).toMatchObject({ type: 'final' })
    expect(refreshed.getState().settings.theme).toBe('dark')
    expect(refreshed.getState().settings.language).toBe('es')
    refreshed.getState().deleteApplication(id)
    const again = createAppStore(localStorageService)
    again.getState().hydrate()
    expect(again.getState().applications).toEqual([])
  })
  it('persists interview deletion without touching other applications', () => {
    const store = createAppStore(localStorageService)
    store.getState().addApplication(input)
    const id = store.getState().applications[0].id
    store
      .getState()
      .addInterview(id, { type: 'recruiter', scheduledAt: '2026-09-30T15:00:00.000Z' })
    const interviewId = store.getState().applications[0].interviews[0].id
    store.getState().deleteInterview(id, interviewId)
    expect(store.getState().applications[0].interviews).toEqual([])
  })
  it('records a history event when the edit form changes status', () => {
    const store = createAppStore(localStorageService)
    store.getState().addApplication(input)
    const id = store.getState().applications[0].id
    store.getState().updateApplication(id, { ...input, status: 'applied' })
    expect(store.getState().applications[0].statusHistory.map((event) => event.status)).toEqual([
      'saved',
      'applied',
    ])
  })
  it('does not change state if persistence fails', () => {
    const store = createAppStore({
      load: () => null,
      save: vi.fn(() => {
        throw new Error('Full')
      }),
    })
    expect(() => store.getState().addApplication(input)).toThrow('Full')
    expect(store.getState().applications).toEqual([])
  })
  it('preserves corrupt data and blocks accidental overwrites', () => {
    localStorage.setItem(STORAGE_KEY, '{broken')
    const store = createAppStore(localStorageService)
    store.getState().hydrate()
    expect(store.getState().storageError).toBeTruthy()
    expect(() => store.getState().addApplication(input)).toThrow()
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{broken')
  })
})
