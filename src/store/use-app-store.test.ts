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
    first
      .getState()
      .updateApplication(id, {
        ...input,
        technologies: ['React'],
        salaryMin: 100000,
        salaryMax: 150000,
      })
    first.getState().changeStatus(id, 'interview')
    first.getState().setTheme('dark')
    const refreshed = createAppStore(localStorageService)
    refreshed.getState().hydrate()
    expect(refreshed.getState().applications[0]).toMatchObject({
      id,
      status: 'interview',
      technologies: ['React'],
      salaryMin: 100000,
    })
    expect(refreshed.getState().settings.theme).toBe('dark')
    refreshed.getState().deleteApplication(id)
    const again = createAppStore(localStorageService)
    again.getState().hydrate()
    expect(again.getState().applications).toEqual([])
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
