import { create } from 'zustand'
import type {
  ApplicationInput,
  ApplicationStatus,
  Backup,
  InterviewEvent,
  JobApplication,
  Settings,
} from '@/types/application'
import { localStorageService, type StorageService } from '@/storage/storage'
import { createBackup, initialStatusEvent } from '@/storage/backup'
import { applicationSchema } from '@/features/applications/schema'
import { detectLanguage, i18n } from '@/i18n'

interface AppState {
  applications: JobApplication[]
  settings: Settings
  storageError: string | null
  hydrate: () => void
  addApplication: (input: ApplicationInput) => void
  updateApplication: (id: string, input: ApplicationInput) => void
  changeStatus: (id: string, status: ApplicationStatus) => void
  deleteApplication: (id: string) => void
  setTheme: (theme: Settings['theme']) => void
  setLanguage: (language: Settings['language']) => void
  addInterview: (applicationId: string, input: Omit<InterviewEvent, 'id'>) => void
  updateInterview: (
    applicationId: string,
    interviewId: string,
    input: Omit<InterviewEvent, 'id'>,
  ) => void
  deleteInterview: (applicationId: string, interviewId: string) => void
  replaceData: (backup: Backup) => void
}
export function createAppStore(storage: StorageService) {
  return create<AppState>((set, get) => {
    const commit = (applications: JobApplication[], settings = get().settings) => {
      if (get().storageError) throw new Error(i18n.t('persistenceError'))
      storage.save(createBackup(applications, settings))
      set({ applications, settings })
    }
    return {
      applications: [],
      settings: { theme: 'system', language: detectLanguage() },
      storageError: null,
      hydrate: () => {
        try {
          const saved = storage.load()
          if (saved)
            set({ applications: saved.applications, settings: saved.settings, storageError: null })
        } catch {
          set({
            storageError: i18n.t('storageError'),
          })
        }
      },
      addApplication: (input) => {
        const now = new Date().toISOString()
        commit([
          {
            ...applicationSchema.parse(input),
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
            statusHistory: [
              {
                id: crypto.randomUUID(),
                status: input.status,
                occurredAt: input.appliedAt ? `${input.appliedAt}T12:00:00.000Z` : now,
              },
            ],
            interviews: [],
          },
          ...get().applications,
        ])
      },
      updateApplication: (id, input) => {
        const data = applicationSchema.parse(input)
        commit(
          get().applications.map((a) => {
            if (a.id !== id) return a
            const updatedAt = new Date().toISOString()
            if (data.status === a.status) return { ...a, ...data, updatedAt }
            const history = a.statusHistory?.length
              ? a.statusHistory
              : [initialStatusEvent(a.status, a.appliedAt, a.createdAt, a.id)]
            return {
              ...a,
              ...data,
              updatedAt,
              statusHistory: [
                ...history,
                { id: crypto.randomUUID(), status: data.status, occurredAt: updatedAt },
              ],
            }
          }),
        )
      },
      changeStatus: (id, status) => {
        const now = new Date().toISOString()
        commit(
          get().applications.map((a) => {
            if (a.id !== id || a.status === status) return a
            const history = a.statusHistory?.length
              ? a.statusHistory
              : [initialStatusEvent(a.status, a.appliedAt, a.createdAt, a.id)]
            return {
              ...a,
              status,
              updatedAt: now,
              statusHistory: [...history, { id: crypto.randomUUID(), status, occurredAt: now }],
            }
          }),
        )
      },
      deleteApplication: (id) => commit(get().applications.filter((a) => a.id !== id)),
      setTheme: (theme) => commit(get().applications, { ...get().settings, theme }),
      setLanguage: (language) => commit(get().applications, { ...get().settings, language }),
      addInterview: (applicationId, input) =>
        commit(
          get().applications.map((a) =>
            a.id === applicationId
              ? {
                  ...a,
                  updatedAt: new Date().toISOString(),
                  interviews: [...a.interviews, { ...input, id: crypto.randomUUID() }],
                }
              : a,
          ),
        ),
      updateInterview: (applicationId, interviewId, input) =>
        commit(
          get().applications.map((a) =>
            a.id === applicationId
              ? {
                  ...a,
                  updatedAt: new Date().toISOString(),
                  interviews: a.interviews.map((i) =>
                    i.id === interviewId ? { ...input, id: interviewId } : i,
                  ),
                }
              : a,
          ),
        ),
      deleteInterview: (applicationId, interviewId) =>
        commit(
          get().applications.map((a) =>
            a.id === applicationId
              ? {
                  ...a,
                  updatedAt: new Date().toISOString(),
                  interviews: a.interviews.filter((i) => i.id !== interviewId),
                }
              : a,
          ),
        ),
      replaceData: (backup) => {
        storage.save(backup)
        set({ applications: backup.applications, settings: backup.settings, storageError: null })
      },
    }
  })
}
export const useAppStore = createAppStore(localStorageService)
