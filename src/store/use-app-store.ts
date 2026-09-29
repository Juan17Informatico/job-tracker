import { create } from 'zustand'
import type {
  ApplicationInput,
  ApplicationStatus,
  BackupV1,
  JobApplication,
  Settings,
} from '@/types/application'
import { localStorageService, type StorageService } from '@/storage/storage'
import { createBackup } from '@/storage/backup'
import { applicationSchema } from '@/features/applications/schema'

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
  replaceData: (backup: BackupV1) => void
}
export function createAppStore(storage: StorageService) {
  return create<AppState>((set, get) => {
    const commit = (applications: JobApplication[], settings = get().settings) => {
      if (get().storageError)
        throw new Error(
          'Stored data could not be read. Export the original data or restore a valid backup in Settings before making changes.',
        )
      storage.save(createBackup(applications, settings))
      set({ applications, settings })
    }
    return {
      applications: [],
      settings: { theme: 'system' },
      storageError: null,
      hydrate: () => {
        try {
          const saved = storage.load()
          if (saved)
            set({ applications: saved.applications, settings: saved.settings, storageError: null })
        } catch {
          set({
            storageError:
              'Your saved data could not be read. It is still on this device. Open Settings to download it or restore a backup.',
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
          },
          ...get().applications,
        ])
      },
      updateApplication: (id, input) => {
        const data = applicationSchema.parse(input)
        commit(
          get().applications.map((a) =>
            a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a,
          ),
        )
      },
      changeStatus: (id, status) =>
        commit(
          get().applications.map((a) =>
            a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a,
          ),
        ),
      deleteApplication: (id) => commit(get().applications.filter((a) => a.id !== id)),
      setTheme: (theme) => commit(get().applications, { theme }),
      replaceData: (backup) => {
        storage.save(backup)
        set({ applications: backup.applications, settings: backup.settings, storageError: null })
      },
    }
  })
}
export const useAppStore = createAppStore(localStorageService)
