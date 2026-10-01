import type { Backup } from '@/types/application'
import { parseBackup } from './backup'
import { i18n } from '@/i18n'

// Keep the original key so V0.1 installations are discovered and migrated in place.
export const STORAGE_KEY = 'job-tracker:v1'
export interface StorageService {
  load(): Backup | null
  save(data: Backup): void
}
export const localStorageService: StorageService = {
  load() {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return null
    const parsed = parseBackup(saved)
    try {
      const version = (JSON.parse(saved) as { version?: unknown }).version
      if (version === 1) localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
    } catch {
      // A valid in-memory migration should remain usable if the rewrite is unavailable.
    }
    return parsed
  },
  save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      throw new Error(i18n.t('persistenceError'))
    }
  },
}
